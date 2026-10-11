import test from 'node:test';
import assert from 'node:assert/strict';
import { getQuickJS } from 'quickjs-emscripten';
import definitions from '../coding/problems.json';
import { compileFailure, judge } from '../coding/engine';
import { instrument } from '../coding/instrument';
import { contract, contractLine, starter } from '../coding/languages';
import { stripTypes, TypeScriptSyntaxError } from '../coding/typescript';
import type { CodingProblem } from '../shared/coding';

const problems = definitions as CodingProblem[];
const problem = (number: number) => problems.find(p => p.number === number)!;
async function runTypeScript(number: number, source: string) {
  const p = problem(number);
  return judge(await getQuickJS(), p, stripTypes(source), [...p.examples, ...p.tests]);
}

test('TypeScript types are stripped without moving runtime lines', () => {
  const source = 'interface Pair { a: number }\nfunction twoSum(nums: number[], target: number): number[] {\n  const seen = new Map<number, number>();\n  throw new Error("line 4");\n}\n';
  const code = stripTypes(source);
  assert.doesNotMatch(code, /interface|: number/);
  assert.equal(code.split('\n').findIndex(line => line.includes('line 4')), 3);
  assert.throws(() => stripTypes('function twoSum(nums: number[] {'), TypeScriptSyntaxError);
  assert.equal(compileFailure('Unexpected token', 3).cases[0].verdict, 'Syntax error');
});

test('TypeScript-only syntax is removed or lowered to equivalent JavaScript', async () => {
  const vm = await getQuickJS(), p = problem(1);
  const source = `enum Dir { Up, Down = 5, Left }
enum Name { A = 'a' }
abstract class Base { abstract size(): number; protected readonly tag?: string; }
class Box<T> extends Base implements Iterable<T> {
  declare hidden: number;
  private items!: T[];
  static count: number = 0;
  constructor(public readonly first: T, private second = first) { super(); this.items = [first, second]; }
  size(this: Box<T>): number { return this.items.length; }
  overload(a: number): number;
  overload(a: any): any { return a; }
  [Symbol.iterator]() { return this.items[Symbol.iterator](); }
}
declare const external: number;
type Pair = [number, number];
function twoSum(nums: number[], target: number, opt?: number): Pair {
  const box = new Box<number>(nums[0]);
  const values = <number[]>nums;
  const seen = new Map<number, number>() satisfies Map<number, number>;
  for (let i = 0; i < values.length; i++) {
    const other = seen.get(target - values[i]!);
    if (other !== undefined) return [other, i] as Pair;
    seen.set(values[i], i);
  }
  return [Dir.Down + Dir.Left + box.size() + Name.A.length + box.first, Dir[0].length];
}
`;
  const code = stripTypes(source);
  const lineOf = (text: string, needle: string) => text.split('\n').findIndex(line => line.includes(needle));
  for (const needle of ['return [other, i]', 'seen.set(values[i], i)', 'this.items = [first, second]', 'return a;'])
    assert.equal(lineOf(code, needle.replace(' as Pair', '')), lineOf(source, needle), `${needle} keeps its line`);
  const result = await judge(vm, p, code, p.examples);
  assert.equal(result.verdict, 'Accepted', result.cases.map(c => c.error).join('\n'));
  const wrong = await judge(vm, p, stripTypes('function twoSum(nums: number[], target: number): number[] { return [Dir.Down]; }\nenum Dir { Up, Down }'), p.examples.slice(0, 1));
  assert.equal(wrong.verdict, 'Wrong answer');
  assert.throws(() => stripTypes('namespace N { const x = 1; }'), /namespace is not supported/);
  assert.throws(() => stripTypes('enum E { A = "a".length }'), /computed enum member/);
});

test('typed TypeScript solutions are judged against the JavaScript reference', async () => {
  const twoSum = await runTypeScript(1, 'function twoSum(nums: number[], target: number): number[] {\n  const seen = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const other = seen.get(target - nums[i]);\n    if (other !== undefined) return [other, i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n');
  assert.equal(twoSum.verdict, 'Accepted');
  const reverse = await runTypeScript(206, 'function reverseList(head: ListNode | null): ListNode | null {\n  let prev: ListNode | null = null;\n  while (head) { const next = head.next; head.next = prev; prev = head; head = next!; }\n  return prev;\n}\n');
  assert.equal(reverse.verdict, 'Accepted');
  const stack = await runTypeScript(155, 'class MinStack {\n  private items: number[] = [];\n  private mins: number[];\n  constructor() { this.mins = []; }\n  push(val: number): void { this.items.push(val); this.mins.push(Math.min(val, this.mins.at(-1) ?? val)); }\n  pop(): void { this.items.pop(); this.mins.pop(); }\n  top(): number { return this.items.at(-1)!; }\n  getMin(): number { return this.mins.at(-1)!; }\n}\n');
  assert.equal(stack.verdict, 'Accepted');
  const clone = await runTypeScript(133, 'function cloneGraph(node: _Node | null): _Node | null {\n  const copies = new Map<_Node, _Node>();\n  const visit = (n: _Node): _Node => {\n    if (copies.has(n)) return copies.get(n)!;\n    const copy = new _Node(n.val);\n    copies.set(n, copy);\n    copy.neighbors = n.neighbors.map(visit);\n    return copy;\n  };\n  return node && visit(node);\n}\n');
  assert.equal(clone.verdict, 'Accepted');
  const wrong = await runTypeScript(1, 'function twoSum(nums: number[], target: number): number[] { return [0, 0]; }');
  assert.equal(wrong.verdict, 'Wrong answer');
});

test('TypeScript debugging keeps sites on the original TypeScript lines', () => {
  const source = 'type Index = number;\nfunction twoSum(nums: number[], target: number): Index[] {\n  const value: number = nums[0];\n  return [value as Index, 1];\n}\n';
  const result = instrument(source, 'typescript');
  assert.deepEqual(result.executableLines, [3, 4]);
  assert.ok(result.sites.some(site => site.line === 3 && site.text.startsWith('const value: number')));
  assert.doesNotMatch(result.code, /: number|as Index|type Index/);
});

test('every problem has TypeScript, Java and C starters; TypeScript starters run', async () => {
  const vm = await getQuickJS();
  for (const p of problems) {
    for (const language of ['typescript', 'java', 'c'] as const) {
      assert.ok(starter(p, language).length > 20, `${p.number} ${language}`);
      assert.ok(contractLine(p, language).length > 0);
    }
    const result = await judge(vm, p, stripTypes(starter(p, 'typescript')), p.examples.slice(0, 1));
    assert.notEqual(result.verdict, 'Syntax error', `${p.number}: ${result.cases[0]?.error}`);
    assert.match(result.cases[0].error ?? '', /Not implemented/, `${p.number} starter reaches the solution`);
  }
  const cycle = contract(141);
  assert.ok(cycle.kind === 'function' && cycle.method.params.length === 1 && cycle.harnessOnly[0] === 'pos');
  assert.match(starter(problem(15), 'c'), /int\*\* threeSum\(int\* nums, int numsSize, int\* returnSize, int\*\* returnColumnSizes\)/);
  assert.match(starter(problem(146), 'c'), /int lRUCacheGet\(LRUCache\* obj, int key\)/);
  assert.match(starter(problem(15), 'java'), /public List<List<Integer>> threeSum\(int\[\] nums\)/);
});
