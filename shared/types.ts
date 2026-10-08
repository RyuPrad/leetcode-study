import type { CodeDraft, JudgeResult, Submission } from './coding';
import type { GuidedProgress } from './guided';
export type ProblemStatus = 'not-started' | 'in-progress' | 'completed';
export type Outcome = 'studied' | 'solved' | 'needs-review';
export interface SolutionTechnique {
  name: string;
  kind: 'algorithm' | 'technique' | 'data-structure';
  role: string;
}
export interface Entry {
  id: string; number?: number; title: string; topic: string;
  notePath: string; markdown: string; searchText: string; visualizerPath?: string;
  solutionTechniques?: SolutionTechnique[];
}
export interface Catalog { version: 1; entries: Entry[]; topics: string[]; visualizers: string[]; }
export interface Progress { status: ProblemStatus; bookmarked: boolean; needsReview: boolean; updatedAt: string; }
export interface StudySession {
  id: string; problemId: string; startedAt: string; endedAt: string | null;
  updatedAt: string; durationMs: number; outcome: Outcome; reflection: string;
}
export interface UserData { version: 3; progress: Record<string, Progress>; sessions: StudySession[]; drafts: Record<string, CodeDraft>; submissions: Submission[]; guided: Record<string, GuidedProgress>; }
export interface TimerState { problemId: string | null; sessionId: string | null; durationMs: number; running: boolean; reason: 'running' | 'away' | 'idle' | 'suspended' | 'inactive'; }
export interface DesktopApi {
  bootstrap(): Promise<{ catalog: Catalog; data: UserData; notice: string | null; version: string }>;
  setProgress(id: string, patch: Partial<Pick<Progress, 'status' | 'bookmarked' | 'needsReview'>>): Promise<UserData>;
  selectProblem(id: string | null): Promise<TimerState>;
  activity(): void;
  editSession(id: string, patch: Pick<StudySession, 'durationMs' | 'outcome' | 'reflection'>): Promise<UserData>;
  deleteSession(id: string): Promise<UserData>;
  saveDraft(id: string, source: string, cases: string): Promise<void>;
  recordSubmission(problemId: string, source: string, result: JudgeResult): Promise<UserData>;
  saveGuidedProgress(problemId: string, progress: GuidedProgress): Promise<UserData>;
  exportBackup(): Promise<boolean>;
  importBackup(): Promise<boolean>;
  openExternal(url: string): Promise<void>;
  onData(callback: (data: UserData) => void): () => void;
  onTimer(callback: (timer: TimerState) => void): () => void;
  onPlaybackPause(callback: () => void): () => void;
  onError(callback: (message: string) => void): () => void;
}
declare global { interface Window { study: DesktopApi; } }
