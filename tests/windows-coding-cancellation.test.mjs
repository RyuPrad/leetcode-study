// Dependency-free DOM/driver model. Executes the current CodeWorkspace runner
// callbacks, but does not replace the real Electron/QuickJS cancellation suite.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';
import { actWhileCodeRuns } from './helpers/running-code-action.mjs';

const source = fs.readFileSync(new URL('../src/coding/CodeWorkspace.tsx', import.meta.url), 'utf8');
const between = (start, end) => {
  const from = source.indexOf(start), to = source.indexOf(end, from);
  assert.ok(from >= 0 && to > from, `Runner source boundary: ${start}`);
  return source.slice(from, to);
};
const runner = stripTypeScriptTypes(
  between('  function disposeRunner()', '  useEffect(()=>{mounted.current') +
  between("  function start(mode:", '  const startRef=') +
  `\nfunction leaveProblem(){${between('    mounted.current=false;', '  };},[]);')}\n}`,
  { mode: 'strip' },
);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function fixture(options = {}) {
  const state = { busy: null, result: null, submissions: [], workers: [], observers: [], timers: new Set(), clicks: [], away: false };
  const later = (callback, ms) => {
    const timer = setTimeout(() => { state.timers.delete(timer); callback(); }, ms);
    state.timers.add(timer); return timer;
  };
  const clear = timer => { clearTimeout(timer); state.timers.delete(timer); };
  const changed = () => queueMicrotask(() => { for (const observer of state.observers) if (observer.connected) observer.callback(); });
  let context;
  const button = name => ({
    disabled: !!options.disabled,
    checkVisibility: () => !options.hidden,
    click() {
      state.clicks.push(name);
      if (options.actionError) throw new Error('Action click failed');
      if (options.brokenStop && name === 'Stop') return;
      vm.runInContext(name === 'Stop' ? 'stop()' : 'leaveProblem()', context);
      if (name === 'Back to library') state.away = true;
      changed();
    },
  });
  const stop = button('Stop'), back = button('Back to library');
  const workspace = { querySelector: selector => state.busy && !options.noControls ? (selector === 'button.stop-code' ? stop : selector === '.judge-running' ? {} : null) : null };
  const document = {
    body: {},
    querySelector(selector) {
      if (selector === '.coding-workspace:not([hidden])') return state.away ? null : workspace;
      if (selector === '.coding-workspace:not([hidden]) .stop-code') return workspace.querySelector('button.stop-code');
      if (selector === 'button[aria-label="Back to library"]') return options.noBack ? null : back;
      if (selector === '.judge-summary strong') return state.result && { textContent: state.result.verdict };
      return null;
    },
  };
  class JudgeWorker {
    constructor() { this.terminated = false; state.workers.push(this); }
    postMessage(job) {
      this.timer = later(() => {
        if (!this.terminated) this.onmessage({ data: { type: 'result', jobId: job.jobId, result: { verdict: job.source === 'reference' ? 'Accepted' : 'Time limit exceeded', passed: 0, total: 1, cases: [], durationMs: 5 } } });
      }, 5);
    }
    terminate() { this.terminated = true; clear(this.timer); }
  }
  context = vm.createContext({
    document, window: { study: { recordSubmission: async (problemId, source, result) => { state.submissions.push({ problemId, source, result }); } } },
    MutationObserver: class {
      constructor(callback) { this.callback = callback; this.connected = false; state.observers.push(this); }
      observe() { this.connected = true; }
      disconnect() { this.connected = false; }
    },
    setTimeout: later, clearTimeout: clear, performance, crypto, JudgeWorker, JOB_TIMEOUT: 30000,
    problemId: 'leetcode:1', problem: { examples: [{}], tests: [{}, {}] }, active: true, debugCases: null, custom: false,
    current: { current: { source: 'function twoSum(){while(true){}}', cases: '' } },
    worker: { current: null }, job: { current: null }, watchdog: {}, caseWatchdog: {}, startTime: { current: 0 }, mounted: { current: true }, progress: { total: 1 },
    setResult: result => { state.result = result; changed(); }, setResultSource() {}, setResultMode() {},
    setBusy: busy => { state.busy = busy; changed(); }, setPanel() {}, setError() {}, setPreview() {}, setLine() {}, setProgress() {},
    console,
  });
  vm.runInContext(runner, context);
  const page = {
    async evaluate(fn, arg) { context.argument = arg; return vm.runInContext(`(${fn.toString()})(argument)`, context); },
    getByRole(role, { name }) {
      assert.equal(role, 'button');
      return { async click() {
        if (options.startError) throw new Error('Start click failed');
        vm.runInContext(`start(${JSON.stringify(name.toLowerCase())})`, context);
        // Model a Windows driver response arriving after the job's lifetime.
        await delay(30);
      } };
    },
  };
  const assertDisposed = () => {
    assert.equal(context.window.__studyRunningAction, undefined);
    assert.ok(state.observers.every(observer => !observer.connected));
    assert.equal(state.timers.size, 0);
  };
  return { page, state, context, assertDisposed };
}

test('the old sequential driver can miss the entire running-control window', async () => {
  const f = fixture();
  await f.page.getByRole('button', { name: 'Run' }).click();
  assert.equal(f.state.result.verdict, 'Time limit exceeded');
  assert.equal(f.context.document.querySelector('.coding-workspace:not([hidden]) .stop-code'), null);
  f.assertDisposed();
});

test('an armed Stop invokes the actual cancellation callback, terminates the worker and permits recovery', async () => {
  const f = fixture();
  for (let i = 0; i < 3; i++) {
    await actWhileCodeRuns(f.page, 'Run', 'Stop', 100);
    assert.equal(f.state.result.verdict, 'Cancelled');
    assert.equal(f.context.job.current, null);
    assert.equal(f.context.worker.current, null);
    assert.equal(f.state.busy, null);
    assert.equal(f.state.workers.at(-1).terminated, true);
    f.assertDisposed();
  }
  assert.equal(f.state.clicks.length, 3);
  assert.equal(f.state.submissions.length, 0, 'Run cancellation must not create a submission');
  f.context.current.current.source = 'reference';
  await f.page.getByRole('button', { name: 'Run' }).click();
  assert.equal(f.state.result.verdict, 'Accepted');
  f.assertDisposed();
});

test('armed navigation executes the actual unmount cleanup and saves a Cancelled submission', async () => {
  const f = fixture();
  await actWhileCodeRuns(f.page, 'Submit', 'Back to library', 100);
  assert.equal(f.state.away, true);
  assert.equal(f.context.job.current, null);
  assert.equal(f.context.worker.current, null);
  assert.equal(f.state.workers[0].terminated, true);
  assert.equal(f.state.submissions.length, 1);
  assert.equal(f.state.submissions[0].result.verdict, 'Cancelled');
  assert.equal(f.state.submissions[0].source, f.context.current.current.source);
  f.assertDisposed();
});

test('missing running UI fails with the verdict instead of pretending cancellation passed', async () => {
  const f = fixture({ noControls: true });
  await assert.rejects(actWhileCodeRuns(f.page, 'Run', 'Stop', 40), /Never observed running controls.*Time limit exceeded/);
  f.assertDisposed();
});

for (const [name, options, action] of [
  ['disabled Stop', { disabled: true }, 'Stop'],
  ['hidden Stop', { hidden: true }, 'Stop'],
  ['missing navigation', { noBack: true }, 'Back to library'],
  ['action exception', { actionError: true }, 'Stop'],
  ['start exception', { startError: true }, 'Stop'],
]) test(`${name} fails and releases its observer and timer`, async () => {
  const f = fixture(options);
  await assert.rejects(actWhileCodeRuns(f.page, 'Run', action, 100), /not available|click failed/);
  f.assertDisposed();
});

test('a broken Stop handler cannot manufacture a Cancelled verdict', async () => {
  const f = fixture({ brokenStop: true });
  await actWhileCodeRuns(f.page, 'Run', 'Stop', 100);
  assert.equal(f.state.clicks.length, 1);
  assert.equal(f.state.result.verdict, 'Time limit exceeded', 'the desktop Cancelled assertion would still fail');
  f.assertDisposed();
});
