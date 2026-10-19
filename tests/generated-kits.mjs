// Generated study kits in a real browser: a function kit's Notes (statement, examples, notes), the
// Walkthrough recorded from the reference solution with stepping and a seekable timeline, and the Code
// tab's local judge accepting the reference; then an SQL kit's example tables, its walkthrough of the
// reference query's stages, and its MySQL judge; then an events kit's timeline walkthrough in virtual time
// and its judge awaiting promises and timers.
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
const read = e => JSON.parse(fs.readFileSync(path.join(ROOT, KITS_PATH, `${e.number}.json`), 'utf8'));
const record = read(entry);
const sqlEntry = kits.find(e => read(e).kind === 'sql'), sqlRecord = sqlEntry && read(sqlEntry);
const eventsEntry = kits.find(e => read(e).io?.events), eventsRecord = eventsEntry && read(eventsEntry);
fs.mkdirSync(path.join(ROOT, 'test-results'), {recursive: true});
// The built renderer (npm run build) with the desktop bridge replaced by an in-page stand-in that serves
// this kit as main serves it and keeps submissions in memory. Workers and WebAssembly load as they do in the app.
const renderer = path.join(ROOT, 'dist/renderer');
assert.ok(fs.existsSync(path.join(renderer, 'index.html')), 'Run npm run build first.');
const fixtures = {'/fixture/catalog.json': JSON.stringify(catalog)};
for (const kit of [record, sqlRecord, eventsRecord].filter(Boolean)) fixtures[`/fixture/kits/${kit.number}.json`] = JSON.stringify(kit);
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
    loadKit: async id => { const response = await fetch(`/fixture/kits/${id.replace('leetcode:', '')}.json`); if (!response.ok) throw new Error('Unknown study kit.'); return response.json(); },
    saveDraft: async () => {}, recordSubmission: async (id, language, source, result) => { window.fixture.submissions.push({id, language, result}); return data; },
    nativeAvailability: async () => ({java: false, c: false}), runNative: async () => { throw new Error('No native toolchains in the browser test.'); }, cancelNative: async () => {},
    openExternal: async () => {}, onData: () => () => {}, onTimer: () => () => {}, onPlaybackPause: () => () => {}, onError: () => () => {}, onNativeProgress: () => () => {}
  };
});
const shots = process.env.KIT_SCREENSHOTS, shot = async name => { if (shots) await page.screenshot({path: path.join(shots, `${name}.png`)}); };
const report = {};
try {
  await page.goto(base);
  const open = async kit => {
    await page.getByRole('button', {name: /^All LeetCode \d+$/}).first().click();
    await page.getByRole('searchbox', {name: 'Search problems'}).fill(String(kit.number));
    await page.getByRole('button', {name: `Open ${kit.title}`, exact: true}).click();
    await page.getByRole('heading', {name: kit.title, exact: true}).waitFor();
  };
  await open(entry);
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

  if (sqlEntry) {
    await open(sqlEntry);
    // Notes: the example's input tables and expected result table.
    await page.locator('.kit-notes').waitFor();
    const expected = sqlRecord.examples[0].expected;
    await page.locator('.kit-notes figure.sql-table', {hasText: 'Expected result'}).first().waitFor();
    const noteTables = await page.locator('.kit-notes .kit-example').first().textContent();
    for (const name of Object.keys(sqlRecord.schema)) assert.ok(noteTables.includes(name), `Notes show the ${name} table`);
    for (const column of expected.columns) assert.ok(noteTables.includes(column), `Notes show the ${column} column`);
    // Walkthrough: input tables, each CTE, then the result beside the expected table.
    await page.getByRole('tab', {name: 'Walkthrough'}).click();
    await page.waitForFunction(() => /^Step 1 of \d+/.test(document.querySelector('.sql-walkthrough .debug-status')?.textContent ?? ''), null, {timeout: 60000});
    const sqlStatus = page.locator('.sql-walkthrough .debug-status'), steps = Number((await sqlStatus.textContent()).match(/of (\d+)/)[1]);
    assert.ok(steps >= 2);
    await page.getByRole('slider', {name: 'Walkthrough timeline'}).fill(String(steps - 1));
    await page.locator('.sql-walkthrough figure.sql-table', {hasText: 'Expected'}).waitFor();
    const resultText = await page.locator('.sql-walkthrough .sql-tables').textContent();
    for (const cell of expected.rows.flat().filter(v => v !== null)) assert.ok(resultText.includes(String(cell)), `The result step shows ${cell}`);
    assert.ok((await page.locator('.sql-reference').textContent()).includes('SELECT'), 'The walkthrough shows the reference query');
    await shot('kit-sql-walkthrough');
    // Code: MySQL is the only language, the examples render as tables, and the reference query is accepted.
    await page.getByRole('tab', {name: 'Code'}).click();
    await page.locator('.problem-example .sql-table').first().waitFor();
    assert.deepEqual(await page.getByRole('combobox', {name: 'Language'}).locator('option').allTextContents(), ['MySQL']);
    await page.locator('.monaco-editor').first().waitFor();
    await page.locator('.solution-button').click();
    await page.getByRole('button', {name: 'Show solution'}).click();
    await page.getByRole('button', {name: 'Use as draft'}).first().click();
    await page.getByRole('button', {name: 'Use as draft'}).last().click();
    await page.getByRole('button', {name: /^Submit/}).click();
    await page.waitForFunction(() => window.fixture.submissions.length === 2, null, {timeout: 60000});
    const sqlSubmission = await page.evaluate(() => window.fixture.submissions[1]);
    assert.equal(sqlSubmission.language, 'sql');
    assert.equal(sqlSubmission.result.verdict, 'Accepted', JSON.stringify(sqlSubmission.result.cases?.find(c => c.verdict !== 'Accepted')));
    assert.equal(sqlSubmission.result.total, sqlRecord.examples.length + sqlRecord.tests.length);
    await page.locator('.judge-summary').waitFor();
    await shot('kit-sql-code');
    report.sql = `SQL kit ${sqlEntry.number}: example tables in Notes, a ${steps}-step query walkthrough, and Submit accepts the reference on ${sqlSubmission.result.total} cases`;
  }
  if (eventsEntry) {
    await open(eventsEntry);
    await page.getByRole('tab', {name: 'Walkthrough'}).click();
    await page.waitForFunction(() => /^Step 1 of \d+/.test(document.querySelector('.trace-walkthrough .debug-status')?.textContent ?? ''), null, {timeout: 60000});
    const traceSteps = Number((await page.locator('.trace-walkthrough .debug-status').textContent()).match(/of (\d+)/)[1]);
    assert.equal(await page.locator('.trace-timeline li').count(), traceSteps - 1, 'Every traced event is on the timeline');
    assert.match(await page.locator('.walkthrough-narration').textContent(), /^t = \d+ ms/);
    await page.getByRole('slider', {name: 'Walkthrough timeline'}).fill(String(traceSteps - 1));
    await page.waitForFunction(() => document.querySelector('.walkthrough-narration')?.textContent?.includes('Finished.'));
    assert.ok((await page.locator('.walkthrough-narration').textContent()).includes(JSON.stringify(eventsRecord.examples[0].expected)), 'The last step shows the scenario answer');
    await shot('kit-events-walkthrough');
    await page.getByRole('tab', {name: 'Code'}).click();
    await page.locator('.monaco-editor').first().waitFor();
    assert.deepEqual(await page.getByRole('combobox', {name: 'Language'}).locator('option').allTextContents(), ['JavaScript', 'TypeScript']);
    assert.equal(await page.getByRole('button', {name: 'Debug', exact: true}).count(), 0, 'Events kits have no live debugger');
    assert.ok((await page.locator('.contract').textContent()).includes(eventsRecord.api), 'The contract shows the API');
    await page.locator('.solution-button').click();
    await page.getByRole('button', {name: 'Show solution'}).click();
    await page.getByRole('button', {name: 'Use as draft'}).first().click();
    await page.getByRole('button', {name: 'Use as draft'}).last().click();
    const before = await page.evaluate(() => window.fixture.submissions.length);
    await page.getByRole('button', {name: /^Submit/}).click();
    await page.waitForFunction(count => window.fixture.submissions.length === count + 1, before, {timeout: 60000});
    const eventsSubmission = await page.evaluate(() => window.fixture.submissions.at(-1));
    assert.equal(eventsSubmission.result.verdict, 'Accepted', JSON.stringify(eventsSubmission.result.cases?.find(c => c.verdict !== 'Accepted')));
    assert.equal(eventsSubmission.result.total, eventsRecord.examples.length + eventsRecord.tests.length);
    report.events = `Events kit ${eventsEntry.number}: a ${traceSteps}-step timeline walkthrough in virtual time, and Submit accepts the reference on ${eventsSubmission.result.total} cases, generated ones included`;
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(ROOT, 'test-results/generated-kits.json'), JSON.stringify({passed: true, kit: entry.number, ...report}, null, 2));
  for (const line of Object.values(report)) console.log(`PASS ${line}`);
} finally { await browser.close(); server.close(); }
