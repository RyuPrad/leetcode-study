import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getQuickJS } from 'quickjs-emscripten';
import definitions from '../coding/problems.json';
import { assembleNative, referenceOutcomes } from '../coding/engine';
import { nativeAvailable, runNative, type NativeRunOptions } from '../desktop/native-runner';
import type { CodingProblem, JudgeResult, NativeLanguage } from '../shared/coding';

const problems = definitions as CodingProblem[];
const fixtures = path.join(import.meta.dirname, 'fixtures', 'languages');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'leetcode-native-test-'));
const options: NativeRunOptions = { toolchains: path.join(import.meta.dirname, '..', 'toolchains'), native: path.join(import.meta.dirname, '..', 'dist', 'native'), tempRoot: temp };
const missing = (language: NativeLanguage) => !nativeAvailable(options, language) && `${language} toolchain not prepared (npm run fetch:toolchains, then npm run build)`;
test.after(() => fs.rmSync(temp, { recursive: true, force: true }));

async function judgeFile(language: NativeLanguage, file: string, number: number, signal?: AbortSignal): Promise<JudgeResult> {
  const problem = problems.find(p => p.number === number)!, source = fs.readFileSync(file, 'utf8'), cases = [...problem.examples, ...problem.tests];
  const references = referenceOutcomes(await getQuickJS(), problem, source, cases);
  const valid = cases.filter((_, i) => !references[i].invalid).map(c => c.input);
  const start = performance.now(), run = await runNative(problem, language, source, valid, { ...options, signal });
  return assembleNative(problem, cases, references, run, Math.round(performance.now() - start));
}
const summary = (result: JudgeResult) => result.cases.filter(c => c.verdict !== 'Accepted').slice(0, 2)
  .map(c => `${c.name}: ${c.verdict} ${c.error ?? ''}\n  input ${JSON.stringify(c.input).slice(0, 200)}\n  actual ${JSON.stringify(c.actual)?.slice(0, 200)}\n  expected ${JSON.stringify(c.expected)?.slice(0, 200)}`).join('\n');

for (const language of ['c', 'java'] as const) {
  const extension = language === 'c' ? '.c' : '.java';
  test(`correct ${language} solutions are Accepted on every submission case`, { skip: missing(language) }, async () => {
    const files = fs.readdirSync(path.join(fixtures, language)).filter(f => f.endsWith(extension));
    assert.ok(files.length >= 25);
    for (const file of files) {
      const result = await judgeFile(language, path.join(fixtures, language, file), Number.parseInt(file));
      assert.equal(result.verdict, 'Accepted', `${language}/${file}\n${summary(result)}`);
      assert.equal(result.passed, result.total);
    }
  });
}

const failure = (name: string) => path.join(fixtures, 'failures', name);
test('C failures report wrong answers, crashes, timeouts and compile errors on the user\'s lines', { skip: missing('c') }, async () => {
  assert.equal((await judgeFile('c', failure('wrong-1.c'), 1)).verdict, 'Wrong answer');
  const crash = await judgeFile('c', failure('segfault-1.c'), 1);
  assert.equal(crash.verdict, 'Runtime error'); assert.match(crash.cases[0].error!, /Segmentation fault/); assert.match(crash.cases[0].logs.join('\n'), /before crash 4/);
  const slow = await judgeFile('c', failure('timeout-1.c'), 1);
  assert.equal(slow.verdict, 'Time limit exceeded'); assert.equal(slow.cases.length, 1, 'judging stops at the first timeout');
  const deep = await judgeFile('c', failure('overflow-70.c'), 70);
  assert.equal(deep.verdict, 'Runtime error'); assert.match(deep.cases[0].error!, /Stack overflow/);
  const compile = await judgeFile('c', failure('compile-1.c'), 1);
  assert.equal(compile.verdict, 'Syntax error'); assert.match(compile.cases[0].error!, /solution\.c:3/);
});

test('Java failures report wrong answers, exceptions with user lines, timeouts, stack and memory limits', { skip: missing('java') }, async () => {
  assert.equal((await judgeFile('java', failure('wrong-1.java'), 1)).verdict, 'Wrong answer');
  const thrown = await judgeFile('java', failure('exception-1.java'), 1);
  assert.equal(thrown.verdict, 'Runtime error');
  assert.match(thrown.cases[0].error!, /ArrayIndexOutOfBoundsException[\s\S]*Solution\.twoSum\(Solution\.java:5\)/);
  assert.match(thrown.cases[0].logs.join('\n'), /before exception 4/);
  const slow = await judgeFile('java', failure('timeout-1.java'), 1);
  assert.equal(slow.verdict, 'Time limit exceeded'); assert.equal(slow.cases.length, 1);
  const deep = await judgeFile('java', failure('overflow-70.java'), 70);
  assert.equal(deep.verdict, 'Runtime error'); assert.match(deep.cases[0].error!, /StackOverflowError/);
  assert.equal((await judgeFile('java', failure('memory-70.java'), 70)).verdict, 'Memory limit exceeded');
  const compile = await judgeFile('java', failure('compile-1.java'), 1);
  assert.equal(compile.verdict, 'Syntax error'); assert.match(compile.cases[0].error!, /Solution\.java:3: error: ';' expected/);
});

test('Stop kills a running native job and leaves no work directory behind', { skip: missing('c') || missing('java') }, async () => {
  for (const [language, file] of [['c', 'timeout-1.c'], ['java', 'timeout-1.java']] as const) {
    const controller = new AbortController(), started = performance.now();
    setTimeout(() => controller.abort(), 700);
    const result = await judgeFile(language, failure(file), 1, controller.signal);
    assert.equal(result.verdict, 'Cancelled', language);
    assert.ok(performance.now() - started < 1900, `${language} stopped before its case deadline`);
  }
  const runs = path.join(temp, 'leetcode-study-runs');
  assert.deepEqual(fs.existsSync(runs) ? fs.readdirSync(runs) : [], []);
});
