import type { CodeCase, CodingProblem, CompareMode, KitIo, Language, Signature } from '../shared/coding';
import { compareModes, languages } from '../shared/coding';
import { contract } from './languages';

/** A generated study kit: coding/kits/<number>.json. See coding/README.md, "Generated study kits". */
export interface KitRecord {
  number: number; title: string;
  /** leetcode: written from LeetCode's statement. recalled: a premium problem described from memory. */
  spec: 'leetcode' | 'recalled';
  /** The problem in original words (Markdown), and its rules as short bullets. */
  statement: string; constraints: string[];
  signature: Signature; entry: string; kind: 'function' | 'design'; parameters: string[]; methods?: Record<string, string[]>;
  io?: KitIo; compare?: CompareMode; checker?: string; validator?: string; adapter?: string;
  languages: Language[];
  /** The JavaScript reference, an independent brute force it was checked against, and the test generator. */
  reference: string; brute?: string; generator?: string;
  examples: CodeCase[]; tests: CodeCase[];
  /** Study notes (Markdown): intuition, approach, walkthrough, complexity, pitfalls. */
  notes: string;
  /** What each reference line does, keyed by 1-based line number, shown as the walkthrough reaches it. */
  narration?: Record<string, string>;
}

const LIMITS = [
  'Local limits: 2 seconds per case, 64 MiB of interpreter memory, 30 seconds per run.',
  'Custom input limits: 20 cases, 2,000 items per array, 10,000 characters per string, 20,000 total values per case.'
];

export function jsStarter(record: Pick<KitRecord, 'kind' | 'entry' | 'parameters' | 'methods'>): string {
  const body = (indent: string) => `${indent}// Write your code here.\n${indent}throw new Error("Not implemented");`;
  if (record.kind === 'function') return `function ${record.entry}(${record.parameters.join(', ')}) {\n${body('  ')}\n}\n`;
  const methods = Object.entries(record.methods ?? {}).filter(([name]) => name !== 'constructor')
    .map(([name, params]) => `  ${name}(${params.join(', ')}) {\n${body('    ')}\n  }`);
  const ctor = record.methods && Object.hasOwn(record.methods, 'constructor') ? record.methods['constructor'] as string[] : [];
  return `class ${record.entry} {\n  constructor(${ctor.join(', ')}) {\n    // Write your code here.\n    \n  }\n\n${methods.join('\n\n')}\n}\n`;
}

export function kitProblem(record: KitRecord): CodingProblem {
  const order = record.kind === 'design' ? 'Cases contain [operations, arguments]. Start with "' + record.entry + '" and its constructor arguments. Methods that return nothing produce null.' : `Each case is an array of arguments in this order: ${record.parameters.join(', ')}.`;
  return {
    id: `leetcode:${record.number}`, number: record.number, title: record.title, description: record.statement,
    constraints: [...record.constraints, order, ...LIMITS], entry: record.entry, kind: record.kind,
    parameters: record.parameters, ...(record.methods ? { methods: record.methods } : {}),
    reference: record.reference, starter: jsStarter(record), examples: record.examples, tests: record.tests,
    generated: true, signature: record.signature, ...(record.io ? { io: record.io } : {}), ...(record.compare ? { compare: record.compare } : {}),
    ...(record.checker ? { checker: record.checker } : {}), ...(record.validator ? { validator: record.validator } : {}),
    ...(record.adapter ? { adapter: record.adapter } : {}), languages: record.languages
  };
}

const identifier = /^[A-Za-z_$][\w$]*$/;
/** Structural problems with a kit record; an empty list means it can be loaded. Behaviour is checked by scripts/check-kits.ts. */
export function kitErrors(record: any, number?: number): string[] {
  const errors: string[] = [], text = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
  if (!record || typeof record !== 'object') return ['Kit is not an object.'];
  if (!Number.isInteger(record.number) || number !== undefined && record.number !== number) errors.push('number does not match the file name.');
  for (const key of ['title', 'statement', 'notes', 'reference']) if (!text(record[key])) errors.push(`${key} is missing.`);
  if (!['leetcode', 'recalled'].includes(record.spec)) errors.push('spec must be leetcode or recalled.');
  if (!Array.isArray(record.constraints) || !record.constraints.every(text)) errors.push('constraints must be a list of text.');
  if (!['function', 'design'].includes(record.kind)) errors.push('kind must be function or design.');
  if (!identifier.test(record.entry ?? '')) errors.push('entry must be an identifier.');
  if (!Array.isArray(record.parameters) || !record.parameters.every((p: unknown) => typeof p === 'string' && identifier.test(p))) errors.push('parameters must be identifiers.');
  if (record.kind === 'design' && (!record.methods || typeof record.methods !== 'object')) errors.push('A design kit needs methods.');
  if (!Array.isArray(record.languages) || !record.languages.length || !record.languages.every((l: unknown) => (languages as readonly unknown[]).includes(l)) || !record.languages.includes('javascript')) errors.push('languages must include javascript and only known languages.');
  if (record.compare !== undefined && !(compareModes as readonly unknown[]).includes(record.compare)) errors.push(`Unknown compare mode ${record.compare}.`);
  if (record.compare === 'checker' && !text(record.checker)) errors.push('Checker mode needs a checker.');
  if (record.compare === 'checker' && record.languages?.some((l: string) => l === 'java' || l === 'c')) errors.push('Checker kits are judged in JavaScript and TypeScript only.');
  if (record.adapter && record.languages?.some((l: string) => l === 'java' || l === 'c')) errors.push('Adapter kits are judged in JavaScript and TypeScript only.');
  for (const key of ['checker', 'validator', 'adapter', 'brute', 'generator']) if (record[key] !== undefined && !text(record[key])) errors.push(`${key} must be source text.`);
  const cases = (list: unknown, name: string, expected: boolean) => {
    if (!Array.isArray(list)) { errors.push(`${name} must be a list.`); return; }
    for (const c of list) if (!c || !text(c.name) || !Array.isArray(c.input) || expected && c.expected === undefined) errors.push(`Invalid ${name} case ${c?.name ?? ''}.`);
  };
  cases(record.examples, 'examples', true); cases(record.tests, 'tests', false);
  if (Array.isArray(record.examples) && !record.examples.length) errors.push('A kit needs at least one example.');
  if (Array.isArray(record.examples) && Array.isArray(record.tests) && record.examples.length + record.tests.length > 100) errors.push('A kit can have at most 100 cases.');
  if (record.narration !== undefined && (typeof record.narration !== 'object' || Object.entries(record.narration).some(([line, note]) => !/^[1-9]\d*$/.test(line) || !text(note)))) errors.push('narration maps line numbers to text.');
  if (!errors.length) try {
    const c = contract(kitProblem(record));
    if (c.kind === 'function' && (c.method.name !== record.entry || c.method.params.map(p => p.name).join() !== record.parameters.join())) errors.push('The signature must name the entry and parameters.');
    if (c.kind === 'design' && (c.name !== record.entry || record.kind !== 'design' || c.methods.some(m => !Object.hasOwn(record.methods, m.name)))) errors.push('The design signature must match entry and methods.');
    if (c.kind === 'function' && record.kind !== 'function') errors.push('A function signature needs kind function.');
  } catch (error) { errors.push(String(error instanceof Error ? error.message : error)); }
  return errors;
}
