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
export interface CodeDraft { source: string; cases: string; updatedAt: string; }
export interface Submission { id: string; problemId: string; source: string; createdAt: string; result: JudgeResult; }
export interface JudgeJob { jobId: string; problemId: string; source: string; mode: 'run' | 'submit'; cases: CodeCase[]; }
export type JudgeEvent = { type: 'progress'; jobId: string; completed: number; total: number } | { type: 'result'; jobId: string; result: JudgeResult };
export const CODE_LIMIT = 262144;
export const INPUT_LIMIT = 262144;
export const CASE_LIMIT = 20;
export const CASE_TIMEOUT = 2000;
export const JOB_TIMEOUT = 30000;
