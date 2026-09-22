import type { GuidedAnswer, GuidedLessonIdentity, GuidedProgress } from '../shared/guided';

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const integer = (value: unknown, maximum: number, minimum = 0): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum && value <= maximum;
const identifier = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9:_-]{0,99}$/.test(value);
const date = (value: unknown): value is string => typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value));

/** Structural validation also accepts old content versions so backups never discard learning history. */
export function validateGuidedProgress(value: unknown): GuidedProgress {
  if (!object(value) || !integer(value.lessonVersion, 1000000, 1) || !identifier(value.caseId) || !identifier(value.runId) || !integer(value.cursor, 10000000) || !object(value.answers) || Object.keys(value.answers).length > 100) throw new Error('Invalid guided lesson progress.');
  const answers = Object.fromEntries(Object.entries(value.answers).map(([id, answer]): [string, GuidedAnswer] => {
    if (!identifier(id) || !object(answer) || !integer(answer.attempts, 1000000) || !integer(answer.hintLevel, 2) || typeof answer.revealed !== 'boolean' || typeof answer.correct !== 'boolean' || answer.choiceId !== undefined && !identifier(answer.choiceId) || answer.correct && (!answer.attempts || answer.choiceId === undefined)) throw new Error('Invalid guided checkpoint answer.');
    return [id, { attempts: answer.attempts, hintLevel: answer.hintLevel as 0 | 1 | 2, revealed: answer.revealed, correct: answer.correct, ...(answer.choiceId === undefined ? {} : { choiceId: answer.choiceId }) }];
  }));
  if (value.completedAt !== undefined && !date(value.completedAt)) throw new Error('Invalid guided completion date.');
  const previous = value.previousCompletion;
  if (previous !== undefined && (!object(previous) || !integer(previous.lessonVersion, 1000000, 1) || !date(previous.completedAt))) throw new Error('Invalid earlier guided completion.');
  return {
    lessonVersion: value.lessonVersion, caseId: value.caseId, runId: value.runId, cursor: value.cursor, answers,
    ...(value.completedAt === undefined ? {} : { completedAt: value.completedAt }),
    ...(previous === undefined ? {} : { previousCompletion: { lessonVersion: (previous as { lessonVersion: number }).lessonVersion, completedAt: (previous as { completedAt: string }).completedAt } })
  };
}

/** Live writes must identify an actual current lesson, case, question and offered answer. */
export function validateCurrentGuidedProgress(value: unknown, lesson: GuidedLessonIdentity, previous?: GuidedProgress): GuidedProgress {
  const clean = validateGuidedProgress(value);
  if (clean.lessonVersion !== lesson.version || clean.caseId !== lesson.caseId) throw new Error('This guided lesson has changed. Restart its current version.');
  if (clean.cursor > lesson.checkpoints.at(-1)!.afterIndex) throw new Error('The guided cursor is beyond the final checkpoint.');
  const checkpoints = new Map(lesson.checkpoints.map(checkpoint => [checkpoint.id, checkpoint]));
  for (const [id, answer] of Object.entries(clean.answers)) {
    const checkpoint = checkpoints.get(id);
    if (!checkpoint || answer.choiceId !== undefined && !checkpoint.options.some(option => option.id === answer.choiceId) || answer.correct && answer.choiceId !== checkpoint.correctOptionId) throw new Error('Unknown guided checkpoint or answer.');
  }
  const alreadyCompleted = previous?.runId === clean.runId && previous.lessonVersion === clean.lessonVersion && previous.completedAt === clean.completedAt && !!clean.completedAt;
  for (const checkpoint of lesson.checkpoints) {
    const answer = clean.answers[checkpoint.id];
    if (clean.cursor > checkpoint.beforeIndex && !answer?.correct && !answer?.revealed) throw new Error('Complete the pending prediction before advancing.');
    if (clean.completedAt && (!answer?.correct && !answer?.revealed || !alreadyCompleted && clean.cursor < checkpoint.afterIndex)) throw new Error('The guided lesson is not complete yet.');
  }
  return clean;
}
