/** Bundled lesson content is authored against one deterministic example. */
export interface GuidedOption { id: string; text: string; feedback: string; }
export interface GuidedAssertion { path: string; value: unknown; }
export interface GuidedTarget { selector: string; optionId: string; label: string; }
export interface GuidedCheckpoint {
  id: string;
  beforeIndex: number;
  afterIndex: number;
  prompt: string;
  options: GuidedOption[];
  correctOptionId: string;
  hints: [string, string];
  explanation: string;
  basics: string;
  codeLines: number[];
  before: GuidedAssertion[];
  after: GuidedAssertion[];
  targets?: GuidedTarget[];
}
export interface GuidedLesson {
  id: string;
  version: number;
  caseId: 'guided-default';
  title: string;
  intro: string;
  concepts: string[];
  expectedInput?: unknown;
  loader?: { functionName: string; args: unknown[] };
  checkpoints: GuidedCheckpoint[];
  recap: string;
  commonMistake: string;
}
export interface GuidedAnswer {
  attempts: number;
  choiceId?: string;
  hintLevel: 0 | 1 | 2;
  revealed: boolean;
  correct: boolean;
}
export interface GuidedCompletion { lessonVersion: number; completedAt: string; }
export interface GuidedProgress {
  lessonVersion: number;
  caseId: string;
  runId: string;
  /** Last fully rendered trace index; restoring always starts paused. */
  cursor: number;
  answers: Record<string, GuidedAnswer>;
  completedAt?: string;
  previousCompletion?: GuidedCompletion;
}
/** The host validates progress against this small projection of bundled content. */
export interface GuidedLessonIdentity {
  id: string;
  version: number;
  caseId: string;
  checkpoints: Pick<GuidedCheckpoint, 'id' | 'options' | 'correctOptionId' | 'beforeIndex' | 'afterIndex'>[];
}
