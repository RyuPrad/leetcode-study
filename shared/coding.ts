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
  // Generated study kits (coding/kits/<n>.json) carry their own contract instead of
  // being keyed by number in harness.js, compare.ts, validation.ts and signatures.mjs.
  generated?: true;
  /** A typed contract in Java notation, as in signatures.mjs. */
  signature?: Signature;
  io?: KitIo;
  compare?: CompareMode;
  /** Guest-side sources, evaluated in QuickJS like the solution itself. */
  checker?: string; validator?: string; adapter?: string;
  languages?: Language[];
}
export type Signature = string | { kind: 'design'; name: string; constructor: string; methods: string[] };
/** How a generated kit's case is run: which argument is changed in place, a retained prefix, a fixed random seed. */
export interface KitIo { mutates?: number; prefix?: boolean; seed?: number; }
/** exact: equal JSON. unordered: the same elements in any order. unordered-nested: also any order inside each element.
 *  float: within 1e-5 relative. checker: the kit's checker(input, actual, expected) decides. */
export const compareModes = ['exact', 'unordered', 'unordered-nested', 'float', 'checker'] as const;
export type CompareMode = typeof compareModes[number];
export const verdicts = ['Accepted', 'Wrong answer', 'Syntax error', 'Runtime error', 'Time limit exceeded', 'Memory limit exceeded', 'Cancelled', 'Invalid input'] as const;
export type Verdict = typeof verdicts[number];
export interface CaseResult {
  name: string; input: Json[]; verdict: Verdict; actual?: Json; expected?: Json;
  error?: string; logs: string[]; durationMs: number;
}
export interface JudgeResult { verdict: Verdict; passed: number; total: number; durationMs: number; cases: CaseResult[]; }
export interface CodeDraft { language: Language; sources: Partial<Record<Language, string>>; cases: string; updatedAt: string; }
export interface Submission { id: string; problemId: string; language: Language; source: string; createdAt: string; result: JudgeResult; }
export interface JudgeJob { jobId: string; problemId: string; language: Language; source: string; mode: 'run' | 'submit'; cases: CodeCase[]; problem?: CodingProblem; }
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
