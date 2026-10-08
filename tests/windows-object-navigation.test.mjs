// Node-only checks of the actual desktop asset-sweep orchestration and assertions.
// Native Electron loading, CSS, painting, and Windows timing still require desktop CI.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(process.env.WINDOWS_OBJECT_NAVIGATION_SOURCE || new URL('./object-view.e2e.mjs', import.meta.url), 'utf8');
const start = source.indexOf('  for (const entry of entries) {');
const end = source.indexOf("  await page.getByRole('button', { name: 'Back to library', exact: true }).click();", start);
assert.ok(start >= 0 && end > start, 'Locate the production offline asset sweep.');
const sweep = new Function('entries', 'assetFrame', 'assert', 'console', `return (async () => { const assets = []; ${source.slice(start, end)} return assets; })();`);
const entries = Array.from({ length: 253 }, (_, index) => ({
  number: index + 1,
  visualizerPath: `Two Pointers/lesson ${index + 1}_visualizer.html`,
}));
const expectedUrl = entry => `study://content/${entry.visualizerPath.split('/').map(encodeURIComponent).join('/')}?embedded=1&parentOrigin=study%3A%2F%2Fapp`;

function fixture(options = {}) {
  const calls = [], events = [];
  let current = -1;
  const frame = {
    async goto(url, config) {
      current++;
      calls.push({ url, config });
      events.push('navigate');
      if (options.navigationError) throw options.navigationError;
      // Inherit the unchanged 20-second operation timeout when navigation omits one.
      if ((options.loadMs || 0) > (config.timeout ?? 20000)) {
        const error = new Error(`frame.goto: Timeout ${config.timeout ?? 20000}ms exceeded.`);
        error.name = 'TimeoutError';
        throw error;
      }
      if (options.loadGate) await options.loadGate;
      events.push('load');
    },
    async waitForFunction(callback) {
      assert.equal(events.at(-1), 'load', 'Object readiness must follow the full load gate.');
      const ready = new vm.Script(`(${callback.toString()})()`).runInNewContext({
        window: { studyLessonAdapter: options.missingAdapter ? undefined : { objectSnapshot() {} } },
        document: { querySelector: () => options.missingCard ? null : {} },
      });
      if (!ready) throw new Error('Object View readiness timed out');
      events.push('ready');
    },
    async evaluate(callback) {
      assert.equal(events.at(-1), 'ready', 'Inspect assets only after Object View readiness.');
      events.push('inspect');
      const container = {
        querySelector: selector => selector === '.study-object-body' ? {} : options.pseudoHeader ? {} : null,
        querySelectorAll: () => [{}],
      };
      return new vm.Script(`(${callback.toString()})()`).runInNewContext({
        window: { StudyObjectView: !options.missingGlobal, StudyObjectState: true },
        document: {
          querySelector: selector => selector.includes(options.missingAsset || 'not-a-real-asset') ? null : {},
          getElementById: () => container,
        },
        getComputedStyle: () => ({ fontSize: options.fontSize || '16px' }),
        studyLessonSource: { spec: { number: options.wrongNumber ? -1 : entries[current].number } },
      });
    },
  };
  return { calls, events, run: (catalog = entries) => sweep(catalog, frame, assert, { log() {} }) };
}

test('slow successful offline navigation still inspects all 253 exact lessons', async () => {
  const run = fixture({ loadMs: 60000 });
  const assets = await run.run();
  assert.equal(assets.length, 253);
  for (const [index, call] of run.calls.entries()) {
    assert.deepEqual(call, { url: expectedUrl(entries[index]), config: { waitUntil: 'load', timeout: 90000 } });
    assert.equal(assets[index].number, entries[index].number);
    assert.equal(assets[index].cards, 1);
  }
  assert.deepEqual(run.events, entries.flatMap(() => ['navigate', 'load', 'ready', 'inspect']));
});

test('asset inspection cannot pass before navigation finishes loading', async () => {
  let release;
  const loadGate = new Promise(resolve => { release = resolve; });
  const run = fixture({ loadGate });
  let finished = false;
  const pending = run.run().then(() => { finished = true; });
  await Promise.resolve();
  assert.equal(finished, false);
  assert.deepEqual(run.events, ['navigate']);
  release();
  await pending;
});

test('navigation exceeding 90 seconds still fails without retry or inspection', async () => {
  const run = fixture({ loadMs: 90001 });
  await assert.rejects(run.run(), /Timeout 90000ms exceeded/);
  assert.equal(run.calls.length, 1);
  assert.deepEqual(run.events, ['navigate']);
});

test('ordinary navigation errors propagate without retry or fallback', async () => {
  const failure = new Error('net::ERR_FILE_NOT_FOUND');
  const run = fixture({ navigationError: failure });
  await assert.rejects(run.run(), error => error === failure);
  assert.equal(run.calls.length, 1);
  assert.deepEqual(run.events, ['navigate']);
});

for (const [name, options, expected] of [
  ['missing adapter', { missingAdapter: true }, /readiness timed out/],
  ['missing object cards', { missingCard: true }, /readiness timed out/],
  ['missing shared globals', { missingGlobal: true }, /scripts are missing/],
  ['missing object-view script', { missingAsset: 'object-view.js' }, /Missing shared script/],
  ['missing object-state script', { missingAsset: 'object-state.js' }, /Missing shared script/],
  ['missing stylesheet', { missingAsset: 'object-view.css' }, /Missing Object View stylesheet/],
  ['wrong stylesheet font', { fontSize: '12px' }, /stylesheet did not load/],
  ['pseudo-call headers', { pseudoHeader: true }, /pseudo-call header/],
  ['wrong lesson identity', { wrongNumber: true }, /-1 !== 1/],
]) {
  test(`${name} remains a failure`, async () => {
    const run = fixture(options);
    await assert.rejects(run.run(), expected);
    assert.equal(run.calls.length, 1, 'Never skip or retry a failed lesson.');
  });
}

test('an incomplete catalog cannot satisfy the 253-lesson coverage assertion', async () => {
  await assert.rejects(fixture().run(entries.slice(0, 252)), /252 !== 253/);
});

test('navigation headroom leaves operation timeouts and runtime errors strict', () => {
  assert.deepEqual([...source.matchAll(/page\.setDefaultTimeout\((\d+)\)/g)].map(match => Number(match[1])), [20000]);
  assert.doesNotMatch(source, /setDefaultNavigationTimeout\(/);
  assert.equal((source.match(/assetFrame\.goto\(/g) || []).length, 1, 'Cover every offline sweep navigation.');
  assert.match(source, /assert\.deepEqual\(errors, \[\]\)/);
  assert.match(source, /await assetFrame\.waitForLoadState\('load'\)/);
});
