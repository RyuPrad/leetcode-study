import fs from 'node:fs';
import assert from 'node:assert/strict';
import { newQuickJSAsyncWASMModule, getQuickJS } from 'quickjs-emscripten';
import definitions from '../coding/problems.json';
import type { CodingProblem } from '../shared/coding';
import { debugEvaluate, DebugController } from '../coding/debug-engine';
import { evaluate } from '../coding/engine';
const module=await newQuickJSAsyncWASMModule(),sync=await getQuickJS();
const failures:{number:number;name:string;error:string}[]=[],full=process.argv.includes('--full');
let checked=0,problemCount=0;
const numbers=process.argv.filter(arg=>/^\d+$/.test(arg)).map(Number);
for(const problem of (definitions as CodingProblem[]).filter(p=>!numbers.length||numbers.includes(p.number))){
  for(const test of full?[...problem.examples,...problem.tests]:problem.examples.slice(0,1)){
    let controller:DebugController;
    const hooks={started:()=>{},running:()=>{},frame:()=>queueMicrotask(()=>controller.command('continue'))};
    controller=new DebugController(hooks);
    try{
      const actual=await debugEvaluate(module,problem,problem.reference,test,controller,hooks);
      const expected=evaluate(sync,problem,problem.reference,test.input);
      assert.equal(actual.error,undefined);assert.equal(expected.error,undefined);assert.deepEqual(actual.actual,expected.actual);
    }catch(error){failures.push({number:problem.number,name:test.name,error:String(error)});}
    checked++;
  }
  problemCount++;
  if(problemCount%25===0)console.log(`Debug parity: ${problemCount}/255 problems, ${checked} cases, ${failures.length} failures`);
}
fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync(`test-results/debug-parity${full?'-full':''}.json`,JSON.stringify({checked,problemCount,failures},null,2));
console.log(JSON.stringify({checked,problemCount,failures},null,2));if(failures.length)process.exitCode=1;
