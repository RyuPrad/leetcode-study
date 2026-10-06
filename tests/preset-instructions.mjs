import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';

const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
const browser=await chromium.launch({headless:true});
const results=[],failures=[];let cursor=0;
async function worker(){
 const page=await browser.newPage({reducedMotion:'reduce'});
 while(cursor<lessons.length){
  const lesson=lessons[cursor++],errors=[];
  const onError=error=>errors.push(error.message);page.on('pageerror',onError);
  try{
   await page.goto(pathToFileURL(path.join(ROOT,lesson.path)).href);
   await page.waitForFunction(()=>window.studyLessonAdapter&&window.studyWalkthrough);
   const cases=await page.evaluate(async()=>{
    const source=studyLessonSource,adapter=studyLessonAdapter;
    const serialize=value=>JSON.stringify(value,(_,item)=>typeof item==='bigint'?String(item)+'n':item);
    const buttons=[...document.querySelectorAll('.study-input-popover button')].filter(button=>/^load(?:Example|Ex)\(/.test(button.getAttribute('onclick')||''));
    const cases=[];
    for(let preset=0;preset<buttons.length;preset++){
     buttons[preset].click();const visited=new Set();let count=0;
     if(source.spec.mode==='precomputed'){
      const total=source.count();if(!Number.isInteger(total)||total<2)throw Error('No executable preset');
      for(let index=1;index<total;index++){
       const state=source.readAt(index),line=state.executedLine;
       if(!Number.isInteger(line)||!document.getElementById('line-'+line)&&!document.getElementById('l'+line))throw Error(`Preset ${preset+1} state ${index}: missing instruction ${line}`);
       // Review the first occurrence of every source line through the real UI.
       if(!visited.has(line)){
        await adapter.seek(index);
        const op=studyWalkthrough.operation,painted=[...document.querySelectorAll('.operation-code')].map(element=>Number(element.id.match(/\d+/)?.[0]));
        if(op.location.line!==line||JSON.stringify(painted)!==JSON.stringify([line]))throw Error(`Preset ${preset+1} state ${index}: highlight differs from its executed instruction`);
        const before=serialize(source.read());studyWalkthrough.setMode('detailed');
        if(serialize(source.read())!==before||studyWalkthrough.operation.location.line!==line)throw Error('Mode switch changed the committed state');
        visited.add(line);
       }
      }
      await adapter.seek(total-1);count=total-1;
     }else{
      // Seek records every history instruction, including those between paints.
      await adapter.seek(50000);count=source.index();
      if(count>=50000)throw Error('Preset exceeded the explicit history test limit');
      for(let index=1;index<=count;index++){
       await adapter.seek(index);const transition=adapter.currentTransition(),op=studyWalkthrough.operation;
       if(!transition||transition.toIndex!==index||!Number.isInteger(transition.instruction.line)||op.location.line!==transition.instruction.line)throw Error(`Preset ${preset+1} state ${index}: journal instruction mismatch`);
       visited.add(transition.instruction.line);
      }
      await adapter.seek(count);
     }
     if(!document.getElementById('btn-next').disabled)throw Error(`Preset ${preset+1} did not finish`);
     cases.push({preset:preset+1,steps:count,lines:visited.size});
    }
    return cases;
   });
   assert.deepEqual(errors,[]);results.push({number:lesson.number,cases});
  }catch(error){failures.push({number:lesson.number,error:String(error)});console.log('FAIL',lesson.number,String(error));}
  finally{page.off('pageerror',onError);}
  if((results.length+failures.length)%25===0)console.log(`Presets ${results.length+failures.length}/${lessons.length}; ${failures.length} failures`);
 }
 await page.close();
}
try{await Promise.all(Array.from({length:3},worker));}finally{await browser.close();}
const summary={lessons:results.length,presets:results.reduce((n,result)=>n+result.cases.length,0),transitions:results.reduce((n,result)=>n+result.cases.reduce((sum,c)=>sum+c.steps,0),0),results,failures};
fs.writeFileSync(path.join(ROOT,'test-results/preset-instructions.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify({lessons:summary.lessons,presets:summary.presets,transitions:summary.transitions,failures},null,2));
if(failures.length)process.exitCode=1;
