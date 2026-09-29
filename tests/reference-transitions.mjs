import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';

const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
try{
  await page.goto(pathToFileURL(path.join(ROOT,lessons.find(l=>l.number===26).path)).href);
  await page.waitForFunction(()=>window.studyWalkthrough);
  const result=await page.evaluate(async()=>{
    document.getElementById('custom-input').value='1,1,3';loadCustom();studyWalkthrough.setMode('compact');
    const observe=()=>({index:studyLessonSource.index(),line:studyWalkthrough.operation.location.line,phase:studyWalkthrough.operation.phase,caption:document.querySelector('.operation-caption').textContent,highlight:[...document.querySelectorAll('.operation-code')].map(el=>el.id),nums:[...studyLessonSource.read().nums],left:studyLessonSource.read().left});
    let pointer,copy;
    for(let i=0;i<50&&!document.getElementById('btn-next').disabled;i++){
      studyLessonAdapter.next();const state=observe();
      if(state.phase==='ADVANCE_LEFT')pointer=state;
      if(state.phase==='WRITE'){copy=state;break;}
    }
    if(!pointer||!copy)throw Error('The pointer and copy instructions were not reached.');
    studyLessonAdapter.previous();const backward=observe();
    studyWalkthrough.setMode('detailed');const detailed=observe();
    document.querySelector('.operation-controls button').click();
    const replayBefore={index:studyLessonSource.index(),nums:[...studyLessonSource.read().nums]};
    await studyWalkthrough.next();
    const replayAfter={index:studyLessonSource.index(),nums:[...studyLessonSource.read().nums]};
    studyWalkthrough.setMode('compact');await studyLessonAdapter.seek(0);await studyLessonAdapter.seek(pointer.index);const sought=observe();
    const transition=studyLessonAdapter.currentTransition();
    studyLessonAdapter.next();const copiedAgain=observe();
    return {pointer,copy,backward,detailed,replayBefore,replayAfter,sought,transition,copiedAgain};
  });
  assert.deepEqual(result.pointer.nums,[1,1,3]);assert.equal(result.pointer.left,1);assert.equal(result.pointer.line,6);
  assert.doesNotMatch(result.pointer.caption,/lastCompareEqual/,'the pointer explanation describes the algorithm rather than a simulator flag');
  assert.deepEqual(result.copy.nums,[1,3,3]);assert.equal(result.copy.line,7);
  for(const state of [result.backward,result.detailed,result.sought])assert.deepEqual(state,result.pointer,'the same committed state restores the same instruction and explanation');
  assert.deepEqual(result.replayAfter,result.replayBefore,'replaying a moment never executes the instruction twice');
  assert.equal(result.transition.instruction.line,6);assert.equal(result.transition.toIndex,result.pointer.index);
  assert.deepEqual(result.copiedAgain,result.copy,'a muted seek does not change the following copy operation');

  for(const [number,preset,expected] of [[33,3,0],[680,3,false]]){
    await page.goto(pathToFileURL(path.join(ROOT,lessons.find(l=>l.number===number).path)).href);
    const states=await page.evaluate(({number,preset})=>{
      if(number===33){document.getElementById('custom-input').value='[5,1,3]';document.getElementById('target-input').value='5';loadCustom();}
      else{document.getElementById('custom-input').value='abc';loadCustom();}
      const events=[];for(let i=0;i<100&&!document.getElementById('btn-next').disabled;i++){const pending=studyLessonSource.pendingInstruction();studyLessonAdapter.next();const t=studyLessonAdapter.currentTransition(),raw=studyLessonSource.read();events.push({phase:t.instruction.phase,line:t.instruction.line,pendingLine:pending.line,sortedHalf:raw.sortedHalf,leftResult:raw.leftResult});}
      return {events,answer:studyLessonSource.read().ans};
    },{number,preset});
    assert.equal(states.answer,expected);
    for(const event of states.events)assert.equal(event.line,event.pendingLine);
    if(number===33){assert.ok(states.events.some(e=>e.phase==='CHECK_RANGE'&&e.line===16));assert.ok(states.events.some(e=>e.phase==='MOVE_RIGHT'&&e.line===19));}
    else assert.ok(states.events.some(e=>e.phase==='SUB_LEFT_DONE'&&e.line===17&&e.leftResult===false));
  }
  assert.deepEqual(errors,[]);
  console.log('PASS committed instructions, Back/Seek/mode restoration, moment replay, muted history capture and alternate branches');
}finally{await browser.close();}
