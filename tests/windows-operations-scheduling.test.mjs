// Dependency-free scheduling model of the exact operation traversal callback.
// Real Chromium navigation and rendered highlights remain covered by operations.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';

const source = fs.readFileSync(new URL('./operations.mjs', import.meta.url), 'utf8');
const start = source.indexOf('const result=await page.evaluate(async()=>{');
const end = source.indexOf('\n });', start);
assert.ok(start >= 0 && end > start, 'The real all-lesson traversal callback is present.');
const body = source.slice(start + 'const result=await page.evaluate(async()=>{'.length, end);
const traversal = new vm.Script(`(async()=>{${body}})()`);
const navigation = source.match(/await page\.goto\([^\n]+\);await page\.waitForFunction\([^\n]+\);/)[0];

function fixture({ total = 70, limit = total, defect, defectAt = 7 } = {}) {
  let index = 0;
  const stepped = [], highlighted = [], yielded = [];
  const line = () => (index % 11) + 1;
  const walkthrough = { operation: null };
  const broken = kind => defect === kind && index === defectAt;
  const nextButton = { get disabled() { return index >= total; } };
  const lessonSource = {
    index: () => index,
    count: () => limit,
    pendingInstruction: () => ({ line: ((index + 1) % 11) + 1, phase: 'WRITE' }),
  };
  const adapter = { next() {
    if (defect === 'no progress' && index + 1 === defectAt) return;
    index++;
    stepped.push(index);
    walkthrough.operation = {
      kind: broken('missing kind') ? '' : 'copy',
      result: broken('missing result') ? '' : 'Copied the value.',
      location: { line: broken('invalid source line') ? 'bad' : line() },
      locations: broken('multiple source lines') ? [line(), line() + 1] : [broken('wrong reported line') ? line() + 1 : line()],
    };
  } };
  const document = {
    getElementById(id) {
      if (id === 'btn-next') return nextButton;
      if (broken('missing source element')) return null;
      assert.equal(id, `line-${line()}`);
      highlighted.push(index);
      return { id };
    },
    querySelectorAll(selector) {
      assert.equal(selector, '.operation-code');
      return [{ id: `line-${broken('wrong rendered line') ? line() + 1 : line()}` }];
    },
  };
  const context = vm.createContext({
    studyLessonAdapter: adapter, studyWalkthrough: walkthrough, studyLessonSource: lessonSource,
    document,
    getComputedStyle: () => ({ backgroundColor: broken('invisible source highlight') ? 'transparent' : 'rgb(39, 73, 108)' }),
    setTimeout(callback, delay) {
      assert.equal(delay, 0, 'Yield to a real timer task without an arbitrary sleep.');
      yielded.push(index);
      return setTimeout(callback, delay);
    },
  });
  return { run: () => traversal.runInContext(context), stepped, highlighted, yielded, index: () => index };
}

test('a long trace yields to pending work before completing and checks every transition', async () => {
  const f = fixture({ total: 103 });
  const pendingWork = new Promise(resolve => setTimeout(() => resolve(f.index()), 0));
  const result = await f.run();
  assert.equal(await pendingWork, 25, 'Pending work runs after the first batch, not after the entire trace.');
  assert.equal(result.count, 103);
  assert.equal(result.complete, true);
  assert.deepEqual(f.stepped, Array.from({ length: 103 }, (_, index) => index + 1));
  assert.deepEqual(f.highlighted, f.stepped, 'Every operation still has its visible source line checked.');
  assert.deepEqual(f.yielded, [25, 50, 75, 100]);
});

test('empty, short and batch-boundary traces retain their full coverage', async () => {
  for (const total of [0, 1, 24, 25, 26, 50]) {
    const f = fixture({ total });
    const result = await f.run();
    assert.equal(result.count, total);
    assert.equal(result.complete, true);
    assert.equal(f.stepped.length, total);
    assert.equal(f.highlighted.length, total);
    assert.equal(f.yielded.length, Math.floor(total / 25));
  }
});

for (const [defect, message] of [
  ['no progress', /No progress/],
  ['missing kind', /Incomplete operation/],
  ['missing result', /Incomplete operation/],
  ['invalid source line', /Incomplete operation/],
  ['multiple source lines', /highlights 2 source lines/],
  ['wrong reported line', /Wrong code highlight/],
  ['wrong rendered line', /Wrong code highlight/],
  ['missing source element', /is not visible/],
  ['invisible source highlight', /is not visible/],
]) {
  test(`the scheduling change still rejects ${defect}`, async () => {
    const f = fixture({ defect, defectAt: 32 });
    await assert.rejects(f.run(), message);
    assert.equal(f.index(), defect === 'no progress' ? 31 : 32, 'A failure is not retried or skipped.');
  });
}

test('an exhausted transition bound cannot pass an incomplete walkthrough', async () => {
  const result = await fixture({ total: 80, limit: 30 }).run();
  assert.equal(result.count, 30);
  assert.equal(result.complete, false);
  const completion = source.match(/assert\.ok\(result\.complete,'whole walkthrough reaches completion'\);/)[0];
  assert.throws(() => new Function('assert', 'result', completion)(assert, result), /whole walkthrough reaches completion/);
});

test('slow navigation gets a finite budget while retaining load and readiness checks', async () => {
  const calls = [];
  const page = {
    async goto(url, options) { calls.push({ kind: 'goto', url, options }); },
    async waitForFunction(predicate) { calls.push({ kind: 'ready', predicate: predicate.toString() }); },
  };
  await new Function('page', 'pathToFileURL', 'path', 'ROOT', 'lesson', `return (async()=>{${navigation}})();`)(
    page, pathToFileURL, path, '/fixture', { path: 'Trees/a_visualizer.html' },
  );
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, pathToFileURL(path.join('/fixture', 'Trees/a_visualizer.html')).href);
  assert.deepEqual(calls[0].options, { timeout: 90000 }, 'Default load event remains required.');
  assert.equal(calls[1].kind, 'ready');
  assert.match(calls[1].predicate, /window\.studyWalkthrough/);
});

test('navigation failures remain failures and are never silently retried', async () => {
  let attempts = 0;
  const failure = new Error('page.goto: Timeout 90000ms exceeded.');
  const page = {
    async goto() { attempts++; throw failure; },
    async waitForFunction() { assert.fail('Readiness must not run after a failed navigation.'); },
  };
  await assert.rejects(new Function('page', 'pathToFileURL', 'path', 'ROOT', 'lesson', `return (async()=>{${navigation}})();`)(
    page, pathToFileURL, path, '/fixture', { path: 'Trees/a_visualizer.html' },
  ), error => error === failure);
  assert.equal(attempts, 1);
});
