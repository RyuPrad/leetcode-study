import assert from 'node:assert/strict';
import test from 'node:test';
import { newQuickJSAsyncWASMModule } from 'quickjs-emscripten';
import { DebugController, debugEvaluate } from '../coding/debug-engine';
import { instrument } from '../coding/instrument';
import definitions from '../coding/problems.json';
import type { CodingProblem } from '../shared/coding';
import type { VisualizationFrame } from '../shared/visualization';
import { DebugHistory } from '../shared/debug-history';
import { DEBUG_HISTORY_BYTES, DEBUG_HISTORY_LIMIT } from '../shared/debugging';
const problem=(definitions as CodingProblem[]).find(p=>p.number===1)!;
async function run(source:string){
  let controller:DebugController;const frames:VisualizationFrame[]=[];
  const hooks={started:()=>{},running:()=>{},frame:(frame:VisualizationFrame)=>{frames.push(frame);queueMicrotask(()=>controller.command('into'));}};
  controller=new DebugController(hooks);
  const result=await debugEvaluate(await newQuickJSAsyncWASMModule(),problem,source,problem.examples[0],controller,hooks);
  return {result,frames};
}
test('debugging preserves scope, closures, short circuits, side effects and finally',async()=>{
  const {result,frames}=await run(`function twoSum(nums,target) {
    let calls=0, value=0; const array=[1,2];
    function read(){calls++;return 0;}
    function nested(){let value=7;return array[read()]++ + value;}
    const outcome = false && nested();
    try { if(nested()!==8 || calls!==1 || array[0]!==2 || value!==0) throw Error('semantics changed'); return [0,1]; }
    finally { calls++; }
  }`);
  assert.equal(result.error,undefined);assert.deepEqual(result.actual,[0,1]);
  assert.ok(frames.some(f=>f.stack.length===2));assert.ok(frames.some(f=>f.changes.some(c=>c.objectId&&c.key==='0')));
});
test('snapshots keep aliases and cycles and do not invoke accessors or toJSON',async()=>{
  const {result,frames}=await run(`function twoSum(nums,target){
    const item={value:1};item.self=item;const alias=item;
    const box={get nope(){throw Error('getter ran')},toJSON(){throw Error('toJSON ran')}};
    item.value=2; return [0,1];
  }`);
  assert.equal(result.error,undefined);
  const frame=[...frames].reverse().find(f=>f.objects.some(o=>o.entries.some(e=>e.key==='self')))!;
  const vars=frame.stack.at(-1)!.variables;assert.deepEqual(vars.find(v=>v.name==='item')?.value,vars.find(v=>v.name==='alias')?.value);
  assert.ok(frames.some(f=>f.objects.some(o=>o.entries.some(e=>e.key==='nope'&&JSON.stringify(e.value).includes('not invoked')))));
});

test('inspection also ignores inherited serialization getters',async()=>{
  const {result}=await run(`function twoSum(){let calls=0;Object.defineProperty(Object.prototype,'toJSON',{configurable:true,get(){calls++;return undefined;}});const item={value:1};item.value++;delete Object.prototype.toJSON;if(calls!==0)throw Error('inspection called a getter');return [0,1];}`);
  assert.equal(result.error,undefined);assert.deepEqual(result.actual,[0,1]);
});
test('unsupported execution constructs receive source diagnostics',()=>{
  for(const source of ['async function twoSum(){}','function* twoSum(){}','function twoSum(){eval("1")}','function twoSum(){const P=Proxy;}'])assert.throws(()=>instrument(source),/line 1/);
  assert.throws(()=>instrument(`function twoSum(){${Array.from({length:500},(_,i)=>`let variable${i}=${i};`).join('')}return [0,1];}`),/too many scope captures/);
  for(const definition of definitions as CodingProblem[])assert.doesNotThrow(()=>instrument(definition.reference),`reference ${definition.number} fits the instrumentation budget`);
});

test('computed access cannot bypass diagnostics for dynamic execution or Proxy inspection',async()=>{
  for(const expression of ["globalThis['Pro'+'xy']({}, {ownKeys(){throw Error('trap ran')}})","(()=>{}).constructor('return 3')()","globalThis['e'+'val']('3')"]){const {result}=await run(`function twoSum(){const unsupported=${expression};return [0,1];}`);assert.match(result.error||'',/Debugging unavailable/);assert.doesNotMatch(result.error||'',/trap ran/);}
});
test('an entry breakpoint suspends execution until commanded',async()=>{
  let controller:DebugController,firstResolve:()=>void=()=>{};const first=new Promise<void>(r=>firstResolve=r),frames:VisualizationFrame[]=[];
  const hooks={started:()=>{},running:()=>{},frame:(frame:VisualizationFrame)=>{frames.push(frame);if(frames.length===1)firstResolve();else queueMicrotask(()=>controller.command('continue'));}};
  controller=new DebugController(hooks);
  let finished=false;
  const running=debugEvaluate(await newQuickJSAsyncWASMModule(),problem,problem.reference,problem.examples[0],controller,hooks).then(r=>{finished=true;return r;});
  await first;await new Promise(r=>setTimeout(r,35));assert.equal(finished,false);assert.equal(frames.length,1);
  controller.pause();await new Promise(r=>setTimeout(r,15));assert.equal(frames.length,1);
  controller.command('continue');const result=await running;assert.equal(result.error,undefined);assert.deepEqual(result.actual,[0,1]);
});

test('instrumentation preserves method receivers, argument order, destructuring and labels',async()=>{
  const {result}=await run(`const globalThis = 'shadowed';
    function twoSum(nums,target){
      let count=0;const object={value:4,get method(){count++;return function(x){return this.value+x}}};
      const answer=object.method((count*=2,3));
      const values=[4,9];[values[0],values[1]]=[values[1],values[0]];
      let sum=0;outer:for(let i=0;i<3;i++){for(let j=0;j<3;j++){if(j===1)continue outer;sum++;}}
      if(answer!==7||count!==2||values.join(',')!=='9,4'||sum!==3||globalThis!=='shadowed')throw Error('evaluation order');
      return [0,1];
    }`);
  assert.equal(result.error,undefined);assert.deepEqual(result.actual,[0,1]);
});

test('instrumentation preserves classes, super, private fields, lexical this and exception recovery',async()=>{
  const {result,frames}=await run(`function twoSum(){
    class Parent{constructor(n){this.n=n;}read(){return this.n;}}
    class Child extends Parent{#extra=2;constructor(){super(3);}read(){const arrow=()=>this.#extra;return super.read()+arrow();}}
    function replace(){try{return 1;}finally{return 2;}}
    let recovered=false;try{throw Error('expected');}catch(error){recovered=error.message==='expected';}
    if(new Child().read()!==5||replace()!==2||!recovered)throw Error('class or finally semantics');
    return [0,1];
  }`);
  assert.equal(result.error,undefined);assert.ok(frames.some(f=>f.stack.some(s=>s.name==='constructor')));
});

test('Map snapshots distinguish key types and expose object key identity and native reads',async()=>{
  const {result,frames}=await run(`function twoSum(){
    const key={name:'key'}, map=new Map([[1,'number'],['1','string'],[key,'object']]);
    const a=map.get(1),b=map.get('1');
    if(a===b||!map.has(key))throw Error('map changed');return [0,1];
  }`);
  assert.equal(result.error,undefined);
  const frame=frames.find(f=>f.objects.some(o=>o.kind==='map'&&o.entries.length===3))!;
  const map=frame.objects.find(o=>o.kind==='map')!;assert.equal(new Set(map.entries.map(e=>e.key)).size,3);
  assert.ok(map.entries.some(e=>e.keyValue&&typeof e.keyValue==='object'&&'ref'in e.keyValue));
  assert.ok(frames.some(f=>f.reads.some(r=>r.objectId===map.id&&r.key==='number:1')));
});

async function session(source:string,breakpoints:number[]=[]){
  const events:VisualizationFrame[]=[],waiters:((frame:VisualizationFrame)=>void)[]=[];
  const hooks={started:()=>{},running:()=>{},frame:(frame:VisualizationFrame,paused:boolean)=>{if(paused){const resolve=waiters.shift();if(resolve)resolve(frame);else events.push(frame);}}};
  const controller=new DebugController(hooks,breakpoints);
  const execution=debugEvaluate(await newQuickJSAsyncWASMModule(),problem,source,problem.examples[0],controller,hooks);
  return {controller,execution,next:()=>events.length?Promise.resolve(events.shift()!):new Promise<VisualizationFrame>(resolve=>waiters.push(resolve))};
}
const nestedSource=`function twoSum(nums,target){
  function helper(x){
    const next=x+1;
    return next;
  }
  const answer=helper(0);
  return [0,answer];
}`;

test('Step Into enters a call, Step Out returns to the caller, and breakpoints bind original lines',{timeout:10000},async()=>{
  const live=await session(nestedSource,[6]);
  try{
    const entry=await live.next();assert.equal(entry.location.line,6);
    live.controller.breakpoints.clear();live.controller.command('into');
    const inside=await live.next();assert.equal(inside.location.line,3);assert.equal(inside.stack.length,2);
    live.controller.command('out');const outside=await live.next();assert.equal(outside.location.line,7);assert.equal(outside.stack.length,1);
    live.controller.command('continue');assert.deepEqual((await live.execution).actual,[0,1]);
  }finally{live.controller.stop();await live.execution;}
});

test('Step Over finishes a nested call and Continue stops before a new breakpoint',{timeout:10000},async()=>{
  const live=await session(nestedSource);
  try{
    await live.next();live.controller.command('over');const frame=await live.next();
    assert.equal(frame.location.line,7);assert.equal(frame.stack.length,1);
    live.controller.command('continue');assert.deepEqual((await live.execution).actual,[0,1]);
    const loop=await session(`function twoSum(){\n let i=0;\n while(i<3){\n i++;\n }\n return [0,1];\n}`);
    try{await loop.next();loop.controller.breakpoints=new Set([4]);loop.controller.command('continue');const stopped=await loop.next();assert.equal(stopped.location.line,4);assert.equal(stopped.stack.at(-1)?.variables.find(v=>v.name==='i')?.value,0);loop.controller.breakpoints.clear();loop.controller.command('continue');assert.equal((await loop.execution).error,undefined);}finally{loop.controller.stop();await loop.execution;}
  }finally{live.controller.stop();await live.execution;}
});

test('waiting for a command is excluded from the active execution clock',{timeout:10000},async()=>{
  const live=await session('function twoSum(){return [0,1];}');
  try{await live.next();const used=live.controller.activeMs();await new Promise(resolve=>setTimeout(resolve,100));assert.ok(Math.abs(live.controller.activeMs()-used)<2);live.controller.command('continue');assert.equal((await live.execution).error,undefined);}finally{live.controller.stop();await live.execution;}
});

test('a breakpoint on a loop header is reached again on later iterations',{timeout:10000},async()=>{
  const live=await session('function twoSum(){\nlet i=0;\nwhile(i<3){i++;}\nreturn [0,1];\n}',[3]);
  try{await live.next();let observed=false;for(let attempt=0;attempt<4;attempt++){live.controller.command('continue');const frame=await Promise.race([live.next(),live.execution.then(()=>null)]);assert.ok(frame,'loop breakpoint must not run to completion');if(frame.stack.at(-1)?.variables.find(v=>v.name==='i')?.value===1){observed=true;break;}}assert.ok(observed);live.controller.breakpoints.clear();live.controller.command('continue');await live.execution;}finally{live.controller.stop();await live.execution;}
});

test('large snapshots disclose truncation and contain only bounded data',async()=>{
  const {result,frames}=await run('function twoSum(){const large=new Array(5000).fill(1);return [0,1];}');
  assert.equal(result.error,undefined);const frame=frames.find(f=>f.truncated)!;assert.ok(frame);assert.ok(JSON.stringify(frame).length<500000);
});

test('inspection history evicts oldest frames at either limit and preserves live state',()=>{
  const frame={index:0,location:{line:1,column:1,endLine:1,endColumn:1},phase:'before',action:'Next',explanation:'',stack:[],objects:[],reads:[],changes:[],logs:[]} satisfies VisualizationFrame;
  const history=new DebugHistory();for(let i=0;i<DEBUG_HISTORY_LIMIT+10;i++)history.append({...frame,index:i});
  assert.equal(history.frames().length,DEBUG_HISTORY_LIMIT);assert.equal(history.frames()[0].index,10);assert.equal(history.frames().at(-1)!.index,DEBUG_HISTORY_LIMIT+9);
  const large=new DebugHistory();for(let i=0;i<100;i++)large.append({...frame,index:i,logs:['x'.repeat(300000)]});
  assert.ok(large.bytes<=DEBUG_HISTORY_BYTES);assert.ok(large.dropped>0);assert.equal(large.frames().at(-1)!.index,99);
});

test('Continue retains the last local values even when execution finishes between sampled checkpoints',async()=>{
  let controller:DebugController;const frames:VisualizationFrame[]=[];const hooks={started:()=>{},running:()=>{},frame:(frame:VisualizationFrame,paused:boolean)=>{frames.push(frame);if(paused)queueMicrotask(()=>controller.command('continue'));}};controller=new DebugController(hooks);
  const result=await debugEvaluate(await newQuickJSAsyncWASMModule(),problem,'function twoSum(){let last=1;last=2;return [0,1];}',problem.examples[0],controller,hooks);
  assert.equal(result.error,undefined);assert.equal(frames.at(-1)?.phase,'exit');assert.equal(frames.at(-1)?.stack[0].variables.find(v=>v.name==='last')?.value,2);
});

test('debug VM enforces its own memory and active-time limits',{timeout:60000},async()=>{
  for(const [source,expected] of [['function twoSum(){const giant=new Array(30000000).fill(0);return [0,1];}',/memory/i],['function twoSum(){while(true){}}',/10 seconds of active execution/]] as const){
    let controller:DebugController;const hooks={started:()=>{},running:()=>{},frame:()=>queueMicrotask(()=>controller.command('continue'))};controller=new DebugController(hooks);
    const result=await debugEvaluate(await newQuickJSAsyncWASMModule(),problem,source,problem.examples[0],controller,hooks);assert.match(result.error||'',expected);
  }
});

test('Path Sum III live debugging retains recursive locals, numeric frequencies and reference parity',async()=>{
  const p=(definitions as CodingProblem[]).find(item=>item.number===437)!;
  let controller:DebugController;const frames:VisualizationFrame[]=[];
  const hooks={started:()=>{},running:()=>{},frame:(frame:VisualizationFrame)=>{frames.push(frame);queueMicrotask(()=>controller.command('into'));}};
  controller=new DebugController(hooks);
  const result=await debugEvaluate(await newQuickJSAsyncWASMModule(),p,p.reference,{name:'Repeated zero prefixes',input:[[0,0,0],0]},controller,hooks);
  assert.equal(result.error,undefined);assert.equal(result.actual,5);
  assert.ok(frames.some(frame=>frame.stack.filter(call=>call.name==='dfs').length>=2),'nested calls keep their own local scope');
  for(const frequency of [2,3])assert.ok(frames.some(frame=>frame.objects.some(object=>object.kind==='map'&&object.entries.some(entry=>entry.key==='number:0'&&entry.value===frequency))),`numeric prefix zero has frequency ${frequency}`);
  assert.ok(frames.some(frame=>frame.stack.some(call=>call.variables.some(variable=>variable.name==='matches'&&variable.value===2))),'multiplicity remains visible in the live debugger');
});
