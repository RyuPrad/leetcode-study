// Generated study kits in the desktop app: main loads a kit over IPC from the installed content,
// the Notes show its statement, the Walkthrough records the reference in the packaged worker,
// and a submission is judged locally and saved to the study profile. An SQL kit and an events kit
// are then walked through and judged offline as well (SQLite and virtual time in the packaged app).
import { _electron as electron } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, KITS_PATH, collectCatalog } from '../scripts/content.mjs';

const kits = (collectCatalog().index ?? []).filter(e => e.kit);
assert.ok(kits.length, 'At least one generated kit exists');
const read = e => JSON.parse(fs.readFileSync(path.join(ROOT, KITS_PATH, `${e.number}.json`), 'utf8'));
const entry = kits.find(e => !read(e).kind || read(e).kind === 'function') ?? kits[0], record = read(entry);
const sqlEntry = kits.find(e => read(e).kind === 'sql'), eventsEntry = kits.find(e => read(e).io?.events);
fs.mkdirSync(path.join(ROOT, '.test-data'), { recursive: true });
const directory = fs.mkdtempSync(path.join(ROOT, '.test-data/kits-e2e-'));
const env = { ...process.env, STUDY_DATA_DIR: directory, STUDY_HEADLESS: '0' }; delete env.ELECTRON_RUN_AS_NODE;
if (process.env.STUDY_TEST_EXE && process.platform === 'win32') env.PATH = `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`;
const app = await electron.launch({ ...(process.env.STUDY_TEST_EXE ? { executablePath: process.env.STUDY_TEST_EXE, args: [] } : { args: [ROOT] }), env, timeout: 30000 });
const page = await app.firstWindow(), errors = [];
page.setDefaultTimeout(30000);
page.on('pageerror', error => errors.push(error.message));
try {
  await page.waitForSelector('.problem-table');
  await app.evaluate(({ session }) => session.defaultSession.enableNetworkEmulation({ offline: true }));
  // Unknown kits are refused by main.
  assert.match(await page.evaluate(() => window.study.loadKit('leetcode:1').then(() => 'loaded', e => String(e))), /Unknown study kit/);
  const open = async kit => {
    // By its title: on a small screen, such as a CI runner's 1024x768, the Code tab shows the sidebar as icons only.
    await page.getByRole('navigation', { name: 'Main navigation' }).getByTitle('All LeetCode problems').click();
    await page.getByRole('searchbox', { name: 'Search problems' }).fill(String(kit.number));
    await page.getByRole('button', { name: `Open ${kit.title}`, exact: true }).click();
    await page.locator('.kit-notes').waitFor();
  };
  // Reveals the reference, submits it, and returns the verdicts saved for the kit.
  const submitReference = async kit => {
    await page.getByRole('tab', { name: 'Code' }).click();
    await page.locator('.solution-button').click();
    await page.getByRole('button', { name: 'Show solution' }).click();
    await page.getByRole('button', { name: 'Use as draft' }).first().click();
    await page.getByRole('button', { name: 'Use as draft' }).last().click();
    await page.getByRole('button', { name: /^Submit/ }).click();
    await page.locator('.judge-summary').waitFor({ timeout: 90000 });
    assert.equal(await page.locator('.judge-summary strong').textContent(), 'Accepted');
    await page.waitForFunction(id => window.study.bootstrap().then(r => r.data.submissions.some(s => s.problemId === id)), kit.id, { timeout: 10000 }).catch(() => {});
    return page.evaluate(id => window.study.bootstrap().then(r => r.data.submissions.filter(s => s.problemId === id).map(s => s.result.verdict)), kit.id);
  };
  await open(entry);
  assert.ok((await page.locator('.kit-notes').textContent()).includes(JSON.stringify(record.examples[0].expected)));
  console.log('PASS main loads the kit over IPC and the Notes show its statement and examples');
  await page.getByRole('tab', { name: 'Walkthrough' }).click();
  await page.waitForFunction(() => /^Step 1 of \d+/.test(document.querySelector('.walkthrough-toolbar .debug-status')?.textContent ?? ''), null, { timeout: 60000 });
  console.log(`PASS the packaged worker records the walkthrough: ${await page.locator('.walkthrough-toolbar .debug-status').textContent()}`);
  assert.deepEqual(await submitReference(entry), ['Accepted']);
  console.log('PASS a submission of the reference is accepted and saved to the profile');
  for (const [kit, selector] of [[sqlEntry, '.sql-walkthrough'], [eventsEntry, '.trace-walkthrough']]) {
    if (!kit) continue;
    await open(kit);
    await page.getByRole('tab', { name: 'Walkthrough' }).click();
    await page.waitForFunction(s => /^Step 1 of \d+/.test(document.querySelector(`${s} .debug-status`)?.textContent ?? ''), selector, { timeout: 60000 });
    assert.deepEqual(await submitReference(kit), ['Accepted']);
    console.log(`PASS ${read(kit).kind === 'sql' ? 'SQL' : 'events'} kit ${kit.number}: the walkthrough runs and the reference is accepted and saved, offline`);
  }
  assert.deepEqual(errors, []);
} finally { await app.close(); fs.rmSync(directory, { recursive: true, force: true }); }
