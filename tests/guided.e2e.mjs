import { _electron as electron } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {ROOT} from '../scripts/content.mjs';
const profile=fs.mkdtempSync(path.join(ROOT,'.test-data/guided-e2e-'));
const env={...process.env,STUDY_DATA_DIR:profile,STUDY_HEADLESS:'0'};delete env.ELECTRON_RUN_AS_NODE;
if(process.env.STUDY_TEST_EXE)env.PATH=`${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`;
const launch=()=>electron.launch({...(process.env.STUDY_TEST_EXE?{executablePath:process.env.STUDY_TEST_EXE,args:[]}:{args:[ROOT]}),env,timeout:30000});
let app=await launch(),page=await app.firstWindow(),frame;page.setDefaultTimeout(20000);const errors=[];
const watch=()=>page.on('pageerror',e=>errors.push(e.message));watch();
async function focus(){await app.evaluate(({BrowserWindow})=>{const win=BrowserWindow.getAllWindows()[0];win.restore();win.show();win.focus();});}
async function open(number=1){
  if(await page.getByRole('button',{name:'Back to library',exact:true}).count())await page.getByRole('button',{name:'Back to library',exact:true}).click();
  await page.getByRole('searchbox',{name:'Search problems'}).fill(String(number));
  const row=page.locator('.problem-table tbody tr').filter({has:page.locator(`.number-col`,{hasText:new RegExp(`^0*${number}$`)})});await row.locator('.problem-link').click();
  await page.getByRole('tab',{name:'Learn',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.guided-container iframe'));
  frame=await page.locator('.guided-container iframe').elementHandle().then(el=>el.contentFrame());
  await frame.waitForFunction(()=>window.studyGuidedController?.progress&&!window.studyGuidedController.busy);
  assert.equal(await frame.evaluate(()=>window.studyGuidedController.error),'');
}
async function stored(id='leetcode:1'){return page.evaluate(async id=>(await window.study.bootstrap()).data.guided[id],id);}
async function checkpoint(){await frame.getByRole('button',{name:'Next prediction',exact:true}).press('Enter');await frame.locator('.guided-question').waitFor();return frame.evaluate(()=>window.studyGuidedController.lesson.checkpoints.find(cp=>cp.beforeIndex===window.studyLessonSource.index()));}
async function show(){await frame.getByRole('button',{name:'Show me',exact:true}).press('Enter');await frame.getByRole('button',{name:'Continue',exact:true}).waitFor();await frame.getByRole('button',{name:'Continue',exact:true}).press('Enter');}
try{
  await page.locator('.problem-table').waitFor();await app.evaluate(({session})=>session.defaultSession.enableNetworkEmulation({offline:true}));await focus();await open();
  const cp=await checkpoint();await frame.getByRole('button',{name:'Hint',exact:true}).click();
  const wrong=cp.options.find(o=>o.id!==cp.correctOptionId);await frame.locator(`.guided-choice[data-option-id="${wrong.id}"]`).click();
  await page.waitForFunction(async()=>(await window.study.bootstrap()).data.guided['leetcode:1']?.answers.decision?.attempts===1);
  const pending=await stored();assert.equal(pending.answers.decision.hintLevel,1);
  await frame.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(1150);assert.equal(await frame.evaluate(()=>window.studyLessonSource.index()),cp.beforeIndex);assert.equal(await frame.getByRole('button',{name:'Play',exact:true}).getAttribute('aria-pressed'),'false');
  await page.getByRole('tab',{name:'Notes',exact:true}).click();await page.getByRole('tab',{name:'Learn',exact:true}).click();assert.equal(await frame.evaluate(()=>window.studyLessonSource.index()),cp.beforeIndex);
  // Source/origin/session and stale sequence guards reject messages without touching the store.
  const serialized=JSON.stringify(await stored());
  await page.evaluate(()=>window.dispatchEvent(new MessageEvent('message',{origin:'study://content',data:{type:'guided:progress',lessonId:'leetcode:1',session:'wrong',progress:{cursor:99999}}})));
  assert.equal(JSON.stringify(await stored()),serialized);
  await frame.evaluate(()=>{const c=window.studyGuidedController,session=new URLSearchParams(location.search).get('session');for(const [token,run]of [[session,'stale-run'],['stale-session',c.progress.runId]])parent.postMessage({type:'guided:progress',session:token,lessonId:c.lesson.id,version:c.lesson.version,caseId:c.lesson.caseId,sequence:Number.MAX_SAFE_INTEGER,runId:run,progress:{...c.progress,runId:run,cursor:99999}},'study://app');});
  await page.waitForTimeout(100);assert.equal(JSON.stringify(await stored()),serialized,'stale messages from the actual frame are ignored');
  await frame.locator(`.guided-choice[data-option-id="${cp.correctOptionId}"]`).focus();await page.keyboard.press('Enter');await frame.getByRole('button',{name:'Watch the change',exact:true}).click();await frame.getByRole('button',{name:'Continue',exact:true}).click();
  assert.ok((await stored()).answers.decision.correct);
  const second=await checkpoint();await frame.getByRole('button',{name:'Hint',exact:true}).click();
  await page.waitForFunction(async()=>(await window.study.bootstrap()).data.guided['leetcode:1'].answers.change?.hintLevel===1);
  await app.close();app=await launch();page=await app.firstWindow();page.setDefaultTimeout(20000);watch();await page.locator('.problem-table').waitFor();await focus();await open();
  assert.equal(await frame.evaluate(()=>window.studyLessonSource.index()),second.beforeIndex);assert.equal((await stored()).answers.change.hintLevel,1);assert.equal(await frame.getByRole('button',{name:'Play',exact:true}).getAttribute('aria-pressed'),'false');
  await show();await checkpoint();await show();await page.waitForFunction(async()=>!!(await window.study.bootstrap()).data.guided['leetcode:1'].completedAt);
  const completed=await stored();assert.equal(completed.answers.change.revealed,true);assert.notEqual(await page.getByLabel('Problem progress').inputValue(),'completed');assert.equal((await page.evaluate(()=>window.study.bootstrap())).data.submissions.length,0);
  await frame.getByRole('slider',{name:'Guided lesson timeline'}).fill('0');await frame.waitForFunction(()=>!window.studyGuidedController.busy);assert.equal((await stored()).completedAt,completed.completedAt);
  console.log('PASS offline guided questions, hints, wrong/correct/revealed answers, barriers, keyboard, resume, review and no coding completion');

  await frame.getByRole('button',{name:'Restart lesson',exact:true}).click();await frame.waitForFunction(()=>!window.studyGuidedController.busy);await checkpoint();
  for(const scale of [1,1.25,1.5]){
    await app.evaluate(({BrowserWindow},factor)=>{const win=BrowserWindow.getAllWindows()[0];win.setContentSize(1440,960);win.webContents.setZoomFactor(factor);},scale);await page.waitForTimeout(150);
    assert.equal(await frame.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    assert.ok(await frame.locator('.study-code').isVisible());
    const screenshot=await app.evaluate(async({BrowserWindow})=>(await BrowserWindow.getAllWindows()[0].webContents.capturePage()).toPNG().toString('base64'));fs.writeFileSync(path.join(ROOT,`test-results/guided-desktop-${scale}.png`),Buffer.from(screenshot,'base64'));
  }
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1));
  await frame.getByRole('button',{name:'Restart lesson',exact:true}).click();await frame.waitForFunction(()=>!window.studyGuidedController.busy);assert.equal((await stored()).previousCompletion.completedAt,completed.completedAt);
  for(const action of ['blur','minimize','suspend']){
    await focus();await frame.getByRole('button',{name:'Play',exact:true}).click();
    await app.evaluate(({BrowserWindow,powerMonitor},action)=>{if(action==='suspend')powerMonitor.emit('suspend');else if(action==='minimize')BrowserWindow.getAllWindows()[0].minimize();else BrowserWindow.getAllWindows()[0].emit('blur');},action);
    await frame.waitForFunction(()=>document.querySelector('.guided-controls button[aria-pressed]')?.getAttribute('aria-pressed')==='false');const pausedIndex=await frame.evaluate(()=>window.studyLessonSource.index());await page.waitForTimeout(150);assert.equal(await frame.evaluate(()=>window.studyLessonSource.index()),pausedIndex);await focus();
  }
  const backup=path.join(profile,'guided-backup.json');await app.evaluate(({dialog},file)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:file});dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});},backup);
  await page.getByRole('button',{name:'Settings and backup',exact:true}).click();await page.getByRole('button',{name:'Export backup',exact:true}).click();await page.getByText('Your backup was exported.',{exact:true}).waitFor();
  const saved=JSON.parse(fs.readFileSync(backup,'utf8'));assert.equal(saved.version,3);assert.equal(saved.guided['leetcode:1'].previousCompletion.completedAt,completed.completedAt);
  await page.getByRole('button',{name:'Restore backup',exact:true}).click();await page.locator('.problem-table').waitFor();await open(143);await checkpoint();await show();assert.equal(await frame.evaluate(()=>window.studyGuidedController.error),'');
  await open(70);await checkpoint();await show();assert.equal(await frame.evaluate(()=>window.studyGuidedController.error),'');
  await app.evaluate(({ipcMain})=>{globalThis.guidedActivityCount=0;ipcMain.on('study:activity',()=>globalThis.guidedActivityCount++);});
  await frame.evaluate(()=>parent.postMessage({type:'study:activity'},'study://app'));await page.waitForTimeout(100);assert.ok(await app.evaluate(()=>globalThis.guidedActivityCount>0),'guided activity reaches study timer');
  await frame.getByRole('button',{name:'Play',exact:true}).focus();await page.keyboard.press('Control+k');await page.locator('.problem-table').waitFor();await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Search problems');assert.equal(await page.locator('.guided-container').count(),0);assert.deepEqual(errors,[]);
  console.log('PASS display scaling, focus/power pauses, backup restore, history/precomputed engines and navigation cleanup');
  fs.writeFileSync(path.join(ROOT,`test-results/guided-${process.env.STUDY_TEST_EXE?'packaged':'desktop'}.json`),JSON.stringify({passed:true,offline:true,profile,packaged:!!process.env.STUDY_TEST_EXE},null,2));
}catch(error){await page.screenshot({path:path.join(ROOT,'test-results/guided-desktop-failure.png')}).catch(()=>{});console.error(await frame?.locator('.guided-panel').innerText().catch(()=>''));throw error;}
finally{await app.close();}
