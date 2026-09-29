import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';

const metadata=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
const lessons=['a','b'].flatMap(shard=>JSON.parse(fs.readFileSync(path.join(ROOT,`visualizer-ui/guided-content-${shard}.json`),'utf8')));
const cases=lessons.flatMap(lesson=>lesson.checkpoints.filter(cp=>cp.afterIndex-cp.beforeIndex>1).map(cp=>({lesson,cp})));
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(15000);
await page.clock.install();await page.clock.pauseAt(Date.now()+1000);
const index=frame=>frame.evaluate(()=>window.studyLessonSource.index());
async function ready(frame){
  const deadline=Date.now()+15000;
  while(!await frame.evaluate(()=>window.studyGuidedController?.progress&&!window.studyGuidedController.busy)){assert.ok(Date.now()<deadline,'guided controller becomes ready');await page.clock.runFor(1);}
}
async function seek(frame,target){
  await frame.evaluate(target=>{window.guidedTestSeek={done:false,error:null};Promise.resolve(window.studyLessonAdapter.seek(target)).then(()=>window.guidedTestSeek.done=true,error=>{window.guidedTestSeek.error=String(error);window.guidedTestSeek.done=true;});},target);
  const deadline=Date.now()+60000;
  while(!await frame.evaluate(()=>window.guidedTestSeek.done)){assert.ok(Date.now()<deadline,'guided seek finishes while yielding');await page.clock.runFor(1);}
  assert.equal(await frame.evaluate(()=>window.guidedTestSeek.error),null);await ready(frame);
}
async function fresh(number,mode='compact'){
  await page.goto(pathToFileURL(path.join(ROOT,metadata.find(item=>item.number===number).path)).href+'?guided=1&walkthrough='+mode);
  await ready(page);await page.getByLabel('Walkthrough detail').selectOption(mode);
}
async function answerAt(frame,checkpoint){
  await seek(frame,checkpoint.beforeIndex);
  await frame.locator(`.guided-choice[data-option-id="${checkpoint.correctOptionId}"]`).click();
}
async function prepare(frame,lesson,target){
  for(const cp of lesson.checkpoints){
    await answerAt(frame,cp);
    if(cp.id===target.id)return;
    await seek(frame,cp.afterIndex);
  }
}
async function advancePlayback(frame,checkpoint,mode){
  const maxTicks=(checkpoint.afterIndex-checkpoint.beforeIndex+2)*(mode==='detailed'?3:1);
  for(let tick=0;tick<maxTicks&&await index(frame)<checkpoint.afterIndex;tick++){
    const before=await index(frame);await page.clock.runFor(mode==='detailed'?2000:1000);await ready(frame);
    const after=await index(frame);assert.ok(after===before||after===before+1,'each playback tick commits at most one instruction');
  }
  assert.equal(await index(frame),checkpoint.afterIndex);
}
let origin;
const server=http.createServer((request,response)=>{
  const url=new URL(request.url,origin),relative=decodeURIComponent(url.pathname);
  if(relative==='/audit-parent'){
    const number=Number(url.searchParams.get('number')||1),file=metadata.find(item=>item.number===number).path;
    response.setHeader('Content-Type','text/html');response.end(`<script>window.auditSaved=null;addEventListener('message',event=>{if(event.source===document.querySelector('iframe')?.contentWindow&&event.data?.type==='guided:progress')window.auditSaved=event.data.progress;});</script><iframe src="${encodeURI(file)}?embedded=1&guided=1&session=guided-transition-test&parentOrigin=${encodeURIComponent(origin)}&walkthrough=compact"></iframe>`);return;
  }
  try{const file=path.join(ROOT,relative);response.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');response.end(fs.readFileSync(file));}
  catch{response.statusCode=404;response.end('Missing test resource');}
});
async function embedded(number,progress=null,active=true){
  await page.goto(origin+'/audit-parent?number='+number);
  const frame=await page.locator('iframe').elementHandle().then(element=>element.contentFrame());
  frame.on('pageerror',error=>errors.push(error.message));await frame.waitForFunction(()=>window.studyGuidedController);
  await message(number,'guided:init',{progress,active});await ready(frame);return frame;
}
function message(number,type,data={}){return page.evaluate(({number,type,data})=>document.querySelector('iframe').contentWindow.postMessage({type,session:'guided-transition-test',lessonId:`leetcode:${number}`,...data},location.origin),{number,type,data});}

try{
  let checked=0;
  for(const {lesson,cp}of cases)for(const mode of ['compact','detailed']){
    await fresh(Number(lesson.id.split(':')[1]),mode);await prepare(page,lesson,cp);
    await page.evaluate(()=>{window.auditIndices=[];window.auditDispose=window.studyLessonAdapter.subscribe(frame=>{if(window.auditIndices.at(-1)!==frame.index)window.auditIndices.push(frame.index);});});
    await page.getByRole('button',{name:'Watch the change',exact:true}).click();await advancePlayback(page,cp,mode);
    const sequence=await page.evaluate(()=>{window.auditDispose();return window.auditIndices;});
    assert.deepEqual(sequence,Array.from({length:cp.afterIndex-cp.beforeIndex},(_,i)=>cp.beforeIndex+i+1),`${lesson.id}/${cp.id}/${mode} shows every intermediate state`);
    assert.equal(await page.locator('.guided-explanation').innerText(),cp.explanation);
    assert.equal(await page.getByRole('button',{name:'Play',exact:true}).getAttribute('aria-pressed'),'false');checked++;
  }

  // The pointer and copy have different observable results, including after restoration.
  const removeDuplicates=lessons.find(lesson=>lesson.id==='leetcode:26'),copy=removeDuplicates.checkpoints.find(cp=>cp.id==='change');
  await fresh(26);await prepare(page,removeDuplicates,copy);
  const original=await page.evaluate(()=>structuredClone(window.studyLessonSource.read()));
  await page.getByRole('button',{name:'Watch the change',exact:true}).click();await page.clock.runFor(1000);await ready(page);
  const moved=await page.evaluate(()=>({raw:structuredClone(window.studyLessonSource.read()),progress:window.studyGuidedController.progress,lines:[...document.querySelectorAll('.operation-code')].map(el=>el.id)}));
  assert.equal(moved.raw.left,original.left+1);assert.deepEqual(moved.raw.nums,original.nums);assert.deepEqual(moved.lines,['line-6']);
  assert.equal(moved.progress.cursor,copy.beforeIndex+1);assert.ok(!moved.progress.completedAt);
  await page.getByRole('button',{name:'Pause',exact:true}).click();await page.clock.runFor(10000);assert.equal(await index(page),moved.progress.cursor);
  await page.getByRole('button',{name:'Previous step',exact:true}).click();await ready(page);assert.equal(await index(page),copy.beforeIndex);
  assert.deepEqual((await page.evaluate(()=>window.studyGuidedController.progress)).answers,moved.progress.answers);
  await page.getByRole('button',{name:'Next step',exact:true}).click();await ready(page);assert.equal(await index(page),copy.beforeIndex+1);
  await page.getByRole('button',{name:'Next step',exact:true}).click();await ready(page);assert.equal(await index(page),copy.afterIndex);
  assert.equal(await page.locator('.guided-explanation').innerText(),copy.explanation);
  assert.deepEqual(await page.locator('.operation-code').evaluateAll(elements=>elements.map(el=>el.id)),['line-7']);

  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin=`http://127.0.0.1:${server.address().port}`;
  let frame=await embedded(26,moved.progress,false);assert.equal(await index(frame),moved.progress.cursor);
  assert.equal(await frame.getByRole('button',{name:'Play',exact:true}).getAttribute('aria-pressed'),'false');
  await message(26,'guided:active',{active:true});await frame.getByRole('button',{name:'Play',exact:true}).waitFor({state:'visible'});
  await frame.getByRole('button',{name:'Next step',exact:true}).click();await ready(frame);
  assert.equal(await index(frame),copy.afterIndex);assert.equal(await frame.locator('.guided-explanation').innerText(),copy.explanation);
  await page.waitForFunction(cursor=>window.auditSaved?.cursor===cursor,copy.afterIndex);
  const restored=await page.evaluate(()=>window.auditSaved);assert.equal(restored.runId,moved.progress.runId);assert.deepEqual(restored.answers,moved.progress.answers);

  frame=await embedded(1,null,false);assert.ok(await frame.getByRole('button',{name:'Play',exact:true}).isDisabled());
  await message(1,'guided:active',{active:true});await frame.getByLabel('Walkthrough detail').selectOption('detailed');
  assert.ok(await frame.getByRole('button',{name:'Next moment',exact:true}).isEnabled());
  await frame.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(2000);assert.equal(await index(frame),0);
  await message(1,'guided:active',{active:false});await frame.getByRole('button',{name:'Play',exact:true}).waitFor({state:'visible'});
  await page.clock.runFor(10000);assert.equal(await index(frame),0);assert.equal(await frame.evaluate(()=>window.studyWalkthrough.stage),1);
  await message(1,'guided:active',{active:true});await frame.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(2000);await ready(frame);assert.equal(await index(frame),1);

  const completedAt='2026-09-24T12:00:00.000Z',outdated={...moved.progress,lessonVersion:removeDuplicates.version+1,completedAt};
  frame=await embedded(26,outdated);const updated=await frame.evaluate(()=>window.studyGuidedController.progress);
  assert.equal(updated.lessonVersion,removeDuplicates.version);assert.equal(updated.cursor,0);assert.deepEqual(updated.answers,{});
  assert.deepEqual(updated.previousCompletion,{lessonVersion:outdated.lessonVersion,completedAt});assert.notEqual(updated.runId,outdated.runId);
  assert.deepEqual(errors,[]);
  const result={passed:true,multiIndexCheckpoints:cases.length,modeCases:checked,checks:['every intermediate reveal state','separate pointer/copy changes','pause/back/manual step','mid-reveal save/reopen','inactive initialization and activation','tab-away and resume','changed-version completion preservation']};
  fs.writeFileSync(path.join(ROOT,'test-results/guided-transitions.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await browser.close();if(server.listening)await new Promise(resolve=>server.close(resolve));}
