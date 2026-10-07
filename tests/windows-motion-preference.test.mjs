// Dependency-free media-event/animation timing model. Executes the production
// cancellation listener and browser test's assertion block; real browser/Windows
// behavior remains covered by test:motion and test:motion:desktop.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const learning = fs.readFileSync(new URL('../visualizer-ui/learning.js', import.meta.url), 'utf8');
const motion = fs.readFileSync(new URL('./pointer-motion.mjs', import.meta.url), 'utf8');
function between(source, from, to) {
  const start = source.indexOf(from), end = source.indexOf(to, start);
  assert.ok(start >= 0 && end > start, `Source boundary: ${from}`);
  return source.slice(start, end);
}
const listener = between(learning, '    const motionPreference=matchMedia(', '    const scheduleFlows=');
const check = between(motion, "      await page.emulateMedia({reducedMotion:'reduce'});", "      await move(page,'next',{settle:true,label:'reduced motion instruction'});");

function fixture({ eventDelay = 80, deliver = true, cancelWorks = true } = {}) {
  let now = 0, changed = false;
  const listeners = [];
  const media = { matches: false, addEventListener(type, callback) { assert.equal(type, 'change'); listeners.push(callback); } };
  const animations = [0, 1].map(() => ({ playState: 'running', cancel() { if (cancelWorks) this.playState = 'idle'; } }));
  const state = { savedPointerAnimations: animations, runningAnimations: [...animations], positionCache: new Map([['pointer', 1]]), lastAnimation: 100, matchMedia: query => { assert.equal(query, '(prefers-reduced-motion: reduce)'); return media; } };
  const context = vm.createContext(state);
  vm.runInContext(listener, context);
  const evaluate = fn => vm.runInContext(`(${fn.toString()})()`, context);
  function advance(ms) {
    now += ms;
    if (deliver && media.matches && !changed && now >= eventDelay) {
      changed = true;
      for (const callback of listeners) callback({ matches: true });
    }
    if (now >= 200) for (const animation of animations) if (animation.playState === 'running') animation.playState = 'finished';
  }
  const page = {
    async emulateMedia({ reducedMotion }) { assert.equal(reducedMotion, 'reduce'); media.matches = true; },
    async waitForTimeout(ms) { advance(ms); },
    async evaluate(fn) { return evaluate(fn); },
    async waitForFunction(fn, arg, { timeout }) {
      assert.equal(arg, null);
      assert.equal(timeout, 5000, 'the cancellation wait must be bounded');
      const deadline = now + timeout;
      while (!evaluate(fn)) {
        if (now >= deadline) throw new Error('Timed out waiting for reduced-motion cancellation');
        advance(Math.min(16, deadline - now));
      }
    },
  };
  return { state, page, now: () => now };
}

test('a fixed 20 ms sleep can check before the media-query event is delivered', async () => {
  const { page } = fixture();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(20);
  assert.equal(await page.evaluate(() => savedPointerAnimations.every(animation => animation.playState === 'idle')), false);
});

for (const eventDelay of [0, 16, 80, 250, 1000]) test(`the real assertion waits for cancellation with a ${eventDelay} ms media-event delay`, async () => {
  const f = fixture({ eventDelay });
  await new Function('page', 'assert', `return (async()=>{${check}})();`)(f.page, assert);
  assert.ok(f.now() >= eventDelay);
  assert.ok(f.state.savedPointerAnimations.every(animation => animation.playState === 'idle'));
  assert.equal(f.state.runningAnimations.length, 0);
  assert.equal(f.state.positionCache.size, 0);
  assert.equal(f.state.lastAnimation, 0);
});

test('natural animation completion cannot hide a missing cancellation event', async () => {
  const f = fixture({ deliver: false });
  await assert.rejects(new Function('page', 'assert', `return (async()=>{${check}})();`)(f.page, assert), /Timed out waiting for reduced-motion cancellation/);
  assert.ok(f.state.savedPointerAnimations.every(animation => animation.playState === 'finished'));
  assert.equal(f.now(), 5000);
  assert.equal(f.state.runningAnimations.length, 2);
});

test('a delivered media event with broken cancellation still fails', async () => {
  const f = fixture({ cancelWorks: false });
  await assert.rejects(new Function('page', 'assert', `return (async()=>{${check}})();`)(f.page, assert), /Timed out waiting for reduced-motion cancellation/);
  assert.ok(f.state.savedPointerAnimations.every(animation => animation.playState === 'finished'));
  assert.equal(f.state.runningAnimations.length, 0, 'the listener did run');
});
