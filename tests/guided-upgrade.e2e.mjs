import { _electron as electron } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { ROOT } from '../scripts/content.mjs';

// Run the exact former installer payload against an isolated profile. Never install,
// uninstall, or launch the user's existing installation or normal application data.
const previous = process.env.STUDY_PREVIOUS_EXE || path.join(ROOT, '.test-data/installer-payload-0.3.0-final/LeetCode Study.exe');
const current = process.env.STUDY_TEST_EXE;
assert.ok(fs.existsSync(previous), `The verified v0.3.0 payload is required: ${previous}`);
if (current) assert.ok(fs.existsSync(current), `The current packaged executable does not exist: ${current}`);
fs.mkdirSync(path.join(ROOT, '.test-data'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'test-results'), { recursive: true });
const profile = fs.mkdtempSync(path.join(ROOT, '.test-data/guided-upgrade-0.3-to-0.4-'));
const filename = path.join(profile, 'study-data.json');
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
function launch(executablePath) {
  const env = { ...process.env, STUDY_DATA_DIR: profile, STUDY_HEADLESS: '1' };
  delete env.ELECTRON_RUN_AS_NODE;
  if (executablePath) env.PATH = `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`;
  return electron.launch({ ...(executablePath ? { executablePath, args: [] } : { args: [ROOT] }), env, timeout: 30000 });
}
async function offline(app) {
  await app.evaluate(({ session }) => session.defaultSession.enableNetworkEmulation({ offline: true }));
}
function retained(data, expected) {
  for (const field of ['progress', 'drafts', 'submissions']) assert.deepEqual(data[field], expected[field], `${field} survives migration and guided practice`);
  for (const session of expected.sessions) assert.deepEqual(data.sessions.find(item => item.id === session.id), session, 'Existing study sessions and reflections remain intact');
}

const oldApp = await launch(previous);
try {
  await offline(oldApp);
  const page = await oldApp.firstWindow();
  await page.locator('.problem-table').waitFor();
  const bootstrap = await page.evaluate(() => window.study.bootstrap());
  assert.equal(bootstrap.version, '0.3.0');
  assert.equal(bootstrap.data.version, 2);
  assert.ok(await oldApp.evaluate(({ app }) => app.isPackaged));
  await page.evaluate(async () => {
    await window.study.selectProblem('leetcode:1');
    await window.study.setProgress('leetcode:1', { status: 'completed', bookmarked: true, needsReview: true });
    const { data } = await window.study.bootstrap();
    await window.study.editSession(data.sessions.find(item => item.problemId === 'leetcode:1').id, { durationMs: 420000, outcome: 'solved', reflection: 'Preserve this reflection across the guided-learning upgrade.' });
    await window.study.saveDraft('leetcode:1', 'function twoSum(){return [0,1];}\n// preserved v0.3 draft', '[[[2,7,11,15],9]]');
    await window.study.recordSubmission('leetcode:1', 'function twoSum(){return [0,1];}', { verdict: 'Accepted', passed: 1, total: 1, durationMs: 25, cases: [{ name: 'Guided upgrade fixture', input: [[2,7,11,15],9], actual: [0,1], expected: [0,1], verdict: 'Accepted', logs: ['preserve console output'], durationMs: 25 }] });
    await window.study.selectProblem(null);
  });
} finally { await oldApp.close(); }

const original = fs.readFileSync(filename), expected = JSON.parse(original);
assert.equal(expected.version, 2);
assert.equal(expected.sessions.length, 1);
let app = await launch(current), saved, archive;
const errors = [];
async function readyPage() {
  await offline(app);
  const page = await app.firstWindow();
  page.setDefaultTimeout(20000);
  page.on('pageerror', error => errors.push(error.message));
  await page.locator('.problem-table').waitFor();
  return page;
}
async function openGuided(page) {
  await page.getByRole('button', { name: 'Open Two Sum', exact: true }).click();
  await page.getByRole('tab', { name: 'Learn', exact: true }).click();
  const frame = await page.locator('.guided-container iframe').elementHandle().then(element => element.contentFrame());
  assert.ok(frame);
  await frame.waitForFunction(() => window.studyGuidedController?.progress && !window.studyGuidedController.busy);
  assert.equal(await frame.evaluate(() => window.studyGuidedController.error), '');
  assert.equal(await frame.evaluate(() => typeof window.study), 'undefined');
  assert.equal(await frame.evaluate(() => typeof window.require), 'undefined');
  return frame;
}
try {
  let page = await readyPage();
  const bootstrap = await page.evaluate(() => window.study.bootstrap());
  assert.equal(bootstrap.version, '0.4.0');
  assert.equal(bootstrap.data.version, 3);
  assert.deepEqual(bootstrap.data, { ...expected, version: 3, guided: {} });
  assert.deepEqual(JSON.parse(fs.readFileSync(filename, 'utf8')), bootstrap.data);
  if (current) assert.ok(await app.evaluate(({ app }) => app.isPackaged));
  const archives = fs.readdirSync(profile).filter(file => file.startsWith('study-data.json.v2-'));
  assert.equal(archives.length, 1);
  archive = path.join(profile, archives[0]);
  assert.equal(hash(fs.readFileSync(archive)), hash(original), 'The schema-2 original is archived byte for byte');
  console.log('PASS v0.3.0 schema-2 migration: all records retained and exact original archived');

  let frame = await openGuided(page);
  const checkpoint = await frame.evaluate(() => window.studyGuidedController.lesson.checkpoints[0]);
  await frame.getByRole('button', { name: 'Next prediction', exact: true }).evaluate(button => button.click());
  await frame.waitForFunction(index => !window.studyGuidedController.busy && window.studyGuidedController.progress.cursor === index, checkpoint.beforeIndex);
  const wrong = checkpoint.options.find(option => option.id !== checkpoint.correctOptionId);
  assert.ok(wrong, 'The prediction offers a wrong answer with feedback');
  await frame.locator(`[data-option-id="${wrong.id}"]`).evaluate(button => button.click());
  await frame.getByRole('button', { name: 'Hint', exact: true }).evaluate(button => button.click());
  await frame.getByRole('button', { name: 'Another hint', exact: true }).evaluate(button => button.click());
  await frame.locator(`[data-option-id="${checkpoint.correctOptionId}"]`).evaluate(button => button.click());
  await frame.getByRole('button', { name: 'Watch the change', exact: true }).evaluate(button => button.click());
  await frame.waitForFunction(index => !window.studyGuidedController.busy && window.studyGuidedController.progress.cursor === index, checkpoint.afterIndex);
  assert.equal(await frame.evaluate(() => window.studyGuidedController.error), '');
  await page.waitForFunction(async ({ id, cursor }) => {
    const progress = (await window.study.bootstrap()).data.guided['leetcode:1'];
    return progress?.cursor === cursor && progress.answers[id]?.correct && progress.answers[id]?.hintLevel === 2;
  }, { id: checkpoint.id, cursor: checkpoint.afterIndex });
  const after = (await page.evaluate(() => window.study.bootstrap())).data;
  saved = after.guided['leetcode:1'];
  assert.equal(saved.answers[checkpoint.id].attempts, 2);
  assert.equal(saved.answers[checkpoint.id].revealed, false);
  assert.equal(saved.completedAt, undefined);
  retained(after, expected);
  console.log('PASS offline guided checkpoint, wrong answer, hints, reveal and progress persistence');

  await app.close();
  app = await launch(current);
  page = await readyPage();
  const restarted = (await page.evaluate(() => window.study.bootstrap())).data;
  assert.deepEqual(restarted.guided['leetcode:1'], saved);
  retained(restarted, expected);
  assert.equal(fs.readdirSync(profile).filter(file => file.startsWith('study-data.json.v2-')).length, 1, 'Schema-3 restart does not repeat migration');
  frame = await openGuided(page);
  assert.deepEqual(await frame.evaluate(() => window.studyGuidedController.progress), saved);
  assert.equal(await frame.getByRole('button', { name: 'Play', exact: true }).getAttribute('aria-pressed'), 'false');
  assert.equal(hash(fs.readFileSync(archive)), hash(original));
  assert.deepEqual(errors, []);
  console.log('PASS restart resumes the saved checkpoint paused and preserves the migration archive');
} finally { await app.close(); }

fs.writeFileSync(path.join(ROOT, `test-results/guided-upgrade-${current ? 'packaged' : 'e2e'}.json`), JSON.stringify({
  passed: true, profile, previous, current: current || 'development Electron', packaged: !!current, offline: true,
  fromVersion: '0.3.0', toVersion: '0.4.0', fromSchema: 2, toSchema: 3,
  originalProfileHash: hash(original), archive, exactOriginalArchived: true,
  retained: ['progress', 'bookmarks', 'review flags', 'study sessions', 'reflections', 'draft source', 'custom cases', 'submissions', 'console output'],
  guided: { checkpoints: 1, wrongAnswer: true, hints: 2, persisted: true, resumedPaused: true },
  installerExecuted: false
}, null, 2));
