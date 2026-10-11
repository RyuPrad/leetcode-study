// Typed contracts for non-JavaScript solutions. coding/signatures.mjs is the maintained
// source; this module parses it and generates the TypeScript, Java and C starters.
import type { CodingProblem, Language } from '../shared/coding';
import { signatures } from './signatures.mjs';

export interface Param { name: string; type: string; }
export interface Method { name: string; returns: string; params: Param[]; }
export type Contract =
  | { kind: 'function'; method: Method; harnessOnly: string[]; }
  | { kind: 'design'; name: string; constructor: Param[]; methods: Method[]; }
  | { kind: 'codec'; name: string; methods: Method[]; };

const scalar = new Set(['int', 'long', 'double', 'boolean', 'char', 'String', 'void', 'ListNode', 'TreeNode', 'Node', 'MountainArray']);
export function isType(type: string): boolean {
  if (scalar.has(type)) return true;
  if (type.endsWith('[]')) return isType(type.slice(0, -2)) && type !== 'void[]';
  const list = /^List<(.+)>$/.exec(type);
  return !!list && ['Integer', 'String', 'Boolean'].includes(list[1]) || !!list && /^List<.+>$/.test(list[1]) && isType(list[1]);
}
/** Element type of an array or list, with boxed names unboxed. */
export function element(type: string): string | undefined {
  if (type.endsWith('[]')) return type.slice(0, -2);
  const inner = /^List<(.+)>$/.exec(type)?.[1];
  return inner === 'Integer' ? 'int' : inner === 'Boolean' ? 'boolean' : inner;
}

function splitParams(text: string): string[] {
  const out: string[] = []; let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '<') depth++; else if (text[i] === '>') depth--;
    else if (text[i] === ',' && depth === 0) { out.push(text.slice(start, i)); start = i + 1; }
  }
  if (text.trim()) out.push(text.slice(start));
  return out.map(s => s.trim());
}
function parseParams(text: string): Param[] {
  return splitParams(text).map(item => {
    const at = item.lastIndexOf(' '), type = item.slice(0, at).trim(), name = item.slice(at + 1);
    if (at < 0 || !isType(type) || type === 'void' || !/^[A-Za-z_]\w*$/.test(name)) throw new Error(`Invalid parameter "${item}".`);
    return { name, type };
  });
}
export function parseMethod(text: string): Method {
  const match = /^(\S+(?:<.+>)?(?:\[\])*)\s+([A-Za-z_]\w*)\((.*)\)$/.exec(text.trim());
  if (!match || !isType(match[1])) throw new Error(`Invalid signature "${text}".`);
  return { returns: match[1], name: match[2], params: parseParams(match[3]) };
}

export function contract(number: number): Contract {
  const raw = (signatures as Record<number, any>)[number];
  if (!raw) throw new Error(`Problem ${number} has no typed signature.`);
  if (typeof raw === 'string') return { kind: 'function', method: parseMethod(raw), harnessOnly: [] };
  if (raw.kind === 'function') return { kind: 'function', method: parseMethod(raw.signature), harnessOnly: raw.harnessOnly ?? [] };
  const methods = raw.methods.map(parseMethod);
  if (raw.kind === 'codec') return { kind: 'codec', name: raw.name, methods };
  const ctor = /^([A-Za-z_]\w*)\((.*)\)$/.exec(raw.constructor);
  if (!ctor || ctor[1] !== raw.name) throw new Error(`Invalid constructor for ${raw.name}.`);
  return { kind: 'design', name: raw.name, constructor: parseParams(ctor[2]), methods };
}

// ---- TypeScript ----------------------------------------------------------------
export function tsType(type: string): string {
  const inner = element(type);
  if (inner) { const t = tsType(inner); return /[| ]/.test(t) ? `Array<${t}>` : `${t}[]`; }
  return ({ int: 'number', long: 'number', double: 'number', boolean: 'boolean', char: 'string', String: 'string', void: 'void',
    ListNode: 'ListNode | null', TreeNode: 'TreeNode | null', Node: '_Node | null', MountainArray: 'MountainArray' } as Record<string, string>)[type];
}
const tsParams = (params: Param[]) => params.map(p => `${p.name}: ${tsType(p.type)}`).join(', ');
const todo = (_returns: string, indent: string) => `${indent}// Write your code here.\n${indent}throw new Error("Not implemented");`;

function typescriptStarter(problem: CodingProblem, c: Contract): string {
  if (c.kind === 'function') {
    const m = c.method, mutated = m.returns === 'void' ? `  // Do not return anything; modify the input in place.\n` : '';
    return `function ${m.name}(${tsParams(m.params)}): ${tsType(m.returns)} {\n${mutated}${todo(m.returns, '  ')}\n}\n`;
  }
  if (problem.kind === 'tree-codec') return c.methods.map(m => `function ${m.name}(${tsParams(m.params)}): ${tsType(m.returns)} {\n${todo(m.returns, '  ')}\n}\n`).join('\n');
  const ctor = c.kind === 'design' ? `  constructor(${tsParams(c.constructor)}) {\n    // Write your code here.\n  }\n\n` : '';
  return `class ${c.name} {\n${ctor}${c.methods.map(m => `  ${m.name}(${tsParams(m.params)}): ${tsType(m.returns)} {\n${todo(m.returns, '    ')}\n  }`).join('\n\n')}\n}\n`;
}

// ---- Java ----------------------------------------------------------------------
const javaDefault = (type: string) => type === 'void' ? '' : ({ int: '0', long: '0L', double: '0.0', boolean: 'false', char: "'\\0'" } as Record<string, string>)[type] ?? 'null';
const javaParams = (params: Param[]) => params.map(p => `${p.type} ${p.name}`).join(', ');
const javaBody = (m: Method, indent: string) => `${indent}// Write your code here.\n${m.returns === 'void' ? '' : `${indent}return ${javaDefault(m.returns)};\n`}`;
const javaNodeDocs: Record<number, string> = {
  133: '/*\n// Definition for a Node.\nclass Node {\n    public int val;\n    public List<Node> neighbors;\n}\n*/\n\n',
  138: '/*\n// Definition for a Node.\nclass Node {\n    int val;\n    Node next;\n    Node random;\n}\n*/\n\n',
  427: '/*\n// Definition for a QuadTree node.\nclass Node {\n    public boolean val;\n    public boolean isLeaf;\n    public Node topLeft, topRight, bottomLeft, bottomRight;\n    public Node(boolean val, boolean isLeaf) {}\n    public Node(boolean val, boolean isLeaf, Node topLeft, Node topRight, Node bottomLeft, Node bottomRight) {}\n}\n*/\n\n'
};
function javaDocs(problem: CodingProblem, c: Contract): string {
  const text = JSON.stringify(c);
  let docs = '';
  if (text.includes('ListNode')) docs += '/**\n * Definition for singly-linked list.\n * public class ListNode {\n *     int val;\n *     ListNode next;\n *     ListNode() {}\n *     ListNode(int val) { this.val = val; }\n *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n * }\n */\n';
  if (text.includes('TreeNode')) docs += '/**\n * Definition for a binary tree node.\n * public class TreeNode {\n *     int val;\n *     TreeNode left;\n *     TreeNode right;\n *     TreeNode() {}\n *     TreeNode(int val) { this.val = val; }\n *     TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }\n * }\n */\n';
  if (problem.number === 374) docs += '/**\n * Forward declaration of guess API.\n * @param  num   your guess\n * @return \t     -1 if num is higher than the picked number\n *\t\t\t      1 if num is lower than the picked number\n *               otherwise return 0\n * int guess(int num);\n */\n\n';
  if (problem.number === 1095) docs += '/**\n * // This is MountainArray\'s API interface.\n * // You should not implement it, or speculate about its implementation\n * interface MountainArray {\n *     public int get(int index) {}\n *     public int length() {}\n * }\n */\n\n';
  return (javaNodeDocs[problem.number] ?? '') + docs;
}
function javaStarter(problem: CodingProblem, c: Contract): string {
  const docs = javaDocs(problem, c);
  if (c.kind === 'function') {
    const base = problem.number === 374 ? ' extends GuessGame' : '';
    return `${docs}class Solution${base} {\n    public ${c.method.returns} ${c.method.name}(${javaParams(c.method.params)}) {\n${javaBody(c.method, '        ')}    }\n}\n`;
  }
  const ctor = c.kind === 'design' ? `    public ${c.name}(${javaParams(c.constructor)}) {\n        // Write your code here.\n    }\n\n` : '';
  return `${docs}class ${c.name} {\n${ctor}${c.methods.map(m => `    public ${m.returns} ${m.name}(${javaParams(m.params)}) {\n${javaBody(m, '        ')}    }`).join('\n\n')}\n}\n`;
}

// ---- C -------------------------------------------------------------------------
// LeetCode's C conventions: arrays carry their length, 2-D arrays also carry column sizes,
// and array returns report their size through returnSize / returnColumnSizes.
const cNodes: Record<number, string> = {
  133: '/**\n * Definition for a Node.\n * struct Node {\n *     int val;\n *     int numNeighbors;\n *     struct Node** neighbors;\n * };\n */\n\n',
  138: '/**\n * Definition for a Node.\n * struct Node {\n *     int val;\n *     struct Node *next;\n *     struct Node *random;\n * };\n */\n\n',
  427: '/**\n * Definition for a Node.\n * struct Node {\n *     bool val;\n *     bool isLeaf;\n *     struct Node *topLeft;\n *     struct Node *topRight;\n *     struct Node *bottomLeft;\n *     struct Node *bottomRight;\n * };\n */\n\n'
};
export function cScalar(type: string): string {
  return ({ int: 'int', long: 'long long', double: 'double', boolean: 'bool', char: 'char', String: 'char*', ListNode: 'struct ListNode*', TreeNode: 'struct TreeNode*', Node: 'struct Node*', MountainArray: 'MountainArray*', void: 'void' } as Record<string, string>)[type];
}
/** Number of pointer levels an array/list type adds, and its innermost scalar. */
export function cShape(type: string): { depth: number; base: string } {
  let depth = 0, t = type;
  for (let inner = element(t); inner !== undefined; inner = element(t)) { depth++; t = inner; }
  // char[] is a mutable byte buffer and char[][] a grid of them, as on LeetCode.
  return { depth, base: t };
}
export function cParams(params: Param[]): string[] {
  return params.flatMap(p => {
    const { depth, base } = cShape(p.type);
    if (depth === 0) return [`${cScalar(base)} ${p.name}`];
    const stars = '*'.repeat(depth);
    if (depth === 1) return [`${cScalar(base)}${stars} ${p.name}`, `int ${p.name}Size`];
    if (depth === 2) return [`${cScalar(base)}${stars} ${p.name}`, `int ${p.name}Size`, `int* ${p.name}ColSize`];
    throw new Error(`Unsupported C parameter ${p.type}.`);
  });
}
export function cReturn(type: string): { type: string; out: string[] } {
  const { depth, base } = cShape(type);
  if (depth === 0) return { type: cScalar(base), out: [] };
  if (depth === 1) return { type: `${cScalar(base)}*`, out: ['int* returnSize'] };
  if (depth === 2) return { type: `${cScalar(base)}**`, out: ['int* returnSize', 'int** returnColumnSizes'] };
  throw new Error(`Unsupported C return ${type}.`);
}
const cDefault = (type: string) => type === 'void' ? '' : /\*/.test(type) ? 'NULL' : type === 'bool' ? 'false' : '0';
const cBody = (returns: string, indent: string) => `${indent}// Write your code here.\n${returns === 'void' ? '' : `${indent}return ${cDefault(returns)};\n`}`;
const lowerFirst = (name: string) => name[0].toLowerCase() + name.slice(1);
const upperFirst = (name: string) => name[0].toUpperCase() + name.slice(1);
/** LeetCode's C design names: LRUCache.get -> lRUCacheGet. */
export const cDesignFunction = (className: string, method: string) => lowerFirst(className) + upperFirst(method);
// Signatures whose C form differs from the generic mapping.
const cOverrides: Record<string, string> = { reverseBits: 'uint32_t reverseBits(uint32_t n)' };
export function cFunction(m: Method, receiver?: string): string {
  if (!receiver && cOverrides[m.name]) return cOverrides[m.name];
  const r = cReturn(m.returns), params = [...(receiver ? [`${receiver}* obj`] : []), ...cParams(m.params), ...r.out];
  return `${r.type} ${receiver ? cDesignFunction(receiver, m.name) : m.name}(${params.join(', ')})`;
}
function cDocs(problem: CodingProblem, c: Contract): string {
  const text = JSON.stringify(c);
  let docs = cNodes[problem.number] ?? '';
  if (text.includes('ListNode')) docs += '/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     struct ListNode *next;\n * };\n */\n';
  if (text.includes('TreeNode')) docs += '/**\n * Definition for a binary tree node.\n * struct TreeNode {\n *     int val;\n *     struct TreeNode *left;\n *     struct TreeNode *right;\n * };\n */\n';
  if (problem.number === 374) docs += '/**\n * Forward declaration of guess API.\n * @param  num   your guess\n * @return \t     -1 if num is lower than the guess number\n *\t\t\t      1 if num is higher than the guess number\n *               otherwise return 0\n * int guess(int num);\n */\n\n';
  if (problem.number === 1095) docs += '/**\n * *********************************************************************\n * // This is the MountainArray\'s API interface.\n * // You should not implement it, or speculate about its implementation\n * *********************************************************************\n *\n * int get(MountainArray *, int index);\n * int length(MountainArray *);\n */\n\n';
  const returns = c.kind === 'function' ? [c.method] : c.methods;
  if (returns.some(m => cShape(m.returns).depth === 1)) docs += '/**\n * Note: The returned array must be malloced, assume caller calls free().\n */\n';
  if (returns.some(m => cShape(m.returns).depth === 2)) docs += '/**\n * Return an array of arrays of size *returnSize.\n * The sizes of the arrays are returned as *returnColumnSizes array.\n * Note: Both returned array and *columnSizes array must be malloced, assume caller calls free().\n */\n';
  return docs;
}
function cStarter(problem: CodingProblem, c: Contract): string {
  const docs = cDocs(problem, c);
  if (c.kind === 'function') return `${docs}${cFunction(c.method)} {\n${cBody(cReturn(c.method.returns).type, '    ')}}\n`;
  if (c.kind === 'codec') {
    const comments = problem.number === 297 ? '/** Encodes a tree to a single string. */\n' : '/** Encodes a list of strings to a single string. */\n';
    return `${docs}${comments}${c.methods.map(m => `${cFunction(m)} {\n${cBody(cReturn(m.returns).type, '    ')}}`).join('\n\n')}\n`;
  }
  const name = c.name, ctor = `${name}* ${cDesignFunction(name, 'create')}(${cParams(c.constructor).join(', ')}) {\n    // Write your code here.\n    return NULL;\n}`;
  const methods = c.methods.map(m => `${cFunction(m, name)} {\n${cBody(cReturn(m.returns).type, '    ')}}`);
  return `${docs}typedef struct {\n    // Write your fields here.\n} ${name};\n\n\n${[ctor, ...methods, `void ${cDesignFunction(name, 'free')}(${name}* obj) {\n    \n}`].join('\n\n')}\n`;
}

export function starter(problem: CodingProblem, language: Language): string {
  if (language === 'javascript') return problem.starter;
  const c = contract(problem.number);
  return language === 'typescript' ? typescriptStarter(problem, c) : language === 'java' ? javaStarter(problem, c) : cStarter(problem, c);
}
/** One-line contract for the description panel. */
export function contractLine(problem: CodingProblem, language: Language): string {
  if (language === 'javascript') return problem.kind === 'design' ? problem.entry : `${problem.entry}(${problem.parameters.join(', ')})`;
  const c = contract(problem.number);
  const methods = c.kind === 'function' ? [c.method] : c.methods;
  if (language === 'java') return methods.map(m => `${m.returns} ${m.name}(${javaParams(m.params)})`).join('\n');
  if (language === 'typescript') return methods.map(m => `${m.name}(${tsParams(m.params)}): ${tsType(m.returns)}`).join('\n');
  return methods.map(m => cFunction(m, c.kind === 'design' ? c.name : undefined)).join('\n');
}
