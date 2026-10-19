import type { CodingProblem } from '../shared/coding';
import { contract } from './languages';

/** What harness.js needs to run one case of a generated kit, derived from its typed contract.
 *  Types are the Java-notation strings of signatures.mjs; the harness converts ListNode,
 *  TreeNode and their arrays between level-order/array JSON and linked objects. */
export interface CaseSpec {
  kind: 'function' | 'design';
  params?: string[]; returns?: string;
  mutates?: number; prefix?: boolean; seed?: number; adapter?: boolean;
  ctor?: string[]; methods?: Record<string, { params: string[]; returns: string }>;
}

export function caseSpec(problem: CodingProblem): CaseSpec | null {
  if (!problem.generated) return null;
  const c = contract(problem), io = problem.io ?? {};
  const shared = { ...(io.seed !== undefined ? { seed: io.seed } : {}), ...(problem.adapter ? { adapter: true } : {}) };
  if (c.kind === 'design') return { kind: 'design', ...shared, ctor: c.constructor.map(p => p.type),
    methods: Object.fromEntries(c.methods.map(m => [m.name, { params: m.params.map(p => p.type), returns: m.returns }])) };
  if (c.kind !== 'function') throw new Error(`Generated kit ${problem.number} must be a function or a design class.`);
  const { params, returns } = c.method;
  // A void function's answer is the argument it changes in place, the first one unless io says otherwise.
  const mutates = io.mutates ?? (returns === 'void' ? 0 : undefined);
  return { kind: 'function', ...shared, params: params.map(p => p.type), returns,
    ...(mutates !== undefined ? { mutates } : {}), ...(io.prefix ? { prefix: true } : {}) };
}

/** Guest code that defines globalThis.__studyAdapter from a kit's adapter source, or nothing. */
export const adapterScript = (problem: CodingProblem) => problem.generated && problem.adapter ? `globalThis.__studyAdapter = (${problem.adapter});` : '';
