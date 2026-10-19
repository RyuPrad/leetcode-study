import type { QuickJSWASMModule } from 'quickjs-emscripten';
import type { CodingProblem, Json, Verdict, CodeCase, JudgeResult, CaseResult, NativeRunResult, ReferenceOutcome, TraceEvent } from '../shared/coding';
import { CASE_TIMEOUT, JOB_TIMEOUT, CODE_LIMIT } from '../shared/coding';
import { installEnvironment, installVirtualTime, executeCase } from './harness.js';
import { accepts } from './compare';
import { validateInput } from './validation';
import { adapterScript, caseSpec } from './kit-spec';

// Marks a case whose adapter returned a promise that has not settled yet.
const PENDING = '__studyPending__';

export function evaluate(QuickJS: QuickJSWASMModule, problem: CodingProblem, source: string, input: Json[], timeout = CASE_TIMEOUT) {
  const runtime = QuickJS.newRuntime();
  runtime.setMemoryLimit(64 * 1024 * 1024);
  runtime.setMaxStackSize(1024 * 1024);
  const start = performance.now(), deadline = start + timeout;
  runtime.setInterruptHandler(() => performance.now() >= deadline);
  const vm = runtime.newContext(), logs: string[] = [];
  let logSize = 0, verdict: Verdict = 'Accepted', actual: Json | undefined, error: string | undefined, trace: TraceEvent[] | undefined;
  const log = vm.newFunction('__print', handle => { const message = vm.getString(handle); if (logSize < 65536) { logs.push(message.slice(0, Math.min(2000,65536-logSize))); logSize += message.length; if (logSize >= 65536) logs.push('[Console output truncated]'); } });
  vm.setProp(vm.global, '__print', log); log.dispose();
  function evaluateText(code: string, filename: string): string | undefined {
    const result = vm.evalCode(code, filename);
    if (result.error) {
      const detail = vm.dump(result.error); result.error.dispose();
      error = `${detail?.name || 'Error'}: ${detail?.message || String(detail)}${detail?.stack ? '\n' + detail.stack : ''}`.slice(0,8000);
      verdict = /out of memory|allocation failed/i.test(error) ? 'Memory limit exceeded' : performance.now() >= deadline || /interrupted/.test(error) ? 'Time limit exceeded' : detail?.name === 'SyntaxError' ? 'Syntax error' : 'Runtime error';
      return;
    }
    const text = vm.typeof(result.value) === 'string' ? vm.getString(result.value) : undefined;
    result.value.dispose(); return text;
  }
  try {
    evaluateText(`(${installEnvironment.toString()})();\nglobalThis.console = Object.fromEntries(['log','info','warn','error','debug'].map(k=>[k,(...args)=>__print(args.map(v=>{try{return typeof v==='string'?v:JSON.stringify(v)}catch{return String(v)}}).join(' ').slice(0,2000))]));`, 'environment.js');
    if (!error && problem.io?.events) evaluateText(`(${installVirtualTime.toString()})();`, 'time.js');
    if (!error) evaluateText(source, 'solution.js');
    if (!error && adapterScript(problem)) evaluateText(adapterScript(problem), 'adapter.js');
    if (!error) {
      // An events kit's adapter may return a promise: it settles as the host drains jobs and advances virtual time.
      let text = evaluateText(`(() => { const out = globalThis.__studyOut = value => { const text = JSON.stringify(value); if (typeof text !== 'string') throw new Error('Return a JSON-compatible value.'); if (text.length > 262144) throw new Error('Output exceeds 256 KiB.'); return text; }; const value = (${executeCase.toString()})(${problem.number}, ${JSON.stringify(input)}, ${problem.entry}, ${problem.number === 297 ? 'deserialize' : 'undefined'}, ${JSON.stringify(caseSpec(problem))}); if (${!!problem.io?.events} && value && typeof value.then === 'function') { value.then(v => { globalThis.__studySettled = { value: v }; }, e => { globalThis.__studySettled = { error: e instanceof Error ? e.name + ': ' + e.message : String(e) }; }); return '${PENDING}'; } return out(value); })()`, 'judge.js');
      for (let ticks = 0; !error && text === PENDING; ticks++) {
        const jobs = runtime.executePendingJobs();
        if (jobs.error) { const detail = vm.dump(jobs.error); jobs.error.dispose(); error = `${detail?.name || 'Error'}: ${detail?.message || String(detail)}`; verdict = performance.now() >= deadline || /interrupted/.test(error) ? 'Time limit exceeded' : 'Runtime error'; break; }
        const settled = evaluateText(`globalThis.__studySettled ? (globalThis.__studySettled.error !== undefined ? (() => { throw { name: 'Rejected promise', message: globalThis.__studySettled.error }; })() : globalThis.__studyOut(globalThis.__studySettled.value)) : '${PENDING}'`, 'settle.js');
        if (error || settled !== PENDING) { text = settled; break; }
        if (ticks >= 100000) { error = 'The scenario ran more than 100,000 timer callbacks.'; verdict = 'Time limit exceeded'; break; }
        if (evaluateText('String(__studyTick())', 'tick.js') === 'false') { error = 'The returned promise never settled, and no timers are left to run.'; verdict = 'Runtime error'; }
      }
      if (!error && text !== undefined) actual = JSON.parse(text);
      if (problem.io?.events) { const events = evaluateText('JSON.stringify(globalThis.__studyTrace ?? [])', 'trace.js'); if (events) trace = JSON.parse(events); }
    }
  } catch (e) { error = String(e).slice(0,8000); verdict = /memory|alloc/i.test(error) ? 'Memory limit exceeded' : 'Runtime error'; }
  finally { vm.dispose(); runtime.dispose(); }
  return { actual, error, logs, verdict: verdict as Verdict, durationMs: Math.round((performance.now()-start)*100)/100, ...(trace ? { trace } : {}) };
}

/** Runs a generated kit's guest-side function (validator or checker) on JSON arguments in a fresh context. */
export function guestCall(QuickJS: QuickJSWASMModule, source: string, args: unknown[]): { value?: Json; error?: string } {
  const runtime = QuickJS.newRuntime();
  runtime.setMemoryLimit(64 * 1024 * 1024); runtime.setMaxStackSize(1024 * 1024);
  const deadline = performance.now() + CASE_TIMEOUT; runtime.setInterruptHandler(() => performance.now() >= deadline);
  const vm = runtime.newContext();
  try {
    const result = vm.evalCode(`JSON.stringify((${source})(...${JSON.stringify(args)}) ?? null)`, 'kit.js');
    if (result.error) { const detail = vm.dump(result.error); result.error.dispose(); return { error: `${detail?.name || 'Error'}: ${detail?.message || String(detail)}` }; }
    const text = vm.getString(result.value); result.value.dispose(); return { value: JSON.parse(text) };
  } finally { vm.dispose(); runtime.dispose(); }
}
/** One input from a kit's generator(rand, size), with the same seeded random sequence everywhere it runs. */
export function generatedInput(QuickJS: QuickJSWASMModule, generator: string, seed: number, size: 'small' | 'large'): Json[] {
  const rand = `(() => { let s = ${Math.trunc(seed)}; return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; })()`;
  const { value, error } = guestCall(QuickJS, `function(size) { return (${generator})(${rand}, size); }`, [size]);
  if (error || !Array.isArray(value)) throw new Error(`The test generator failed: ${error ?? 'it did not return a list of arguments'}`);
  return value;
}
/** The cases with every generated test's input built, ready to judge. */
export function expandCases(QuickJS: QuickJSWASMModule, problem: CodingProblem, cases: CodeCase[]): CodeCase[] {
  return cases.map(test => test.generate && problem.generator ? { name: test.name, input: generatedInput(QuickJS, problem.generator, test.generate.seed, test.generate.size), ...(test.expected !== undefined ? { expected: test.expected } : {}) } : test);
}
/** Why a generated kit rejects this input, from its guest-side validator, or null. */
export function kitInvalid(QuickJS: QuickJSWASMModule, problem: CodingProblem, input: Json[]): string | null {
  if (!problem.generated || !problem.validator) return null;
  const { value, error } = guestCall(QuickJS, problem.validator, [input]);
  return error ? `The input check failed: ${error}` : typeof value === 'string' && value ? value : null;
}
/** Whether actual is an accepted answer: the kit's checker for checker mode, otherwise compare.ts. */
export function accepted(QuickJS: QuickJSWASMModule, problem: CodingProblem, input: Json[], actual: Json | undefined, expected: Json | undefined): boolean {
  if (problem.generated && problem.compare === 'checker' && problem.checker) return guestCall(QuickJS, problem.checker, [input, actual ?? null, expected ?? null]).value === true;
  return accepts(problem, input, actual, expected);
}

export async function judge(QuickJS: QuickJSWASMModule, problem: CodingProblem, source: string, cases: CodeCase[], progress?: (completed: number) => void): Promise<JudgeResult> {
  const start = performance.now(), results: CaseResult[] = [];
  for (const test of cases) {
    if (performance.now()-start > JOB_TIMEOUT) { results.push({...test,verdict:'Time limit exceeded',logs:[],durationMs:0,error:'The 30 second job limit was reached.'}); break; }
    const invalid = source.length > CODE_LIMIT ? 'Source exceeds 256 KiB.' : validateInput(problem,test.input) ?? kitInvalid(QuickJS,problem,test.input);
    if (invalid) { results.push({...test,verdict:'Invalid input',error:invalid,logs:[],durationMs:0}); }
    else {
      const reference = evaluate(QuickJS,problem,problem.reference,test.input);
      if (reference.verdict !== 'Accepted') results.push({...test,verdict:'Invalid input',error:`The reference could not evaluate this case: ${reference.error}`,logs:[],durationMs:0});
      else {
        const run = evaluate(QuickJS,problem,source,test.input);
        if (run.verdict === 'Accepted' && !accepted(QuickJS,problem,test.input,run.actual,reference.actual)) run.verdict = 'Wrong answer';
        results.push({...test,...run,expected:reference.actual});
      }
    }
    progress?.(results.length);
    if (results.at(-1)!.verdict === 'Time limit exceeded' || results.at(-1)!.verdict === 'Memory limit exceeded' || results.at(-1)!.verdict === 'Syntax error') break;
    // Give the worker an opportunity to report progress between cases.
    await new Promise(resolve => setTimeout(resolve,0));
  }
  return {verdict:results.find(r=>r.verdict!=='Accepted')?.verdict || 'Accepted',passed:results.filter(r=>r.verdict==='Accepted').length,total:cases.length,durationMs:Math.round(performance.now()-start),cases:results};
}

/** A run that stops before any case, e.g. on a compile error. */
export function compileFailure(message: string, total: number): JudgeResult {
  return {verdict:'Syntax error',passed:0,total,durationMs:0,cases:[{name:'Compiler',input:[],verdict:'Syntax error',error:message.slice(0,8000),logs:[],durationMs:0}]};
}

/** Expected results for a Java/C job, from the JavaScript reference as for JavaScript solutions. */
export function referenceOutcomes(QuickJS: QuickJSWASMModule, problem: CodingProblem, source: string, cases: CodeCase[]): ReferenceOutcome[] {
  return cases.map(test => {
    const invalid = source.length > CODE_LIMIT ? 'Source exceeds 256 KiB.' : validateInput(problem,test.input) ?? kitInvalid(QuickJS,problem,test.input);
    if (invalid) return {invalid};
    const reference = evaluate(QuickJS,problem,problem.reference,test.input);
    return reference.verdict === 'Accepted' ? {expected:reference.actual} : {invalid:`The reference could not evaluate this case: ${reference.error}`};
  });
}
/** Combines native results for the valid cases with the reference outcomes, as judge() reports. */
export function assembleNative(problem: CodingProblem, cases: CodeCase[], references: ReferenceOutcome[], run: NativeRunResult, durationMs: number): JudgeResult {
  if ('compileError' in run) return {...compileFailure(run.compileError,cases.length),durationMs};
  const results: CaseResult[] = [];
  let next = 0;
  for (let i = 0; i < cases.length; i++) {
    const test = cases[i], reference = references[i];
    if (reference.invalid) { results.push({...test,verdict:'Invalid input',error:reference.invalid,logs:[],durationMs:0}); continue; }
    const native = run.cases[next++];
    if (!native) break;
    const verdict = native.verdict === 'Accepted' && !accepts(problem,test.input,native.actual,reference.expected) ? 'Wrong answer' : native.verdict;
    results.push({...test,...native,verdict,expected:reference.expected});
    if (['Time limit exceeded','Memory limit exceeded','Syntax error','Cancelled'].includes(verdict)) break;
  }
  const total = cases.length;
  return {verdict:results.find(r=>r.verdict!=='Accepted')?.verdict || (results.length===total?'Accepted':'Runtime error'),passed:results.filter(r=>r.verdict==='Accepted').length,total,durationMs,cases:results};
}
