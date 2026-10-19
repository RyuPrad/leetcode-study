import type { CodeCase, CodingProblem, CompareMode, GeneratedCase, KitIo, Language, Signature } from '../shared/coding';
import { compareModes, languages } from '../shared/coding';
import { contract } from './languages';

/** A generated study kit: coding/kits/<number>.json. See coding/README.md, "Generated study kits". */
export interface KitRecord {
  number: number; title: string;
  /** leetcode: written from LeetCode's statement. recalled: a premium problem described from memory. */
  spec: 'leetcode' | 'recalled';
  /** The problem in original words (Markdown), and its rules as short bullets. */
  statement: string; constraints: string[];
  signature: Signature; entry: string; kind: 'function' | 'design' | 'sql'; parameters: string[]; methods?: Record<string, string[]>;
  /** SQL kits: each table's [column, type] pairs, and whether the result's row order matters. Cases are [tables].
   * A kit whose answer is an UPDATE or DELETE names the table it modifies; that table's rows are the result. */
  schema?: Record<string, [string, string][]>; ordered?: boolean; modifies?: string;
  io?: KitIo; compare?: CompareMode; checker?: string; validator?: string; adapter?: string;
  /** For an API the signature cannot express (closures, promises, generators): the JavaScript and TypeScript starters and the
   * API in one line. The signature then describes the case arguments the adapter receives. */
  starters?: { javascript: string; typescript?: string }; api?: string;
  languages: Language[];
  /** The JavaScript reference, an independent brute force it was checked against, and the test generator. */
  reference: string; brute?: string; generator?: string;
  /** Tests are stored inputs, or { name, generate: { seed, size } } for a large input the generator builds at run time. */
  examples: CodeCase[]; tests: (CodeCase | { name: string; generate: GeneratedCase })[];
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
  if (record.kind === 'sql') return '-- Write one MySQL query.\n';
  const body = (indent: string) => `${indent}// Write your code here.\n${indent}throw new Error("Not implemented");`;
  if (record.kind === 'function') return `function ${record.entry}(${record.parameters.join(', ')}) {\n${body('  ')}\n}\n`;
  const methods = Object.entries(record.methods ?? {}).filter(([name]) => name !== 'constructor')
    .map(([name, params]) => `  ${name}(${params.join(', ')}) {\n${body('    ')}\n  }`);
  const ctor = record.methods && Object.hasOwn(record.methods, 'constructor') ? record.methods['constructor'] as string[] : [];
  return `class ${record.entry} {\n  constructor(${ctor.join(', ')}) {\n    // Write your code here.\n    \n  }\n\n${methods.join('\n\n')}\n}\n`;
}

export function kitProblem(record: KitRecord): CodingProblem {
  const order = record.kind === 'sql' ? `Each case is [tables]: an object mapping ${Object.keys(record.schema ?? {}).join(', ')} to their rows. ${record.modifies ? `The statement changes ${record.modifies}; its rows afterwards are the answer, in any order.` : record.ordered ? 'Rows must come in the order the statement asks for.' : 'Rows may come in any order.'}` : record.kind === 'design' ? 'Cases contain [operations, arguments]. Start with "' + record.entry + '" and its constructor arguments. Methods that return nothing produce null.' : `Each case is an array of arguments in this order: ${record.parameters.join(', ')}.`;
  return {
    id: `leetcode:${record.number}`, number: record.number, title: record.title, description: record.statement,
    constraints: [...record.constraints, order, ...LIMITS], entry: record.entry, kind: record.kind,
    parameters: record.parameters, ...(record.methods ? { methods: record.methods } : {}),
    reference: record.reference, starter: record.starters?.javascript ?? jsStarter(record), examples: record.examples,
    tests: record.tests.map(t => 'generate' in t && t.generate ? { name: t.name, input: [], generate: t.generate } : t as CodeCase),
    ...(record.generator && record.tests.some(t => 'generate' in t && t.generate) ? { generator: record.generator } : {}),
    generated: true, signature: record.signature, ...(record.io ? { io: record.io } : {}), ...(record.compare ? { compare: record.compare } : {}),
    ...(record.checker ? { checker: record.checker } : {}), ...(record.validator ? { validator: record.validator } : {}),
    ...(record.adapter ? { adapter: record.adapter } : {}), languages: record.languages,
    ...(record.starters ? { starters: record.starters, api: record.api } : {}),
    ...(record.kind === 'sql' ? { schema: record.schema, ordered: !!record.ordered, ...(record.modifies ? { modifies: record.modifies } : {}) } : {})
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
  if (!['function', 'design', 'sql'].includes(record.kind)) errors.push('kind must be function, design or sql.');
  if (record.kind === 'sql') {
    if (!record.schema || typeof record.schema !== 'object' || !Object.keys(record.schema).length || Object.entries(record.schema).some(([name, columns]) => !identifier.test(name) || !Array.isArray(columns) || !columns.length || (columns as unknown[]).some(c => !Array.isArray(c) || c.length !== 2 || !identifier.test(String(c[0])) || typeof c[1] !== 'string'))) errors.push('An SQL kit needs a schema of tables, each a list of [column, type].');
    if (JSON.stringify(record.languages) !== '["sql"]') errors.push('An SQL kit is judged in sql only.');
    if (record.modifies !== undefined && !Object.hasOwn(record.schema ?? {}, record.modifies)) errors.push('modifies must name a table of the schema.');
  }
  else if (!identifier.test(record.entry ?? '')) errors.push('entry must be an identifier.');
  if (!Array.isArray(record.parameters) || !record.parameters.every((p: unknown) => typeof p === 'string' && identifier.test(p))) errors.push('parameters must be identifiers.');
  if (record.kind === 'design' && (!record.methods || typeof record.methods !== 'object')) errors.push('A design kit needs methods.');
  if (record.kind !== 'sql' && (!Array.isArray(record.languages) || !record.languages.length || !record.languages.every((l: unknown) => (languages as readonly unknown[]).includes(l)) || !record.languages.includes('javascript'))) errors.push('languages must include javascript and only known languages.');
  if (record.compare !== undefined && !(compareModes as readonly unknown[]).includes(record.compare)) errors.push(`Unknown compare mode ${record.compare}.`);
  if (record.compare === 'checker' && !text(record.checker)) errors.push('Checker mode needs a checker.');
  if (record.compare === 'checker' && record.languages?.some((l: string) => l === 'java' || l === 'c')) errors.push('Checker kits are judged in JavaScript and TypeScript only.');
  if (record.adapter && record.languages?.some((l: string) => l === 'java' || l === 'c')) errors.push('Adapter kits are judged in JavaScript and TypeScript only.');
  if (record.io?.events && !text(record.adapter)) errors.push('An events kit needs an adapter that runs the scenario.');
  if (/\bObject\b/.test(JSON.stringify(record.signature ?? '')) && record.languages?.some((l: string) => l === 'java' || l === 'c')) errors.push('Signatures with Object (any JSON value) are judged in JavaScript and TypeScript only.');
  if (record.starters !== undefined && (!text(record.starters?.javascript) || !text(record.api) || !text(record.adapter) || record.languages?.some((l: string) => !text(record.starters?.[l])))) errors.push('Kits with their own starters need an adapter, an api line, and a starter for every language they offer.');
  // The Java and C judges return the first argument for in-place changes and have no retained-prefix output.
  if ((record.io?.prefix || record.io?.mutates) && record.languages?.some((l: string) => l === 'java' || l === 'c')) errors.push('Kits with a retained prefix or a change to a later argument are judged in JavaScript and TypeScript only.');
  for (const key of ['checker', 'validator', 'adapter', 'brute', 'generator']) if (record[key] !== undefined && !text(record[key])) errors.push(`${key} must be source text.`);
  const cases = (list: unknown, name: string, expected: boolean) => {
    if (!Array.isArray(list)) { errors.push(`${name} must be a list.`); return; }
    for (const c of list) {
      const generated = !expected && c?.generate !== undefined;
      if (generated && (c.input !== undefined || !Number.isSafeInteger(c.generate?.seed) || !['small', 'large'].includes(c.generate?.size) || !text(record.generator))) errors.push(`Generated test ${c?.name ?? ''} needs a generator and generate: { seed, size: "small" | "large" }, and no input.`);
      else if (!c || !text(c.name) || !generated && !Array.isArray(c.input) || expected && c.expected === undefined) errors.push(`Invalid ${name} case ${c?.name ?? ''}.`);
    }
  };
  cases(record.examples, 'examples', true); cases(record.tests, 'tests', false);
  if (Array.isArray(record.examples) && !record.examples.length) errors.push('A kit needs at least one example.');
  if (Array.isArray(record.examples) && Array.isArray(record.tests) && record.examples.length + record.tests.length > 100) errors.push('A kit can have at most 100 cases.');
  if (record.narration !== undefined && (typeof record.narration !== 'object' || Object.entries(record.narration).some(([line, note]) => !/^[1-9]\d*$/.test(line) || !text(note)))) errors.push('narration maps line numbers to text.');
  if (!errors.length && record.kind !== 'sql') try {
    const c = contract(kitProblem(record));
    if (c.kind === 'function' && (c.method.name !== record.entry || c.method.params.map(p => p.name).join() !== record.parameters.join())) errors.push('The signature must name the entry and parameters.');
    if (c.kind === 'design' && (c.name !== record.entry || record.kind !== 'design' || c.methods.some(m => !Object.hasOwn(record.methods, m.name)))) errors.push('The design signature must match entry and methods.');
    if (c.kind === 'function' && record.kind !== 'function') errors.push('A function signature needs kind function.');
  } catch (error) { errors.push(String(error instanceof Error ? error.message : error)); }
  return errors;
}
