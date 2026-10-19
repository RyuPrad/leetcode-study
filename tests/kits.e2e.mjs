// A generated study kit in the desktop app: main loads it over IPC from the installed content,
// the Notes show its statement, the Walkthrough records the reference in the packaged worker,
// and a submission is judged locally and saved to the study profile.
import { _electron as electron } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, KITS_PATH, collectCatalog } from '../scripts/content.mjs';

const kits = (collectCatalog().index ?? []).filter(e => e.kit);
assert.ok(kits.length, 'At least one generated kit exists');
const entry = kits[0], record = JSON.parse(fs.readFileSync(path.join(ROOT, KITS_PATH, `${entry.number}.json`), 'utf8'));
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
  await page.getByRole('button', { name: /^All LeetCode \d+$/ }).first().click();
  await page.getByRole('searchbox', { name: 'Search problems' }).fill(String(entry.number));
  await page.getByRole('button', { name: `Open ${entry.title}`, exact: true }).click();
  await page.locator('.kit-notes').waitFor();
  assert.ok((await page.locator('.kit-notes').textContent()).includes(JSON.stringify(record.examples[0].expected)));
  console.log('PASS main loads the kit over IPC and the Notes show its statement and examples');
  await page.getByRole('tab', { name: 'Walkthrough' }).click();
  await page.waitForFunction(() => /^Step 1 of \d+/.test(document.querySelector('.walkthrough-toolbar .debug-status')?.textContent ?? ''), null, { timeout: 60000 });
  console.log(`PASS the packaged worker records the walkthrough: ${await page.locator('.walkthrough-toolbar .debug-status').textContent()}`);
  await page.getByRole('tab', { name: 'Code' }).click();
  await page.locator('.solution-button').click();
  await page.getByRole('button', { name: 'Show solution' }).click();
  await page.getByRole('button', { name: 'Use as draft' }).first().click();
  await page.getByRole('button', { name: 'Use as draft' }).last().click();
  await page.getByRole('button', { name: /^Submit/ }).click();
  await page.locator('.judge-summary').waitFor({ timeout: 90000 });
  assert.equal(await page.locator('.judge-summary strong').textContent(), 'Accepted');
  await page.waitForFunction(id => window.study.bootstrap().then(r => r.data.submissions.some(s => s.problemId === id)), entry.id, { timeout: 10000 }).catch(() => {});
  const saved = await page.evaluate(id => window.study.bootstrap().then(r => r.data.submissions.filter(s => s.problemId === id).map(s => s.result.verdict)), entry.id);
  assert.deepEqual(saved, ['Accepted']);
  console.log('PASS a submission of the reference is accepted and saved to the profile');
  assert.deepEqual(errors, []);
} finally { await app.close(); fs.rmSync(directory, { recursive: true, force: true }); }
