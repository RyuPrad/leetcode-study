import { randomUUID } from 'node:crypto';
import type { StudySession, TimerState, UserData } from '../shared/types';
import { StudyStore } from './store';
export const IDLE_MS = 5 * 60 * 1000;
export const CHECKPOINT_MS = 15000;
export class StudyTracker {
  private active: StudySession | null = null;
  private focused = false;
  private suspended = false;
  private previous = 0;
  private activityAt = 0;
  private checkpointAt = 0;
  constructor(private store: StudyStore, private now = () => performance.now(), private wall = () => new Date().toISOString()) {}
  select(id: string | null) {
    if (id === this.active?.problemId) return this.state();
    this.end();
    if (id) {
      const stamp = this.wall();
      this.active = { id: randomUUID(), problemId: id, startedAt: stamp, endedAt: null, updatedAt: stamp, durationMs: 0, outcome: 'studied', reflection: '' };
      this.previous = this.activityAt = this.checkpointAt = this.now();
      if (!this.store.snapshot().progress[id] || this.store.snapshot().progress[id].status === 'not-started') this.store.updateProgress(id, { status: 'in-progress' });
      this.store.putSession(this.active);
    }
    return this.state();
  }
  tick() {
    const now = this.now();
    if (this.active) {
      if (this.focused && !this.suspended) this.active.durationMs += Math.max(0, Math.min(now, this.activityAt + IDLE_MS) - this.previous);
      this.previous = now;
      if (now - this.checkpointAt >= CHECKPOINT_MS) this.checkpoint();
    }
  }
  activity() { this.tick(); this.activityAt = this.now(); }
  setFocused(focused: boolean) { this.tick(); this.focused = focused; if (focused) this.activityAt = this.now(); else this.checkpoint(); }
  setSuspended(suspended: boolean) { this.tick(); this.suspended = suspended; if (!suspended) this.activityAt = this.now(); else this.checkpoint(); }
  checkpoint() {
    if (!this.active) return;
    this.active.updatedAt = this.wall();
    this.store.putSession(this.active);
    this.checkpointAt = this.now();
  }
  end() {
    if (!this.active) return;
    this.tick();
    this.active.endedAt = this.wall();
    this.checkpoint();
    this.active = null;
  }
  restore(data: UserData) {
    // Preserve the latest time in the pre-import archive. Detach only after the
    // replacement reaches disk, so a failed restore can keep the same session.
    this.tick();
    this.checkpoint();
    this.store.restore(data);
    this.active = null;
  }
  edit(id: string, patch: Pick<StudySession, 'durationMs' | 'outcome' | 'reflection'>) {
    this.tick();
    this.store.editSession(id, patch);
    if (this.active?.id === id) { this.active = this.store.snapshot().sessions.find(s => s.id === id)!; this.previous = this.now(); }
  }
  delete(id: string) { if (this.active?.id === id) this.active = null; this.store.deleteSession(id); }
  state(): TimerState {
    const reason = !this.active ? 'inactive' : this.suspended ? 'suspended' : !this.focused ? 'away' : this.now() - this.activityAt >= IDLE_MS ? 'idle' : 'running';
    return { problemId: this.active?.problemId ?? null, sessionId: this.active?.id ?? null, durationMs: this.active?.durationMs ?? 0, running: reason === 'running', reason };
  }
}
