// Runs Java and C solutions with the toolchains bundled beside the app (scripts/fetch-toolchains.mjs).
// Unlike JavaScript/TypeScript in QuickJS these run as native processes on this PC: they get a
// fresh temporary directory, a minimal environment, per-case and per-job deadlines and output
// caps, and their whole process tree is killed on timeout, Stop, navigation or close.
// Expected results still come from the JavaScript reference; the renderer compares them.
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { CodingProblem, Json, NativeCaseResult, NativeLanguage, NativeRunResult, Verdict } from '../shared/coding';
export type { NativeLanguage } from '../shared/coding';
import { CASE_TIMEOUT, JOB_TIMEOUT } from '../shared/coding';
import { contract } from '../coding/languages';
import { cProgram } from '../coding/c-harness';

export interface NativeRunOptions {
  /** toolchains/ from scripts/fetch-toolchains.mjs and native/ from scripts/build.mjs; both sit in resources/ when packaged. */
  toolchains: string;
  native: string;
  tempRoot: string;
  onProgress?: (completed: number) => void;
  signal?: AbortSignal;
  caseTimeout?: number;
  jobTimeout?: number;
}

const OUTPUT_LIMIT = 256 * 1024, LOG_LIMIT = 65536;
// JVM startup and in-memory compilation are not part of any case's time.
const JAVA_STARTUP = 15000;
const COMPILE_TIMEOUT = 10000;

export const toolchainPaths = ({ toolchains, native }: Pick<NativeRunOptions, 'toolchains' | 'native'>) => ({
  java: path.join(toolchains, 'java', 'bin', 'java.exe'),
  judge: path.join(native, 'java'),
  tcc: path.join(toolchains, 'c', 'tcc.exe'),
  cInclude: path.join(toolchains, 'c', 'include'),
  cLib: path.join(toolchains, 'c', 'lib')
});
export function nativeAvailable(options: Pick<NativeRunOptions, 'toolchains' | 'native'>, language: NativeLanguage) {
  const paths = toolchainPaths(options);
  return language === 'java' ? fs.existsSync(paths.java) && fs.existsSync(path.join(paths.judge, 'JudgeMain.class')) : fs.existsSync(paths.tcc);
}

function environment(temp: string): NodeJS.ProcessEnv {
  // No inherited PATH, user profile or tool options reach the solution.
  const root = process.env.SystemRoot || 'C:\\Windows';
  return { SystemRoot: root, windir: root, TEMP: temp, TMP: temp, PATH: path.join(root, 'System32') };
}
export function killTree(child: ChildProcess) {
  if (child.exitCode !== null || child.signalCode !== null || !child.pid) return;
  if (process.platform === 'win32') spawnSync(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'taskkill.exe'), ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
  else child.kill('SIGKILL');
}
const lines = (text: string) => text.split(/\r?\n/).filter((line, i, all) => line || i < all.length - 1).map(line => line.slice(0, 2000));
function capped(text: string) { const logs = lines(text.slice(0, LOG_LIMIT)); if (text.length > LOG_LIMIT) logs.push('[Console output truncated]'); return logs; }

// Windows exception codes a native solution can end with.
const crashes: Record<number, string> = {
  0xC0000005: 'Segmentation fault: invalid memory access.',
  0xC00000FD: 'Stack overflow.',
  0xC0000094: 'Integer division by zero.',
  0xC0000095: 'Integer overflow.',
  0xC000001D: 'Illegal instruction.',
  0xC0000409: 'Stack buffer overrun or abort.',
  0xC0000017: 'Out of memory.',
  0x80000003: 'Breakpoint or assertion failure.'
};
export function describeExit(code: number | null): string {
  if (code === null) return 'The process was terminated.';
  const unsigned = code >>> 0;
  return crashes[unsigned] ?? (code === 3 ? 'abort() was called or an assertion failed.' : `The program exited with code ${code}.`);
}

interface Exec { code: number | null; stdout: string; stderr: string; timedOut: boolean; aborted: boolean; durationMs: number; }
/** Runs one process to completion with a deadline, an abort signal and capped output. */
function exec(command: string, args: string[], options: { cwd: string; env: NodeJS.ProcessEnv; timeout: number; signal?: AbortSignal; input?: string }): Promise<Exec> {
  return new Promise(resolve => {
    const start = performance.now();
    const child = spawn(command, args, { cwd: options.cwd, env: options.env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', timedOut = false, aborted = false;
    child.stdout!.setEncoding('utf8').on('data', chunk => { if (stdout.length < OUTPUT_LIMIT) stdout += chunk; });
    child.stderr!.setEncoding('utf8').on('data', chunk => { if (stderr.length < OUTPUT_LIMIT) stderr += chunk; });
    child.stdin!.on('error', () => {});
    child.stdin!.end(options.input ?? '');
    const timer = setTimeout(() => { timedOut = true; killTree(child); }, options.timeout);
    const abort = () => { aborted = true; killTree(child); };
    options.signal?.addEventListener('abort', abort, { once: true });
    const finish = (code: number | null) => { clearTimeout(timer); options.signal?.removeEventListener('abort', abort); resolve({ code, stdout, stderr, timedOut, aborted, durationMs: Math.round((performance.now() - start) * 100) / 100 }); };
    child.on('error', error => { stderr += String(error); finish(-1); });
    child.on('close', code => finish(code));
  });
}

function workspace(tempRoot: string) {
  const dir = path.join(tempRoot, 'leetcode-study-runs', randomUUID());
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function runNative(problem: CodingProblem, language: NativeLanguage, source: string, cases: Json[][], options: NativeRunOptions): Promise<NativeRunResult> {
  const dir = workspace(options.tempRoot);
  try { return await (language === 'java' ? runJava : runC)(problem, source, cases, options, dir); }
  finally { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
}

const cancelled = (): NativeCaseResult => ({ verdict: 'Cancelled', logs: [], durationMs: 0 });

async function runJava(problem: CodingProblem, source: string, cases: Json[][], options: NativeRunOptions, dir: string): Promise<NativeRunResult> {
  const paths = toolchainPaths(options), caseTimeout = options.caseTimeout ?? CASE_TIMEOUT, jobTimeout = options.jobTimeout ?? JOB_TIMEOUT;
  const c = contract(problem.number);
  const job = {
    number: problem.number, kind: c.kind, caseTimeoutMs: caseTimeout, source, cases,
    className: c.kind === 'function' ? 'Solution' : c.name,
    entry: c.kind === 'function' ? c.method.name : '', arity: c.kind === 'function' ? c.method.params.length : 0
  };
  const child = spawn(paths.java, ['-Xmx256m', '-Xss16m', '-XX:+UseSerialGC', '-XX:TieredStopAtLevel=1', '-XX:-UsePerfData', '-Dfile.encoding=UTF-8', '-Dstdout.encoding=UTF-8', '-cp', paths.judge, 'JudgeMain'],
    { cwd: dir, env: environment(dir), windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
  const results: NativeCaseResult[] = [];
  let compileError: string | undefined, compiled = false, stderr = '', buffer = '', reason: 'timeout' | 'job' | 'abort' | undefined;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  const arm = (ms: number) => { clearTimeout(watchdog); watchdog = setTimeout(() => { reason = 'timeout'; killTree(child); }, ms); };
  const jobTimer = setTimeout(() => { reason = 'job'; killTree(child); }, jobTimeout);
  const abort = () => { reason = 'abort'; killTree(child); };
  options.signal?.addEventListener('abort', abort, { once: true });
  arm(JAVA_STARTUP);
  child.stdin!.on('error', () => {});
  child.stdin!.end(JSON.stringify(job));
  child.stderr!.setEncoding('utf8').on('data', chunk => { if (stderr.length < OUTPUT_LIMIT) stderr += chunk; });
  child.stdout!.setEncoding('utf8').on('data', chunk => {
    buffer += chunk;
    if (buffer.length > 16 * OUTPUT_LIMIT) { reason = 'job'; killTree(child); return; }
    let newline: number;
    while ((newline = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newline).trim(); buffer = buffer.slice(newline + 1);
      if (!line) continue;
      const event = JSON.parse(line);
      if (event.type === 'compile-error') compileError = event.message;
      else if (event.type === 'compiled') { compiled = true; arm(caseTimeout + 1500); }
      else if (event.type === 'case') {
        const { verdict, actual, error, logs, durationMs } = event;
        results.push({ verdict, ...(actual !== undefined ? { actual } : {}), ...(error ? { error } : {}), logs: logs ?? [], durationMs });
        options.onProgress?.(results.length);
        arm(caseTimeout + 1500);
      }
    }
  });
  const code = await new Promise<number | null>(resolve => { child.on('error', error => { stderr += String(error); resolve(-1); }); child.on('close', resolve); });
  clearTimeout(watchdog); clearTimeout(jobTimer); options.signal?.removeEventListener('abort', abort);
  if (compileError !== undefined) return { compileError };
  if (reason === 'abort') return { cases: [...results, cancelled()] };
  if (results.length < cases.length) {
    const tail = stderr.trim().split(/\r?\n/).slice(-12).join('\n');
    if (!compiled && reason !== 'job') return { compileError: reason === 'timeout' ? 'The Java compiler did not finish in time.' : `The Java runner could not start (${describeExit(code)}).\n${tail}`.trim() };
    const verdict: Verdict = reason ? 'Time limit exceeded' : /OutOfMemoryError/.test(stderr) ? 'Memory limit exceeded' : 'Runtime error';
    const error = reason === 'job' ? 'The 30 second job limit was reached.' : reason === 'timeout' ? `The case exceeded ${caseTimeout} ms.` : `The Java process ended unexpectedly (${describeExit(code)}).${tail ? `\n${tail}` : ''}`;
    results.push({ verdict, error, logs: [], durationMs: reason === 'timeout' ? caseTimeout : 0 });
  }
  return { cases: results };
}

async function runC(problem: CodingProblem, source: string, cases: Json[][], options: NativeRunOptions, dir: string): Promise<NativeRunResult> {
  const paths = toolchainPaths(options), caseTimeout = options.caseTimeout ?? CASE_TIMEOUT, jobTimeout = options.jobTimeout ?? JOB_TIMEOUT;
  const started = performance.now(), env = environment(dir);
  fs.writeFileSync(path.join(dir, 'main.c'), cProgram(problem, source, cases));
  // A 256 MiB stack lets recursive solutions reach LeetCode-like depths.
  const compile = await exec(paths.tcc, ['-std=c99', '-I', paths.cInclude, '-L', paths.cLib, '-Wl,-stack=268435456', '-o', 'solution.exe', 'main.c'],
    { cwd: dir, env, timeout: COMPILE_TIMEOUT, signal: options.signal });
  if (compile.aborted) return { cases: [cancelled()] };
  if (compile.code !== 0) {
    const message = (compile.stderr + compile.stdout).trim().replace(/^.*?main\.c/gm, 'main.c');
    return { compileError: compile.timedOut ? 'The C compiler did not finish in time.' : (message || 'Compilation failed.').slice(0, 8000) };
  }
  const results: NativeCaseResult[] = [];
  for (let i = 0; i < cases.length; i++) {
    const remaining = jobTimeout - (performance.now() - started);
    if (remaining <= 0) { results.push({ verdict: 'Time limit exceeded', error: 'The 30 second job limit was reached.', logs: [], durationMs: 0 }); break; }
    const resultFile = path.join(dir, `result-${i}.json`);
    const run = await exec(path.join(dir, 'solution.exe'), [String(i), resultFile], { cwd: dir, env, timeout: Math.min(caseTimeout, remaining), signal: options.signal });
    if (run.aborted) { results.push(cancelled()); break; }
    const logs = capped(run.stdout + run.stderr);
    if (run.timedOut) { results.push({ verdict: 'Time limit exceeded', error: `The case exceeded ${caseTimeout} ms.`, logs, durationMs: caseTimeout }); break; }
    let written: { actual?: Json; error?: string; durationMs?: number } | undefined;
    try { written = JSON.parse(fs.readFileSync(resultFile, 'utf8')); } catch { written = undefined; }
    if (run.code === 0 && written && 'actual' in written) results.push({ verdict: 'Accepted', actual: written.actual, logs, durationMs: written.durationMs ?? run.durationMs });
    else if (written?.error) results.push({ verdict: 'Runtime error', error: written.error, logs, durationMs: run.durationMs });
    else {
      const error = describeExit(run.code);
      results.push({ verdict: /Out of memory/.test(error) ? 'Memory limit exceeded' : 'Runtime error', error, logs, durationMs: run.durationMs });
    }
    options.onProgress?.(results.length);
  }
  return { cases: results };
}
