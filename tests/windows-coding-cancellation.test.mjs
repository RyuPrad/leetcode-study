// Dependency-free DOM/driver model. Executes the current CodeWorkspace runner
// callbacks, but does not replace the real Electron/QuickJS cancellation suite.
// Java and C jobs are modelled at the window.study native-runner IPC boundary.
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
// The runner's own JOB_TIMEOUT and isNativeLanguage.
const constants = stripTypeScriptTypes(fs.readFileSync(new URL('../shared/coding.ts', import.meta.url), 'utf8'), { mode: 'strip' }).replace(/\bexport /g, '');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function fixture(options = {}) {
  const state = { busy: null, result: null, submissions: [], workers: [], observers: [], timers: new Set(), clicks: [], away: false,
    nativeRuns: [], nativeCancels: [], progressListeners: new Set(), assembled: [] };
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
  const problem = { examples: [{}], tests: [{}, {}] };
  class JudgeWorker {
    constructor() { this.terminated = false; state.workers.push(this); }
    postMessage(job) {
      this.timer = later(() => {
        if (this.terminated) return;
        // As in judge.worker.ts, Java and C hand their cases and reference outcomes to the desktop runner.
        if (job.language === 'java' || job.language === 'c') {
          const cases = job.mode === 'submit' ? [...problem.examples, ...problem.tests] : job.cases;
          this.onmessage({ data: { type: 'references', jobId: job.jobId, cases, references: cases.map(() => ({ expected: null })) } });
        } else this.onmessage({ data: { type: 'result', jobId: job.jobId, result: { verdict: job.source === 'reference' ? 'Accepted' : 'Time limit exceeded', passed: 0, total: 1, cases: [], durationMs: 5 } } });
      }, 5);
    }
    terminate() { this.terminated = true; clear(this.timer); }
  }
  // A native process runs until the test makes it exit; cancelling only asks the desktop runner to end it.
  const exits = new Map();
  const study = {
    recordSubmission: async (problemId, language, source, result) => { state.submissions.push({ problemId, language, source, result }); },
    runNative: request => new Promise(resolve => { state.nativeRuns.push(request); exits.set(request.jobId, verdict => resolve({ cases: request.inputs.map(() => ({ verdict, logs: [], durationMs: 5 })) })); }),
    cancelNative: async jobId => { state.nativeCancels.push(jobId); },
    onNativeProgress: callback => { state.progressListeners.add(callback); return () => state.progressListeners.delete(callback); },
  };
  context = vm.createContext({
    document, window: { study },
    MutationObserver: class {
      constructor(callback) { this.callback = callback; this.connected = false; state.observers.push(this); }
      observe() { this.connected = true; }
      disconnect() { this.connected = false; }
    },
    setTimeout: later, clearTimeout: clear, performance, crypto, JudgeWorker,
    // coding/engine.ts needs QuickJS; the model only turns the native cases into a verdict.
    assembleNative: (problem, cases, references, run, durationMs) => {
      state.assembled.push(run);
      const failed = run.cases.find(c => c.verdict !== 'Accepted');
      return { verdict: failed?.verdict ?? 'Accepted', passed: run.cases.filter(c => c.verdict === 'Accepted').length, total: cases.length, durationMs, cases: [] };
    },
    problemId: 'leetcode:1', problem, active: true, debugCases: null, custom: false,
    current: { current: { source: 'function twoSum(){while(true){}}', cases: '', language: options.language ?? 'javascript' } },
    worker: { current: null }, job: { current: null }, nativeJob: { current: null }, watchdog: {}, caseWatchdog: {}, startTime: { current: 0 }, mounted: { current: true }, progress: { total: 1 },
    setResult: result => { state.result = result; changed(); }, setResultSource() {}, setResultMode() {},
    setBusy: busy => { state.busy = busy; changed(); }, setPanel() {}, setError() {}, setPreview() {}, setLine() {}, setProgress() {},
    console,
  });
  vm.runInContext(constants, context);
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
    assert.equal(context.nativeJob.current, null);
    assert.equal(state.progressListeners.size, 0);
  };
  const exit = (jobId, verdict) => { const end = exits.get(jobId); exits.delete(jobId); end(verdict); };
  return { page, state, context, assertDisposed, exit };
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
  assert.equal(f.state.submissions[0].language, 'javascript');
  f.assertDisposed();
});

// Native jobs outlive a driver round-trip (Java starts a JVM, C a compiler), so, as in the desktop
// suite, Stop and navigation are pressed once the desktop runner owns the job instead of armed first.
test('Stop during a native job cancels the desktop process, whose late exit cannot touch the next job', async () => {
  const f = fixture({ language: 'java' });
  await f.page.getByRole('button', { name: 'Run' }).click();
  const [first] = f.state.nativeRuns;
  assert.equal(first.language, 'java');
  assert.equal(f.context.nativeJob.current, first.jobId);
  assert.equal(f.state.workers[0].terminated, true, 'the reference worker hands the job to the desktop runner');
  f.context.document.querySelector('.coding-workspace:not([hidden]) .stop-code').click();
  assert.deepEqual(f.state.nativeCancels, [first.jobId]);
  assert.equal(f.state.result.verdict, 'Cancelled');
  assert.equal(f.context.job.current, null);
  assert.equal(f.context.nativeJob.current, null);
  assert.equal(f.state.busy, null);
  // Run again before the cancelled process has exited.
  f.context.current.current.source = 'reference';
  await f.page.getByRole('button', { name: 'Run' }).click();
  const second = f.state.nativeRuns[1];
  f.exit(first.jobId, 'Cancelled');
  await delay(0);
  assert.equal(f.context.nativeJob.current, second.jobId, 'a late exit leaves the running job cancellable');
  assert.equal(f.state.busy, 'run');
  f.exit(second.jobId, 'Accepted');
  await delay(0);
  assert.equal(f.state.result.verdict, 'Accepted');
  assert.equal(f.state.assembled.length, 1, 'only the running job is assembled');
  assert.equal(f.state.submissions.length, 0, 'Run cancellation must not create a submission');
  f.assertDisposed();
});

test('navigation during a native Submit cancels the desktop process and saves a Cancelled submission', async () => {
  const f = fixture({ language: 'c' });
  await f.page.getByRole('button', { name: 'Submit' }).click();
  const [run] = f.state.nativeRuns;
  assert.equal(f.context.nativeJob.current, run.jobId);
  f.context.document.querySelector('button[aria-label="Back to library"]').click();
  assert.equal(f.state.away, true);
  assert.deepEqual(f.state.nativeCancels, [run.jobId]);
  assert.equal(f.context.job.current, null);
  assert.deepEqual(f.state.submissions.map(s => [s.language, s.source, s.result.verdict]), [['c', f.context.current.current.source, 'Cancelled']]);
  f.exit(run.jobId, 'Cancelled');
  await delay(0);
  assert.equal(f.state.submissions.length, 1, 'the late exit saves nothing more');
  assert.equal(f.state.assembled.length, 0);
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
