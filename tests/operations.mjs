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
 const result=await page.evaluate(async()=>{const a=studyLessonAdapter,w=studyWalkthrough,s=studyLessonSource;let count=0;while(!document.getElementById('btn-next').disabled&&count<3000){const prior=s.index();a.next();if(s.index()===prior)throw Error('No progress');if(!w.operation.kind||!w.operation.result||!Number.isInteger(w.operation.location.line))throw Error('Incomplete operation');const line=document.getElementById(`line-${w.operation.location.line}`)||document.getElementById(`l${w.operation.location.line}`);if(!line)throw Error('Missing source line');if(!line.classList.contains('operation-code')||getComputedStyle(line).backgroundColor!=='rgb(39, 73, 108)')throw Error('Operation source highlight is not visible');count++;}return {count,complete:document.getElementById('btn-next').disabled};});
 assert.ok(result.complete,'whole walkthrough reaches completion');steps+=result.count;assert.deepEqual(errors,[]);checked++;
 }catch(error){failures.push({number:lesson.number,error:String(error)});console.log('FAIL',lesson.number,String(error));}finally{page.off('pageerror',onError);}if((checked+failures.length)%25===0)console.log(`Operations ${checked+failures.length}/250; ${steps} transitions; ${failures.length} failures`);}await page.close();}
try{await Promise.all(Array.from({length:4},worker));
 const removeDuplicates=await browser.newPage();await removeDuplicates.goto(pathToFileURL(path.join(ROOT,lessons.find(l=>l.number===26).path)).href);await removeDuplicates.waitForFunction(()=>window.studyWalkthrough);
 const writeTrace=await removeDuplicates.evaluate(()=>{document.getElementById('custom-input').value='1,2,2';window.loadCustom();const events=[];for(let count=0;count<30&&!document.getElementById('btn-next').disabled;count++){studyLessonAdapter.next();const op=studyWalkthrough.operation,raw=studyLessonSource.read();if(op.phase==='COMPARE'||op.phase==='WRITE')events.push({phase:op.phase,line:op.location.line,kind:op.kind,highlight:[...document.querySelectorAll('.operation-code')].map(el=>el.id),right:raw.right,equal:raw.lastCompareEqual});}return events;});
 assert.ok(writeTrace.some(event=>event.phase==='WRITE'&&event.line===7&&event.kind==='copy'&&event.highlight.includes('line-7')),'array copy highlights nums[left] = nums[right]');
 assert.ok(writeTrace.some(event=>event.phase==='COMPARE'&&event.line===5&&event.right===2&&event.equal===true&&event.highlight.includes('line-5')&&!event.highlight.includes('line-7')),'duplicate comparison does not highlight the skipped write');
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
