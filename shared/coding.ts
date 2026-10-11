export const languages = ['javascript', 'typescript', 'java', 'c'] as const;
export type Language = typeof languages[number];
export const languageNames: Record<Language, string> = { javascript: 'JavaScript', typescript: 'TypeScript', java: 'Java', c: 'C' };
export const isLanguage = (value: unknown): value is Language => (languages as readonly unknown[]).includes(value);
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export interface CodeCase { name: string; input: Json[]; expected?: Json; }
export interface CodingProblem {
  id: string; number: number; title: string; description: string; constraints: string[];
  entry: string; kind: 'function' | 'design' | 'codec' | 'tree-codec';
  parameters: string[]; methods?: Record<string, string[]>;
  reference: string; starter: string; examples: CodeCase[]; tests: CodeCase[];
}
export const verdicts = ['Accepted', 'Wrong answer', 'Syntax error', 'Runtime error', 'Time limit exceeded', 'Memory limit exceeded', 'Cancelled', 'Invalid input'] as const;
export type Verdict = typeof verdicts[number];
export interface CaseResult {
  name: string; input: Json[]; verdict: Verdict; actual?: Json; expected?: Json;
  error?: string; logs: string[]; durationMs: number;
}
export interface JudgeResult { verdict: Verdict; passed: number; total: number; durationMs: number; cases: CaseResult[]; }
export interface CodeDraft { language: Language; sources: Partial<Record<Language, string>>; cases: string; updatedAt: string; }
export interface Submission { id: string; problemId: string; language: Language; source: string; createdAt: string; result: JudgeResult; }
export interface JudgeJob { jobId: string; problemId: string; language: Language; source: string; mode: 'run' | 'submit'; cases: CodeCase[]; }
export type JudgeEvent = { type: 'progress'; jobId: string; completed: number; total: number } | { type: 'result'; jobId: string; result: JudgeResult }
  // Java/C: the worker only evaluates the reference; the desktop runner executes the solution.
  | { type: 'references'; jobId: string; cases: CodeCase[]; references: ReferenceOutcome[] };
export type NativeLanguage = 'java' | 'c';
export const isNativeLanguage = (language: Language): language is NativeLanguage => language === 'java' || language === 'c';
/** One case from the desktop Java/C runner, before comparison with the JavaScript reference. */
export interface NativeCaseResult { verdict: Verdict; actual?: Json; error?: string; logs: string[]; durationMs: number; }
export type NativeRunResult = { compileError: string } | { cases: NativeCaseResult[] };
export interface NativeRunRequest { jobId: string; problemId: string; language: NativeLanguage; source: string; inputs: Json[][]; }
/** What the JavaScript reference says about a case: why it is invalid, or its expected result. */
export interface ReferenceOutcome { invalid?: string; expected?: Json; }
export const CODE_LIMIT = 262144;
export const INPUT_LIMIT = 262144;
export const CASE_LIMIT = 20;
export const CASE_TIMEOUT = 2000;
export const JOB_TIMEOUT = 30000;
