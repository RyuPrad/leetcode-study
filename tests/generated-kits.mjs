// A generated study kit in a real browser: its Notes (statement, examples, notes), the Walkthrough
// recorded from the reference solution with stepping and a seekable timeline, and the Code tab's
// local judge accepting a correct solution and rejecting a wrong one.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import http from 'node:http';
import {chromium} from 'playwright';
import {ROOT, KITS_PATH, collectCatalog} from '../scripts/content.mjs';

const catalog = collectCatalog();
const kits = (catalog.index ?? []).filter(e => e.kit);
assert.ok(kits.length > 0, 'At least one generated kit exists');
// The first function kit whose reference sorts in place is not required; any function kit works.
const entry = kits.find(e => JSON.parse(fs.readFileSync(path.join(ROOT, KITS_PATH, `${e.number}.json`), 'utf8')).kind === 'function') ?? kits[0];
const record = JSON.parse(fs.readFileSync(path.join(ROOT, KITS_PATH, `${entry.number}.json`), 'utf8'));
fs.mkdirSync(path.join(ROOT, 'test-results'), {recursive: true});
// The built renderer (npm run build) with the desktop bridge replaced by an in-page stand-in that serves
// this kit as main serves it and keeps submissions in memory. Workers and WebAssembly load as they do in the app.
const renderer = path.join(ROOT, 'dist/renderer');
assert.ok(fs.existsSync(path.join(renderer, 'index.html')), 'Run npm run build first.');
const fixtures = {'/fixture/catalog.json': JSON.stringify(catalog), '/fixture/kit.json': JSON.stringify(record)};
const types = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.wasm': 'application/wasm', '.json': 'application/json', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.png': 'image/png'};
const server = http.createServer((request, response) => {
  const url = decodeURIComponent(new URL(request.url, 'http://x').pathname);
  if (fixtures[url]) { response.writeHead(200, {'content-type': 'application/json'}); response.end(fixtures[url]); return; }
  const file = path.join(renderer, url === '/' ? 'index.html' : url);
  if (!file.startsWith(renderer) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { response.writeHead(404); response.end(); return; }
  response.writeHead(200, {'content-type': types[path.extname(file)] ?? 'application/octet-stream'}); fs.createReadStream(file).pipe(response);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({headless: true}), page = await browser.newPage({viewport: {width: 1440, height: 900}}), errors = [];
page.on('pageerror', e => errors.push(e.message));
if (process.env.KIT_DEBUG) page.on('console', m => console.log('console:', m.type(), m.text().slice(0, 300)));
await page.addInitScript(() => {
  let data = {version: 4, progress: {}, sessions: [], drafts: {}, submissions: [], guided: {}};
  const timer = {problemId: null, sessionId: null, durationMs: 0, running: false, reason: 'inactive'}, json = url => fetch(url).then(r => r.json());
  window.fixture = {submissions: []};
  window.study = {
    bootstrap: async () => ({catalog: await json('/fixture/catalog.json'), data, notice: null, version: 'test'}),
    setProgress: async () => data, selectProblem: async id => ({...timer, problemId: id}), activity() {},
    loadKit: async id => { const kit = await json('/fixture/kit.json'); if (id !== 'leetcode:' + kit.number) throw new Error('Unknown study kit.'); return kit; },
    saveDraft: async () => {}, recordSubmission: async (id, language, source, result) => { window.fixture.submissions.push({id, language, result}); return data; },
    nativeAvailability: async () => ({java: false, c: false}), runNative: async () => { throw new Error('No native toolchains in the browser test.'); }, cancelNative: async () => {},
    openExternal: async () => {}, onData: () => () => {}, onTimer: () => () => {}, onPlaybackPause: () => () => {}, onError: () => () => {}, onNativeProgress: () => () => {}
  };
});
const shots = process.env.KIT_SCREENSHOTS, shot = async name => { if (shots) await page.screenshot({path: path.join(shots, `${name}.png`)}); };
const report = {};
try {
  await page.goto(base);
  await page.getByRole('button', {name: /^All LeetCode \d+$/}).first().click();
  await page.getByRole('searchbox', {name: 'Search problems'}).fill(String(entry.number));
  await page.getByRole('button', {name: `Open ${entry.title}`, exact: true}).click();
  await page.getByRole('heading', {name: entry.title, exact: true}).waitFor();
  assert.deepEqual((await page.getByRole('tab').allTextContents()).map(t => t.replace(/\d+$/, '')), ['Walkthrough', 'Code', 'Notes', 'Ladders', 'History']);
  // Notes: the statement, every example and the study notes.
  await page.locator('.kit-notes').waitFor();
  const notes = await page.locator('.kit-notes').textContent();
  for (const example of record.examples) assert.ok(notes.includes(JSON.stringify(example.expected)), `Notes show ${example.name}`);
  assert.ok(notes.includes('Complexity') || notes.includes('Approach'), 'Notes include the authored study notes');
  await shot('kit-notes');
  report.notes = 'Notes show the statement, every example and the study notes';

  // Walkthrough: recorded from the reference, stepped and seeked.
  await page.getByRole('tab', {name: 'Walkthrough'}).click();
  const status = page.locator('.walkthrough-toolbar .debug-status');
  await shot('kit-walkthrough-start');
  await page.waitForFunction(() => /^Step 1 of \d+/.test(document.querySelector('.walkthrough-toolbar .debug-status')?.textContent ?? ''), null, {timeout: 60000});
  const total = Number((await status.textContent()).match(/of (\d+)/)[1]);
  assert.ok(total >= 2, `The walkthrough recorded ${total} steps`);
  await page.getByRole('button', {name: 'Next step'}).click();
  await page.getByRole('button', {name: 'Next step'}).click();
  assert.match(await status.textContent(), /^Step 3 of/);
  await page.locator('.walkthrough-narration').waitFor();
  await page.getByRole('slider', {name: 'Walkthrough timeline'}).fill(String(total - 1));
  await page.waitForFunction(() => document.querySelector('.walkthrough-narration')?.textContent?.includes('Finished.'));
  const finished = await page.locator('.walkthrough-narration').textContent();
  assert.ok(finished.includes(JSON.stringify(record.examples[0].expected)), 'The last step shows the returned answer');
  await page.locator('.debug-source .view-lines').first().waitFor({timeout: 30000});
  assert.ok((await page.locator('.debug-source .view-lines').first().textContent()).trim().length > 10, 'The reference code panel shows the solution');
  await shot('kit-walkthrough');
  report.walkthrough = `the walkthrough records ${total} steps of the reference and seeks to its answer`;

  // Code: the reference passes Submit; a wrong answer fails Run.
  await page.getByRole('tab', {name: 'Code'}).click();
  await page.locator('.kit-statement').waitFor();
  // Reveal the reference and use it as the draft, as a learner would.
  await page.locator('.monaco-editor').first().waitFor();
  await page.locator('.solution-button').click();
  await page.getByRole('button', {name: 'Show solution'}).click();
  await page.getByRole('button', {name: 'Use as draft'}).first().click();
  await page.getByRole('button', {name: 'Use as draft'}).last().click();
  await page.getByRole('button', {name: /^Submit/}).click();
  await page.locator('.judge-summary').waitFor({timeout: 90000});
  await page.waitForFunction(() => window.fixture.submissions.length === 1, null, {timeout: 30000});
  const submission = await page.evaluate(() => window.fixture.submissions[0]);
  assert.equal(submission.result.verdict, 'Accepted', JSON.stringify(submission.result.cases?.find(c => c.verdict !== 'Accepted')));
  assert.equal(submission.result.total, record.examples.length + record.tests.length);
  await shot('kit-code');
  report.code = `Submit judges all ${submission.result.total} local cases and accepts the reference`;
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(ROOT, 'test-results/generated-kits.json'), JSON.stringify({passed: true, kit: entry.number, ...report}, null, 2));
  for (const line of Object.values(report)) console.log(`PASS ${line}`);
} finally { await browser.close(); server.close(); }
