// Dependency-free lifecycle model executing the production pause subscription,
// pause callback and presentation effect. Electron IPC/focus and QuickJS remain
// covered by the real Windows test:debugger gate, not by this model.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';

const source = fs.readFileSync(new URL('../src/coding/DebugWorkspace.tsx', import.meta.url), 'utf8');
const desktop = fs.readFileSync(new URL('./debugger.e2e.mjs', import.meta.url), 'utf8');
const between = (text, start, end) => {
  const from = text.indexOf(start), to = text.indexOf(end, from);
  assert.ok(from >= 0 && to > from, `Source boundary: ${start}`);
  return text.slice(from, to);
};
const send = between(source, '  function send(', '  function move(');
const pause = between(source, '  function pause()', '  useEffect(()=>{');
const current = source.match(/  const keyboard=useRef\([^\n]+/)[0];
const subscription = source.split('\n').find(line => line.includes('window.study.onPlaybackPause('));
const presentation = source.split('\n').find(line => line.includes("if(!active||historical||paused||presentationPaused||result||motion.current!=='play'||!live)return;"));
assert.ok(subscription && presentation, 'The actual native subscription and presentation effect are present.');
const renderBody = stripTypeScriptTypes(`function render({live,result,paused,presentationPaused,moment}){
  const active=true,historical=false,detail='detailed',speed=4,move=()=>{};
  ${send}${pause}${current}${subscription}${presentation}
  return {pause};
}`, { mode: 'strip' });

function fixture() {
  const state = { live: undefined, result: null, paused: false, presentationPaused: false, moment: 0, status: 'Starting' };
  const native = new Set(), visibility = new Set(), messages = [], timers = new Map(), refs = [], effects = [];
  let now = 0, nextTimer = 0, refIndex = 0, effectIndex = 0, api;
  const context = vm.createContext({
    window: { study: { onPlaybackPause(callback) { native.add(callback); return () => native.delete(callback); } } },
    document: {
      hidden: false,
      addEventListener(name, callback) { assert.equal(name, 'visibilitychange'); visibility.add(callback); },
      removeEventListener(name, callback) { assert.equal(name, 'visibilitychange'); visibility.delete(callback); },
    },
    worker: { current: { postMessage(message) { messages.push(message); } } },
    session: { current: 'first-session' }, motion: { current: 'play' }, acknowledged: { current: null },
    setPresentationPaused: value => { state.presentationPaused = value; },
    setPaused: value => { state.paused = value; },
    setStatus: value => { state.status = value; },
    setMoment: value => { state.moment = typeof value === 'function' ? value(state.moment) : value; },
    useRef(value) { const slot = refIndex++; return refs[slot] ||= { current: value }; },
    useEffect(callback, deps) {
      const slot = effectIndex++, prior = effects[slot];
      if (prior && deps.length === prior.deps.length && deps.every((dep, i) => Object.is(dep, prior.deps[i]))) return;
      prior?.cleanup?.(); effects[slot] = { deps, cleanup: callback() };
    },
    setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { at: now + delay, callback }); return id; },
    clearTimeout: id => timers.delete(id),
  });
  vm.runInContext(renderBody, context);
  function render(update = {}) {
    Object.assign(state, update); refIndex = 0; effectIndex = 0;
    api = context.render(state);
  }
  function elapse(ms) {
    const end = now + ms;
    while (true) {
      const next = [...timers.entries()].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      const [id, timer] = next; timers.delete(id); now = timer.at; timer.callback(); render();
    }
    now = end;
  }
  render(); // The native subscription is installed before the first frame exists.
  return {
    state, native, visibility, messages, timers, context, render, elapse,
    nativePause() { for (const callback of native) callback(); render(); },
    setHidden(value) { context.document.hidden = value; for (const callback of visibility) callback(); render(); },
    manualPause() { api.pause(); render(); },
    dispose() { for (const effect of effects) effect.cleanup?.(); },
  };
}

test('native pause uses the current live frame after a mount with no frames', () => {
  const f = fixture();
  f.render({ live: { index: 2 }, status: 'Playing' });
  assert.equal(f.timers.size, 1);
  f.nativePause();
  assert.equal(f.state.status, 'Paused');
  assert.equal(f.state.paused, true);
  assert.equal(f.state.presentationPaused, true);
  assert.equal(f.messages.at(-1).type, 'pause', 'The worker still receives the pause command.');
  assert.equal(f.timers.size, 0, 'The pending presentation dwell is cancelled.');
  f.elapse(2000);
  assert.equal(f.state.moment, 0);
  assert.equal(f.messages.filter(message => message.type === 'presented').length, 0);
  f.dispose();
});

test('visibility loss freezes presentation and visibility restoration never resumes it', () => {
  const f = fixture();
  f.render({ live: { index: 7 }, status: 'Playing' });
  f.setHidden(false);
  assert.equal(f.messages.length, 0);
  f.elapse(500); assert.equal(f.state.moment, 1);
  f.setHidden(true);
  assert.equal(f.state.status, 'Paused');
  assert.equal(f.state.presentationPaused, true);
  f.setHidden(false); f.elapse(2000);
  assert.equal(f.state.moment, 1);
  assert.equal(f.messages.filter(message => message.type === 'presented').length, 0);
  f.dispose();
});

test('one stable native subscription sees new sessions and the latest completion state', () => {
  const f = fixture(), registered = [...f.native][0];
  for (let attempt = 1; attempt <= 3; attempt++) {
    f.context.session.current = `session-${attempt}`;
    f.render({ live: { index: attempt }, paused: false, presentationPaused: false, status: 'Playing' });
    f.nativePause();
    assert.equal(f.state.status, 'Paused');
    assert.equal(f.messages.at(-1).sessionId, `session-${attempt}`);
    assert.equal(f.native.size, 1); assert.equal([...f.native][0], registered);
  }
  f.render({ result: { type: 'finished' }, status: 'Finished', paused: false, presentationPaused: false });
  f.nativePause();
  assert.equal(f.state.status, 'Finished', 'A native event must not turn a finished result back into Paused.');
  assert.equal(f.state.paused, false);
  f.dispose();
});

test('manual pause remains effective and only an explicit resume restarts presentation', () => {
  const f = fixture();
  f.render({ live: { index: 2 }, status: 'Playing' });
  f.manualPause(); f.elapse(2000);
  assert.equal(f.state.moment, 0);
  f.render({ paused: false, presentationPaused: false, status: 'Playing' });
  f.elapse(1500);
  assert.equal(f.state.moment, 2);
  assert.equal(f.messages.filter(message => message.type === 'presented').length, 1);
  assert.equal(f.messages.at(-1).index, 2);
  f.dispose();
});

test('unmount removes native/visibility listeners and all pending presentation timers', () => {
  const f = fixture();
  f.render({ live: { index: 3 }, status: 'Playing' });
  f.dispose();
  assert.equal(f.native.size, 0); assert.equal(f.visibility.size, 0); assert.equal(f.timers.size, 0);
  f.nativePause(); f.setHidden(true); f.elapse(2000);
  assert.equal(f.messages.length, 0);
});

const play = between(desktop, 'async function playCheckpoint(){', '\nasync function breakpoint(');
const playCheckpoint = new Function('index', 'clickControl', 'page', `${play};return playCheckpoint;`);

test('the native E2E rejects a stale paused checkpoint before triggering the pause action', async () => {
  const clicked = [], waits = [];
  const play = playCheckpoint(async () => 'Step 1 · 1 checkpoints', async name => clicked.push(name), {
    async waitForFunction(predicate, before) { waits.push({ predicate, before }); },
  });
  await play();
  assert.deepEqual(clicked, ['Play']); assert.equal(waits.length, 1);
  const { predicate, before } = waits[0];
  const check = (status, paused, index) => vm.runInNewContext(`(${predicate.toString()})(before)`, {
    before, document: { querySelector(selector) {
      if (selector === '.debug-status') return { textContent: status };
      if (selector === '.debug-status.paused') return paused ? {} : null;
      if (selector === '.debug-timeline>span') return index === null ? null : { textContent: index };
      assert.fail(`Unexpected selector ${selector}`);
    } },
  });
  assert.equal(check('Entry', true, before), false);
  assert.equal(check('Playing', false, before), false, 'Running acknowledgement alone does not prove a new checkpoint.');
  assert.equal(check('Playing', false, null), false, 'A missing timeline is not a new checkpoint.');
  assert.equal(check('Paused', true, 'Step 2 · 2 checkpoints'), false);
  assert.equal(check('Playing', false, 'Step 2 · 2 checkpoints'), true);
  assert.match(desktop, /await playCheckpoint\(\);await pauseAction\(\);await paused\(\);/);
  assert.match(desktop, /assert\.equal\(await index\(\),stopped\)/, 'Checkpoint stability remains a strict equality assertion.');
});

test('failed Play or readiness checks are propagated without retrying', async () => {
  for (const failAt of ['click', 'readiness']) {
    let clicks = 0, waits = 0;
    const failure = new Error(`Failed ${failAt}`);
    const play = playCheckpoint(async () => 'Step 1 · 1 checkpoints', async () => { clicks++; if (failAt === 'click') throw failure; }, {
      async waitForFunction() { waits++; throw failure; },
    });
    await assert.rejects(play(), error => error === failure);
    assert.equal(clicks, 1); assert.equal(waits, failAt === 'click' ? 0 : 1);
  }
});
