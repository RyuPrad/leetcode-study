// Upgrades a schema 3 profile written by a previous extracted package to the per-language
// schema 4 of the current package. Both executables and the profile must be inside this
// checkout's .test-data; the installed app and live profile are never used.
import { _electron as electron } from 'playwright';
import { extractFile } from '@electron/asar';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { ROOT } from '../scripts/content.mjs';

const previous = process.env.STUDY_PREVIOUS_EXE, current = process.env.STUDY_TEST_EXE;
assert.ok(previous && current, 'Set STUDY_PREVIOUS_EXE and STUDY_TEST_EXE to extracted packaged executables.');
const testRoot = fs.realpathSync(path.join(ROOT, '.test-data'));
function isolated(filename, description) {
  const absolute = fs.realpathSync(filename), relative = path.relative(testRoot, absolute);
  assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative), `${description} must be inside this checkout's .test-data.`);
  return absolute;
}
const version = exe => JSON.parse(extractFile(path.join(path.dirname(exe), 'resources', 'app.asar'), 'package.json').toString()).version;
const former = isolated(previous, 'Previous executable'), next = isolated(current, 'Current executable');
assert.equal(version(former).split('.').slice(0, 2).join('.'), '0.7', 'Use an extracted 0.7.x package, the last schema 3 release.');
assert.equal(version(next), JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version);
const profile = fs.mkdtempSync(path.join(testRoot, 'language-upgrade-'));
const file = path.join(profile, 'study-data.json');
const env = { ...process.env, STUDY_DATA_DIR: profile, STUDY_HEADLESS: '0', PATH: `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}` };
delete env.ELECTRON_RUN_AS_NODE; delete env.STUDY_TEST_EXE; delete env.STUDY_PREVIOUS_EXE;
const launch = executablePath => electron.launch({ executablePath, args: [], env, timeout: 30000 });

const twoSum = 'function twoSum(nums, target) {\n  // preserved 0.7 draft\n  return [0, 1];\n}\n';
const reverse = 'function reverseList(head) {\n  return head; // preserved list draft\n}\n';
let app = await launch(former), page = await app.firstWindow();
try {
  await page.locator('.problem-table').waitFor();
  await page.evaluate(async ({ twoSum, reverse }) => {
    await window.study.setProgress('leetcode:1', { bookmarked: true, needsReview: true });
    await window.study.saveDraft('leetcode:1', twoSum, '[[[2,7,11,15],9]]');
    await window.study.saveDraft('leetcode:206', reverse, '');
    await window.study.recordSubmission('leetcode:1', twoSum, { verdict: 'Accepted', passed: 1, total: 1, durationMs: 3, cases: [{ name: 'Case 1', input: [[2, 7, 11, 15], 9], actual: [0, 1], expected: [0, 1], verdict: 'Accepted', logs: [], durationMs: 3 }] });
  }, { twoSum, reverse });
} finally { await app.close(); }
const v3bytes = fs.readFileSync(file, 'utf8'), v3 = JSON.parse(v3bytes);
assert.equal(v3.version, 3);

app = await launch(next); page = await app.firstWindow(); page.setDefaultTimeout(20000);
const errors = []; page.on('pageerror', e => errors.push(e.message));
let data;
try {
  await page.locator('.problem-table').waitFor();
  data = (await page.evaluate(() => window.study.bootstrap())).data;
  assert.equal(data.version, 4);
  assert.deepEqual(data.progress, v3.progress);
  assert.equal(data.sessions.length, v3.sessions.length);
  for (const [id, draft] of Object.entries(v3.drafts)) assert.deepEqual(data.drafts[id], { language: 'javascript', sources: { javascript: draft.source }, cases: draft.cases, updatedAt: draft.updatedAt }, id);
  assert.deepEqual(data.submissions, v3.submissions.map(s => ({ ...s, language: 'javascript' })));
  const archive = fs.readdirSync(profile).find(name => /^study-data\.json\.v3-\d+\.json$/.test(name));
  assert.ok(archive, 'the schema 3 original is archived'); assert.equal(fs.readFileSync(path.join(profile, archive), 'utf8'), v3bytes);
  // The upgraded draft opens in JavaScript; switching languages keeps it.
  await page.getByRole('searchbox', { name: 'Search problems' }).fill('1');
  await page.getByRole('button', { name: 'Open Two Sum', exact: true }).click();
  await page.getByRole('tab', { name: 'Code', exact: true }).click();
  await page.getByRole('textbox', { name: 'JavaScript solution', exact: true }).waitFor();
  assert.match((await page.locator('.code-editor').innerText()).replace(/ /g, ' '), /preserved 0\.7 draft/);
  const language = page.getByRole('combobox', { name: 'Language', exact: true });
  await language.selectOption('java'); await page.getByRole('textbox', { name: 'Java solution', exact: true }).waitFor();
  await language.selectOption('javascript'); await page.getByRole('textbox', { name: 'JavaScript solution', exact: true }).waitFor();
  assert.deepEqual(errors, []);
} finally { await app.close(); }

app = await launch(next); page = await app.firstWindow();
try {
  await page.locator('.problem-table').waitFor();
  const restarted = (await page.evaluate(() => window.study.bootstrap())).data;
  assert.equal(restarted.drafts['leetcode:1'].sources.javascript, twoSum);
  assert.equal(restarted.drafts['leetcode:206'].sources.javascript, reverse);
  assert.equal(restarted.drafts['leetcode:1'].language, 'javascript');
  assert.ok(restarted.drafts['leetcode:1'].sources.java?.includes('class Solution'), 'the Java starter draft created by switching is kept');
  assert.deepEqual(restarted.submissions, data.submissions);
} finally { await app.close(); }
fs.mkdirSync(path.join(ROOT, 'test-results'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'test-results/language-upgrade.json'), JSON.stringify({ passed: true, from: version(former), to: version(next), profile, schema: { from: 3, to: 4 } }, null, 2));
console.log(`PASS ${version(former)} schema 3 profile upgraded to ${version(next)} schema 4 with exact archive, migrated drafts/submissions and restart persistence`);
