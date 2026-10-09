import fs from 'node:fs';
import { getQuickJS } from 'quickjs-emscripten';
import { evaluate } from '../coding/engine';
import { validateInput } from '../coding/validation';
import { extraCase } from '../coding/cases.mjs';
import { statements } from '../coding/statements.mjs';
import type { CodingProblem, CodeCase } from '../shared/coding';
const problems = JSON.parse(fs.readFileSync('coding/problems.json','utf8')) as CodingProblem[];
const vm=await getQuickJS();
let failures=0, count=0;
for (const p of problems) {
  p.description=statements[p.number];
  if(!p.description) throw new Error(`Missing statement ${p.number}`);
  p.reference=p.reference.replace("makeBoard(n, '.')","Array.from({length:n},()=>Array(n).fill('.'))").replace(/res\[len-/g,'res[res.length-');
  if(p.number===567&&!p.reference.includes('function matches')) p.reference+='\nfunction matches(a,b) { return Object.keys(b).every(k=>a[k]===b[k]); }';
  for(const type of ['MinHeap','MaxHeap']) if(p.reference.includes(`new ${type}(`)&&!p.reference.includes(`class ${type}`)) p.reference+=`\nclass ${type} { constructor() { this.items=[]; } size() { return this.items.length; } peek() { return this.items[0]; } push(v) { this.items.push(v); this.items.sort((x,y)=>{const a=Array.isArray(x)?x:[x],b=Array.isArray(y)?y:[y]; for(let i=0;i<Math.min(a.length,b.length);i++){if(a[i]!==b[i])return ${type==='MinHeap'?'1':'-1'}*(a[i]<b[i]?-1:1);} return 0;}); } pop() { return this.items.shift(); } }`;
  const inputNote = p.kind==='design' ? `Cases contain [operations, arguments]. Start with "${p.entry}" and constructor arguments. Void methods produce null in results.` : p.kind==='codec' ? 'Cases contain [strs]. The judge checks decode(encode(strs)) using separate instances.' : 'Each case is an array of arguments in this order: '+p.parameters.join(', ')+'.';
  p.constraints=[inputNote,'Local limits: 2 seconds per case, 64 MiB of interpreter memory, 30 seconds per run.','Custom input limits: 20 cases, 2,000 items per array, 10,000 characters per string, 20,000 total values per case. Matrices: at most 100 by 100.'];
  if(p.number===437)p.constraints.push('0 to 1,000 non-null nodes; node values are integers in [-1,000,000,000, 1,000,000,000]; targetSum is an integer in [-1,000, 1,000]. Prefix sums remain exact JavaScript numbers.');
  if([51,52].includes(p.number))p.constraints.push('1 <= n <= 9.');
  if(p.parameters.some(v=>['root','p','q','subRoot'].includes(v))||p.number===297)p.constraints.push('Trees use level-order arrays with null for absent children. TreeNode(val, left = null, right = null) is available to your code.');
  if(p.parameters.some(v=>['head','list1','list2','l1','l2','lists'].includes(v)))p.constraints.push('Lists use value arrays in cases; your code receives nodes. ListNode(val = 0, next = null) is available.');
  if(p.number===138)p.constraints.push('Random lists use [value, randomIndexOrNull] pairs. Node(val) provides val, next and random.');
  if(p.number===133)p.constraints.push('Graphs use adjacency lists indexed by node value minus one. Node(val, neighbors = []) is available.');
  if([26,27,48,73,75,88,130,143,189,286,344].includes(p.number))p.constraints.push('The judge checks the mutated argument. For problems 26/27, also return the retained length.');
  if([46,47,78,90,1863].includes(p.number))p.constraints.push('Local backtracking limit: 12 values.');
  if([39,40,131,473,698].includes(p.number))p.constraints.push('Local backtracking limit: 16 input elements/characters.');
  p.examples=p.examples.filter(t=>{const e=validateInput(p,t.input);if(e)console.log(`Omitted out-of-contract preset ${p.number}/${t.name}: ${e}`);return !e;});
  const extras = Array.from({length:12},(_,i)=>({name:`Test ${i+1}`,input:extraCase(p.number,i+1)})) as CodeCase[];
  if(!p.examples.length)p.examples=extras.splice(0,2);
  p.tests=extras;
  for(const test of [...p.examples,...p.tests]) {
    count++;
    const error=validateInput(p,test.input);
    const result=error?null:evaluate(vm,p,p.reference,test.input);
    if(error || result?.verdict!=='Accepted') { failures++; console.log(`${p.number}/${test.name}: ${error||result?.error}`); }
    else if(p.examples.includes(test))test.expected=result.actual;
  }
}
fs.writeFileSync('coding/problems.json',JSON.stringify(problems,null,2)+'\n');
console.log({problems:problems.length,cases:count,failures});
process.exitCode=failures?1:0;
