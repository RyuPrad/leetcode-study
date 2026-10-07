// Node-only orchestration regression: execute the real validator with fake Playwright
// and file I/O. This does not verify browser loading, painting, or Windows behavior.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourcePath = process.env.WINDOWS_VISUALIZER_VALIDATOR_SOURCE || path.join(root, 'scripts/validate-visualizers.mjs');
const source = fs.readFileSync(sourcePath, 'utf8');
// Imports are supplied below; all production orchestration and assertions execute.
const executable = source.replace(/^import[^\n]+;\r?\n/gm, '');
assert.ok(executable.includes('async function inspect('), 'Expected the production validator');
const file = 'Array & Hashing/longest_consecutive_sequence_visualizer.html';
const keys = ['initial', 'forward', 'back', 'restarted', 'final'];
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const snapshots = Object.fromEntries(keys.map(key => [key, { state: key }]));
const expected = Object.fromEntries(keys.map(key => [key, hash(snapshots[key])]));
const plain = value => JSON.parse(JSON.stringify(value));

async function validate({ loadMs = 0, resultPatch = {}, pageError, navigationError, baseline = true } = {}) {
  const output = new Map(), calls = [], events = [];
  let evaluations = 0, closedPages = 0, browserClosed = false, cleared = false;
  const processStub = { argv: [], env: {}, exitCode: undefined };
  const browser = {
    async newPage() {
      const handlers = new Map();
      return {
        on: (name, handler) => handlers.set(name, handler),
        off: (name, handler) => { assert.equal(handlers.get(name), handler); handlers.delete(name); },
        async goto(url, options) {
          calls.push({ url, ...plain(options) });
          if (navigationError) throw navigationError;
          if (loadMs > options.timeout) {
            const error = new Error(`page.goto: Timeout ${options.timeout}ms exceeded.`);
            error.name = 'TimeoutError';
            throw error;
          }
          events.push('load');
          if (pageError) handlers.get('pageerror')?.(new Error(pageError));
        },
        async evaluate(callback) {
          assert.equal(typeof callback, 'function');
          assert.equal(events.at(-1), 'load', 'Snapshot inspection must follow a completed load');
          evaluations++;
          return { ...snapshots, count: 37, capped: false, redesigned: true,
            layout: { controlsVisible: true, scroll: 1240, width: 1240 }, ...resultPatch };
        },
        async close() { assert.equal(handlers.size, 0); closedPages++; },
      };
    },
    async close() { browserClosed = true; },
  };
  const context = vm.createContext({
    fs: {
      existsSync: name => name.endsWith('visualizer-baseline.json') && baseline,
      readFileSync: name => {
        assert.ok(name.endsWith('visualizer-baseline.json'));
        return JSON.stringify({ [file]: expected });
      },
      mkdirSync() {},
      writeFileSync: (name, content) => output.set(name, content),
    },
    path, pathToFileURL, createHash, ROOT: root,
    collectCatalog: () => ({ visualizers: [file] }),
    chromium: { launch: async () => browser },
    process: processStub,
    console: { log() {}, error() {} },
    setInterval: () => 1,
    clearInterval: id => { assert.equal(id, 1); cleared = true; },
  });
  await new vm.Script(`(async () => {\n${executable}\n})()`, { filename: sourcePath }).runInContext(context);
  assert.equal(browserClosed, true);
  assert.equal(cleared, true);
  assert.equal(closedPages, 4);
  assert.equal(calls.length, 1, 'Navigation failures must not be retried');
  assert.equal(calls[0].url, pathToFileURL(path.join(root, file)).href);
  assert.equal(calls[0].waitUntil, 'load', 'Retain the full page-load readiness gate');
  assert.equal(calls[0].timeout, 90000, 'Use the bounded Windows navigation budget');
  const report = JSON.parse(output.get(path.join(root, 'test-results/visualizers.json')));
  assert.equal(report.count, 1);
  return { report, exitCode: processStub.exitCode, evaluations };
}

let passed = 0;
async function check(name, callback) { await callback(); passed++; console.log(`PASS ${name}`); }

await check('slow successful load retains every expected snapshot', async () => {
  const run = await validate({ loadMs: 60000 });
  assert.equal(run.exitCode, undefined);
  assert.equal(run.evaluations, 1);
  assert.deepEqual(run.report.failures, []);
  for (const key of keys) assert.equal(run.report.results[file][key], expected[key]);
});
await check('load exceeding 90 seconds still fails without inspection or retry', async () => {
  const run = await validate({ loadMs: 90001 });
  assert.equal(run.exitCode, 1);
  assert.equal(run.evaluations, 0);
  assert.equal(Object.keys(run.report.results).length, 0);
  assert.match(run.report.failures[0], /Timeout 90000ms exceeded/);
});
await check('ordinary navigation errors still fail once', async () => {
  const run = await validate({ navigationError: new Error('net::ERR_FILE_NOT_FOUND') });
  assert.equal(run.exitCode, 1);
  assert.equal(run.evaluations, 0);
  assert.match(run.report.failures[0], /ERR_FILE_NOT_FOUND/);
});
for (const key of keys) {
  await check(`${key} snapshot mismatches remain failures`, async () => {
    const run = await validate({ resultPatch: { [key]: { changed: true } } });
    assert.equal(run.exitCode, 1);
    assert.deepEqual(run.report.failures, [`${file}: ${key} differs from expected behavior`]);
  });
}
for (const [name, options, message] of [
  ['missing layout', { resultPatch: { redesigned: false } }, 'shared layout not mounted'],
  ['hidden controls', { resultPatch: { layout: { controlsVisible: false } } }, 'step controls hidden'],
  ['missing baseline', { baseline: false }, 'missing baseline'],
  ['page errors', { pageError: 'script initialization failed' }, 'script initialization failed'],
  ['capped traces', { resultPatch: { capped: true } }, 'did not finish within the explicit 50000-step verification limit'],
]) {
  await check(`${name} remain failures`, async () => {
    const run = await validate(options);
    assert.equal(run.exitCode, 1);
    assert.deepEqual(run.report.failures, [`${file}: ${message}`]);
  });
}
console.log(`${passed} checks passed. Node-only orchestration; Windows browser CI remains the integration gate.`);
