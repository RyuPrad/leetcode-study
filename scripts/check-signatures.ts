// Checks coding/signatures.mjs against problems.json: names, arity, every case input and
// every reference output must fit the declared types, and all starters must generate.
import fs from 'node:fs';
import { getQuickJS } from 'quickjs-emscripten';
import { evaluate } from '../coding/engine';
import { contract, element, starter, type Param } from '../coding/languages';
import type { CodingProblem, Json } from '../shared/coding';

const problems = JSON.parse(fs.readFileSync('coding/problems.json', 'utf8')) as CodingProblem[];
const vm = await getQuickJS();
const INT_MIN = -(2 ** 31), INT_MAX = 2 ** 31 - 1;
// reverseBits and hammingWeight take the 32 bits as unsigned.
const unsigned = new Set([190]);

function fits(type: string, value: Json, number: number): boolean {
  const inner = element(type);
  if (inner) return Array.isArray(value) && value.every(v => fits(inner, v, number));
  switch (type) {
    case 'int': return Number.isInteger(value) && (value as number) >= INT_MIN && (value as number) <= (unsigned.has(number) ? 2 ** 32 - 1 : INT_MAX);
    case 'long': return Number.isSafeInteger(value);
    case 'double': return typeof value === 'number' && Number.isFinite(value);
    case 'boolean': return typeof value === 'boolean';
    case 'char': return typeof value === 'string' && value.length === 1;
    case 'String': return typeof value === 'string';
    case 'ListNode': case 'MountainArray': return Array.isArray(value) && value.every(v => Number.isInteger(v));
    case 'TreeNode': return Array.isArray(value) && value.every(v => v === null || Number.isInteger(v));
    case 'Node': return Array.isArray(value);
    default: return false;
  }
}
const names = (params: Param[]) => params.map(p => p.name).join(',');

let failures = 0, checked = 0;
for (const p of problems) {
  const errors: string[] = [];
  try {
    const c = contract(p.number);
    for (const language of ['typescript', 'java', 'c'] as const) if (!starter(p, language).trim()) errors.push(`empty ${language} starter`);
    const cases = [...p.examples, ...p.tests];
    if (c.kind === 'function') {
      if (c.method.name !== p.entry) errors.push(`entry ${c.method.name} != ${p.entry}`);
      const expected = [...c.method.params.map(x => x.name), ...c.harnessOnly];
      if (expected.join(',') !== p.parameters.join(',')) errors.push(`parameters ${expected} != ${p.parameters}`);
      for (const t of cases) {
        checked++;
        // 235 passes p and q as values; the harness resolves them to nodes of root.
        c.method.params.forEach((param, i) => { if (!fits(p.number === 235 && i > 0 ? 'int' : param.type, t.input[i], p.number)) errors.push(`${t.name}: ${param.name} is not ${param.type}: ${JSON.stringify(t.input[i]).slice(0, 80)}`); });
        const r = evaluate(vm, p, p.reference, t.input);
        if (r.verdict !== 'Accepted') { errors.push(`${t.name}: reference ${r.error}`); continue; }
        const out = r.actual as Json;
        // In-place and adapter outputs have harness-defined shapes, not the return type (160 reports the shared node's value or null).
        if (c.method.returns === 'void' || [26, 27, 80, 133, 138, 160, 427].includes(p.number)) continue;
        const returns = p.number === 235 ? 'int' : c.method.returns;
        if (!fits(returns, out, p.number)) errors.push(`${t.name}: output is not ${returns}: ${JSON.stringify(out).slice(0, 80)}`);
      }
    } else if (c.kind === 'design') {
      const declared = Object.keys(p.methods ?? {}).filter(m => m !== 'constructor' && m !== 'hash');
      const signed = c.methods.map(m => m.name);
      if ([...declared].sort().join() !== [...signed].sort().join()) errors.push(`methods ${signed} != ${declared}`);
      if (names(c.constructor) !== (p.methods?.constructor ?? []).join(',')) errors.push(`constructor ${names(c.constructor)} != ${p.methods?.constructor}`);
      for (const t of cases) {
        checked++;
        const [ops, args] = t.input as [string[], Json[][]];
        if (ops[0] !== c.name) errors.push(`${t.name}: first operation ${ops[0]}`);
        c.constructor.forEach((param, i) => { if (!fits(param.type, args[0][i], p.number)) errors.push(`${t.name}: constructor ${param.name} is not ${param.type}`); });
        const r = evaluate(vm, p, p.reference, t.input);
        if (r.verdict !== 'Accepted') { errors.push(`${t.name}: reference ${r.error}`); continue; }
        const out = r.actual as Json[];
        for (let i = 1; i < ops.length; i++) {
          const m = c.methods.find(x => x.name === ops[i]);
          if (!m) { errors.push(`${t.name}: unknown operation ${ops[i]}`); continue; }
          if (m.params.length !== args[i].length) errors.push(`${t.name}: ${m.name} arity ${args[i].length}`);
          m.params.forEach((param, k) => { if (!fits(param.type, args[i][k], p.number)) errors.push(`${t.name}: ${m.name}.${param.name} is not ${param.type}`); });
          if (m.returns === 'void' ? out[i] !== null : !fits(m.returns, out[i], p.number)) errors.push(`${t.name}: ${m.name} returned ${JSON.stringify(out[i])}, not ${m.returns}`);
        }
      }
    } else {
      // Codecs round-trip: the case input and the output share the encoded value's type.
      const value = p.number === 297 ? 'TreeNode' : c.methods[0].params[0].type;
      for (const t of cases) {
        checked++;
        if (!fits(value, t.input[0], p.number)) errors.push(`${t.name}: input is not ${value}`);
        const r = evaluate(vm, p, p.reference, t.input);
        if (r.verdict !== 'Accepted' || !fits(value, r.actual as Json, p.number)) errors.push(`${t.name}: round trip is not ${value}`);
      }
    }
  } catch (error) { errors.push(String(error)); }
  if (errors.length) { failures++; console.log(`${p.number} ${p.title}\n  ${[...new Set(errors)].slice(0, 6).join('\n  ')}`); }
}
console.log({ problems: problems.length, cases: checked, failures });
process.exitCode = failures ? 1 : 0;
