// One-time authoring aid. The checked-in coding/problems.json is the runtime source.
// Usage: node scripts/import-coding.mjs <visualizer code extraction JSON>
import fs from 'node:fs';
import { parse } from '@babel/parser';
const rows = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const design = new Set([146,155,208,211,225,232,295,304,355,460,622,703,705,706,895,901,933,981,2013]);
const helpers = new Set(['Node','ListNode','TreeNode','DSU','TrieNode','MinHeap','MaxHeap']);
const aliases = { list1:'l1', list2:'l2', wordDict:'dict', root:'tree', head:'list' };
const output = [];
for (const row of rows) {
  const n = row.number;
  let reference = row.code;
  if (n === 700) reference = 'function searchBST(root, val) { while (root && root.val !== val) root = val < root.val ? root.left : root.right; return root; }';
  if (n === 933) reference = 'class RecentCounter { constructor() { this.q = []; } ping(t) { this.q.push(t); while (this.q[0] < t - 3000) this.q.shift(); return this.q.length; } }';
  if (n === 502) reference = reference.replace('i < n &&', 'i < projects.length &&');
  if (n === 1095) reference = reference.replace(/arr\.length/g, 'arr.length()').replace(/arr\[mid \+ 1\]/g, 'arr.get(mid + 1)').replace(/arr\[mid\]/g, 'arr.get(mid)');
  const ast = parse(reference).program.body;
  const declarations = ast.flatMap(x => x.type === 'FunctionDeclaration' || x.type === 'ClassDeclaration' ? [x] : x.type === 'VariableDeclaration' ? x.declarations.filter(d => ['FunctionExpression','ArrowFunctionExpression'].includes(d.init?.type)).map(d => ({ ...d.init, id: d.id })) : []);
  const main = declarations.find(x => !helpers.has(x.id.name));
  const kind = design.has(n) ? 'design' : n === 271 ? 'codec' : n === 297 ? 'tree-codec' : 'function';
  const methods = main.type === 'ClassDeclaration' ? Object.fromEntries(main.body.body.filter(m => m.type === 'ClassMethod' && !m.key.name.startsWith('_') && m.key.name !== 'touch').map(m => [m.key.name, m.params.map(p => p.name)])) : undefined;
  let parameters = kind === 'design' ? ['operations','arguments'] : kind === 'codec' ? ['strs'] : main.params.map(p => p.name);
  if (n === 141) parameters.push('pos');
  if (n === 374) parameters.push('pick');
  let starter = main.type === 'ClassDeclaration' ? `class ${main.id.name} {\n${Object.entries(methods).map(([m, args]) => `  ${m}(${args.join(', ')}) {\n    // Write your code here.\n    ${m === 'constructor' ? '' : 'throw new Error("Not implemented");'}\n  }`).join('\n\n')}\n}` : `function ${main.id.name}(${(n === 141 ? ['head'] : n === 374 ? ['n'] : parameters).join(', ')}) {\n  // Write your code here.\n  throw new Error("Not implemented");\n}`;
  if (n === 297) starter = 'function serialize(root) {\n  // Return a string representing the tree.\n  throw new Error("Not implemented");\n}\n\nfunction deserialize(data) {\n  // Return the reconstructed TreeNode.\n  throw new Error("Not implemented");\n}';
  const examples = Object.values(row.examples || {}).map(raw => {
    if (kind === 'design') {
      let ctor = [], ops;
      if (n === 304) { ctor = [raw.matrix]; ops = raw.queries.map(a => ['sumRegion', a]); }
      else if (n === 703) { ctor = raw.slice(0, 2); ops = raw[2].map(v => ['add', [v]]); }
      else if (n === 895) ops = raw.split(';').map(s => s.trim().split(' ')).map(([m,v]) => [m, v === undefined ? [] : [Number(v)]]);
      else if (n === 901) ops = raw.map(v => ['next', [v]]);
      else if (n === 2013) ops = raw.map(([m,v]) => [m,[v]]);
      else ops = raw.flatMap(o => { const args = Object.entries(o).filter(([k]) => k !== 'method').map(([,v]) => v); if (o.method === 'new') { ctor = args; return []; } return [[o.method, args]]; });
      return [[main.id.name, ...ops.map(o => o[0])], [ctor, ...ops.map(o => o[1])]];
    }
    if (parameters.length === 1) return [raw && !Array.isArray(raw) && typeof raw === 'object' ? raw[parameters[0]] ?? raw[aliases[parameters[0]]] : raw];
    if (Array.isArray(raw)) return raw;
    return parameters.map(p => raw[p] ?? raw[aliases[p]] ?? (p === 'head' ? raw.vals : undefined));
  });
  if (n === 141) examples.push([[3,2,0,-4],1], [[1],-1]);
  if (n === 700) examples.push([[4,2,7,1,3],2], [[4,2,7,1,3],5]);
  if (n === 933) examples.push([['RecentCounter','ping','ping','ping','ping'],[[],[1],[100],[3001],[3002]]]);
  if (examples.some(a => a.some(v => v === undefined))) throw new Error(`Unmapped input ${n}`);
  output.push({ id: row.id, number:n, title:row.title, description:'', constraints:[], entry: main.id.name, kind, parameters, ...(methods ? {methods} : {}), reference, starter: starter + '\n', examples:examples.slice(0,3).map((input,i)=>({name:`Example ${i+1}`, input})), tests:examples.slice(3).map((input,i)=>({name:`Preset ${i+4}`,input})) });
}
fs.mkdirSync('coding', {recursive:true});
fs.writeFileSync('coding/problems.json', JSON.stringify(output, null, 2)+'\n');
console.log(`Imported ${output.length} definitions.`);
