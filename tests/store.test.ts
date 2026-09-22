import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { StudyStore, emptyData, validateData } from '../desktop/store';
import type { StudySession } from '../shared/types';
function fixture(t: test.TestContext) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'leetcode-study-test-'));
  t.after(() => { assert.equal(path.dirname(dir), os.tmpdir()); assert.ok(path.basename(dir).startsWith('leetcode-study-test-')); fs.rmSync(dir, { recursive: true, force: true }); });
  return { dir, store: new StudyStore(dir) };
}
const session = (id = 'session-1'): StudySession => ({ id, problemId: 'leetcode:1', startedAt: '2026-01-01T00:00:00.000Z', endedAt: '2026-01-01T00:10:00.000Z', updatedAt: '2026-01-01T00:10:00.000Z', durationMs: 600000, outcome: 'studied', reflection: 'Check the complement before inserting.' });
test('progress and reflections survive restarting the store', t => {
  const { dir, store } = fixture(t); store.updateProgress('leetcode:1', { bookmarked: true }); store.putSession(session());
  const reloaded = new StudyStore(dir).snapshot(); assert.equal(reloaded.progress['leetcode:1'].bookmarked, true); assert.equal(reloaded.sessions[0].reflection, session().reflection);
});
test('invalid progress updates are rejected without modifying saved data', t => {
  const { store } = fixture(t); store.updateProgress('leetcode:1', { status: 'in-progress' }); const before = fs.readFileSync(store.file, 'utf8');
  assert.throws(() => store.updateProgress('leetcode:1', { status: 'invalid' as any })); assert.throws(() => store.updateProgress('__proto__', {}));
  assert.equal(fs.readFileSync(store.file, 'utf8'), before);
});
test('malformed or future backups do not replace existing data', t => {
  const { store } = fixture(t); store.putSession(session()); const before = store.snapshot();
  for (const value of [null, { version: 2 }, { ...emptyData(), sessions: [{ ...session(), durationMs: -1 }] }, { ...emptyData(), sessions: [session(), session()] }, { ...emptyData(), sessions: [{ ...session(), reflection: 123 }] }]) assert.throws(() => store.restore(value));
  assert.deepEqual(store.snapshot(), before);
});
test('backup restore preserves stable problem IDs and archives previous data', t => {
  const { dir, store } = fixture(t); store.updateProgress('leetcode:2', { status: 'completed' });
  store.restore({ ...emptyData(), sessions: [session()], progress: { 'leetcode:99999': { status: 'completed', bookmarked: false, needsReview: false, updatedAt: session().updatedAt } } });
  assert.equal(store.snapshot().sessions[0].problemId, 'leetcode:1'); assert.ok(store.snapshot().progress['leetcode:99999']); assert.ok(fs.readdirSync(dir).some(f => f.includes('before-import')));
});
test('unfinished sessions recover only their checkpointed duration', t => {
  const { dir, store } = fixture(t); store.putSession({ ...session(), endedAt: null, durationMs: 1000 }); const recovered = new StudyStore(dir).snapshot().sessions[0];
  assert.equal(recovered.durationMs, 1000); assert.equal(recovered.endedAt, recovered.updatedAt);
});
test('corrupt primary data recovers from the last valid backup', t => {
  const { dir, store } = fixture(t); store.updateProgress('leetcode:1', { bookmarked: true }); store.updateProgress('leetcode:2', { bookmarked: true }); fs.writeFileSync(store.file, '{broken');
  const recovered = new StudyStore(dir); assert.ok(recovered.notice); assert.ok(recovered.snapshot().progress['leetcode:1'].bookmarked); assert.ok(fs.readdirSync(dir).some(f => f.includes('.corrupt-')));
});
test('two unreadable files are preserved instead of silently resetting progress', t => {
  const { dir, store } = fixture(t); fs.writeFileSync(store.file, 'broken'); fs.writeFileSync(`${store.file}.bak`, 'also broken');
  assert.throws(() => new StudyStore(dir), /preserved/); assert.equal(fs.readFileSync(store.file, 'utf8'), 'broken');
});
test('only an explicit solved outcome completes a problem', t => {
  const { store } = fixture(t); store.putSession(session()); assert.equal(store.snapshot().progress['leetcode:1'], undefined);
  store.editSession('session-1', { durationMs: 5000, outcome: 'solved', reflection: 'Done' }); assert.equal(store.snapshot().progress['leetcode:1'].status, 'completed');
  store.editSession('session-1', { durationMs: 5000, outcome: 'needs-review', reflection: 'Review later' }); assert.equal(store.snapshot().progress['leetcode:1'].status, 'completed'); assert.ok(store.snapshot().progress['leetcode:1'].needsReview);
});
test('snapshot changes cannot mutate the store and unknown backup fields are removed', t => {
  const { store } = fixture(t); store.putSession(session()); const snapshot = store.snapshot(); snapshot.sessions[0].reflection = 'changed'; assert.notEqual(store.snapshot().sessions[0].reflection, 'changed');
  const clean = validateData({ ...emptyData(), executable: 'nope', sessions: [{ ...session(), executable: 'nope' }] }); assert.ok(!('executable' in clean)); assert.ok(!('executable' in clean.sessions[0]));
});
test('version 1 profiles migrate atomically with an exact archived original', t=>{
  const {dir,store}=fixture(t), legacy={version:1,progress:{},sessions:[session()]};
  const bytes=JSON.stringify(legacy);fs.writeFileSync(store.file,bytes);
  const migrated=new StudyStore(dir);assert.equal(migrated.snapshot().version,3);assert.deepEqual(migrated.snapshot().drafts,{});assert.deepEqual(migrated.snapshot().submissions,[]);assert.deepEqual(migrated.snapshot().guided,{});
  const archive=fs.readdirSync(dir).find(f=>f.includes('.v1-'))!;assert.ok(archive);assert.equal(fs.readFileSync(path.join(dir,archive),'utf8'),bytes);
  assert.equal(JSON.parse(fs.readFileSync(store.file,'utf8')).version,3);
  assert.equal(new StudyStore(dir).snapshot().sessions[0].reflection,session().reflection);
});
test('drafts and immutable submissions survive restart and backup restore; only Accepted completes',t=>{
  const {dir,store}=fixture(t),source='function twoSum(nums, target) { return [0,1]; }';
  store.updateProgress('leetcode:1',{bookmarked:true,needsReview:true});
  store.saveDrafts({'leetcode:1':{source,cases:'[[[2,7],9]]',updatedAt:session().updatedAt}});
  const wrong={verdict:'Wrong answer' as const,passed:0,total:1,durationMs:1,cases:[{name:'Case 1',input:[[2,7],9],actual:[0,0],expected:[0,1],verdict:'Wrong answer' as const,logs:[],durationMs:1}]};
  store.recordSubmission('leetcode:1',source,wrong);assert.notEqual(store.snapshot().progress['leetcode:1'].status,'completed');
  store.recordSubmission('leetcode:1',source,{...wrong,verdict:'Accepted',passed:1,cases:[{...wrong.cases[0],actual:[0,1],verdict:'Accepted'}]});
  store.recordSubmission('leetcode:1','changed',wrong);
  const data=new StudyStore(dir).snapshot();assert.equal(data.progress['leetcode:1'].status,'completed');assert.ok(data.progress['leetcode:1'].bookmarked&&data.progress['leetcode:1'].needsReview);assert.equal(data.submissions[0].source,source);assert.equal(data.drafts['leetcode:1'].source,source);
  const copy=fixture(t).store;copy.restore(data);assert.deepEqual(copy.snapshot(),data);
  assert.throws(()=>store.recordSubmission('leetcode:1',source,{...wrong,verdict:'Accepted'}),/Inconsistent/);
  assert.throws(()=>store.saveDrafts({'leetcode:1':{source:'x'.repeat(262145),cases:'[]',updatedAt:session().updatedAt}}));
});
