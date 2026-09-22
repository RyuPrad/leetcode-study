import RELEASE_SYNC from '@jitl/quickjs-wasmfile-release-sync';
import wasmUrl from '@jitl/quickjs-wasmfile-release-sync/wasm?url';
import { newQuickJSWASMModuleFromVariant, newVariant } from 'quickjs-emscripten-core';
import definitions from '../../coding/problems.json';
import { judge } from '../../coding/engine';
import type { CodingProblem, JudgeJob, JudgeEvent } from '../../shared/coding';
const send = (event: JudgeEvent) => self.postMessage(event);
self.onmessage = async ({data:job}: MessageEvent<JudgeJob>) => {
  try {
    const problem = (definitions as CodingProblem[]).find(p=>p.id===job.problemId);
    if(!problem)throw new Error('Unknown problem.');
    const vm=await newQuickJSWASMModuleFromVariant(newVariant(RELEASE_SYNC,{wasmLocation:wasmUrl}));
    const cases=job.mode==='submit'?[...problem.examples,...problem.tests]:job.cases;
    send({type:'progress',jobId:job.jobId,completed:0,total:cases.length});
    const result=await judge(vm,problem,job.source,cases,completed=>send({type:'progress',jobId:job.jobId,completed,total:cases.length}));
    send({type:'result',jobId:job.jobId,result});
  }catch(error) {
    send({type:'result',jobId:job.jobId,result:{verdict:'Runtime error',passed:0,total:1,durationMs:0,cases:[{name:'Runner',input:[],verdict:'Runtime error',error:String(error).slice(0,8000),logs:[],durationMs:0}]}});
  }
};
