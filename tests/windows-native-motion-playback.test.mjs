// Dependency-free renderer/driver scheduling model using the real playback UI
// controller and the helper used by the desktop suite. Actual OS focus, painting
// and Electron pointer keyframes still require test:motion:desktop on Windows.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { armNativeMotionPlayback } from './helpers/native-motion-playback.mjs';

const workspace = fs.readFileSync(new URL('../visualizer-ui/workspace.js', import.meta.url), 'utf8');
const from = workspace.indexOf('  function attachPlayback('), to = workspace.indexOf('\n  function mount()', from);
assert.ok(from >= 0 && to > from, 'The production playback controller is present');
const controller = workspace.slice(from, to);
const desktop = fs.readFileSync(new URL('./pointer-motion.e2e.mjs', import.meta.url), 'utf8');
const checks = desktop.slice(desktop.indexOf('    assert.equal(paused.error,'), desktop.indexOf('    const recordings='));
const verifyPause = new Function('assert', 'paused', checks);

function fixture({ mode = 'detailed', total = 40, minimum = 12, timeout = 30000, defect } = {}) {
  let now = 0, timerId = 0, index = 0, stage = 0, advance;
  const timers = new Map(), subscribers = new Set(), observers = [], clicks = [];
  const elements = new Map();
  class Element {
    constructor() { this.attributes = new Map(); this.events = new Map(); this.disabled = false; this.textContent = ''; }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    addEventListener(name, callback) { const listeners = this.events.get(name) || []; listeners.push(callback); this.events.set(name, listeners); }
    removeEventListener(name, callback) { this.events.set(name, (this.events.get(name) || []).filter(listener => listener !== callback)); }
    checkVisibility() { return defect !== 'hidden Pause'; }
    click() {
      clicks.push({ id: this.id, label: this.getAttribute('aria-label'), index });
      if (defect === 'broken Pause' && this.getAttribute('aria-label') === 'Pause') return;
      if (defect === 'cosmetic Pause' && this.getAttribute('aria-label') === 'Pause') {
        this.setAttribute('aria-pressed', 'false'); return;
      }
      for (const listener of this.events.get('click') || []) listener({ target: this });
    }
    querySelector() { return speed; }
  }
  const next = new Element(), reset = new Element(), speed = new Element(), toolbar = new Element();
  next.id = 'btn-next'; reset.id = 'btn-reset'; speed.value = '4';
  elements.set(next.id, next); elements.set(reset.id, reset);
  const steps = { insertBefore(element) { elements.set(element.id, element); }, after() {} };
  const schedule = (callback, delay) => { const id = ++timerId; timers.set(id, { callback, at: now + delay }); return id; };
  const context = vm.createContext({
    Element, document: {
      hidden: false, getElementById: id => elements.get(id),
      createElement: () => new Element(), addEventListener() {},
    },
    setTimeout: schedule, clearTimeout: id => timers.delete(id),
    MutationObserver: class { constructor(callback) { observers.push(callback); } observe() {} disconnect() {} },
    addEventListener() {},
    studyLessonSource: { index: () => index },
    studyLessonAdapter: { subscribe(listener) { subscribers.add(listener); return () => subscribers.delete(listener); } },
    nativePointerProbe: { sample: () => {
      if (defect === 'probe exception' && index === minimum) throw new Error('Sample failed');
      return { index, lines: [`line-${index}`], labels: [] };
    } },
    studyWalkthrough: {
      mode,
      setGate(gate) { advance = gate.nextStep; },
      async next() {
        if (defect === 'stalled playback') return;
        if (mode === 'compact') advance();
        else if (stage === 0) stage = 1;
        else if (stage === 1) { advance(); stage = 2; }
        else stage = 0;
      },
    },
    toolbar, steps,
  });
  context.window = context;
  const changed = () => { for (const listener of subscribers) listener(); };
  next.addEventListener('click', () => {
    index++; next.disabled = index >= total;
    if (defect === 'disabled Pause' && index === minimum) elements.get('study-play').disabled = true;
    if (defect === 'wrong Pause label' && index === minimum) elements.get('study-play').setAttribute('aria-label', 'Play');
    changed();
    for (const observer of observers) observer();
  });
  vm.runInContext(`${controller}\nattachPlayback(toolbar, steps, 'study://app');`, context);
  const play = elements.get('study-play');
  const run = (fn, arg) => { context.argument = arg; return vm.runInContext(`(${fn.toString()})(argument)`, context); };
  async function elapse(ms) {
    const end = now + ms;
    while (true) {
      const due = [...timers.entries()].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
      if (!due) break;
      const [id, timer] = due; timers.delete(id); now = timer.at;
      await timer.callback();
    }
    now = end;
  }
  return {
    context, play, clicks, subscribers, timers, changed, index: () => index, elapse, run,
    arm: () => run(armNativeMotionPlayback, { minimum, timeout }),
    async nativePlay(driverDelay = 0) { play.click(); await elapse(driverDelay); },
    dispose() { context.nativeMotionUnsubscribe(); },
  };
}

test('timer-driven playback can finish while an animation-frame observer is never scheduled', async () => {
  const f = fixture();
  let records = 0;
  f.subscribers.add(() => records++);
  await f.nativePlay(65000);
  assert.equal(records, 40);
  assert.equal(f.index(), 40);
  assert.equal(f.play.getAttribute('aria-pressed'), 'false');
  assert.equal(f.clicks.filter(click => click.label === 'Pause').length, 0,
    'Completion alone does not exercise Pause; a late driver cannot recover that coverage.');
});

for (const mode of ['compact', 'detailed']) {
  for (const driverDelay of [0, 65000]) {
    test(`${mode}: armed Pause preserves all 12 transitions with a ${driverDelay} ms driver delay and no animation frames`, async () => {
      const f = fixture({ mode });
      f.arm();
      await f.nativePlay(driverDelay);
      await f.elapse(30000);
      const paused = await f.context.nativeMotionCompletion;
      verifyPause(assert, paused);
      assert.equal(paused.index, 12);
      assert.equal(paused.recorded, 12);
      assert.deepEqual(Array.from(f.context.nativeMotionPlayback, pair => [pair.before.index, pair.after.index]),
        Array.from({ length: 12 }, (_, i) => [i, i + 1]));
      assert.equal(f.clicks.filter(click => click.label === 'Pause').length, 1);
      await f.elapse(mode === 'detailed' ? 1800 : 600);
      assert.equal(f.index(), paused.index, 'The actual production Pause cancels future timer-driven steps.');
      f.dispose();
      assert.equal(f.subscribers.size, 0);
      assert.equal(f.timers.size, 0);
    });
  }
}

test('same-index notifications cannot satisfy the transition target or trigger Pause twice', async () => {
  const f = fixture({ mode: 'compact' });
  f.arm();
  for (let i = 0; i < 50; i++) f.changed();
  assert.equal(f.context.nativeMotionPlayback.length, 0);
  await f.nativePlay(3000);
  verifyPause(assert, await f.context.nativeMotionCompletion);
  for (let i = 0; i < 50; i++) f.changed();
  assert.equal(f.clicks.filter(click => click.label === 'Pause').length, 1);
  f.dispose();
});

test('the observation deadline starts with native Play, not its actionability wait', async () => {
  const f = fixture();
  f.arm(); await f.elapse(19000);
  assert.equal(f.timers.size, 0);
  await f.nativePlay(18000);
  verifyPause(assert, await f.context.nativeMotionCompletion);
  f.dispose();
});

test('the post-Pause observation rejects a button that only changes its pressed appearance', async () => {
  const f = fixture({ defect: 'cosmetic Pause' });
  f.arm(); await f.nativePlay(17500);
  const paused = await f.context.nativeMotionCompletion;
  verifyPause(assert, paused);
  await f.elapse(1800);
  assert.notEqual(f.index(), paused.index, 'Detailed playback needs more than one moment to expose an uncanceled timer.');
  f.dispose();
});

for (const [defect, error] of [
  ['stalled playback', /did not record 12/],
  ['broken Pause', /did not stop playback/],
  ['disabled Pause', /not available/],
  ['hidden Pause', /not available/],
  ['wrong Pause label', /not available/],
  ['probe exception', /Sample failed/],
]) {
  test(`the helper still rejects ${defect}`, async () => {
    const f = fixture({ defect });
    f.arm(); await f.nativePlay(30000);
    const paused = await f.context.nativeMotionCompletion;
    assert.match(paused.error, error);
    assert.throws(() => verifyPause(assert, paused));
    f.dispose();
    assert.equal(f.subscribers.size, 0);
  });
}

test('natural completion at the target cannot masquerade as a successful Pause', async () => {
  const f = fixture({ total: 12 });
  f.arm(); await f.nativePlay(30000);
  const paused = await f.context.nativeMotionCompletion;
  assert.equal(paused.finished, true);
  assert.match(paused.error, /not available/);
  assert.throws(() => verifyPause(assert, paused));
  assert.equal(f.clicks.filter(click => click.label === 'Pause').length, 0);
  f.dispose();
});

test('disposal before activation clears the deadline and subscriber', async () => {
  const f = fixture();
  f.arm(); f.dispose();
  assert.match((await f.context.nativeMotionCompletion).error, /disposed/);
  assert.equal(f.subscribers.size, 0);
  assert.equal(f.timers.size, 0);
});

test('an invalid observation or already-running example fails before installing a subscriber', async () => {
  const f = fixture();
  assert.throws(() => f.run(armNativeMotionPlayback, { minimum: 0, timeout: 30000 }), /bounds/);
  f.play.click();
  assert.throws(() => f.arm(), /must start paused/);
  assert.equal(f.subscribers.size, 0);
});

test('desktop integration retains native Play, all motion assertions, and checks from the exact Pause index', () => {
  assert.match(desktop, /await frame\.evaluate\(armNativeMotionPlayback,\{minimum:12,timeout:30000\}\)/);
  assert.match(desktop, /await frame\.getByRole\('button',\{name:'Play',exact:true\}\)\.click\(\)/);
  assert.match(desktop, /for\(const recording of recordings\)compare\(recording\.before,recording\.after,/);
  assert.match(desktop, /const index=paused\.index;\s+\/\/[^\n]+\n\s+await page\.waitForTimeout\(mode==='detailed'\?1800:600\);\s+assert\.equal\(await frame\.evaluate\(\(\)=>studyLessonSource\.index\(\)\),index,'native Pause stops playback'\)/);
  assert.match(desktop, /finally\{await frame\.evaluate\(\(\)=>nativeMotionUnsubscribe\(\)\);\}/);
});
