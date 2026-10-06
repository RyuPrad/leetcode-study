import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';
import {testSingleLineHighlights} from './single-line-highlights.mjs';
const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
const browser=await chromium.launch({headless:true}),failures=[];let cursor=0,checked=0,steps=0;
async function worker(){const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});while(cursor<lessons.length){const lesson=lessons[cursor++],errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);try{
 await page.goto(pathToFileURL(path.join(ROOT,lesson.path)).href);await page.waitForFunction(()=>window.studyWalkthrough);
 const result=await page.evaluate(async()=>{
  const a=studyLessonAdapter,w=studyWalkthrough,s=studyLessonSource;let count=0;
  while(!document.getElementById('btn-next').disabled&&count<(s.count()??50000)){
   const instruction=s.pendingInstruction?.()||{line:s.readAt(s.index()+1).executedLine};
   const phase=instruction.phase;
   const prior=s.index();a.next();if(s.index()===prior)throw Error('No progress');if(!w.operation.kind||!w.operation.result||!Number.isInteger(w.operation.location.line))throw Error('Incomplete operation');
   const expected=[instruction.line];
   const locations=w.operation.locations||[w.operation.location.line];if(locations.length!==1)throw Error(`Operation ${phase} highlights ${locations.length} source lines`);
   const actual=[...document.querySelectorAll('.operation-code')].map(el=>Number(el.id.match(/\d+/)?.[0])).sort((x,y)=>x-y),want=[...new Set(expected.map(Number))].sort((x,y)=>x-y),reported=[...new Set(locations.map(Number))].sort((x,y)=>x-y);
   if(JSON.stringify(actual)!==JSON.stringify(want)||JSON.stringify(reported)!==JSON.stringify(want))throw Error(`Wrong code highlight for ${phase}: expected ${want}, operation ${reported}, rendered ${actual}`);
   for(const n of want){const line=document.getElementById(`line-${n}`)||document.getElementById(`l${n}`);if(!line||getComputedStyle(line).backgroundColor!=='rgb(39, 73, 108)')throw Error(`Operation source highlight ${n} is not visible`);}
   count++;
  }
  return {count,complete:document.getElementById('btn-next').disabled};
 });
 assert.ok(result.complete,'whole walkthrough reaches completion');steps+=result.count;assert.deepEqual(errors,[]);checked++;
 }catch(error){failures.push({number:lesson.number,error:String(error)});console.log('FAIL',lesson.number,String(error));}finally{page.off('pageerror',onError);}if((checked+failures.length)%25===0)console.log(`Operations ${checked+failures.length}/${lessons.length}; ${steps} transitions; ${failures.length} failures`);}await page.close();}
try{await Promise.all(Array.from({length:4},worker));
 const removeDuplicates=await browser.newPage();await removeDuplicates.goto(pathToFileURL(path.join(ROOT,lessons.find(l=>l.number===26).path)).href);await removeDuplicates.waitForFunction(()=>window.studyWalkthrough);
 const writeTrace=await removeDuplicates.evaluate(()=>{document.getElementById('custom-input').value='1,1,3';window.loadCustom();const events=[];for(let count=0;count<30&&!document.getElementById('btn-next').disabled;count++){studyLessonAdapter.next();const op=studyWalkthrough.operation,raw=studyLessonSource.read();if(['COMPARE','ADVANCE_LEFT','WRITE'].includes(op.phase))events.push({phase:op.phase,line:op.location.line,locations:op.locations,code:op.code,kind:op.kind,highlight:[...document.querySelectorAll('.operation-code')].map(el=>el.id),left:raw.left,right:raw.right,equal:raw.lastCompareEqual,nums:raw.nums});}return events;});
 assert.ok(writeTrace.some(event=>event.phase==='ADVANCE_LEFT'&&event.line===6&&JSON.stringify(event.locations)==='[6]'&&event.highlight.join(',')==='line-6'&&event.code==='left++;'&&event.left===1),'left advances in its own highlighted step');
 assert.ok(writeTrace.some(event=>event.phase==='WRITE'&&event.line===7&&JSON.stringify(event.locations)==='[7]'&&event.kind==='copy'&&event.highlight.join(',')==='line-7'&&event.code==='nums[left] = nums[right];'&&event.left===1&&event.nums[1]===3),'copy is shown separately after the left pointer advances');
 assert.ok(writeTrace.findIndex(event=>event.phase==='WRITE')>writeTrace.findIndex(event=>event.phase==='ADVANCE_LEFT'),'left increment precedes the array copy');
 assert.ok(writeTrace.some(event=>event.phase==='COMPARE'&&event.line===5&&JSON.stringify(event.locations)==='[5]'&&event.right===1&&event.equal===true&&event.highlight.join(',')==='line-5'),'duplicate comparison highlights only the comparison line');
 await testSingleLineHighlights(removeDuplicates);
 await removeDuplicates.close();
 const permutation=await browser.newPage();await permutation.goto(pathToFileURL(path.join(ROOT,lessons.find(l=>l.number===567).path)).href);await permutation.waitForFunction(()=>window.studyWalkthrough);
 for(const [input,expected]of [['ab | eidbaooo',true],['ab | eidboaoo',false],['adc | dcda',true],['abc | ba',false],['aab | caba',true]]){
  const result=await permutation.evaluate(input=>{document.getElementById('custom-input').value=input;window.loadCustom();let removed=0;for(let i=0;i<1000&&!document.getElementById('btn-next').disabled;i++){studyLessonAdapter.next();const raw=studyLessonSource.read(),op=studyWalkthrough.operation;if(Object.hasOwn(raw.windowMap,'undefined')||Object.values(raw.windowMap).some(n=>!Number.isFinite(n)))throw Error('The leaving character was lost between its individual steps');if(op.phase==='REMOVE_LEFT_COUNT'){if(raw.leavingIndex!==raw.left)throw Error('Decrement must retain the leaving index until left advances');removed++;}}return {answer:studyLessonSource.read().ans,complete:document.getElementById('btn-next').disabled,removed};},input);
  assert.equal(result.complete,true);assert.equal(result.answer,expected,`separate frequency updates preserve the permutation result for ${input}`);if(input==='ab | eidbaooo')assert.equal(result.removed,3);
 }
 await permutation.close();
 const twoSum=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await twoSum.goto(pathToFileURL(path.join(ROOT,lessons.find(l=>l.number===1).path)).href);await twoSum.waitForFunction(()=>window.studyWalkthrough);
 await twoSum.evaluate(async()=>{await studyLessonAdapter.seek(4);if(studyWalkthrough.operation.phase!=='COMPUTE_NEEDED'||studyWalkthrough.operation.location.line!==6)throw Error('Seek did not restore the committed calculation');await studyWalkthrough.next();});assert.equal(await twoSum.locator('.study-transfer').count(),0);assert.match(await twoSum.locator('.operation-caption').innerText(),/Look for number 7/);assert.match(await twoSum.locator('.formula-piece').last().innerText(),/not checked/);
 await twoSum.getByRole('button',{name:'Next moment',exact:true}).click();assert.equal(await twoSum.evaluate(()=>studyLessonSource.index()),4);await twoSum.getByRole('button',{name:'Next moment',exact:true}).click();assert.equal(await twoSum.evaluate(()=>studyLessonSource.index()),5);assert.match(await twoSum.locator('.operation-caption').innerText(),/Not found/);assert.equal(await twoSum.locator('.study-transfer').count(),0);
 await twoSum.getByRole('button',{name:'Previous moment',exact:true}).click();await twoSum.getByRole('button',{name:'Next moment',exact:true}).click();assert.equal(await twoSum.evaluate(()=>studyLessonSource.index()),5,'replaying a moment never executes twice');
 await twoSum.evaluate(()=>studyLessonAdapter.next());await twoSum.waitForFunction(()=>document.querySelector('.study-transfer'));assert.match(await twoSum.locator('.operation-link-label').textContent(),/Store 2; index 0/);
 await twoSum.evaluate(async()=>{await studyLessonAdapter.seek(10);await studyWalkthrough.next();});await twoSum.getByRole('button',{name:'Next moment',exact:true}).click();await twoSum.getByRole('button',{name:'Next moment',exact:true}).click();assert.match(await twoSum.locator('.operation-caption').innerText(),/Found number 2/);assert.equal(await twoSum.locator('.study-transfer').count(),0);
 await twoSum.getByRole('button',{name:'Previous moment',exact:true}).click();await twoSum.evaluate(()=>studyLessonAdapter.seek(3));assert.ok(await twoSum.locator('[data-study-key="cell:1"]').isVisible(),'whole-step navigation restores live entity identities after moment review');
 await twoSum.screenshot({path:path.join(ROOT,'test-results/operations-result.png')});await twoSum.close();
}catch(error){failures.push({case:'Two Sum moments',error:String(error)});}finally{await browser.close();}
const result={lessons:checked,transitions:steps,failures};fs.writeFileSync(path.join(ROOT,'test-results/operations.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(failures.length)process.exitCode=1;
