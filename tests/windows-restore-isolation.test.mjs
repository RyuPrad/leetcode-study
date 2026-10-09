// Actual main/preload/Store/Tracker and CodeWorkspace callbacks, with disposable
// disk profiles. The Windows desktop suite additionally covers the real IPC/reload.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { desktopFixture, codeRunner, empty, accepted, guided, stamp, readSource } from './helpers/desktop-profile-harness.mjs';

const session = () => ({ id: 'shared-session', problemId: 'leetcode:1', startedAt: stamp, endedAt: stamp, updatedAt: stamp, durationMs: 1000, outcome: 'studied', reflection: 'restored reflection' });
const restored = () => ({ ...empty(),
  progress: { 'leetcode:1': { status: 'not-started', bookmarked: true, needsReview: true, updatedAt: stamp } },
  drafts: { 'leetcode:1': { source: 'restored same-problem source', cases: '[]', updatedAt: stamp }, 'leetcode:2': { source: 'restored source', cases: '[]', updatedAt: stamp } },
  submissions: [{ id: 'restored-submission', problemId: 'leetcode:2', source: 'saved restored submission', createdAt: stamp, result: accepted() }],
  sessions: [session()], guided: { 'leetcode:1': guided('restored-run') },
});
const archives = f => fs.readdirSync(f.directory).filter(name => name.includes('.before-import-'));
const readArchive = (f, name) => JSON.parse(fs.readFileSync(path.join(f.directory, name), 'utf8'));
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
async function prepare(t) {
  const f = await desktopFixture(t, { ...empty(), sessions: [{ ...session(), reflection: 'old reflection' }], guided: { 'leetcode:1': guided('old-run') } });
  await f.api.selectProblem('leetcode:1'); f.tracker.setFocused(true); f.advance(1000);
  fs.writeFileSync(f.backup, JSON.stringify(restored()));
  const priorArchive = `${f.file}.before-import-prior.json`, priorBytes = 'previous archive sentinel\n';
  fs.writeFileSync(priorArchive, priorBytes);
  return { ...f, priorArchive, priorBytes };
}
function assertRestored(f) {
  assert.deepEqual(f.store.snapshot(), restored()); assert.deepEqual(f.disk(), restored());
  assert.deepEqual(f.restart(), restored());
  assert.equal(fs.readFileSync(f.priorArchive, 'utf8'), f.priorBytes);
  assert.equal(f.tracker.state().sessionId, null);
}
for (const callback of ['late Accepted', 'unmount Cancelled']) test(`${callback} cannot reinsert an old submission after successful restore`, async t => {
  const f = await prepare(t), runner = codeRunner(f.api); runner.start();
  const draft = f.api.saveDraft('leetcode:1', 'latest unsaved old draft', '[[1]]');
  assert.equal(await f.api.importBackup(), true); await draft;
  const archive = archives(f).find(name => !name.endsWith('prior.json'));
  assert.ok(archive); const archived = readArchive(f, archive);
  assert.equal(archived.drafts['leetcode:1'].source, 'latest unsaved old draft');
  assert.equal(archived.sessions.at(-1).durationMs, 1000);
  assert.equal(archived.guided['leetcode:1'].runId, 'old-run');
  if (callback === 'late Accepted') await runner.finish(accepted());
  await runner.leave();
  assert.equal(runner.state.writes.length, 1);
  assert.equal(runner.state.workers[0].terminated, true); assert.equal(runner.state.timers.size, 0);
  f.advance(20000); f.tracker.setFocused(false); f.tracker.setSuspended(true); f.close();
  assertRestored(f);
  assert.match(runner.state.errors[0], /workspace was replaced/);
});

test('every old-document mutation is rejected, even after another bootstrap; fresh documents can save', async t => {
  const f = await prepare(t); await f.api.importBackup();
  assert.equal((await f.api.bootstrap()).data.drafts['leetcode:2'].source, 'restored source');
  const patch = { durationMs: 5, outcome: 'solved', reflection: 'stale edit' };
  for (const write of [
    () => f.api.saveDraft('leetcode:1', 'stale editor', '[]'),
    () => f.api.saveGuidedProgress('leetcode:1', guided('stale-guided')),
    () => f.api.setProgress('leetcode:1', { status: 'completed' }),
    () => f.api.selectProblem('leetcode:1'),
    () => f.api.editSession('shared-session', patch),
    () => f.api.deleteSession('shared-session'),
    () => f.api.recordSubmission('leetcode:1', 'stale accepted', accepted()),
    () => f.api.importBackup(), () => f.api.exportBackup(),
  ]) await assert.rejects(write(), /workspace was replaced/);
  f.api.activity(); f.flush(); assertRestored(f);
  const next = await f.openDocument();
  const save = next.saveDraft('leetcode:1', 'new document edit', '[]'); f.flush(); await save;
  await next.saveGuidedProgress('leetcode:1', guided('new-document-guided'));
  await next.recordSubmission('leetcode:1', 'new document submission', accepted());
  assert.equal(f.disk().drafts['leetcode:1'].source, 'new document edit');
  assert.equal(f.disk().guided['leetcode:1'].runId, 'new-document-guided');
  assert.equal(f.disk().progress['leetcode:1'].status, 'completed');
  assert.equal(f.epoch(), 1);
  assert.equal(Object.hasOwn(f.disk(), 'profileEpoch'), false);
  assert.ok(archives(f).filter(name => !name.endsWith('prior.json')).every(name => !Object.hasOwn(readArchive(f, name), 'profileEpoch')));
});

for (const failure of ['file cancel', 'confirmation cancel', 'invalid JSON', 'invalid data', 'archive', 'commit']) test(`${failure} keeps the old write scope and same active session`, async t => {
  const f = await prepare(t), runner = codeRunner(f.api), oldSession = f.tracker.state().sessionId;
  runner.start();
  if (failure === 'file cancel') f.dialog.showOpenDialog = async () => ({ canceled: true, filePaths: [] });
  if (failure === 'confirmation cancel') f.dialog.showMessageBox = async () => ({ response: 0 });
  if (failure === 'invalid JSON') fs.writeFileSync(f.backup, '{');
  if (failure === 'invalid data') fs.writeFileSync(f.backup, JSON.stringify({ version: 3 }));
  f.fail(failure);
  if (failure.endsWith('cancel')) assert.equal(await f.api.importBackup(), false);
  else await assert.rejects(f.api.importBackup());
  f.fail(null);
  assert.equal(f.epoch(), 0); assert.equal(f.tracker.state().sessionId, oldSession);
  f.advance(1000); assert.equal(f.tracker.state().durationMs, 2000);
  await runner.finish(accepted()); await runner.leave();
  assert.equal(f.disk().submissions.at(-1).source, 'old pending source');
  assert.equal(f.disk().progress['leetcode:1'].status, 'completed');
  const save = f.api.saveDraft('leetcode:1', 'edit after failed import', '[]'); f.flush(); await save;
  assert.equal(f.disk().drafts['leetcode:1'].source, 'edit after failed import');
  assert.equal(fs.readFileSync(f.priorArchive, 'utf8'), f.priorBytes);
  assert.equal(f.disk().drafts['leetcode:2'], undefined);
});

test('a failed pending-draft flush aborts restore and the retained draft can be retried', async t => {
  const f = await prepare(t), sessionId = f.tracker.state().sessionId;
  const draft = f.api.saveDraft('leetcode:1', 'draft before failed restore', '[]');
  const failedDraft = assert.rejects(draft, /draft flush failure/);
  f.fail('draft'); await assert.rejects(f.api.importBackup(), /draft flush failure/); await failedDraft;
  assert.equal(f.epoch(), 0); assert.equal(f.tracker.state().sessionId, sessionId);
  assert.equal(archives(f).length, 1);
  f.fail(null); f.flush();
  assert.equal(f.disk().drafts['leetcode:1'].source, 'draft before failed restore');
  assert.equal(f.disk().drafts['leetcode:2'], undefined);
});

test('ordinary navigation still saves a Cancelled submission', async t => {
  const f = await prepare(t), runner = codeRunner(f.api); runner.start(); await runner.leave();
  assert.equal(f.disk().submissions.at(-1).result.verdict, 'Cancelled');
  assert.equal(f.disk().submissions.at(-1).source, 'old pending source');
  assert.notEqual(f.disk().progress['leetcode:1'].status, 'completed');
  assert.deepEqual(runner.state.errors, []);
});

test('a result received while the restore confirmation is open is retained in the pre-import archive', async t => {
  const f = await prepare(t), runner = codeRunner(f.api), answer = deferred(), opened = deferred(); runner.start();
  f.dialog.showMessageBox = () => { opened.resolve(); return answer.promise; };
  const importing = f.api.importBackup(); await opened.promise;
  await runner.finish(accepted());
  answer.resolve({ response: 1 }); await importing; await runner.leave();
  const archive = readArchive(f, archives(f).find(name => !name.endsWith('prior.json')));
  assert.equal(archive.submissions.at(-1).result.verdict, 'Accepted');
  assert.equal(archive.submissions.at(-1).source, 'old pending source');
  assertRestored(f);
});

for (const waitingAt of ['file dialog', 'confirmation', 'export dialog']) test(`an old ${waitingAt} cannot commit after another restore`, async t => {
  const f = await prepare(t), waiting = deferred(), opened = deferred();
  let pending;
  if (waitingAt === 'file dialog') {
    f.dialog.showOpenDialog = () => { opened.resolve(); return waiting.promise; }; pending = f.api.importBackup(); await opened.promise;
    f.dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [f.backup] });
  } else if (waitingAt === 'confirmation') {
    f.dialog.showMessageBox = () => { opened.resolve(); return waiting.promise; }; pending = f.api.importBackup(); await opened.promise;
    f.dialog.showMessageBox = async () => ({ response: 1 });
  } else {
    f.dialog.showSaveDialog = () => { opened.resolve(); return waiting.promise; }; pending = f.api.exportBackup(); await opened.promise;
  }
  const rejected = assert.rejects(pending, /workspace was replaced/);
  assert.equal(await f.api.importBackup(), true);
  waiting.resolve(waitingAt === 'file dialog' ? { canceled: false, filePaths: [f.backup] } : waitingAt === 'confirmation' ? { response: 1 } : { canceled: false, filePath: path.join(f.directory, 'stale-export.json') });
  await rejected; assert.equal(f.epoch(), 1); assertRestored(f);
  assert.equal(fs.existsSync(path.join(f.directory, 'stale-export.json')), false);
  assert.equal(archives(f).length, 2, 'only one new pre-import archive');
});

test('the actual restore-success callback reloads only on success', () => {
  const source = readSource('src/App.tsx');
  const match = source.match(/window\.study\.importBackup\(\)\.then\((restored => \{[^}]+\})\)/);
  assert.ok(match, 'Find the actual App restore callback');
  let reloads = 0;
  const callback = vm.runInNewContext(`(${match[1]})`, { window: { location: { reload: () => reloads++ } } });
  callback(false); assert.equal(reloads, 0); callback(true); assert.equal(reloads, 1);
});
