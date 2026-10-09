import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs';
import {chromium} from 'playwright';
import {ROOT,collectCatalog} from '../scripts/content.mjs';
const histories=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'))).filter(l=>{
 const html=fs.readFileSync(path.join(ROOT,l.path),'utf8');return html.includes('function preview(index)');
});
const browser=await chromium.launch();const page=await browser.newPage();let transitions=0,previews=0;
try{
 for(const lesson of histories){
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.join(ROOT,lesson.path)).href);
  await page.waitForFunction(()=>window.studyLessonSource?.pendingInstruction&&window.studyLessonAdapter);
  const result=await page.evaluate(()=>{
   const source=studyLessonSource,failures=[],lines=[],phases=[];let steps=0;
   const raw=()=>JSON.stringify(source.read());
   while(source.pendingInstruction()&&steps++<2000){
    const before=raw(),index=source.index(),diagram=document.querySelector('#visual-ui,#lists-ui,#svg,#lists');
    const beforeDom=diagram.outerHTML,beforeView=source.preview(index).outerHTML,instruction=source.pendingInstruction(),again=source.pendingInstruction();
    if(JSON.stringify(instruction)!==JSON.stringify(again)||raw()!==before||source.index()!==index||diagram.outerHTML!==beforeDom) failures.push('Impure pending selector at '+index);
    if(!Number.isInteger(instruction.line)||!document.getElementById('line-'+instruction.line)&&!document.getElementById('l'+instruction.line))failures.push('Missing source line '+JSON.stringify(instruction));
    lines.push(instruction.line);phases.push(instruction.phase);
    studyLessonAdapter.next();const after=raw();
    if(steps%5===0){
     const afterDiagram=document.querySelector('#visual-ui,#lists-ui,#svg,#lists').outerHTML;
     const preview=source.preview(index);
     if(!preview||preview.outerHTML!==beforeView) failures.push('Wrong before diagram at '+index);
     if(raw()!==after||source.index()!==index+1||document.querySelector('#visual-ui,#lists-ui,#svg,#lists').outerHTML!==afterDiagram)failures.push('Preview changed live state at '+index);
     studyLessonAdapter.previous();if(raw()!==before)failures.push('Back changed state at '+index);
     studyLessonAdapter.next();if(raw()!==after)failures.push('Replay changed state at '+index);
    }
   }
   if(steps>=2000)failures.push('Did not terminate');
   if(!document.getElementById('btn-next').disabled)failures.push('Null instruction before completion');
   return{failures,lines,phases,steps,raw:source.read()};
  });
  assert.deepEqual(errors,[],`${lesson.number}: browser errors`);assert.deepEqual(result.failures,[],`${lesson.number}: state and preview invariants`);
  const setup={437:[2,3,4,22],2:[1,2,3,4],3:[2,3,4],11:[2,3,4],15:[2,3],21:[2,3],26:[2,3],33:[2,3],34:[7,8],35:[7,8],69:[2,3,4],74:[2,3,4,5],81:[2,3],88:[2,3,4],121:[2,3],125:[2,3],141:[2,3,5],143:[1,2,3,4],153:[2,3],167:[2,3],169:[2,3],206:[2,3],209:[2,3,4],344:[2,3],374:[2,3],410:[2,3,4],424:[2,3,4,5],567:[1,2,3,4,5,6],658:[2,3],680:[2,3],704:[7,8],875:[2,3,4],881:[2,3,4,5],1011:[2,3,4],1768:[2,3,4]};
  if(setup[lesson.number])assert.deepEqual(result.lines.slice(0,setup[lesson.number].length),setup[lesson.number],`${lesson.number}: source-order setup`);
  transitions+=result.steps;previews+=Math.floor(result.steps/5);page.removeAllListeners('pageerror');
 }

 for(const n of [1,2,5]){
  await page.goto(pathToFileURL(path.join(ROOT,histories.find(l=>l.number===19).path)).href);
  await page.waitForFunction(()=>window.studyLessonAdapter);
  const removal=await page.evaluate(n=>{
   window.alert=()=>{};document.getElementById('custom-input').value='4,4,4,4,4 | '+n;loadCustom();
   while(studyLessonSource.pendingInstruction()?.phase!=='REMOVE')studyLessonAdapter.next();
   const before=studyLessonSource.read(),head=before.head.id,slow=before.slow.id,fast=before.fast.id,removed=before.slow.next,successor=before.nodes.find(node=>node.id===removed).nextId,heap=before.nodes.map(node=>node.id);
   studyLessonAdapter.next();const after=studyLessonSource.read();
   return{before:{head,slow,fast,removed,successor,heap},after:{head:after.head.id,slow:after.slow.id,fast:after.fast.id,next:after.slow.next,heap:after.nodes.map(node=>node.id),ans:after.ans},caption:document.querySelector('.operation-caption').textContent,diagram:document.querySelector('#visual-ui').textContent};
  },n);
  assert.deepEqual(removal.after.heap,removal.before.heap,'removal keeps the node heap and IDs stable');
  assert.equal(removal.after.fast,removal.before.fast,'fast keeps its reference even when the removed node is the tail');
  assert.equal(removal.after.head,removal.before.head,'the original head argument keeps its identity after head removal');assert.equal(removal.after.slow,removal.before.slow);assert.equal(removal.after.next,removal.before.successor);
  assert.deepEqual(removal.after.ans,[4,4,4,4]);assert.match(removal.caption,/Bypassed node/);
  if(n===1)assert.match(removal.diagram,/fast/,'the detached tail still displays its fast reference');
 }
 for(const input of ['1 | 3','1,2,3 | 3']){
  await page.goto(pathToFileURL(path.join(ROOT,histories.find(l=>l.number===881).path)).href);
  await page.waitForFunction(()=>window.studyLessonAdapter);
  const comparisons=await page.evaluate(input=>{
   window.alert=()=>{};document.getElementById('custom-input').value=input;loadCustom();const proposals=[];
   while(studyLessonSource.pendingInstruction()){
    const phase=studyLessonSource.pendingInstruction().phase,before=studyLessonSource.read(),count=before.boats,boarded=[...before.boardedIndices];studyLessonAdapter.next();const raw=studyLessonSource.read();
    if(phase==='COMPARE')proposals.push({count,boarded,beforeSingleton:before.left===before.right,boats:raw.boats,afterBoarded:[...raw.boardedIndices],boat:JSON.parse(JSON.stringify(raw.lastBoat))});
   }
   return proposals;
  },input);
  for(const proposal of comparisons){assert.equal(proposal.boats,proposal.count,'a comparison does not dispatch a boat');assert.deepEqual(proposal.afterBoarded,proposal.boarded,'a comparison does not board passengers');assert.equal(proposal.boat.dispatched,false);assert.equal(new Set(proposal.boat.passengers).size,proposal.boat.passengers.length,'one person cannot occupy two passenger slots');if(proposal.beforeSingleton){assert.equal(proposal.boat.passengers.length,1);assert.equal(proposal.boat.total,proposal.boat.lw,'a singleton boat has one passenger weight');}}
 }
 for(const id of [15,881]){await page.goto(pathToFileURL(path.join(ROOT,histories.find(l=>l.number===id).path)).href);await page.waitForFunction(()=>window.studyLessonAdapter);const sortStep=await page.evaluate(id=>{const input=id===15?'3,1,2':'3,1,2 | 4';document.getElementById('custom-input').value=input;loadCustom();const value=()=>[...(id===15?studyLessonSource.read().nums:studyLessonSource.read().people)],before=value();studyLessonAdapter.next();const after=value();studyLessonAdapter.previous();const back=value();init();return{before,after,back,reset:value()};},id);assert.deepEqual(sortStep,{before:[3,1,2],after:[1,2,3],back:[3,1,2],reset:[3,1,2]},`${id}: sorting commits only at its source line and resets to the supplied input`);}
 console.log(`Validated ${histories.length} histories: ${transitions} transitions, ${previews} pure snapshot previews and Back/replay checks.`);
}finally{await browser.close();}
