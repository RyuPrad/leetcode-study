// Compiles and runs the generated Java and C starter of every problem on its examples with the
// bundled toolchains. Starters return default values, so the only acceptable failures are the
// harness's own messages about missing results; anything else is a signature or harness defect.
// Usage: npx tsx scripts/check-native.ts [java|c] [problem numbers...]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { starter } from '../coding/languages';
import { runNative, nativeAvailable, type NativeLanguage } from '../desktop/native-runner';
import type { CodingProblem } from '../shared/coding';
import { ROOT } from './content.mjs';
import { workers } from './workers.mjs';

const problems = JSON.parse(fs.readFileSync(path.join(ROOT, 'coding/problems.json'), 'utf8')) as CodingProblem[];
const args = process.argv.slice(2);
const languages = (args.filter(a => a === 'java' || a === 'c') as NativeLanguage[]);
const numbers = new Set(args.filter(a => /^\d+$/.test(a)).map(Number));
const options = { toolchains: path.join(ROOT, 'toolchains'), native: path.join(ROOT, 'dist/native'), tempRoot: os.tmpdir() };
const expected = [
  /^Error: The solution did not return a value\.$/, /must return a string/, /Return an ancestor node/, /Invalid quad tree/,
  /Set \*returnSize/, /Set \*returnColumnSizes/, /^java\.lang\.NullPointerException/, /random must point|Invalid output list/, /Return the root of the input tree/
];

const outcomes = new Map<string, number[]>();
let failures = 0;
const record = (key: string, number: number) => outcomes.set(key, [...(outcomes.get(key) ?? []), number]);
for (const language of languages.length ? languages : ['java', 'c'] as NativeLanguage[]) {
  if (!nativeAvailable(options, language)) throw new Error(`The ${language} toolchain is missing. Run npm run fetch:toolchains and npm run build.`);
  const selected = problems.filter(p => !numbers.size || numbers.has(p.number));
  let next = 0;
  // A few jobs at once; each is its own process.
  await Promise.all(Array.from({ length: workers({ perWorkerMB: 250 }) }, async () => {
    while (next < selected.length) {
      const p = selected[next++];
      const result = await runNative(p, language, starter(p, language), p.examples.map(e => e.input), options);
      if ('compileError' in result) { failures++; record(`${language} COMPILE ${result.compileError.split('\n')[0]}`, p.number); continue; }
      if (result.cases.length !== p.examples.length) { failures++; record(`${language} MISSING CASES`, p.number); }
      for (const c of result.cases) {
        const message = c.error?.split('\n')[0] ?? '';
        const ok = c.verdict === 'Accepted' || c.verdict === 'Runtime error' && expected.some(pattern => pattern.test(message));
        if (!ok) failures++;
        record(`${language} ${ok ? 'ok' : 'UNEXPECTED'} ${c.verdict}${message ? `: ${message.slice(0, 120)}` : ''}`, p.number);
      }
    }
  }));
}
for (const [key, list] of [...outcomes].sort()) console.log(`${key}\n    ${[...new Set(list)].join(' ')}`);
console.log({ failures });
process.exitCode = failures ? 1 : 0;
