import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';

const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
const browser=await chromium.launch({headless:true}),reports=[];
try{
  const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const number of [48,912,973]){
    await page.goto(pathToFileURL(path.join(ROOT,lessons.find(lesson=>lesson.number===number).path)).href);await page.waitForFunction(()=>window.studyLessonAdapter);
    const result=await page.evaluate(number=>{
      const source=studyLessonSource,live=JSON.stringify(StudyObjectView.capture(source.read())),start=source.index();
      const assert=(condition,message)=>{if(!condition)throw Error(message);};
      const get=(frame,name)=>frame.stack.flatMap(call=>call.variables).find(variable=>variable.name===name)?.value;
      let active=0,pop=0,uninitialized=0;
      for(let index=0;index<source.count();index++){
        const raw=source.readAt(index),frame=source.objectFrame(index),repeated=source.objectFrame(index);
        assert(JSON.stringify(frame)===JSON.stringify(repeated),'Pure repeat changed the object frame');
        assert(!Object.hasOwn(raw,'objectLocals'),'Supplemental capture leaked into existing lesson reads');
        if(number===48){
          if(raw.phase==='transpose'){assert(get(frame,'temp')===(raw.swapDone?raw.grid[raw.j][raw.i]:raw.grid[raw.i][raw.j]),'Transpose temp must keep the original swapped value');active++;}
          else assert(get(frame,'temp')===undefined,'Transpose temp must be absent outside its block');
        }else if(number===912){
          if(raw.executedLine===12||raw.executedLine===13){assert(get(frame,'k')===(raw.k??raw.temp.length),'Merge writeback k is the captured counter');active++;}
          else assert(get(frame,'k')===undefined,'Merge k must be absent outside the writeback loop');
          if(![3,4,5,6,7,8,10,11,12,13].includes(raw.executedLine))for(const name of ['i','j','temp'])assert(get(frame,name)===undefined,'Inactive merge helper local '+name+' must be absent');
        }else if(number===973){
          if(raw.phase==='push'){
            assert(get(frame,'i')===undefined,'The pop counter must be absent during pushes');
            if(raw.pt){assert(get(frame,'x')===raw.pt[1]&&get(frame,'y')===raw.pt[2],'Push coordinates are tuple coordinates, never squared distance');active++;}
          }
          if(raw.phase==='pop'&&[7,8,9].includes(raw.executedLine)){
            const i=get(frame,'i');assert(Number.isInteger(i),'Active pop iteration must expose its counter');
            if(raw.executedLine===9){const point=raw.res.at(-1);assert(get(frame,'x')===point[0]&&get(frame,'y')===point[1],'Destructured popped coordinates must match the appended point');assert(get(frame,'dist')===point[0]**2+point[1]**2,'Destructured popped distance is accurate');pop++;}
            else {assert(get(frame,'x')?.special==='not initialized','Pop result binding stays uninitialized while the call runs');uninitialized++;}
          }
          if(raw.phase==='done')for(const name of ['i','dist','x','y'])assert(get(frame,name)===undefined,'Completed pop-loop locals must be absent');
        }
      }
      assert(source.index()===start&&JSON.stringify(StudyObjectView.capture(source.read()))===live,'Pure supplemental projections changed the live lesson');
      assert(active>0,'Relevant local checkpoints were tested');if(number===973)assert(pop>0&&uninitialized>0,'Pop boundaries were tested');
      return {number,checkpoints:source.count(),active,pop,uninitialized};
    },number);reports.push(result);
  }
  assert.deepEqual(errors,[]);await page.close();
  fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});fs.writeFileSync(path.join(ROOT,'test-results/object-view-locals.json'),JSON.stringify({passed:true,reports},null,2));
  console.log('PASS source-owned temp, merge writeback and popped-coordinate locals without changing lesson reads or navigation');
}finally{await browser.close();}
