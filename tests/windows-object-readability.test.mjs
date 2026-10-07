// Dependency-free DOM/timing model of the exact desktop measurement helper.
// Native Electron viewport and zoom behavior remains covered by the desktop test.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { focusedObjectSnapshot, waitForReadableObject } from './helpers/object-readability.mjs';

const viewport = { width: 1024, height: 720 };
const desktop = fs.readFileSync(new URL('./object-view-readability.e2e.mjs', import.meta.url), 'utf8');
const start = desktop.indexOf('  const minimumLines = '), end = desktop.indexOf('  const mode = ', start);
assert.ok(start >= 0 && end > start);
const check = new Function('page', 'host', 'card', 'item', 'waitForReadableObject', 'assert', `return (async()=>{${desktop.slice(start, end)} return focus;})();`);

function fixture({ delay = 80, resizeDelay = 48, height = 327.015625, top = 354.171875, clipped = false, covered = false, focused = true, staleViewport = false } = {}) {
  let now = 0, elementDisposed = 0, resultDisposed = 0;
  const container = { dataset: { objectFocused: String(focused) }, getBoundingClientRect: () => ({ width: 963 }) };
  const ancestor = { parentElement: null, getBoundingClientRect: () => ({ top: clipped ? top + 10 : 0, bottom: 720 }) };
  const currentHeight = () => now >= delay ? height : 201.015625;
  const body = {
    parentElement: ancestor,
    closest(selector) { assert.equal(selector, '.study-object-view'); return container; },
    getBoundingClientRect: () => ({ top, bottom: top + currentHeight(), left: 38, width: 933, height: currentHeight() }),
    get clientHeight() { return Math.round(currentHeight()); }, clientWidth: 918,
    contains: element => element === body,
    async dispose() { elementDisposed++; },
  };
  const context = vm.createContext({
    innerWidth: 1024, innerHeight: 720,
    getComputedStyle: element => element === body ? { paddingTop: '1px', paddingBottom: '1px', lineHeight: '25.6px' } : { overflowY: clipped ? 'hidden' : 'visible' },
    document: { elementFromPoint(x, y) {
      const portion = (y - top) / currentHeight();
      return covered === true || (typeof covered === 'number' && Math.abs(portion - covered) < .01) ? ancestor : body;
    } },
  });
  function evaluate(fn, args) {
    context.args = args;
    context.innerWidth = !staleViewport && now >= resizeDelay ? viewport.width : 956;
    context.innerHeight = !staleViewport && now >= resizeDelay ? viewport.height : 593;
    return vm.runInContext(`(${fn.toString()})(args)`, context);
  }
  const host = {
    async evaluate(fn, args) { return evaluate(fn, args); },
    async waitForFunction(fn, args, { timeout }) {
      assert.equal(timeout, 5000, 'The native layout wait is bounded.');
      const deadline = now + timeout;
      for (;;) {
        const result = evaluate(fn, args);
        if (result) return { async jsonValue() { return result; }, async dispose() { resultDisposed++; } };
        if (now >= deadline) throw new Error('Timeout waiting for readable Object View');
        now = Math.min(deadline, now + 16);
      }
    },
  };
  const locator = { async elementHandle() { return body; } };
  return {
    host, locator, body,
    page: { async evaluate() { return viewport; } },
    card: { locator(selector) { assert.equal(selector, '.study-object-body'); return locator; } },
    snapshot: () => evaluate(focusedObjectSnapshot, { body, viewport, minimumLines: 8, diagnostic: true }),
    advance: value => { now = value; },
    now: () => now,
    disposed: () => ({ element: elementDisposed, result: resultDisposed }),
  };
}

test('two child frames can observe the failed 201 px body before its 327 px layout arrives', () => {
  const f = fixture();
  f.advance(32);
  const focus = f.snapshot();
  assert.equal(focus.visibleHeight, 201.015625);
  assert.equal(focus.visibleHeight - focus.padding >= focus.lineHeight * 8 - 1, false);
  f.advance(80);
  const ready = f.snapshot();
  assert.equal(ready.visibleHeight, 327.015625);
  assert.ok(ready.visibleHeight - ready.padding >= ready.lineHeight * 8 - 1);
});

for (const delay of [0, 16, 80, 250, 1000]) test(`the desktop assertion waits for a ${delay} ms value-height update`, async () => {
  const f = fixture({ delay });
  const focus = await check(f.page, f.host, f.card, { name: 'minimum', zoom: 1 }, waitForReadableObject, assert);
  assert.ok(f.now() >= Math.max(delay, 48));
  assert.equal(focus.visibleHeight, 327.015625);
  assert.deepEqual(f.disposed(), { element: 1, result: 1 });
});

test('a readable child still waits for the full-window host viewport', async () => {
  const f = fixture({ delay: 0, resizeDelay: 400, top: 100 });
  const focus = await waitForReadableObject(f.host, f.locator, viewport, 8);
  assert.equal(f.now(), 400);
  assert.equal(focus.viewport.width, viewport.width);
  assert.equal(focus.viewport.height, viewport.height);
});

test('default 100% geometry still requires twelve complete lines', async () => {
  const good = fixture();
  await check(good.page, good.host, good.card, { name: 'default', zoom: 1 }, waitForReadableObject, assert);
  const short = fixture({ height: 250 });
  await assert.rejects(check(short.page, short.host, short.card, { name: 'default', zoom: 1 }, waitForReadableObject, assert), /must show 12 complete lines/);
  assert.equal(short.now(), 5000);
});

for (const [name, options] of [
  ['persistently short body', { height: 201.015625 }],
  ['partial eighth line', { height: 205.75 }],
  ['clipped ancestor', { clipped: true }],
  ['covered upper pixels', { covered: .1 }],
  ['covered middle pixels', { covered: .5 }],
  ['covered lower pixels', { covered: .9 }],
  ['unfocused card', { focused: false }],
  ['missing host resize', { staleViewport: true, top: 100 }],
]) test(`${name} remains a hard failure with final geometry diagnostics`, async () => {
  const f = fixture(options);
  await assert.rejects(waitForReadableObject(f.host, f.locator, viewport, 8), error => {
    assert.match(error.message, /Timeout waiting for readable Object View/);
    assert.match(error.message, /must show 8 complete lines/);
    assert.match(error.message, /expectedViewport.*1024.*720/);
    assert.match(error.message, /visibleHeight/);
    return true;
  });
  assert.equal(f.now(), 5000);
  assert.deepEqual(f.disposed(), { element: 1, result: 0 });
});

test('the existing one-pixel measurement tolerance is unchanged', async () => {
  const f = fixture({ height: 206 });
  const focus = await waitForReadableObject(f.host, f.locator, viewport, 8);
  assert.equal(focus.visibleHeight, 206);
});
