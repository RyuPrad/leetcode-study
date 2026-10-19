import RELEASE_SYNC from '@jitl/quickjs-wasmfile-release-sync';
import wasmUrl from '@jitl/quickjs-wasmfile-release-sync/wasm?url';
import { newQuickJSWASMModuleFromVariant, newVariant } from 'quickjs-emscripten-core';
import definitions from '../../coding/problems.json';
import { compileFailure, expandCases, judge, referenceOutcomes } from '../../coding/engine';
import { stripTypes, TypeScriptSyntaxError } from '../../coding/typescript';
import type { CodingProblem, JudgeJob, JudgeEvent, JudgeResult } from '../../shared/coding';
import sqlWasm from 'sql.js/dist/sql-wasm.wasm?url';
const send = (event: JudgeEvent) => self.postMessage(event);
self.onmessage = async ({data:job}: MessageEvent<JudgeJob>) => {
  try {
    // Generated kits arrive with the job; hand-built kits are bundled.
    const problem = job.problem ?? (definitions as CodingProblem[]).find(p=>p.id===job.problemId);
    if(!problem)throw new Error('Unknown problem.');
    const quickjs=()=>newQuickJSWASMModuleFromVariant(newVariant(RELEASE_SYNC,{wasmLocation:wasmUrl}));
    // A generated kit's large tests are built from its generator here, before any language runs them.
    let cases=job.mode==='submit'?[...problem.examples,...problem.tests]:job.cases;
    if(cases.some(c=>c.generate))cases=expandCases(await quickjs(),problem,cases);
    // SQL problems run in SQLite; the engine loads only when one is judged.
    if(problem.kind==='sql'){
      const [{default:initSqlJs},{judgeSql}]=await Promise.all([import('sql.js'),import('../../coding/sql-engine')]);
      const SQL=await initSqlJs({locateFile:()=>sqlWasm});
      send({type:'result',jobId:job.jobId,result:judgeSql(SQL,problem,job.source,cases) as JudgeResult});
      return;
    }
    if(job.language==='java'||job.language==='c'){
      const vm=await quickjs();
      send({type:'references',jobId:job.jobId,cases,references:referenceOutcomes(vm,problem,job.source,cases)});
      return;
    }
    let source=job.source;
    if(job.language==='typescript')try{source=stripTypes(job.source);}catch(error){if(!(error instanceof TypeScriptSyntaxError))throw error;send({type:'result',jobId:job.jobId,result:compileFailure(error.message,cases.length)});return;}
    const vm=await quickjs();
    send({type:'progress',jobId:job.jobId,completed:0,total:cases.length});
    const result=await judge(vm,problem,source,cases,completed=>send({type:'progress',jobId:job.jobId,completed,total:cases.length}));
    send({type:'result',jobId:job.jobId,result});
  }catch(error) {
    send({type:'result',jobId:job.jobId,result:{verdict:'Runtime error',passed:0,total:1,durationMs:0,cases:[{name:'Runner',input:[],verdict:'Runtime error',error:String(error).slice(0,8000),logs:[],durationMs:0}]}});
  }
};
