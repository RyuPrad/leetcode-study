import type { QuickJSWASMModule } from 'quickjs-emscripten';
import type { CodingProblem, Json, Verdict, CodeCase, JudgeResult, CaseResult } from '../shared/coding';
import { CASE_TIMEOUT, JOB_TIMEOUT, CODE_LIMIT } from '../shared/coding';
import { installEnvironment, executeCase } from './harness.js';
import { accepts } from './compare';
import { validateInput } from './validation';

export function evaluate(QuickJS: QuickJSWASMModule, problem: CodingProblem, source: string, input: Json[], timeout = CASE_TIMEOUT) {
  const runtime = QuickJS.newRuntime();
  runtime.setMemoryLimit(64 * 1024 * 1024);
  runtime.setMaxStackSize(1024 * 1024);
  const start = performance.now(), deadline = start + timeout;
  runtime.setInterruptHandler(() => performance.now() >= deadline);
  const vm = runtime.newContext(), logs: string[] = [];
  let logSize = 0, verdict: Verdict = 'Accepted', actual: Json | undefined, error: string | undefined;
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
    if (!error) evaluateText(source, 'solution.js');
    if (!error) {
      const text = evaluateText(`(() => { const value = (${executeCase.toString()})(${problem.number}, ${JSON.stringify(input)}, ${problem.entry}, ${problem.number === 297 ? 'deserialize' : 'undefined'}); const text = JSON.stringify(value); if (typeof text !== 'string') throw new Error('Return a JSON-compatible value.'); if (text.length > 262144) throw new Error('Output exceeds 256 KiB.'); return text; })()`, 'judge.js');
      if (!error && text !== undefined) actual = JSON.parse(text);
    }
  } catch (e) { error = String(e).slice(0,8000); verdict = /memory|alloc/i.test(error) ? 'Memory limit exceeded' : 'Runtime error'; }
  finally { vm.dispose(); runtime.dispose(); }
  return { actual, error, logs, verdict: verdict as Verdict, durationMs: Math.round((performance.now()-start)*100)/100 };
}

export async function judge(QuickJS: QuickJSWASMModule, problem: CodingProblem, source: string, cases: CodeCase[], progress?: (completed: number) => void): Promise<JudgeResult> {
  const start = performance.now(), results: CaseResult[] = [];
  for (const test of cases) {
    if (performance.now()-start > JOB_TIMEOUT) { results.push({...test,verdict:'Time limit exceeded',logs:[],durationMs:0,error:'The 30 second job limit was reached.'}); break; }
    const invalid = source.length > CODE_LIMIT ? 'Source exceeds 256 KiB.' : validateInput(problem,test.input);
    if (invalid) { results.push({...test,verdict:'Invalid input',error:invalid,logs:[],durationMs:0}); }
    else {
      const reference = evaluate(QuickJS,problem,problem.reference,test.input);
      if (reference.verdict !== 'Accepted') results.push({...test,verdict:'Invalid input',error:`The reference could not evaluate this case: ${reference.error}`,logs:[],durationMs:0});
      else {
        const run = evaluate(QuickJS,problem,source,test.input);
        if (run.verdict === 'Accepted' && !accepts(problem,test.input,run.actual,reference.actual)) run.verdict = 'Wrong answer';
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
