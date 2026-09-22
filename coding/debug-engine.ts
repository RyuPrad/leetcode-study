import type { QuickJSAsyncWASMModule } from 'quickjs-emscripten';
import type { CodingProblem, CodeCase, Json } from '../shared/coding';
import type { DebugMotion } from '../shared/debugging';
import { DEBUG_TIME_LIMIT } from '../shared/debugging';
import type { VisualizationFrame } from '../shared/visualization';
import { frameChanges } from '../shared/visualization';
import { observedOperations } from '../shared/operations';
import { instrument } from './instrument';
import { installEnvironment, executeCase } from './harness.js';
import { installDebugEnvironment } from './debug-runtime.js';
import { validateInput } from './validation';

export interface DebugHooks {
  started(lines:number[]):void;
  frame(frame:VisualizationFrame,paused:boolean,reason:string):void;
  running():void;
}
export class DebugController {
  breakpoints = new Set<number>();
  motion:DebugMotion='into';
  paused=false;
  pauseRequested=false;
  speed=1;
  presentation:'detailed'|'compact'='compact';
  private presentationIndex:number|null=null;
  private presentResolve:(()=>void)|undefined;
  private resume:(()=>void)|undefined;
  private depth=0;
  private baseDepth=Infinity;
  private first=true;
  private shouldPause=true;
  private reason='Entry';
  private checkpoint=0;
  private lastIndex=0;
  private previous:VisualizationFrame|undefined;
  private used=0;
  private segment=performance.now();
  private stopped=false;
  private waitingForCommand=false;
  private hooks:DebugHooks;
  constructor(hooks:DebugHooks,breakpoints:number[]=[]){this.hooks=hooks;this.breakpoints=new Set(breakpoints);}
  command(motion:DebugMotion,speed=1,presentation:'detailed'|'compact'='compact'){this.presentation=presentation;this.motion=motion;this.speed=Math.max(.5,Math.min(4,speed));this.baseDepth=this.depth;this.pauseRequested=false;if(this.presentationIndex!==null){if(motion==='play'&&presentation==='detailed'){this.hooks.running();return;}this.presentResolve?.();this.presentationIndex=null;}this.paused=false;this.hooks.running();this.resume?.();this.resume=undefined;}
  presented(index:number){if(index!==this.presentationIndex)return;this.presentationIndex=null;this.presentResolve?.();this.presentResolve=undefined;}
  pause(){if(this.waitingForCommand)return;this.pauseRequested=true;if(this.presentationIndex!==null)return;this.resume?.();this.resume=undefined;}
  stop(){this.stopped=true;this.presentResolve?.();this.resume?.();this.resume=undefined;}
  activeMs(){return this.used+(this.paused?0:Math.max(0,performance.now()-this.segment));}
  interrupted(){return this.stopped||this.activeMs()>DEBUG_TIME_LIMIT;}
  start(){this.segment=performance.now();}
  skipInterval(){return this.motion==='continue'&&!this.breakpoints.size&&!this.pauseRequested?256:0;}
  decision(site:{line:number;kind:string},depth:number,index:number){
    this.depth=depth;
    const breakpoint=['before','iteration','condition'].includes(site.kind)&&this.breakpoints.has(site.line);
    this.shouldPause=this.pauseRequested||this.first&&depth>0||breakpoint||this.motion==='into'&&!this.first||this.motion==='over'&&depth<=this.baseDepth||this.motion==='out'&&depth<this.baseDepth;
    this.reason=this.pauseRequested?'Paused':breakpoint?'Breakpoint':this.first?'Entry':'Step';
    // Continue samples checkpoints, while Play/stepping retain each teaching step.
    return this.shouldPause || this.motion==='play' || performance.now()-this.checkpoint>=32;
  }
  async checkpointFrame(frame:VisualizationFrame){
    this.used+=Math.max(0,performance.now()-this.segment);this.paused=true;this.checkpoint=performance.now();this.lastIndex=frame.index;
    frame.changes=frameChanges(this.previous,frame);frame.operations=observedOperations(frame,this.previous);this.previous=frame;
    const pause=this.shouldPause;this.first=false;
    const presentation=!pause&&this.motion==='play'&&this.presentation==='detailed'?new Promise<void>(resolve=>{this.presentationIndex=frame.index;this.presentResolve=resolve;}):null;
    this.hooks.frame(frame,pause,this.reason);
    if(pause){this.pauseRequested=false;this.waitingForCommand=true;await new Promise<void>(resolve=>{this.resume=resolve;});this.waitingForCommand=false;}
    else if(presentation){await presentation;if(this.pauseRequested&&!this.stopped){this.pauseRequested=false;this.waitingForCommand=true;this.hooks.frame(frame,true,'Paused');await new Promise<void>(resolve=>{this.resume=resolve;});this.waitingForCommand=false;}}
    else if(this.motion==='play')await new Promise<void>(resolve=>{const timer=setTimeout(resolve,1000/this.speed);this.resume=()=>{clearTimeout(timer);resolve();};});
    else await new Promise(resolve=>setTimeout(resolve,0));
    this.resume=undefined;this.paused=false;this.segment=performance.now();
    if(this.stopped)throw new Error('Debug session stopped.');
  }
  recordExit(frame:VisualizationFrame){frame.changes=frameChanges(this.previous,frame);frame.operations=observedOperations(frame,this.previous);this.previous=frame;this.hooks.frame(frame,false,'Function exited');}
}
export async function debugEvaluate(module:QuickJSAsyncWASMModule,problem:CodingProblem,source:string,test:CodeCase,controller:DebugController,hooks:DebugHooks) {
  const invalid=validateInput(problem,test.input);if(invalid)throw new Error(invalid);
  const transformed=instrument(source);hooks.started(transformed.executableLines);
  const runtime=module.newRuntime();runtime.setMemoryLimit(64*1024*1024);runtime.setMaxStackSize(1024*1024);runtime.setInterruptHandler(()=>controller.interrupted());
  const vm=runtime.newContext(),logs:string[]=[];let actual:Json|undefined,error:string|undefined,logBytes=0;
  const decision=vm.newFunction('__studyDecision',(site,depth,index)=>vm.newNumber(controller.decision(transformed.sites[vm.getNumber(site)],vm.getNumber(depth),vm.getNumber(index))?1:controller.skipInterval()));
  vm.setProp(vm.global,'__studyDecision',decision);decision.dispose();
  const pause=vm.newAsyncifiedFunction('__studyPause',async handle=>{const frame=JSON.parse(vm.getString(handle)) as VisualizationFrame;frame.logs=[...logs];await controller.checkpointFrame(frame);return vm.undefined;});vm.setProp(vm.global,'__studyPause',pause);pause.dispose();
  const exitFrame=vm.newFunction('__studyExit',handle=>{const frame=JSON.parse(vm.getString(handle)) as VisualizationFrame;frame.logs=[...logs];controller.recordExit(frame);return vm.undefined;});vm.setProp(vm.global,'__studyExit',exitFrame);exitFrame.dispose();
  const print=vm.newFunction('__print',handle=>{if(logBytes<65536){const text=vm.getString(handle).slice(0,Math.min(2000,65536-logBytes));logBytes+=text.length;logs.push(text);}});vm.setProp(vm.global,'__print',print);print.dispose();
  async function evaluate(code:string,filename:string){const result=await vm.evalCodeAsync(code,filename);if(result.error){const detail=vm.dump(result.error);result.error.dispose();throw new Error(`${detail?.name||'Error'}: ${detail?.message||String(detail)}`);}const text=vm.typeof(result.value)==='string'?vm.getString(result.value):undefined;result.value.dispose();return text;}
  controller.start();
  try{
    await evaluate(`(${installEnvironment.toString()})(); (${installDebugEnvironment.toString()})(${JSON.stringify(transformed.sites)}); globalThis.console=Object.fromEntries(['log','info','warn','error','debug'].map(k=>[k,(...args)=>__print(args.map(v=>{try{return typeof v==='string'?v:JSON.stringify(v)}catch{return String(v)}}).join(' ').slice(0,2000))]));`,'environment.js');
    await evaluate(`globalThis[${JSON.stringify(transformed.helperName)}]=__studyDebugger;`,'debug-helper.js');
    await evaluate(transformed.code,'solution.js');
    const output=await evaluate(`__studyDebugger.enable(); (()=>{const value=(${executeCase.toString()})(${problem.number},${JSON.stringify(test.input)},${problem.entry},${problem.number===297?'deserialize':'undefined'});const text=JSON.stringify(value);if(typeof text!=='string')throw new Error('Return a JSON-compatible value.');if(text.length>262144)throw new Error('Output exceeds 256 KiB.');return text;})()`,'judge.js');
    if(output!==undefined)actual=JSON.parse(output);
  }catch(e){error=controller.interrupted()?'Debugging exceeded 10 seconds of active execution. Paused time is excluded.':String(e).replace(/^Error: /,'').slice(0,8000);}
  finally{
    vm.dispose();
    // quickjs-emscripten 0.32 deletes the runtime callback registry before
    // JS_FreeRuntime collects cyclic closures. Keep its host-reference finalizer
    // registered until collection finishes. This module belongs to one session.
    const internals=runtime as any, callbacks=internals.callbacks;
    const remove=callbacks.deleteRuntime;let freed:number|undefined;
    callbacks.deleteRuntime=(pointer:number)=>{freed=pointer;};
    try{runtime.dispose();}finally{callbacks.deleteRuntime=remove;if(freed!==undefined)remove.call(callbacks,freed);}
  }
  return {actual,error,logs,durationMs:Math.round(controller.activeMs())};
}
