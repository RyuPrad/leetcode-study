import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {ROOT} from '../scripts/content.mjs';
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'reduce'});
const file=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8')).find(l=>l.number===1).path;
async function fresh(){await page.goto(pathToFileURL(path.join(ROOT,file)).href+'?guided=1&walkthrough=compact');await page.waitForFunction(()=>window.studyGuidedController?.progress&&!window.studyGuidedController.busy);}
try{
  await page.clock.install();await page.clock.pauseAt(Date.now()+1000);
  await fresh();const index=await page.evaluate(()=>window.studyLessonSource.index());
  const splitter=page.getByRole('separator',{name:'Resize lesson diagram'});await splitter.focus();await page.keyboard.press('ArrowRight');assert.equal(await splitter.getAttribute('aria-valuenow'),'62');assert.equal(await page.evaluate(()=>window.studyLessonSource.index()),index);
  assert.equal(await page.getByRole('button',{name:'Focus diagram',exact:true}).count(),0);assert.ok(await page.locator('.study-code').isVisible());
  await page.setViewportSize({width:900,height:700});const narrowWidth=(await page.locator('.study-diagram').boundingBox()).width;await splitter.focus();await page.keyboard.press('ArrowRight');assert.notEqual((await page.locator('.study-diagram').boundingBox()).width,narrowWidth,'resizing also changes the compact layout');assert.equal(await page.evaluate(()=>window.studyLessonSource.index()),index);await page.setViewportSize({width:1440,height:960});
  for(const finish of ['Next prediction','timeline']){
    await fresh();const lesson=await page.evaluate(()=>window.studyGuidedController.lesson);
    for(const cp of lesson.checkpoints){await page.getByRole('button',{name:'Next prediction',exact:true}).click();await page.waitForFunction(()=>!window.studyGuidedController.busy);await page.locator(`.guided-choice[data-option-id="${cp.correctOptionId}"]`).click();
      if(cp===lesson.checkpoints.at(-1)){if(finish==='timeline')await page.getByRole('slider',{name:'Guided lesson timeline'}).fill(String(cp.afterIndex));else await page.getByRole('button',{name:'Next prediction',exact:true}).click();}
      else {await page.getByRole('button',{name:'Watch the change',exact:true}).click();await page.clock.runFor(1000*(cp.afterIndex-cp.beforeIndex+1));await page.getByRole('button',{name:'Continue',exact:true}).click();}}
    await page.getByRole('heading',{name:'Lesson explored',exact:true}).waitFor();assert.ok(await page.evaluate(()=>window.studyGuidedController.progress.completedAt));
  }
  await fresh();await page.evaluate(()=>{const cp=window.studyGuidedController.lesson.checkpoints[0];window.originalGuidedAssertions=structuredClone(cp.before);cp.before=[{path:'phase',value:'intentionally mismatched test fixture'}];});
  await page.getByRole('button',{name:'Next prediction',exact:true}).click();await page.locator('.guided-error').waitFor();assert.ok(await page.getByRole('button',{name:'Restart lesson',exact:true}).isEnabled());
  await page.evaluate(()=>window.studyGuidedController.lesson.checkpoints[0].before=window.originalGuidedAssertions);await page.getByRole('button',{name:'Restart lesson',exact:true}).click();await page.waitForFunction(()=>!window.studyGuidedController.busy);assert.equal(await page.evaluate(()=>window.studyGuidedController.error),'');
  // Revisions restart the current walkthrough while retaining the earlier completion marker.
  const revised=await page.evaluate(()=>{const lesson=window.studyGuidedController.lesson;return window.StudyGuided.restore({...lesson,version:2},{...window.studyGuidedController.progress,lessonVersion:1,completedAt:'2026-09-22T12:00:00Z',cursor:5});});
  assert.equal(revised.lessonVersion,2);assert.equal(revised.cursor,0);assert.deepEqual(revised.answers,{});assert.equal(revised.previousCompletion.lessonVersion,1);
  const result={passed:true,checks:['keyboard resize without stepping','reference code remains visible','completion through forward seek and timeline','mismatch recovery','content revision retains prior completion']};fs.writeFileSync(path.join(ROOT,'test-results/guided-controls.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
