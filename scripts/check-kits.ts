// Verifies generated study kits (coding/kits/<n>.json) by running them:
// - the record's structure (coding/kits.ts kitErrors) and every case against the typed contract and validator;
// - the reference solves every example with LeetCode's stated answer and runs every test;
// - an independent brute force agrees with the reference on every case except large generated ones, and on random
//   small inputs from the generator;
// - a wrong solution is rejected, the walkthrough records, and the TypeScript/Java/C starters generate.
// SQL kits run the same checks with sql.js: the reference query against LeetCode's example tables, an independent
// second query against it on every case and generated table set, and each common table expression of the walkthrough.
// Usage: npx tsx scripts/check-kits.ts [numbers...] [--json=file]
import fs from 'node:fs';
import path from 'node:path';
import { getQuickJS, newQuickJSAsyncWASMModule } from 'quickjs-emscripten';
import type { CodeCase, CodingProblem, Json } from '../shared/coding';
import { KITS_PATH, ROOT } from './content.mjs';
import { kitErrors, kitProblem } from '../coding/kits';
import { accepted, evaluate, expandCases, generatedInput, judge, kitInvalid } from '../coding/engine';
import { validateInput } from '../coding/validation';
import { starter, contractLine } from '../coding/languages';
import { DebugController, debugEvaluate } from '../coding/debug-engine';
import { WALKTHROUGH_FRAME_LIMIT } from '../shared/debugging';
import initSqlJs from 'sql.js';
import { cteSteps, judgeSql, runSql, sameTable, sqlInvalid, type SqlResult, type SqlTables } from '../coding/sql-engine';

const FUZZ = 60;
const sync = await getQuickJS(), asyncModule = await newQuickJSAsyncWASMModule(), SQL = await initSqlJs();
const numbers = process.argv.filter(a => /^\d+$/.test(a)).map(Number);
const report = process.argv.find(a => a.startsWith('--json='))?.slice(7);
const dir = path.join(ROOT, KITS_PATH);
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /^\d+\.json$/.test(f)).map(f => Number(f.slice(0, -5))).filter(n => !numbers.length || numbers.includes(n)).sort((a, b) => a - b) : [];
for (const n of numbers) if (!files.includes(n)) console.error(`No kit file ${KITS_PATH}/${n}.json`);
const show = (v: unknown) => { const t = JSON.stringify(v); return t === undefined ? 'undefined' : t.length > 300 ? `${t.slice(0, 300)}…` : t; };

/** A seeded generator call: the kit's generate(rand, size) returns one argument array. */
const generated = (problem: CodingProblem, generator: string, seed: number, size: 'small' | 'large'): Json[] => generatedInput(sync, generator, seed, size);
// Stored tests stay small; larger ones are generated from a seed when they run.
const TEST_LIMIT = 4000, TESTS_LIMIT = 24000;

async function check(number: number): Promise<string[]> {
  const errors: string[] = [];
  let record: any;
  try { record = JSON.parse(fs.readFileSync(path.join(dir, `${number}.json`), 'utf8')); } catch (error) { return [`Unreadable JSON: ${error}`]; }
  const structure = kitErrors(record, number);
  if (structure.length) return structure;
  const problem = kitProblem(record), lines = record.reference.split('\n').length;
  for (const line of Object.keys(record.narration ?? {})) if (Number(line) > lines) errors.push(`narration line ${line} is past the reference's ${lines} lines.`);
  const stored = record.tests.filter((t: any) => !t.generate).map((t: any) => JSON.stringify(t.input).length);
  if (stored.some((n: number) => n > TEST_LIMIT) || stored.reduce((a: number, b: number) => a + b, 0) > TESTS_LIMIT) errors.push(`Stored test inputs must be at most ${TEST_LIMIT} characters each and ${TESTS_LIMIT} in total; make larger tests generated: { "name": ..., "generate": { "seed": 7, "size": "large" } }.`);
  let cases: CodeCase[];
  try { cases = expandCases(sync, problem, [...problem.examples, ...problem.tests]); } catch (error) { return [...errors, String(error)]; }
  const generatedNames = new Set(problem.tests.filter(t => t.generate).map(t => t.name));
  // A brute force is written for small inputs: on a large one it may time out, run out of memory or overflow,
  // depending on the machine's speed, so large generated tests are checked by the reference alone.
  const largeNames = new Set(problem.tests.filter(t => t.generate?.size === 'large').map(t => t.name));
  if (problem.kind === 'sql') return [...errors, ...checkSql(record, problem, cases)];
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
    if (record.brute && !largeNames.has(test.name)) {
      const brute = evaluate(sync, problem, record.brute, test.input, 10000);
      // A small generated test may still be beyond the brute force, as generated inputs are in the fuzzing below.
      if (brute.verdict === 'Time limit exceeded' && generatedNames.has(test.name)) continue;
      if (brute.verdict !== 'Accepted') errors.push(`The brute force fails ${test.name}: ${brute.verdict} ${brute.error ?? ''}`.trim());
      else if (!accepted(sync, problem, test.input, brute.actual, run.actual)) errors.push(`Brute force ${show(brute.actual)} and reference ${show(run.actual)} disagree on ${test.name} ${show(test.input)}.`);
    }
  }
  // Random small inputs compare the reference with the brute force, and must pass validation.
  const fuzzed = new Set<string>();
  if (record.generator) {
    for (let seed = 1; seed <= FUZZ && errors.length < 12; seed++) {
      let input: Json[];
      try { input = generated(problem, record.generator, seed * 7919, 'small'); } catch (error) { errors.push(String(error)); break; }
      const invalid = validateInput(problem, input) ?? kitInvalid(sync, problem, input);
      if (invalid) { errors.push(`Generated input (seed ${seed}) is invalid: ${invalid} ${show(input)}`); continue; }
      const run = evaluate(sync, problem, problem.reference, input);
      if (run.verdict !== 'Accepted') { errors.push(`The reference fails generated input ${show(input)}: ${run.verdict} ${run.error ?? ''}`); continue; }
      fuzzed.add(JSON.stringify(run.actual));
      if (!record.brute) continue;
      const brute = evaluate(sync, problem, record.brute, input, 10000);
      if (brute.verdict !== 'Accepted') { if (brute.verdict !== 'Time limit exceeded') errors.push(`The brute force fails generated input ${show(input)}: ${brute.verdict} ${brute.error ?? ''}`); continue; }
      if (!accepted(sync, problem, input, brute.actual, run.actual)) errors.push(`On generated input ${show(input)} the brute force gives ${show(brute.actual)} but the reference gives ${show(run.actual)}.`);
    }
    // Large inputs become generated tests, so they must be valid and the reference must handle them.
    try {
      const large = generated(problem, record.generator, 99991, 'large'), invalid = validateInput(problem, large) ?? kitInvalid(sync, problem, large);
      if (invalid) errors.push(`The large generated input is invalid: ${invalid}`);
      else { const run = evaluate(sync, problem, problem.reference, large); if (run.verdict !== 'Accepted') errors.push(`The reference fails a large generated input: ${run.verdict} ${run.error ?? ''}`); }
    } catch (error) { errors.push(String(error)); }
  } else errors.push('A kit needs a generator.');
  if (!record.brute) errors.push('A kit needs an independent brute force.');
  // Varied answers catch solutions that return a constant. A problem whose answer takes only two values (yes/no,
  // 0 or 1) on every case and generated input needs only those two, and one with a single answer for every valid
  // input (2396) only that one; a constant wrong answer is still rejected below.
  const answers = new Set(outputs.map(o => JSON.stringify(o)));
  const variety = Math.min(3, new Set([...answers, ...fuzzed]).size);
  if (answers.size < Math.min(variety, outputs.length)) errors.push(`The cases produce fewer than ${variety} distinct answers; vary the tests.`);
  // A plainly wrong solution must not be accepted.
  const wrong = problem.kind === 'design' ? `class ${problem.entry} { constructor() {} ${Object.keys(problem.methods ?? {}).filter(m => m !== 'constructor').map(m => `${m}() { return -12345; }`).join(' ')} }` : `function ${problem.entry}() { return -12345; }`;
  const verdict = await judge(sync, problem, wrong, cases);
  if (verdict.verdict === 'Accepted') errors.push('A solution that always returns -12345 is accepted; the cases or comparison are too weak.');
  // The walkthrough records the first example: an events kit as its traced events, any other kit step by step.
  let truncated = false;
  if (problem.io?.events) {
    const run = evaluate(sync, problem, problem.reference, problem.examples[0].input);
    if ((run.trace ?? []).length < 2) errors.push(`The walkthrough traces ${(run.trace ?? []).length} events on ${problem.examples[0].name}; call kit.trace for each call, timer and result.`);
  } else try {
    const frames: unknown[] = []; let controller: DebugController;
    const hooks = { started: () => {}, running: () => {}, frame: (frame: unknown, paused: boolean) => { frames.push(frame); if (frames.length >= WALKTHROUGH_FRAME_LIMIT) { truncated = true; controller.stop(); return; } if (paused) queueMicrotask(() => controller.command('into')); } };
    controller = new DebugController(hooks);
    const result = await debugEvaluate(asyncModule, problem, problem.reference, problem.examples[0], controller, hooks);
    // As in the app, a recording cut by the debugger's time limit keeps its steps; how far it gets depends on the machine.
    if (result.timedOut && frames.length) truncated = true;
    if (!truncated && result.error) errors.push(`The walkthrough fails on ${problem.examples[0].name}: ${result.error}`);
    if (frames.length < 2) errors.push('The walkthrough recorded fewer than 2 steps.');
  } catch (error) { if (!truncated) errors.push(`The walkthrough fails: ${error}`); }
  for (const language of problem.languages ?? []) try { starter(problem, language); contractLine(problem, language); } catch (error) { errors.push(`The ${language} starter fails: ${error}`); }
  return errors;
}

const isTable = (v: unknown): v is SqlResult => !!v && typeof v === 'object' && Array.isArray((v as SqlResult).columns) && (v as SqlResult).columns.every(c => typeof c === 'string') && Array.isArray((v as SqlResult).rows) && (v as SqlResult).rows.every(r => Array.isArray(r) && r.length === (v as SqlResult).columns.length);
function checkSql(record: any, problem: CodingProblem, cases: CodeCase[]): string[] {
  const errors: string[] = [], schema = problem.schema ?? {}, ordered = !!problem.ordered && !problem.modifies, outputs: SqlResult[] = [];
  if (problem.tests.length < 8) errors.push(`Only ${problem.tests.length} tests; write at least 8.`);
  const invalid = (input: Json[]) => sqlInvalid(schema, input) ?? kitInvalid(sync, problem, input);
  for (const test of cases) {
    const bad = invalid(test.input);
    if (bad) { errors.push(`${test.name} is invalid: ${bad} Input ${show(test.input)}`); continue; }
    const tables = test.input[0] as unknown as SqlTables, run = runSql(SQL, schema, tables, problem.reference, problem.modifies);
    if (!run.result) { errors.push(`The reference query fails ${test.name}: ${run.error}`); continue; }
    outputs.push(run.result);
    if (test.expected !== undefined) {
      if (!isTable(test.expected)) errors.push(`${test.name}'s expected answer must be a table: {"columns": [...], "rows": [[...], ...]}.`);
      else {
        if (!sameTable(run.result, test.expected, ordered)) errors.push(`The reference answers ${show(run.result)} on ${test.name}, but the stated answer is ${show(test.expected)}.`);
        if (run.result.columns.join() !== test.expected.columns.join()) errors.push(`The reference names its columns ${run.result.columns.join(', ')} but ${test.name} expects ${test.expected.columns.join(', ')}.`);
      }
    }
    if (record.brute) {
      const brute = runSql(SQL, schema, tables, record.brute, problem.modifies);
      if (!brute.result) errors.push(`The second query fails ${test.name}: ${brute.error}`);
      else if (!sameTable(brute.result, run.result, ordered)) errors.push(`The second query ${show(brute.result)} and the reference ${show(run.result)} disagree on ${test.name} ${show(test.input)}.`);
    }
  }
  const distinct = new Set(outputs.map(o => JSON.stringify([...o.rows.map(r => JSON.stringify(r))].sort()))).size;
  if (distinct < Math.min(3, outputs.length)) errors.push('The cases produce fewer than 3 distinct result tables; vary the tests.');
  if (outputs.length && outputs.every(o => !o.rows.length)) errors.push('Every case has an empty result.');
  if (record.generator) {
    for (let seed = 1; seed <= FUZZ && errors.length < 12; seed++) {
      let input: Json[];
      try { input = generated(problem, record.generator, seed * 7919, 'small'); } catch (error) { errors.push(String(error)); break; }
      const bad = invalid(input);
      if (bad) { errors.push(`Generated input (seed ${seed}) is invalid: ${bad} ${show(input)}`); continue; }
      const tables = input[0] as unknown as SqlTables, run = runSql(SQL, schema, tables, problem.reference, problem.modifies);
      if (!run.result) { errors.push(`The reference query fails generated input ${show(input)}: ${run.error}`); continue; }
      if (!record.brute) continue;
      const brute = runSql(SQL, schema, tables, record.brute, problem.modifies);
      if (!brute.result) errors.push(`The second query fails generated input ${show(input)}: ${brute.error}`);
      else if (!sameTable(brute.result, run.result, ordered)) errors.push(`On generated input ${show(input)} the second query gives ${show(brute.result)} but the reference gives ${show(run.result)}.`);
    }
    try {
      const large = generated(problem, record.generator, 99991, 'large'), start = performance.now();
      if (invalid(large) === null) { const run = runSql(SQL, schema, large[0] as unknown as SqlTables, problem.reference, problem.modifies); if (!run.result) errors.push(`The reference query fails a large generated input: ${run.error}`); else if (performance.now() - start > 2000) errors.push('The reference query takes over 2 seconds on a large generated input.'); }
      else errors.push(`The large generated input is invalid: ${invalid(large)}`);
    } catch (error) { errors.push(String(error)); }
  } else errors.push('A kit needs a generator.');
  if (!record.brute) errors.push('A kit needs an independent second query.');
  // Plainly wrong queries must not be accepted.
  for (const wrong of ['SELECT 1', `SELECT * FROM ${Object.keys(schema)[0]} WHERE 1 = 0`]) if (judgeSql(SQL, problem, wrong, cases).verdict === 'Accepted') errors.push(`The query ${wrong} is accepted; the cases are too weak.`);
  // The walkthrough runs each common table expression of the reference on the first example.
  const first = problem.examples[0]?.input[0] as unknown as SqlTables | undefined;
  if (first) for (const cte of cteSteps(problem.reference)) { const run = runSql(SQL, schema, first, cte.sql); if (!run.result) errors.push(`The walkthrough cannot run ${cte.name}: ${run.error}`); }
  try { starter(problem, 'sql'); contractLine(problem, 'sql'); } catch (error) { errors.push(`The SQL starter fails: ${error}`); }
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
