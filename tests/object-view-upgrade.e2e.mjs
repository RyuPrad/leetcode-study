// Run extracted packages against disposable profiles. This never installs an app
// and rejects the installed executable, the live profile, and backup originals.
import { _electron as electron } from 'playwright';
import { extractFile } from '@electron/asar';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { ROOT } from '../scripts/content.mjs';

const verifyExisting = process.argv.includes('--verify-existing');
const previous = process.env.STUDY_PREVIOUS_EXE;
const current = process.env.STUDY_TEST_EXE;
assert.ok(previous && current, 'Set STUDY_PREVIOUS_EXE and STUDY_TEST_EXE to extracted packaged executables.');
const testRoot = path.join(ROOT, '.test-data');
fs.mkdirSync(testRoot, { recursive: true });
fs.mkdirSync(path.join(ROOT, 'test-results'), { recursive: true });
const realTestRoot = fs.realpathSync(testRoot);
function isolated(filename, description) {
  const absolute = fs.realpathSync(filename);
  const relative = path.relative(realTestRoot, absolute);
  assert.ok(relative && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative), `${description} must be inside this checkout's .test-data.`);
  return absolute;
}
function payload(filename, description) {
  const executable = isolated(filename, description);
  const archive = path.join(path.dirname(executable), 'resources', 'app.asar');
  isolated(archive, `${description} archive`);
  const metadata = JSON.parse(extractFile(archive, 'package.json').toString());
  const lessons = ['a', 'b'].flatMap(part => JSON.parse(extractFile(archive, path.join('dist', 'content', 'visualizer-ui', `guided-content-${part}.json`)).toString()));
  return { executable, archive, version: metadata.version, lessons };
}
const former = payload(previous, 'Previous executable');
const next = payload(current, 'Current executable');
const expectedVersion = process.env.STUDY_EXPECT_VERSION || JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
assert.ok(['0.5.7', '0.6.0', '0.6.1', '0.6.2'].includes(former.version), 'Use a verified 0.5.7, 0.6.0, 0.6.1 or 0.6.2 installer payload.');
assert.equal(next.version, expectedVersion, 'The extracted current package must match the intended release.');
let profile;
if (verifyExisting) {
  assert.ok(process.env.STUDY_UPGRADE_PROFILE, '--verify-existing requires STUDY_UPGRADE_PROFILE.');
  assert.ok(!fs.lstatSync(process.env.STUDY_UPGRADE_PROFILE).isSymbolicLink(), 'Pass a disposable profile directory, not a symbolic link or junction.');
  profile = isolated(process.env.STUDY_UPGRADE_PROFILE, 'Disposable copied profile');
  assert.match(path.basename(profile), /^object-view-upgrade-copy-/, 'Name the disposable full-profile copy object-view-upgrade-copy-<unique suffix>; do not pass a backup original.');
  assert.ok(fs.statSync(profile).isDirectory(), 'The copied profile must be a directory.');
} else {
  assert.ok(!process.env.STUDY_UPGRADE_PROFILE, 'STUDY_UPGRADE_PROFILE is only accepted with --verify-existing.');
  profile = fs.mkdtempSync(path.join(testRoot, 'object-view-upgrade-fixture-'));
}
const filename = path.join(profile, 'study-data.json');
const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
function ordered(value) {
  if (Array.isArray(value)) return value.map(ordered);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])]));
  return value;
}
const fingerprint = value => hash(ordered(value));
const dataFields = ['progress', 'sessions', 'drafts', 'submissions', 'guided'];
function retained(actual, expected, description) {
  assert.equal(actual.version, 3, `${description}: schema remains 3`);
  for (const field of dataFields) assert.equal(fingerprint(actual[field]), fingerprint(expected[field]), `${description}: ${field} stays exact`);
}
function recovered(data) {
  assert.equal(data.version, 3, 'The input profile must have schema 3.');
  return { ...data, sessions: data.sessions.map(session => session.endedAt === null ? { ...session, endedAt: session.updatedAt } : session) };
}
const errors = [];
async function launch(item, directory = profile) {
  isolated(directory, 'Test profile');
  const env = { ...process.env, STUDY_DATA_DIR: directory, STUDY_HEADLESS: '1', PATH: `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}` };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.STUDY_DEV_URL;
  const app = await electron.launch({ executablePath: item.executable, args: [], env, timeout: 30000 });
  try {
    const page = await app.firstWindow();
    page.setDefaultTimeout(20000);
    page.on('pageerror', error => errors.push(`${item.version}: ${error.message}`));
    await app.evaluate(({ session }) => session.defaultSession.enableNetworkEmulation({ offline: true }));
    await page.locator('.problem-table').waitFor();
    assert.equal(await app.evaluate(({ app }) => app.getPath('userData')), path.resolve(directory), 'Electron uses only the disposable profile.');
    assert.ok(await app.evaluate(({ app }) => app.isPackaged), 'The executable is packaged.');
    assert.equal(await app.evaluate(({ app }) => app.getVersion()), item.version);
    return { app, page };
  } catch (error) { await app.close(); throw error; }
}
async function read(page) {
  return page.evaluate(async () => ({
    ...(await window.study.bootstrap()),
    preferences: Object.fromEntries(Object.keys(localStorage).filter(key => key.startsWith('study.')).sort().map(key => [key, localStorage.getItem(key)])),
  }));
}
async function seed(page) {
  const lessons = [1, 21].map(number => former.lessons.find(lesson => lesson.id === `leetcode:${number}`));
  for (const lesson of lessons) {
    assert.ok(lesson);
    const now = next.lessons.find(candidate => candidate.id === lesson.id);
    assert.equal(now?.version, lesson.version, 'Existing guided content retains its reviewed version.');
    assert.equal(fingerprint(now.checkpoints), fingerprint(lesson.checkpoints), 'Existing guided checkpoint content is unchanged by Object View.');
  }
  await page.evaluate(async lessons => {
    localStorage.setItem('study.walkthroughMode', 'compact');
    localStorage.setItem('study.tabOutEnabled', 'false');
    for (const [id, durationMs, outcome, reflection] of [
      ['leetcode:1', 420000, 'solved', 'Two Sum retention fixture.'],
      ['leetcode:21', 210000, 'needs-review', 'Retain duplicate-valued linked-list notes.'],
      ['leetcode:933', 90000, 'studied', 'The 3000 ms boundary is inclusive.'],
    ]) {
      const timer = await window.study.selectProblem(id);
      await window.study.editSession(timer.sessionId, { durationMs, outcome, reflection });
      await window.study.selectProblem(null);
    }
    for (const [id, source, cases] of [
      ['leetcode:1', 'function twoSum(nums,target){return [0,1];}\n// Retained draft', '[[[2,7,11,15],9]]'],
      ['leetcode:21', 'function mergeTwoLists(list1,list2){return list1;}\n// Work in progress', '[[[1,1,3],[1,2,4]]]'],
      ['leetcode:700', 'function searchBST(root,val){return root;}\n// Existing code-only problem', '[[[4,2,7,1,3],2]]'],
      ['leetcode:933', 'class RecentCounter { constructor(){this.queue=[];} ping(t){return 1;} }', '[[["RecentCounter","ping","ping"],[[],[1],[3001]]]]'],
    ]) await window.study.saveDraft(id, source, cases);
    await window.study.recordSubmission('leetcode:1', 'function twoSum(){return [0,1];}', {
      verdict: 'Accepted', passed: 1, total: 1, durationMs: 25,
      cases: [{ name: 'Retained accepted result', input: [[2,7],9], actual: [0,1], expected: [0,1], verdict: 'Accepted', logs: ['Preserve accepted console output.'], durationMs: 25 }],
    });
    await window.study.recordSubmission('leetcode:21', 'function mergeTwoLists(a,b){return a;}', {
      verdict: 'Wrong answer', passed: 0, total: 1, durationMs: 12,
      cases: [{ name: 'Retained failed result', input: [[1,2],[1,3]], actual: [1,2], expected: [1,1,2,3], verdict: 'Wrong answer', logs: ['Preserve failed console output.'], durationMs: 12 }],
    });
    for (const [id, patch] of [
      ['leetcode:1', { status: 'completed', bookmarked: true, needsReview: false }],
      ['leetcode:21', { status: 'in-progress', bookmarked: true, needsReview: true }],
      ['leetcode:700', { status: 'not-started', bookmarked: false, needsReview: true }],
      ['leetcode:933', { status: 'completed', bookmarked: false, needsReview: false }],
    ]) await window.study.setProgress(id, patch);
    for (const lesson of lessons) {
      const complete = lesson.id === 'leetcode:21';
      const [first, second] = lesson.checkpoints;
      const answers = complete
        ? Object.fromEntries(lesson.checkpoints.map((checkpoint, index) => [checkpoint.id, { attempts: index + 1, choiceId: checkpoint.correctOptionId, hintLevel: index % 3, revealed: false, correct: true }]))
        : { [first.id]: { attempts: 2, choiceId: first.correctOptionId, hintLevel: 1, revealed: false, correct: true }, [second.id]: { attempts: 1, choiceId: second.options.find(option => option.id !== second.correctOptionId).id, hintLevel: 2, revealed: false, correct: false } };
      await window.study.saveGuidedProgress(lesson.id, {
        lessonVersion: lesson.version, caseId: lesson.caseId, runId: `objects-upgrade-${complete ? 'complete' : 'partial'}`,
        cursor: complete ? lesson.checkpoints.at(-1).afterIndex : second.beforeIndex, answers,
        ...(complete ? { completedAt: '2026-09-29T17:00:00.000Z' } : {}),
        previousCompletion: { lessonVersion: Math.max(1, lesson.version - 1), completedAt: '2026-09-28T17:00:00.000Z' },
      });
    }
    await window.study.selectProblem(null);
  }, lessons);
}

const copiedInput = verifyExisting ? fs.readFileSync(filename) : null;
const original = copiedInput ? JSON.parse(copiedInput) : null;
let handle = await launch(former), baseline;
try {
  if (!verifyExisting) await seed(handle.page);
  baseline = await read(handle.page);
  assert.equal(baseline.version, former.version);
  if (original) retained(baseline.data, recovered(original), 'Previous package startup');
  fs.writeFileSync(path.join(profile, 'upgrade-preferences-baseline.json'), JSON.stringify({ origin: 'study://app', preferences: baseline.preferences }, null, 2));
} finally { await handle.app.close(); }
const saved = fs.readFileSync(filename), expected = JSON.parse(saved);
retained(expected, baseline.data, 'Previous package close');
if (!verifyExisting) {
  assert.equal(expected.sessions.length, 3);
  assert.equal(Object.keys(expected.drafts).length, 4);
  assert.equal(expected.submissions.length, 2);
  assert.equal(Object.keys(expected.guided).length, 2);
}
for (const restart of [false, true]) {
  handle = await launch(next);
  try {
    const state = await read(handle.page);
    assert.equal(state.version, next.version);
    assert.equal(state.catalog.entries.filter(entry => entry.number).length, 252);
    assert.equal(state.catalog.visualizers.length, 252);
    for (const number of [700, 933]) assert.ok(state.catalog.entries.find(entry => entry.number === number)?.visualizerPath, `New ${number} visualizer is packaged.`);
    retained(state.data, expected, restart ? 'Current package restart' : 'Current package startup');
    assert.equal(fingerprint(state.preferences), fingerprint(baseline.preferences), 'Every study.* renderer preference is retained.');
    assert.equal(hash(fs.readFileSync(filename)), hash(saved), 'Normal startup leaves the saved schema-3 file byte for byte unchanged.');
  } finally { await handle.app.close(); }
  assert.equal(hash(fs.readFileSync(filename)), hash(saved), 'Library shutdown leaves existing records unchanged.');
}

// A separate synthetic recovery fixture proves the only permitted startup edit.
// Existing copied profiles are never edited or given synthetic user records.
let recovery;
if (!verifyExisting) {
  const recoveryProfile = fs.mkdtempSync(path.join(testRoot, 'object-view-upgrade-recovery-'));
  const interrupted = structuredClone(expected);
  interrupted.sessions[0].endedAt = null;
  fs.writeFileSync(path.join(recoveryProfile, 'study-data.json'), JSON.stringify(interrupted, null, 2));
  handle = await launch(next, recoveryProfile);
  try {
    const state = await read(handle.page);
    retained(state.data, recovered(interrupted), 'Interrupted-session recovery');
    assert.equal(state.data.sessions[0].endedAt, interrupted.sessions[0].updatedAt);
    assert.equal(state.data.sessions[0].durationMs, interrupted.sessions[0].durationMs, 'Recovery retains exactly the last checkpointed duration.');
  } finally { await handle.app.close(); }
  retained(JSON.parse(fs.readFileSync(path.join(recoveryProfile, 'study-data.json'), 'utf8')), recovered(interrupted), 'Recovery profile close');
  recovery = { profile: recoveryProfile, recoveredSessions: 1, endedAtUsesUpdatedAt: true, durationUnchanged: true };
}
assert.equal(errors.length, 0, `Packaged renderer errors: ${errors.length}`);
const report = {
  passed: true, offline: true, packaged: true, installerExecuted: false, mode: verifyExisting ? 'existing-copy' : 'seeded-fixture',
  profile, previous: former.executable, current: next.executable, fromVersion: former.version, toVersion: next.version, schema: 3,
  payloads: { previousArchiveSha256: hash(fs.readFileSync(former.archive)), currentArchiveSha256: hash(fs.readFileSync(next.archive)) },
  retained: Object.fromEntries(dataFields.map(field => [field, { count: Array.isArray(expected[field]) ? expected[field].length : Object.keys(expected[field]).length, sha256: fingerprint(expected[field]) }])),
  preferences: { count: Object.keys(baseline.preferences).length, sha256: fingerprint(baseline.preferences), baselineFile: path.join(profile, 'upgrade-preferences-baseline.json') },
  baselineFileSha256: hash(saved), ...(copiedInput ? { copiedInputFileSha256: hash(copiedInput) } : {}), unchangedOnCurrentStartupAndRestart: true,
  recoveredOnPreviousStartup: original?.sessions.filter(session => session.endedAt === null).length || 0,
  ...(recovery ? { recovery } : {}),
};
fs.writeFileSync(path.join(ROOT, `test-results/object-view-upgrade-${verifyExisting ? 'existing-copy' : 'fixture'}.json`), JSON.stringify(report, null, 2));
console.log(`PASS ${former.version} → ${next.version}: all schema-3 records and ${Object.keys(baseline.preferences).length} renderer preferences retained across startup and restart${recovery ? '; checkpoint recovery verified' : ''}.`);
