import RELEASE_ASYNC from '@jitl/quickjs-wasmfile-release-asyncify';
import asyncWasm from '@jitl/quickjs-wasmfile-release-asyncify/wasm?url';
import RELEASE_SYNC from '@jitl/quickjs-wasmfile-release-sync';
import syncWasm from '@jitl/quickjs-wasmfile-release-sync/wasm?url';
import { newQuickJSAsyncWASMModuleFromVariant, newQuickJSWASMModuleFromVariant, newVariant } from 'quickjs-emscripten-core';
import definitions from '../../coding/problems.json';
import { DebugController, debugEvaluate } from '../../coding/debug-engine';
import { evaluate } from '../../coding/engine';
import { accepts } from '../../coding/compare';
import type { CodingProblem } from '../../shared/coding';
import type { DebugCommand, DebugEvent } from '../../shared/debugging';
let controller:DebugController|undefined,sessionId='';
const send=(event:DebugEvent)=>self.postMessage(event);
self.onmessage=async({data}:MessageEvent<DebugCommand>)=>{
  if(data.type!=='start'){
    if(data.sessionId!==sessionId||!controller)return;
    if(data.type==='motion')controller.command(data.motion,data.speed,data.presentation);
    if(data.type==='presented')controller.presented(data.index);
    if(data.type==='pause')controller.pause();
    if(data.type==='breakpoints')controller.breakpoints=new Set(data.lines);
    return;
  }
  if(sessionId)return;sessionId=data.sessionId;
  try{
    const problem=(definitions as CodingProblem[]).find(p=>p.id===data.problemId);if(!problem)throw new Error('Unknown problem.');
    const hooks={started:(executableLines:number[])=>send({type:'started',sessionId,executableLines}),frame:(frame:any,paused:boolean,reason:string)=>send({type:'frame',sessionId,frame,paused,reason}),running:()=>send({type:'running',sessionId})};
    controller=new DebugController(hooks,data.breakpoints);
    const module=await newQuickJSAsyncWASMModuleFromVariant(newVariant(RELEASE_ASYNC,{wasmLocation:asyncWasm}));
    const result=await debugEvaluate(module,problem,data.source,data.test,controller,hooks);
    if(result.error){send({type:'finished',sessionId,...result});return;}
    const referenceModule=await newQuickJSWASMModuleFromVariant(newVariant(RELEASE_SYNC,{wasmLocation:syncWasm}));
    const reference=evaluate(referenceModule,problem,problem.reference,data.test.input);
    send({type:'finished',sessionId,...result,expected:reference.actual,accepted:reference.verdict==='Accepted'&&accepts(problem,data.test.input,result.actual,reference.actual)});
  }catch(error){send({type:'finished',sessionId,error:String(error).replace(/^Error: /,'').slice(0,8000),logs:[],durationMs:0});}
};
