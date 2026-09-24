import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';
const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
const browser=await chromium.launch({headless:true}),failures=[];let cursor=0,checked=0,steps=0;
async function worker(){const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});while(cursor<lessons.length){const lesson=lessons[cursor++],errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);try{
 await page.goto(pathToFileURL(path.join(ROOT,lesson.path)).href);await page.waitForFunction(()=>window.studyWalkthrough);
 const result=await page.evaluate(async()=>{
  const a=studyLessonAdapter,w=studyWalkthrough,s=studyLessonSource,rules=window.studyOperationRules.find(r=>r.id===`leetcode:${s.spec.number}`),observedPhaseLines={};let count=0;
  while(!document.getElementById('btn-next').disabled&&count<3000){
   const frame=a.snapshot(),raw=s.read(),phase=raw.execState||frame.phase,normalized=String(phase).replace(/_/g,' '),mapped=rules.phases?.[phase]??rules.phases?.[normalized]??rules.phases?.[frame.phase];
   if(s.spec.mode==='history'&&phase){const observed=observedPhaseLines[String(phase)]||=new Set();observed.add(Number(frame.location.line));}
   const prior=s.index();a.next();if(s.index()===prior)throw Error('No progress');if(!w.operation.kind||!w.operation.result||!Number.isInteger(w.operation.location.line))throw Error('Incomplete operation');
   const expected=s.spec.mode==='history'?(Array.isArray(mapped)?mapped.map(Number):mapped!==undefined&&mapped!==null&&Number.isInteger(Number(mapped))?[Number(mapped)]:[frame.location.line]):w.operation.locations||[w.operation.location.line];
   const actual=[...document.querySelectorAll('.operation-code')].map(el=>Number(el.id.match(/\d+/)?.[0])).sort((x,y)=>x-y),want=[...new Set(expected.map(Number))].sort((x,y)=>x-y),reported=[...new Set((w.operation.locations||[w.operation.location.line]).map(Number))].sort((x,y)=>x-y);
   if(JSON.stringify(actual)!==JSON.stringify(want)||JSON.stringify(reported)!==JSON.stringify(want))throw Error(`Wrong code highlight for ${phase}: expected ${want}, operation ${reported}, rendered ${actual}`);
   for(const n of want){const line=document.getElementById(`line-${n}`)||document.getElementById(`l${n}`);if(!line||getComputedStyle(line).backgroundColor!=='rgb(39, 73, 108)')throw Error(`Operation source highlight ${n} is not visible`);}
   count++;
  }
  if(s.spec.mode==='history')for(const [phase,observed]of Object.entries(observedPhaseLines)){const mapped=rules.phases?.[phase]??rules.phases?.[phase.replace(/_/g,' ')];if(Array.isArray(mapped)){const configured=new Set(mapped.map(Number));if([...observed].some(line=>!configured.has(line)))throw Error(`Phase ${phase} omits a traced line ${[...observed].filter(line=>!configured.has(line))}`);}else if(mapped!==undefined&&mapped!==null&&Number.isInteger(Number(mapped))&&(observed.size!==1||!observed.has(Number(mapped))))throw Error(`Ambiguous phase ${phase} must use the current trace location: ${[...observed]} vs ${mapped}`);}
  return {count,complete:document.getElementById('btn-next').disabled};
 });
 assert.ok(result.complete,'whole walkthrough reaches completion');steps+=result.count;assert.deepEqual(errors,[]);checked++;
 }catch(error){failures.push({number:lesson.number,error:String(error)});console.log('FAIL',lesson.number,String(error));}finally{page.off('pageerror',onError);}if((checked+failures.length)%25===0)console.log(`Operations ${checked+failures.length}/250; ${steps} transitions; ${failures.length} failures`);}await page.close();}
try{await Promise.all(Array.from({length:4},worker));
 const removeDuplicates=await browser.newPage();await removeDuplicates.goto(pathToFileURL(path.join(ROOT,lessons.find(l=>l.number===26).path)).href);await removeDuplicates.waitForFunction(()=>window.studyWalkthrough);
 const writeTrace=await removeDuplicates.evaluate(()=>{document.getElementById('custom-input').value='1,2,2';window.loadCustom();const events=[];for(let count=0;count<30&&!document.getElementById('btn-next').disabled;count++){studyLessonAdapter.next();const op=studyWalkthrough.operation,raw=studyLessonSource.read();if(op.phase==='COMPARE'||op.phase==='WRITE')events.push({phase:op.phase,line:op.location.line,locations:op.locations,code:op.code,kind:op.kind,highlight:[...document.querySelectorAll('.operation-code')].map(el=>el.id),right:raw.right,equal:raw.lastCompareEqual});}return events;});
 assert.ok(writeTrace.some(event=>event.phase==='WRITE'&&event.line===7&&JSON.stringify(event.locations)==='[6,7]'&&event.kind==='copy'&&event.highlight.join(',')==='line-6,line-7'&&event.code==='left++;\nnums[left] = nums[right];'),'array write highlights the index advance and copy together');
 assert.ok(writeTrace.some(event=>event.phase==='COMPARE'&&event.line===5&&JSON.stringify(event.locations)==='[5]'&&event.right===2&&event.equal===true&&event.highlight.join(',')==='line-5'),'duplicate comparison highlights only its comparison line');
 await removeDuplicates.close();
 const page=await browser.newPage();await page.goto(pathToFileURL(path.join(ROOT,lessons.find(l=>l.number===1).path)).href);await page.waitForFunction(()=>window.studyWalkthrough);
 await page.evaluate(()=>studyLessonAdapter.seek(4));assert.equal(await page.locator('.study-transfer').count(),0);assert.match(await page.locator('.operation-caption').innerText(),/Look for number 7/);assert.match(await page.locator('.formula-piece').last().innerText(),/not checked/);
 await page.getByRole('button',{name:'Next moment',exact:true}).click();assert.equal(await page.evaluate(()=>studyLessonSource.index()),4);await page.getByRole('button',{name:'Next moment',exact:true}).click();assert.equal(await page.evaluate(()=>studyLessonSource.index()),5);assert.match(await page.locator('.operation-caption').innerText(),/Not found/);assert.equal(await page.locator('.study-transfer').count(),0);
 await page.getByRole('button',{name:'Previous moment',exact:true}).click();await page.getByRole('button',{name:'Next moment',exact:true}).click();assert.equal(await page.evaluate(()=>studyLessonSource.index()),5,'replaying a moment never executes twice');
 await page.evaluate(()=>studyLessonAdapter.next());await page.waitForFunction(()=>document.querySelector('.study-transfer'));assert.match(await page.locator('.operation-link-label').textContent(),/Store 2; index 0/);
 await page.evaluate(()=>studyLessonAdapter.seek(10));await page.getByRole('button',{name:'Next moment',exact:true}).click();await page.getByRole('button',{name:'Next moment',exact:true}).click();assert.match(await page.locator('.operation-caption').innerText(),/Found number 2/);assert.equal(await page.locator('.study-transfer').count(),0);
 await page.getByRole('button',{name:'Previous moment',exact:true}).click();await page.evaluate(()=>studyLessonAdapter.seek(3));assert.ok(await page.locator('[data-study-key="cell:1"]').isVisible(),'whole-step navigation restores live entity identities after moment review');
 await page.screenshot({path:path.join(ROOT,'test-results/operations-result.png')});await page.close();
}catch(error){failures.push({case:'Two Sum moments',error:String(error)});}finally{await browser.close();}
const result={lessons:checked,transitions:steps,failures};fs.writeFileSync(path.join(ROOT,'test-results/operations.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(failures.length)process.exitCode=1;
