import test from 'node:test';
import assert from 'node:assert/strict';
import {newQuickJSAsyncWASMModule} from 'quickjs-emscripten';
import {DebugController,debugEvaluate} from '../coding/debug-engine';
import definitions from '../coding/problems.json';
import type {CodingProblem} from '../shared/coding';
import type {VisualizationFrame} from '../shared/visualization';
const problem=(definitions as CodingProblem[]).find(p=>p.number===1)!;
test('native lookups and writes report distinct actual results without repeating getters or overridden methods',async()=>{
 const frames:VisualizationFrame[]=[];let controller:DebugController;
 const hooks={started:()=>{},running:()=>{},frame:(f:VisualizationFrame)=>{frames.push(f);queueMicrotask(()=>controller.command('into'));}};
 controller=new DebugController(hooks);
 const source=`function twoSum(nums,target){let calls=0;const map=new Map();if(map.has(7))throw Error('miss');map.set(2,0);if(!map.has(2))throw Error('hit');const custom={get has(){calls++;return function(x){calls++;return x===2;}}};if(!custom.has(2)||calls!==2)throw Error('double call');return [0,1];}`;
 const result=await debugEvaluate(await newQuickJSAsyncWASMModule(),problem,source,problem.examples[0],controller,hooks);
 assert.equal(result.error,undefined);assert.deepEqual(result.actual,[0,1]);const ops=frames.flatMap(f=>f.operations||[]);
 assert.equal(ops.filter(o=>o.kind==='lookup').length,2);assert.ok(ops.some(o=>o.kind==='lookup'&&o.result.startsWith('Not found')));assert.ok(ops.some(o=>o.kind==='lookup'&&o.result.startsWith('Found')));assert.ok(ops.some(o=>o.kind==='write'&&o.result.includes('Key 2 now stores 0')));assert.ok(ops.every(o=>!o.links?.length));
});
test('Detailed Play waits for the matching presentation acknowledgement and excludes that time',async()=>{
 const frames:VisualizationFrame[]=[];let controller:DebugController;let release:()=>void=()=>{};const arrived=new Promise<void>(resolve=>release=resolve);
 const hooks={started:()=>{},running:()=>{},frame:(f:VisualizationFrame,paused:boolean)=>{frames.push(f);if(paused)queueMicrotask(()=>controller.command('play',4,'detailed'));else release();}};
 controller=new DebugController(hooks);
 const job=debugEvaluate(await newQuickJSAsyncWASMModule(),problem,'function twoSum(nums,target){let x=1;x++;return [0,1];}',problem.examples[0],controller,hooks);
 await arrived;const count=frames.length,index=frames.at(-1)!.index,used=controller.activeMs();controller.presented(index+999);await new Promise(r=>setTimeout(r,70));assert.equal(frames.length,count);assert.ok(controller.activeMs()-used<5);
 controller.pause();await new Promise(r=>setTimeout(r,30));assert.equal(frames.length,count);controller.command('continue',1,'compact');const result=await job;assert.equal(result.error,undefined);assert.deepEqual(result.actual,[0,1]);
});
