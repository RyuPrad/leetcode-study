// Verifies generated study kits (coding/kits/<n>.json) by running them:
// - the record's structure (coding/kits.ts kitErrors) and every case against the typed contract and validator;
// - the reference solves every example with LeetCode's stated answer and runs every test;
// - an independent brute force agrees with the reference on every case and on random inputs from the generator;
// - a wrong solution is rejected, the walkthrough records, and the TypeScript/Java/C starters generate.
// Usage: npx tsx scripts/check-kits.ts [numbers...] [--json=file]
import fs from 'node:fs';
import path from 'node:path';
import { getQuickJS, newQuickJSAsyncWASMModule } from 'quickjs-emscripten';
import type { CodingProblem, Json } from '../shared/coding';
import { KITS_PATH, ROOT } from './content.mjs';
import { kitErrors, kitProblem } from '../coding/kits';
import { accepted, evaluate, guestCall, judge, kitInvalid } from '../coding/engine';
import { validateInput } from '../coding/validation';
import { starter, contractLine } from '../coding/languages';
import { DebugController, debugEvaluate } from '../coding/debug-engine';
import { WALKTHROUGH_FRAME_LIMIT } from '../shared/debugging';

const FUZZ = 60;
const sync = await getQuickJS(), asyncModule = await newQuickJSAsyncWASMModule();
const numbers = process.argv.filter(a => /^\d+$/.test(a)).map(Number);
const report = process.argv.find(a => a.startsWith('--json='))?.slice(7);
const dir = path.join(ROOT, KITS_PATH);
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /^\d+\.json$/.test(f)).map(f => Number(f.slice(0, -5))).filter(n => !numbers.length || numbers.includes(n)).sort((a, b) => a - b) : [];
for (const n of numbers) if (!files.includes(n)) console.error(`No kit file ${KITS_PATH}/${n}.json`);
const show = (v: unknown) => { const t = JSON.stringify(v); return t === undefined ? 'undefined' : t.length > 300 ? `${t.slice(0, 300)}…` : t; };

/** A seeded generator call: the kit's generate(rand, size) returns one argument array. */
function generated(problem: CodingProblem, generator: string, seed: number, size: 'small' | 'large'): Json[] {
  const rand = `(() => { let s = ${seed}; return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; })()`;
  const { value, error } = guestCall(sync, `function(size) { return (${generator})(${rand}, size); }`, [size]);
  if (error || !Array.isArray(value)) throw new Error(`generator failed: ${error ?? `returned ${show(value)}`}`);
  return value as Json[];
}

async function check(number: number): Promise<string[]> {
  const errors: string[] = [];
  let record: any;
  try { record = JSON.parse(fs.readFileSync(path.join(dir, `${number}.json`), 'utf8')); } catch (error) { return [`Unreadable JSON: ${error}`]; }
  const structure = kitErrors(record, number);
  if (structure.length) return structure;
  const problem = kitProblem(record), lines = record.reference.split('\n').length;
  for (const line of Object.keys(record.narration ?? {})) if (Number(line) > lines) errors.push(`narration line ${line} is past the reference's ${lines} lines.`);
  const cases = [...problem.examples, ...problem.tests];
  if (problem.tests.length < 8) errors.push(`Only ${problem.tests.length} tests; write at least 8.`);
  const outputs: Json[] = [];
  for (const test of cases) {
    const invalid = validateInput(problem, test.input) ?? kitInvalid(sync, problem, test.input);
    if (invalid) { errors.push(`${test.name} is invalid: ${invalid} Input ${show(test.input)}`); continue; }
    const run = evaluate(sync, problem, problem.reference, test.input);
    if (run.verdict !== 'Accepted') { errors.push(`The reference fails ${test.name}: ${run.verdict} ${run.error ?? ''}`.trim()); continue; }
    outputs.push(run.actual as Json);
    if (test.expected !== undefined && !accepted(sync, problem, test.input, run.actual, test.expected)) errors.push(`The reference answers ${show(run.actual)} on ${test.name}, but the stated answer is ${show(test.expected)}.`);
    if (problem.compare === 'checker' && !accepted(sync, problem, test.input, run.actual, run.actual)) errors.push(`The checker rejects the reference's own answer on ${test.name}.`);
    if (record.brute) {
      const brute = evaluate(sync, problem, record.brute, test.input, 10000);
      if (brute.verdict !== 'Accepted') errors.push(`The brute force fails ${test.name}: ${brute.verdict} ${brute.error ?? ''}`.trim());
      else if (!accepted(sync, problem, test.input, brute.actual, run.actual)) errors.push(`Brute force ${show(brute.actual)} and reference ${show(run.actual)} disagree on ${test.name} ${show(test.input)}.`);
    }
  }
  // Varied answers catch solutions that return a constant; a yes/no problem has only two.
  const variety = outputs.every(o => typeof o === 'boolean') ? 2 : 3;
  if (new Set(outputs.map(o => JSON.stringify(o))).size < Math.min(variety, outputs.length)) errors.push(`The cases produce fewer than ${variety} distinct answers; vary the tests.`);
  // Random small inputs compare the reference with the brute force, and must pass validation.
  if (record.generator) {
    for (let seed = 1; seed <= FUZZ && errors.length < 12; seed++) {
      let input: Json[];
      try { input = generated(problem, record.generator, seed * 7919, 'small'); } catch (error) { errors.push(String(error)); break; }
      const invalid = validateInput(problem, input) ?? kitInvalid(sync, problem, input);
      if (invalid) { errors.push(`Generated input (seed ${seed}) is invalid: ${invalid} ${show(input)}`); continue; }
      const run = evaluate(sync, problem, problem.reference, input);
      if (run.verdict !== 'Accepted') { errors.push(`The reference fails generated input ${show(input)}: ${run.verdict} ${run.error ?? ''}`); continue; }
      if (!record.brute) continue;
      const brute = evaluate(sync, problem, record.brute, input, 10000);
      if (brute.verdict !== 'Accepted') { if (brute.verdict !== 'Time limit exceeded') errors.push(`The brute force fails generated input ${show(input)}: ${brute.verdict} ${brute.error ?? ''}`); continue; }
      if (!accepted(sync, problem, input, brute.actual, run.actual)) errors.push(`On generated input ${show(input)} the brute force gives ${show(brute.actual)} but the reference gives ${show(run.actual)}.`);
    }
    try { const large = generated(problem, record.generator, 99991, 'large'); const run = evaluate(sync, problem, problem.reference, large); if (validateInput(problem, large) === null && run.verdict !== 'Accepted') errors.push(`The reference fails a large generated input: ${run.verdict} ${run.error ?? ''}`); } catch (error) { errors.push(String(error)); }
  } else errors.push('A kit needs a generator.');
  if (!record.brute) errors.push('A kit needs an independent brute force.');
  // A plainly wrong solution must not be accepted.
  const wrong = problem.kind === 'design' ? `class ${problem.entry} { constructor() {} ${Object.keys(problem.methods ?? {}).filter(m => m !== 'constructor').map(m => `${m}() { return -12345; }`).join(' ')} }` : `function ${problem.entry}() { return -12345; }`;
  const verdict = await judge(sync, problem, wrong, cases);
  if (verdict.verdict === 'Accepted') errors.push('A solution that always returns -12345 is accepted; the cases or comparison are too weak.');
  // The walkthrough records the first example.
  try {
    const frames: unknown[] = []; let controller: DebugController, truncated = false;
    const hooks = { started: () => {}, running: () => {}, frame: (frame: unknown, paused: boolean) => { frames.push(frame); if (frames.length >= WALKTHROUGH_FRAME_LIMIT) { truncated = true; controller.stop(); return; } if (paused) queueMicrotask(() => controller.command('into')); } };
    controller = new DebugController(hooks);
    const result = await debugEvaluate(asyncModule, problem, problem.reference, problem.examples[0], controller, hooks);
    if (!truncated && result.error) errors.push(`The walkthrough fails on ${problem.examples[0].name}: ${result.error}`);
    if (frames.length < 2) errors.push('The walkthrough recorded fewer than 2 steps.');
  } catch (error) { errors.push(`The walkthrough fails: ${error}`); }
  for (const language of problem.languages ?? []) try { starter(problem, language); contractLine(problem, language); } catch (error) { errors.push(`The ${language} starter fails: ${error}`); }
  return errors;
}

const failures: Record<number, string[]> = {};
let done = 0;
for (const number of files) {
  const errors = await check(number).catch(error => [`Check crashed: ${error}`]);
  if (errors.length) failures[number] = errors;
  if (++done % 50 === 0) console.log(`Checked ${done}/${files.length} kits, ${Object.keys(failures).length} failing`);
}
for (const [number, errors] of Object.entries(failures)) { console.log(`\n✗ ${number}`); for (const e of errors.slice(0, 12)) console.log(`  - ${e}`); }
console.log(`\n${files.length - Object.keys(failures).length} of ${files.length} kits pass.`);
if (report) fs.writeFileSync(report, JSON.stringify({ checked: files.length, failures }, null, 2));
if (Object.keys(failures).length || numbers.some(n => !files.includes(n))) process.exitCode = 1;
