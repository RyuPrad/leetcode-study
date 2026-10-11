// Judges every reference solution in coding/solutions on its problem's full submission suite:
// TypeScript in QuickJS, Java and C with the bundled toolchains. Each must be Accepted.
// Usage: npx tsx scripts/check-solutions.ts [typescript|java|c ...] [problem numbers...]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getQuickJS } from 'quickjs-emscripten';
import { assembleNative, judge, referenceOutcomes } from '../coding/engine';
import { solutionPath } from '../coding/solutions';
import { stripTypes } from '../coding/typescript';
import { nativeAvailable, runNative } from '../desktop/native-runner';
import type { CodingProblem, JudgeResult } from '../shared/coding';
import { ROOT } from './content.mjs';

const problems = JSON.parse(fs.readFileSync(path.join(ROOT, 'coding/problems.json'), 'utf8')) as CodingProblem[];
const args = process.argv.slice(2);
const chosen = args.filter(a => ['typescript', 'java', 'c'].includes(a)) as ('typescript' | 'java' | 'c')[];
const numbers = new Set(args.filter(a => /^\d+$/.test(a)).map(Number));
const options = { toolchains: path.join(ROOT, 'toolchains'), native: path.join(ROOT, 'dist/native'), tempRoot: os.tmpdir() };
const vm = await getQuickJS();
const failures: string[] = [];
let checked = 0;

async function judgeSolution(problem: CodingProblem, language: 'typescript' | 'java' | 'c', source: string): Promise<JudgeResult> {
  const cases = [...problem.examples, ...problem.tests];
  if (language === 'typescript') return judge(vm, problem, stripTypes(source), cases);
  const references = referenceOutcomes(vm, problem, source, cases);
  const run = await runNative(problem, language, source, cases.filter((_, i) => !references[i].invalid).map(c => c.input), options);
  return assembleNative(problem, cases, references, run, 0);
}

for (const language of chosen.length ? chosen : ['typescript', 'java', 'c'] as const) {
  if (language !== 'typescript' && !nativeAvailable(options, language)) throw new Error(`The ${language} toolchain is missing. Run npm run fetch:toolchains and npm run build.`);
  const selected = problems.filter(p => !numbers.size || numbers.has(p.number));
  let next = 0;
  await Promise.all(Array.from({ length: language === 'typescript' ? 1 : Math.min(4, os.cpus().length) }, async () => {
    while (next < selected.length) {
      const problem = selected[next++], file = path.join(ROOT, solutionPath(problem.number, language));
      checked++;
      if (!fs.existsSync(file)) { failures.push(`${language} ${problem.number}: missing ${path.relative(ROOT, file)}`); continue; }
      let result: JudgeResult;
      try { result = await judgeSolution(problem, language, fs.readFileSync(file, 'utf8')); }
      catch (error) { failures.push(`${language} ${problem.number}: ${String(error).split('\n')[0]}`); continue; }
      if (result.verdict !== 'Accepted') {
        const c = result.cases.find(x => x.verdict !== 'Accepted');
        failures.push(`${language} ${problem.number}: ${result.verdict} ${result.passed}/${result.total}${c ? ` — ${c.name}: ${(c.error ?? '').split('\n').slice(0, 3).join(' | ').slice(0, 300)} input=${JSON.stringify(c.input).slice(0, 150)} actual=${JSON.stringify(c.actual)?.slice(0, 150)} expected=${JSON.stringify(c.expected)?.slice(0, 150)}` : ''}`);
      }
    }
  }));
}
for (const failure of failures.sort()) console.log(failure);
console.log({ checked, failures: failures.length });
process.exitCode = failures.length ? 1 : 0;
