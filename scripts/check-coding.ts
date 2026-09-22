import fs from 'node:fs';
import { getQuickJS } from 'quickjs-emscripten';
import { evaluate } from '../coding/engine';
import { validateInput } from '../coding/validation';
import type { CodingProblem } from '../shared/coding';
const problems = JSON.parse(fs.readFileSync('coding/problems.json','utf8')) as CodingProblem[];
const vm = await getQuickJS();
let count = 0, failures = 0;
for (const p of problems) {
  const errors = new Set<string>();
  for (const t of [...p.examples,...p.tests]) { count++; const invalid = validateInput(p,t.input); if(invalid) errors.add('INPUT: '+invalid); else {const r = evaluate(vm,p,p.reference,t.input);if(r.verdict!=='Accepted') errors.add(r.error!);} }
  if(errors.size) {failures++; console.log(p.number,p.entry,[...errors].join(' | '));}
}
console.log({problems:problems.length,cases:count,failures});
process.exitCode=failures?1:0;
