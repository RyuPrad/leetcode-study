import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CodingProblem, Language } from '../shared/coding';
import { solutionPath } from '../coding/solutions';
import { PROBLEM_COUNT } from '../scripts/library-size.mjs';
import { lex, normalize, toLines, units, wholeSolution } from '../src/typing/snippets';
import { TypingRun } from '../src/typing/engine';
import { personalBest, validResult, type TypingResult } from '../src/typing/typing-store';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const problems = JSON.parse(fs.readFileSync(path.join(root, 'coding/problems.json'), 'utf8')) as CodingProblem[];
const solutions: { name: string; language: Language; text: string }[] = problems.flatMap(p => [
  { name: `javascript/${p.number}`, language: 'javascript' as Language, text: p.reference },
  ...(['typescript', 'java', 'c'] as const).map(language => ({ name: `${language}/${p.number}`, language: language as Language, text: fs.readFileSync(path.join(root, solutionPath(p.number, language)), 'utf8') }))
]);
const codeLines = (source: string, language: Language) => toLines(source, language).filter(l => !l.skip).map(l => l.text);
function balanced(source: string, language: Language) {
  const kinds = lex(source, language), stack: string[] = [], open: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  for (let i = 0; i < source.length; i++) {
    if (kinds[i]) continue;
    if ('([{'.includes(source[i])) stack.push(source[i]);
    else if (')]}'.includes(source[i]) && stack.pop() !== open[source[i]]) return false;
  }
  return !stack.length;
}

test('every reference solution splits into balanced snippets that cover its code in order', () => {
  assert.equal(solutions.length, PROBLEM_COUNT * 4);
  for (const { name, language, text } of solutions) {
    const whole = normalize(text), snippets = units(text, language);
    assert.ok(snippets.length > 0, name);
    assert.ok(balanced(whole, language), `${name} is balanced as a whole`);
    const typed = snippets.flatMap(s => { assert.ok(balanced(s.source, language), `${name}: ${s.label}`); assert.ok(s.label && !/\s{2}/.test(s.label), `${name} label`); return codeLines(s.source, language); });
    // Only a class wrapper's header and closing brace may be left out of the snippets.
    let next = 0;
    for (const line of codeLines(whole, language)) {
      if (line === typed[next]) next++;
      else assert.match(line, /^(?:(?:export|public|private|protected|abstract|final|static)\s+)*class\s+\w+.*\{$|^\};?$/, `${name} leaves out ${JSON.stringify(line)}`);
    }
    assert.equal(next, typed.length, `${name} snippets follow the solution`);
    assert.equal(wholeSolution(text).source, whole);
  }
});

test('class members become their own labelled snippets; short members join the next one', () => {
  const java = units(fs.readFileSync(path.join(root, 'coding/solutions/java/155.java'), 'utf8'), 'java');
  assert.deepEqual(java.map(s => s.label), ['MinStack.MinStack, push', 'MinStack.pop, top, getMin']);
  assert.ok(java[0].source.startsWith('private final List<int[]> stack'), 'members are dedented');
  const c = units(fs.readFileSync(path.join(root, 'coding/solutions/c/1.c'), 'utf8'), 'c');
  assert.deepEqual(c.map(s => s.label), ['twoSum'], 'a one-line struct joins the function after it');
  assert.deepEqual(units('class Solution {\n    public int f(int x) {\n        int y = x;\n        y++;\n        return y;\n    }\n}', 'java').map(s => s.source.split('\n')[0]), ['public int f(int x) {']);
});

test('normalizing and splitting lines: automatic indentation, skipped comments, strings are not comments', () => {
  assert.equal(normalize('\r\n\tif (a) {  \r\n\t\tb();\r\n\t}\r\n\r\n'), '    if (a) {\n        b();\n    }');
  const lines = toLines(normalize([
    '// heading',
    'const url = "http://x"; // trailing',
    '  /* block',
    '     still */',
    'const t = `a${ {b: 1}.b }c // not a comment`;',
    'const r = /\\/\\/[}]/g.test(s); /* end */',
    '',
    "char c = '\"'; // quote"
  ].join('\n')), 'javascript');
  assert.deepEqual(lines.map(l => [l.indent, l.text, l.comment, l.skip]), [
    [0, '', '// heading', true],
    [0, 'const url = "http://x";', ' // trailing', false],
    [2, '', '/* block', true],
    [5, '', 'still */', true],
    [0, 'const t = `a${ {b: 1}.b }c // not a comment`;', '', false],
    [0, 'const r = /\\/\\/[}]/g.test(s);', ' /* end */', false],
    [0, '', '', true],
    [0, "char c = '\"';", ' // quote', false]
  ]);
});

const lines = (source: string) => toLines(normalize(source), 'javascript');
const typeAll = (run: TypingRun, text: string, clock: { t: number }, step = 100) => { for (const char of text) { clock.t += step; run.type(char, clock.t); } };

test('a clean run: Enter jumps past indentation and skipped lines; the last character finishes', () => {
  const clock = { t: 1000 }, run = new TypingRun(lines('function f(a) {\n  // why\n\n  return a[0];\n}'));
  run.enter(clock.t); assert.equal(run.started, false, 'Enter before typing does not start the clock');
  typeAll(run, 'function f(a) {', clock); clock.t += 100; run.enter(clock.t);
  assert.equal(run.line, 3, 'the comment and blank lines are skipped');
  typeAll(run, 'return a[0];', clock); clock.t += 100; run.enter(clock.t);
  assert.equal(run.done, false); typeAll(run, '}', clock); assert.equal(run.done, true);
  const stats = run.stats(clock.t + 5000);
  assert.equal(stats.correct, 'function f(a) {'.length + 'return a[0];'.length + 1);
  assert.deepEqual([stats.incorrect, stats.extra, stats.missed, stats.accuracy], [0, 0, 0, 100]);
  // 30 keystrokes, 100 ms apart from the first: 29 * 100 ms of typing; the time after finishing is not counted.
  assert.equal(stats.ms, 2900);
  assert.equal(stats.wpm, Math.round((stats.correct + 2) / 5 / (2900 / 60000) * 100) / 100);
  assert.equal(stats.samples.length, 3);
});

test('mistakes, extras, an early Enter and Backspace follow Monkeytype', () => {
  const clock = { t: 0 }, run = new TypingRun(lines('ab;\ncd;\nef;'));
  typeAll(run, 'xb;', clock);
  assert.equal(run.typed[0], 'xb;'); assert.equal(run.column, 3, 'a wrong character still advances');
  typeAll(run, '!!', clock); run.enter(clock.t += 100);
  typeAll(run, 'c', clock); run.enter(clock.t += 100);
  assert.equal(run.line, 2);
  run.backspace(); assert.equal(run.line, 1, 'Backspace returns to a line with an error'); assert.equal(run.typed[1], 'c');
  run.backspace(); run.backspace(); assert.equal(run.line, 0, 'and to an earlier one with extras');
  run.backspace(); run.backspace(); assert.equal(run.typed[0], 'xb;');
  run.backspaceWord(); assert.equal(run.typed[0], 'xb', 'Ctrl+Backspace removes a run of symbols');
  run.backspaceWord(); assert.equal(run.typed[0], '');
  typeAll(run, 'ab;', clock); run.enter(clock.t += 100); typeAll(run, 'cd;', clock); run.enter(clock.t += 100);
  run.backspace(); assert.equal(run.line, 2, 'Backspace does not return to a correct line');
  typeAll(run, 'e', clock); run.enter(clock.t += 100);
  assert.equal(run.done, true, 'Enter on the last line ends the run');
  const stats = run.stats(clock.t);
  assert.deepEqual([stats.correct, stats.incorrect, stats.extra, stats.missed], [7, 0, 0, 2]);
  assert.deepEqual(stats.misses, [['\n', 2], ['a', 1], ['d', 1], ['f', 1]], 'extras count against the line break; early Enters against the next character');
  assert.equal(stats.accuracy, Math.round(13 / 18 * 10000) / 100, 'corrected mistakes still count');
});

test('extras stop at the limit and pausing excludes the time away', () => {
  const clock = { t: 0 }, run = new TypingRun(lines('a;\nb;'));
  typeAll(run, 'a;', clock); typeAll(run, 'z'.repeat(40), clock);
  assert.equal(run.typed[0].length, 22);
  run.pause(clock.t); clock.t += 60_000;
  assert.equal(run.running, false);
  run.enter(clock.t += 100); typeAll(run, 'b;', clock);
  assert.equal(run.done, true);
  assert.ok(run.stats(clock.t).ms < 10_000, 'the minute away is not counted');
});

test('typing results are validated and personal bests are per language and mode', () => {
  const result: TypingResult = { at: '2026-10-14T12:00:00.000Z', problemId: 'leetcode:1', language: 'java', mode: 'snippet', unit: 'twoSum', ms: 9000, wpm: 61.5, raw: 70, accuracy: 96.2, correct: 150, incorrect: 3, extra: 1, missed: 0 };
  assert.ok(validResult(result));
  for (const bad of [null, { ...result, problemId: '__proto__' }, { ...result, language: 'python' }, { ...result, wpm: -1 }, { ...result, accuracy: 101 }, { ...result, at: 'yesterday' }]) assert.equal(validResult(bad), false);
  const list = [result, { ...result, wpm: 80, problemId: 'leetcode:2' }, { ...result, wpm: 99, language: 'c' as Language }];
  assert.equal(personalBest(list, 'java', 'snippet')?.wpm, 80);
  assert.equal(personalBest(list, 'java', 'snippet', 'leetcode:1')?.wpm, 61.5);
  assert.equal(personalBest(list, 'java', 'solution'), null);
});
