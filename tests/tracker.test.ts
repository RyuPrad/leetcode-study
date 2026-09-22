import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { StudyStore } from '../desktop/store';
import { StudyTracker, IDLE_MS } from '../desktop/tracker';
function fixture(t: test.TestContext) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'leetcode-study-test-'));
  t.after(() => { assert.equal(path.dirname(dir), os.tmpdir()); assert.ok(path.basename(dir).startsWith('leetcode-study-test-')); fs.rmSync(dir, { recursive: true, force: true }); });
  let clock = 0; const store = new StudyStore(dir); const tracker = new StudyTracker(store, () => clock, () => new Date(Date.UTC(2026, 0, 1) + clock).toISOString());
  return { store, tracker, advance: (ms: number) => { clock += ms; tracker.tick(); } };
}
test('one session per problem visit and opening never marks completion', t => {
  const { store, tracker, advance } = fixture(t); tracker.select('leetcode:1'); const id = tracker.state().sessionId; tracker.setFocused(true); advance(2000); tracker.select('leetcode:1');
  assert.equal(tracker.state().sessionId, id); assert.equal(store.snapshot().progress['leetcode:1'].status, 'in-progress'); tracker.select('leetcode:2');
  assert.equal(store.snapshot().sessions.length, 2); assert.equal(store.snapshot().sessions[0].durationMs, 2000); assert.ok(store.snapshot().sessions[0].endedAt);
});
test('unfocused and suspended time never increases the session duration', t => {
  const { tracker, advance } = fixture(t); tracker.select('leetcode:1'); advance(5000); assert.equal(tracker.state().durationMs, 0); tracker.setFocused(true); advance(1000); tracker.setFocused(false); advance(60000); tracker.setFocused(true); advance(1000); tracker.setSuspended(true); advance(3600000); tracker.setSuspended(false); advance(1000);
  assert.equal(tracker.state().durationMs, 3000);
});
test('inactivity pauses at exactly five minutes and resumes on interaction', t => {
  const { tracker, advance } = fixture(t); tracker.select('leetcode:1'); tracker.setFocused(true); advance(IDLE_MS + 120000); assert.equal(tracker.state().durationMs, IDLE_MS); assert.equal(tracker.state().reason, 'idle'); tracker.activity(); advance(2000); assert.equal(tracker.state().durationMs, IDLE_MS + 2000); assert.equal(tracker.state().reason, 'running');
});
test('15-second checkpoints bound loss on interruption', t => {
  const { store, tracker, advance } = fixture(t); tracker.select('leetcode:1'); tracker.setFocused(true); advance(16000); advance(4000);
  assert.equal(store.snapshot().sessions[0].durationMs, 16000); tracker.end(); assert.equal(store.snapshot().sessions[0].durationMs, 20000);
});
test('editing the active session survives later checkpoints', t => {
  const { store, tracker, advance } = fixture(t); tracker.select('leetcode:1'); tracker.setFocused(true); advance(1000); tracker.edit(tracker.state().sessionId!, { durationMs: 60000, outcome: 'needs-review', reflection: 'Remember the base case.' }); advance(16000);
  const current = store.snapshot().sessions[0]; assert.equal(current.durationMs, 76000); assert.equal(current.reflection, 'Remember the base case.'); assert.ok(store.snapshot().progress['leetcode:1'].needsReview);
});
test('deleting the active session does not recreate it on the next tick', t => {
  const { store, tracker, advance } = fixture(t); tracker.select('leetcode:1'); tracker.delete(tracker.state().sessionId!); advance(60000); assert.equal(store.snapshot().sessions.length, 0); assert.equal(tracker.state().reason, 'inactive');
});
test('invalid duration correction preserves a running session', t => {
  const { tracker, advance } = fixture(t); tracker.select('leetcode:1'); tracker.setFocused(true); advance(1000); assert.throws(() => tracker.edit(tracker.state().sessionId!, { durationMs: NaN, outcome: 'studied', reflection: '' })); advance(1000); assert.equal(tracker.state().durationMs, 2000);
});
