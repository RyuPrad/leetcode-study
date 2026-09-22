import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { StudyStore, emptyData, validateData } from '../desktop/store';
import { validateCurrentGuidedProgress, validateGuidedProgress } from '../desktop/guided-data';
import type { GuidedLessonIdentity, GuidedProgress } from '../shared/guided';

const timestamp = '2026-09-22T12:00:00.000Z';
const lesson: GuidedLessonIdentity = {
  id: 'leetcode:1', version: 1, caseId: 'guided-default',
  checkpoints: [1, 2, 3].map(i => ({ id: `prediction-${i}`, beforeIndex: i * 2, afterIndex: i * 2 + 1, options: [{ id: 'yes', text: 'Yes', feedback: 'Correct.' }, { id: 'no', text: 'No', feedback: 'Try again.' }], correctOptionId: 'yes' }))
};
function progress(): GuidedProgress { return { lessonVersion: 1, caseId: 'guided-default', runId: 'test-run', cursor: 0, answers: {} }; }
function complete(): GuidedProgress {
  return { ...progress(), cursor: 7, answers: Object.fromEntries(lesson.checkpoints.map((checkpoint, i) => [checkpoint.id, { attempts: i === 2 ? 0 : 2, ...(i === 2 ? {} : { choiceId: 'yes' }), hintLevel: 2 as const, correct: i !== 2, revealed: i === 2 }])), completedAt: timestamp };
}
function fixture(t: test.TestContext) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'leetcode-guided-test-'));
  t.after(() => { assert.equal(path.dirname(dir), os.tmpdir()); assert.ok(path.basename(dir).startsWith('leetcode-guided-test-')); fs.rmSync(dir, { recursive: true, force: true }); });
  return { dir, store: new StudyStore(dir) };
}

test('schema 2 migration preserves the exact original and every existing record', t => {
  const { dir, store } = fixture(t);
  const legacy = {
    version: 2,
    progress: { 'leetcode:1': { status: 'completed', bookmarked: true, needsReview: true, updatedAt: timestamp } },
    sessions: [{ id: 'session', problemId: 'leetcode:1', startedAt: timestamp, endedAt: timestamp, updatedAt: timestamp, durationMs: 60000, outcome: 'studied', reflection: 'Remember the complement.' }],
    drafts: { 'leetcode:1': { source: 'function twoSum() { return [0,1]; }', cases: '[[[2,7],9]]', updatedAt: timestamp } },
    submissions: [{ id: 'submission', problemId: 'leetcode:1', source: 'function twoSum() { return [0,1]; }', createdAt: timestamp, result: { verdict: 'Accepted', total: 1, passed: 1, durationMs: 1, cases: [{ name: 'Case 1', input: [[2,7],9], actual: [0,1], expected: [0,1], verdict: 'Accepted', durationMs: 1, logs: [] }] } }]
  };
  const bytes = `  ${JSON.stringify(legacy, null, 3)}\n`;
  fs.writeFileSync(store.file, bytes);
  const migrated = new StudyStore(dir), data = migrated.snapshot();
  assert.equal(data.version, 3); assert.deepEqual(data.guided, {});
  for (const key of ['progress', 'sessions', 'drafts', 'submissions'] as const) assert.deepEqual(data[key], legacy[key]);
  const archive = fs.readdirSync(dir).find(file => file.includes('.v2-'));
  assert.ok(archive); assert.equal(fs.readFileSync(path.join(dir, archive), 'utf8'), bytes);
  const saved = fs.readFileSync(store.file, 'utf8'); new StudyStore(dir); assert.equal(fs.readFileSync(store.file, 'utf8'), saved);
  assert.equal(fs.readdirSync(dir).filter(file => file.includes('.v2-')).length, 1);
});

test('schema 2 recovery migration archives the recovered original as well as corrupt primary', t => {
  const { dir, store } = fixture(t), bytes = JSON.stringify({ version: 2, progress: {}, sessions: [], drafts: {}, submissions: [] });
  fs.writeFileSync(store.file, '{broken'); fs.writeFileSync(`${store.file}.bak`, bytes);
  const restored = new StudyStore(dir); assert.equal(restored.snapshot().version, 3); assert.match(restored.notice!, /recovery backup/);
  const files = fs.readdirSync(dir); assert.ok(files.some(file => file.includes('.corrupt-')));
  assert.equal(fs.readFileSync(path.join(dir, files.find(file => file.includes('.v2-'))!), 'utf8'), bytes);
});

test('guided answers, hints, revealed results and earlier completion survive restart and backup restore without solving', t => {
  const { dir, store } = fixture(t), result = complete();
  store.updateProgress('leetcode:1', { status: 'in-progress', bookmarked: true });
  store.saveGuidedProgress('leetcode:1', result);
  assert.equal(store.snapshot().progress['leetcode:1'].status, 'in-progress');
  assert.equal(store.snapshot().submissions.length, 0);
  const reopened = new StudyStore(dir); assert.deepEqual(reopened.snapshot().guided['leetcode:1'], result);
  const restarted = { ...progress(), runId: 'another-run', previousCompletion: { lessonVersion: 1, completedAt: timestamp } };
  reopened.saveGuidedProgress('leetcode:1', restarted);
  const target = fixture(t).store; target.restore(reopened.snapshot());
  assert.deepEqual(target.snapshot(), reopened.snapshot());
  target.restore({ version: 1, progress: {}, sessions: [] }); assert.deepEqual(target.snapshot().guided, {});
  target.restore({ version: 2, progress: {}, sessions: [], drafts: {}, submissions: [] }); assert.equal(target.snapshot().version, 3);
});

test('invalid guided writes and backups leave current data untouched and remove arbitrary properties', t => {
  const { store } = fixture(t); store.saveGuidedProgress('leetcode:1', progress());
  const bytes = fs.readFileSync(store.file, 'utf8');
  const invalid: unknown[] = [null, { ...progress(), cursor: -1 }, { ...progress(), lessonVersion: 0 }, { ...progress(), runId: '__proto__' }, { ...progress(), completedAt: 'no date' }, { ...progress(), previousCompletion: { lessonVersion: 0, completedAt: timestamp } }, { ...progress(), answers: { question: { attempts: Infinity, hintLevel: 0, correct: false, revealed: false } } }, { ...progress(), answers: { question: { attempts: 0, hintLevel: 3, correct: false, revealed: false } } }, { ...progress(), answers: { question: { attempts: 0, hintLevel: 0, correct: true, revealed: false } } }];
  for (const bad of invalid) {
    assert.throws(() => store.saveGuidedProgress('leetcode:1', bad as GuidedProgress));
    assert.throws(() => store.restore({ ...emptyData(), guided: { 'leetcode:1': bad } }));
  }
  assert.equal(fs.readFileSync(store.file, 'utf8'), bytes);
  const cleaned = validateGuidedProgress({ ...complete(), executable: 'never', answers: { 'prediction-1': { attempts: 1, hintLevel: 0, correct: true, revealed: false, choiceId: 'yes', executable: 'never' } } });
  assert.ok(!('executable' in cleaned)); assert.ok(!('executable' in cleaned.answers['prediction-1']));
  assert.throws(() => validateData({ ...emptyData(), version: 4 }));
});

test('live guided writes validate bundled lesson identity and cannot skip unresolved predictions', () => {
  assert.deepEqual(validateCurrentGuidedProgress(progress(), lesson), progress());
  const bad: GuidedProgress[] = [{ ...progress(), lessonVersion: 2 }, { ...progress(), caseId: 'other-case' }, { ...progress(), cursor: 3 }, { ...progress(), answers: { other: { attempts: 1, choiceId: 'yes', hintLevel: 0, correct: true, revealed: false } } }, { ...progress(), answers: { 'prediction-1': { attempts: 1, choiceId: 'unknown', hintLevel: 0, correct: false, revealed: false } } }, { ...progress(), answers: { 'prediction-1': { attempts: 1, choiceId: 'no', hintLevel: 0, correct: true, revealed: false } } }, { ...complete(), cursor: 6 }];
  for (const value of bad) assert.throws(() => validateCurrentGuidedProgress(value, lesson));
  assert.deepEqual(validateCurrentGuidedProgress(complete(), lesson), complete());
  const wrong = { ...progress(), cursor: 2, answers: { 'prediction-1': { attempts: 1, choiceId: 'no', hintLevel: 2 as const, correct: false, revealed: false } } };
  assert.deepEqual(validateCurrentGuidedProgress(wrong, lesson), wrong);
  assert.throws(() => validateCurrentGuidedProgress({ ...wrong, cursor: 3 }, lesson));
  assert.equal(validateCurrentGuidedProgress({ ...wrong, cursor: 3, answers: { 'prediction-1': { ...wrong.answers['prediction-1'], revealed: true } } }, lesson).cursor, 3);
});

test('backward review retains proven completion while future content versions remain restorable', () => {
  const saved = complete(), review = { ...saved, cursor: 0 };
  assert.deepEqual(validateCurrentGuidedProgress(review, lesson, saved), review);
  assert.throws(() => validateCurrentGuidedProgress({ ...review, runId: 'different-run' }, lesson, saved));
  const oldVersion = { ...saved, lessonVersion: 8 };
  assert.deepEqual(validateData({ ...emptyData(), guided: { 'leetcode:1': oldVersion } }).guided['leetcode:1'], oldVersion);
  assert.throws(() => validateCurrentGuidedProgress(oldVersion, lesson));
});
