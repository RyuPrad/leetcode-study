import RELEASE_SYNC from '@jitl/quickjs-wasmfile-release-sync';
import wasmUrl from '@jitl/quickjs-wasmfile-release-sync/wasm?url';
import { newQuickJSWASMModuleFromVariant, newVariant } from 'quickjs-emscripten-core';
import definitions from '../../coding/problems.json';
import { compileFailure, judge, referenceOutcomes } from '../../coding/engine';
import { stripTypes, TypeScriptSyntaxError } from '../../coding/typescript';
import type { CodingProblem, JudgeJob, JudgeEvent } from '../../shared/coding';
const send = (event: JudgeEvent) => self.postMessage(event);
self.onmessage = async ({data:job}: MessageEvent<JudgeJob>) => {
  try {
    const problem = (definitions as CodingProblem[]).find(p=>p.id===job.problemId);
    if(!problem)throw new Error('Unknown problem.');
    if(job.language==='java'||job.language==='c'){
      const vm=await newQuickJSWASMModuleFromVariant(newVariant(RELEASE_SYNC,{wasmLocation:wasmUrl}));
      const cases=job.mode==='submit'?[...problem.examples,...problem.tests]:job.cases;
      send({type:'references',jobId:job.jobId,cases,references:referenceOutcomes(vm,problem,job.source,cases)});
      return;
    }
    let source=job.source;
    if(job.language==='typescript')try{source=stripTypes(job.source);}catch(error){if(!(error instanceof TypeScriptSyntaxError))throw error;send({type:'result',jobId:job.jobId,result:compileFailure(error.message,job.mode==='submit'?problem.examples.length+problem.tests.length:job.cases.length)});return;}
    const vm=await newQuickJSWASMModuleFromVariant(newVariant(RELEASE_SYNC,{wasmLocation:wasmUrl}));
    const cases=job.mode==='submit'?[...problem.examples,...problem.tests]:job.cases;
    send({type:'progress',jobId:job.jobId,completed:0,total:cases.length});
    const result=await judge(vm,problem,source,cases,completed=>send({type:'progress',jobId:job.jobId,completed,total:cases.length}));
    send({type:'result',jobId:job.jobId,result});
  }catch(error) {
    send({type:'result',jobId:job.jobId,result:{verdict:'Runtime error',passed:0,total:1,durationMs:0,cases:[{name:'Runner',input:[],verdict:'Runtime error',error:String(error).slice(0,8000),logs:[],durationMs:0}]}});
  }
};
