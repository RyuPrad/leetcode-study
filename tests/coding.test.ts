import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getQuickJS } from 'quickjs-emscripten';
import definitions from '../coding/problems.json';
import type { CodingProblem, Json } from '../shared/coding';
import { evaluate, judge } from '../coding/engine';
import { accepts } from '../coding/compare';
import { parseCases, validateInput } from '../coding/validation';
import { extraCase } from '../coding/cases.mjs';
import { statements } from '../coding/statements.mjs';
const problems = definitions as CodingProblem[];
const get = (n:number)=>problems.find(p=>p.number===n)!;
const vm=await getQuickJS();
// Independent oracle: deliberately scan rather than repeating the reference's binary searches.
const linearRange = (nums:number[],target:number):[number,number] => {
  let first=-1,last=-1;
  for(let i=0;i<nums.length;i++) if(nums[i]===target){if(first===-1)first=i;last=i;}
  return [first,last];
};
test('every catalog problem has a complete coding definition, working reference, and rejected incorrect implementation',async()=>{
  const catalog=JSON.parse(fs.readFileSync('dist/content/catalog.json','utf8'));
  assert.deepEqual(problems.map(p=>p.id).sort(),catalog.entries.filter((p:any)=>p.number).map((p:any)=>p.id).sort());
  let cases=0;
  for(const p of problems){
    assert.ok(p.description.length>30&&p.constraints.length>=3&&p.starter.length>30,p.id);
    assert.ok(p.examples.length>0&&p.tests.length>=10,p.id);
    if(![22,51,52].includes(p.number))assert.ok(new Set(p.tests.map(t=>JSON.stringify(t.input))).size>=10,`${p.id}: at least 10 distinct additional cases`);
    for(const t of [...p.examples,...p.tests]){
      assert.equal(validateInput(p,t.input),null,`${p.id} ${t.name}`);
      const result=evaluate(vm,p,p.reference,t.input);
      assert.equal(result.verdict,'Accepted',`${p.id} ${t.name}: ${result.error}`);
      assert.ok(accepts(p,t.input,result.actual,result.actual),`${p.id} must accept its reference result`);
      if(t.expected!==undefined)assert.ok(accepts(p,t.input,result.actual,t.expected),`${p.id} expected example`);
      cases++;
    }
    const wrong = p.kind==='design' ? `class ${p.entry} { constructor() {throw Error('incorrect');} }` : p.kind==='codec' ? 'class Codec { encode(){return "";} decode(){return ["wrong"];}}' : p.kind==='tree-codec' ? 'function serialize(){return "";} function deserialize(){return null;}' : `function ${p.entry}(){return null;}`;
    const result=await judge(vm,p,wrong,p.examples);
    assert.notEqual(result.verdict,'Accepted',p.id);
  }
  console.log(`Validated ${problems.length} problems and ${cases} reference cases.`);
});
test('adapters enforce mutation, list/graph copies, serialization, and supplied APIs',()=>{
  const run=(n:number,source:string,input:Json[])=>evaluate(vm,get(n),source,input);
  assert.deepEqual(run(26,'function removeDuplicates(nums){nums[0]=1;nums[1]=2;return 2;}',[[1,1,2]]).actual,{length:2,values:[1,2]});
  assert.deepEqual(run(48,'function rotate(m){m[0][0]=3;m[0][1]=1;m[1][0]=4;m[1][1]=2;}',[[[1,2],[3,4]]]).actual,[[3,1],[4,2]]);
  assert.equal(run(138,'function copyRandomList(head){return head;}',[[[1,null]]]).verdict,'Runtime error');
  assert.equal(run(133,'function cloneGraph(node){return node;}',[[[2],[1]]]).verdict,'Runtime error');
  assert.equal(run(141,get(141).reference,[[1,2,3],0]).actual,true);
  assert.equal(run(374,get(374).reference,[100,43]).actual,43);
  assert.equal(run(1095,'function findInMountainArray(t,a){for(let i=0;i<101;i++)a.get(0);return 0;}',[1,[1,2,1]]).verdict,'Runtime error');
  assert.deepEqual(run(271,'class Codec { encode(s){this.s=s;return "";} decode(){return this.s;} }',[['a']]).verdict,'Runtime error');
  assert.deepEqual(run(297,get(297).reference,[[1,null,2,3]]).actual,[1,null,2,3]);
});
test('semantic validators accept alternative valid answers and reject invalid shapes or multiplicities',()=>{
  assert.ok(accepts(get(1),[[2,7,11],9],[1,0],[0,1]));
  assert.ok(!accepts(get(1),[[3,2,4],6],[0,0],[1,2]));
  assert.ok(accepts(get(5),['babad'],'aba','bab'));
  assert.ok(accepts(get(210),[3,[[2,0]]],[1,0,2],[0,1,2]));
  assert.ok(!accepts(get(210),[3,[[2,0]]],[2,1,0],[0,1,2]));
  assert.ok(accepts(get(49),[['eat','tea','a']],[['a'],['tea','eat']],[['eat','tea'],['a']]));
  assert.ok(!accepts(get(49),[['a','a']],[['a']],[['a','a']]));
  assert.ok(accepts(get(767),['aabb'],'baba','abab'));
  assert.ok(!accepts(get(767),['aabb'],'aabb','abab'));
  assert.ok(accepts(get(973),[[[0,1],[1,0]],1],[[1,0]],[[0,1]]));
  assert.ok(!accepts(get(973),[[[0,1],[2,0]],1],[[2,0]],[[0,1]]));
  assert.ok(accepts(get(50),[2,-3],0.12500001,0.125));
  assert.ok(!accepts(get(50),[2,-3],null,0.125));
});
test('the sandbox bounds loops, memory, output, console, and recovers with a fresh context',()=>{
  const p=get(1), input=p.examples[0].input;
  assert.equal(evaluate(vm,p,'function twoSum( {',input).verdict,'Syntax error');
  const error=evaluate(vm,p,'function twoSum(){\n throw new Error("test location");\n}',input);
  assert.match(error.error!,/solution\.js:2/);
  assert.equal(evaluate(vm,p,'function twoSum(){while(true){}}',input,50).verdict,'Time limit exceeded');
  const memory=evaluate(vm,p,'function twoSum(){const a=[];while(true)a.push(new Array(100000).fill(1));}',input);
  assert.equal(memory.verdict,'Memory limit exceeded',memory.error);
  const result=evaluate(vm,p,'function twoSum(){console.log(typeof process,typeof require,typeof fetch,typeof window,typeof study);for(let i=0;i<1000;i++)console.log("x".repeat(1000));return [0,1];}',input);
  assert.equal(result.logs[0],'undefined undefined undefined undefined undefined');
  assert.ok(result.logs.join('\n').length<70000);
  assert.equal(evaluate(vm,p,'function twoSum(){return "x".repeat(300000);}',input).verdict,'Runtime error');
  assert.equal(evaluate(vm,p,p.reference,input).verdict,'Accepted');
});
test('custom cases validate before reference execution and match documented argument ordering',()=>{
  assert.equal(parseCases(get(1),'[[[2,7,11],9]]').length,1);
  assert.throws(()=>parseCases(get(1),'[[[2,2],99]]'),/Exactly one/);
  assert.throws(()=>parseCases(get(1),'{}'),/cases/);
  assert.throws(()=>parseCases(get(1),'['),/JSON/);
  assert.throws(()=>parseCases(get(230),'[[[2,1,3],4]]'),/existing node/);
  assert.throws(()=>parseCases(get(933),'[[["RecentCounter","ping","ping"],[[],[10],[2]]]]'),/increasing/);
});
test('Search Range includes the standard examples and twelve independently checked boundary cases',()=>{
  const p=get(34);
  assert.equal(p.id,'leetcode:34');
  assert.equal(p.entry,'searchRange');
  assert.equal(p.kind,'function');
  assert.deepEqual(p.parameters,['nums','target']);
  assert.equal(p.description,statements[34]);
  assert.match(p.starter,/function searchRange\(nums, target\)/);
  assert.deepEqual(p.examples.map(t=>[t.input,t.expected]),[
    [[[5,7,7,8,8,10],8],[3,4]],
    [[[5,7,7,8,8,10],6],[-1,-1]],
    [[[],0],[-1,-1]]
  ]);
  assert.equal(p.tests.length,12);
  assert.equal(new Set(p.tests.map(t=>JSON.stringify(t.input))).size,12);
  p.tests.forEach((t,i)=>assert.deepEqual(t.input,extraCase(34,i+1)));
  for(const t of [...p.examples,...p.tests]){
    const [nums,target]=t.input as [number[],number];
    assert.equal(validateInput(p,t.input),null,t.name);
    const result=evaluate(vm,p,p.reference,t.input);
    assert.equal(result.verdict,'Accepted',`${t.name}: ${result.error}`);
    assert.deepEqual(result.actual,linearRange(nums,target),t.name);
    if(t.expected!==undefined)assert.deepEqual(t.expected,linearRange(nums,target),t.name);
  }
});
test('Search Range matches a linear oracle across exhaustive small sorted arrays',()=>{
  const p=get(34), alphabet=[-2,0,3], targets=[-3,-2,-1,0,1,3,4];
  function check(nums:number[],start:number){
    for(const target of targets){
      const result=evaluate(vm,p,p.reference,[nums,target]);
      assert.equal(result.verdict,'Accepted',result.error);
      assert.deepEqual(result.actual,linearRange(nums,target),JSON.stringify([nums,target]));
    }
    if(nums.length===6)return;
    for(let i=start;i<alphabet.length;i++)check([...nums,alphabet[i]],i);
  }
  check([],0);
});
test('Search Range validates sorted safe-integer input while allowing duplicates and empty arrays',()=>{
  const p=get(34);
  for(const input of [[[],0],[[2,2],2],[[Number.MIN_SAFE_INTEGER,0,Number.MAX_SAFE_INTEGER],Number.MAX_SAFE_INTEGER],[Array(2000).fill(7),7]]){
    assert.equal(validateInput(p,input),null,JSON.stringify(input));
  }
  for(const input of [null,[],[[1]],[[1],1,2],['1',1],[[1],'1'],[[2,1],1],[[1,2,1],1],[[1.5],1],[[1],1.5],[[null],0],[[true],0],[[Number.MAX_SAFE_INTEGER+1],0],[[Number.MIN_SAFE_INTEGER-1],0],[[1],Number.MAX_SAFE_INTEGER+1],[[Infinity],0],[[1],NaN],[Array(2001).fill(0),0]]){
    assert.notEqual(validateInput(p,input),null,JSON.stringify(input));
  }
  assert.equal(parseCases(p,'[[[],0],[[2,2],2]]').length,2);
  assert.throws(()=>parseCases(p,'[[[2,1],1]]'),/nondecreasing/);
});
test('Search Range uses logarithmic element reads without mutating its input',()=>{
  const p=get(34);
  const measuredReference=p.reference+`
const unmeasuredSearchRange = searchRange;
searchRange = function(nums, target) {
  let reads = 0;
  const measured = new Proxy(nums, {
    get(array, key) {
      if (/^(0|[1-9][0-9]*)$/.test(String(key))) reads++;
      return array[key];
    },
    set() { throw new Error('searchRange must not mutate nums'); }
  });
  const result = unmeasuredSearchRange(measured, target);
  if (reads > 2 * Math.ceil(Math.log2(nums.length + 1)) + 1) {
    throw new Error('Expected logarithmic element reads');
  }
  return result;
};`;
  const arrays=[Array(2000).fill(7),Array.from({length:2000},(_,i)=>Math.floor(i/4)-250)];
  for(const nums of arrays)for(const target of [-251,-250,0,7,249,250]){
    const result=evaluate(vm,p,measuredReference,[nums,target]);
    assert.equal(result.verdict,'Accepted',result.error);
    assert.deepEqual(result.actual,linearRange(nums,target));
  }
});
test('Search Range rejects single-match, exclusive-end, absent-target, and malformed answers',async()=>{
  const p=get(34);
  for(const source of [
    'function searchRange(){return [-1,-1];}',
    'function searchRange(nums,target){const i=nums.indexOf(target);return [i,i];}',
    'function searchRange(nums,target){return [nums.indexOf(target),nums.lastIndexOf(target)+1];}',
    'function searchRange(nums,target){let i=0;while(i<nums.length&&nums[i]<target)i++;let j=i;while(j<nums.length&&nums[j]===target)j++;return [i,j-1];}'
  ]){
    const result=await judge(vm,p,source,[...p.examples,...p.tests]);
    assert.equal(result.verdict,'Wrong answer');
  }
  for(const actual of [[4,3],[3,5],[3],[3,4,4],3,null])assert.ok(!accepts(p,p.examples[0].input,actual,[3,4]));
});
