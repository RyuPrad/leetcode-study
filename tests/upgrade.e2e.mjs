import { _electron as electron } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {ROOT} from '../scripts/content.mjs';
const previous=process.env.STUDY_PREVIOUS_EXE,current=process.env.STUDY_TEST_EXE;
if(!previous||!current)throw Error('Set STUDY_PREVIOUS_EXE and STUDY_TEST_EXE to the two packaged executables.');
const profile=fs.mkdtempSync(path.join(ROOT,'.test-data/upgrade-0.2-to-0.3-'));
const env={...process.env,STUDY_DATA_DIR:profile,STUDY_HEADLESS:'1',PATH:`${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`};delete env.ELECTRON_RUN_AS_NODE;
const launch=executablePath=>electron.launch({executablePath,args:[],env,timeout:30000});
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
const oldApp=await launch(previous);
try{
  const page=await oldApp.firstWindow();await page.locator('.problem-table').waitFor();
  assert.equal((await page.evaluate(()=>window.study.bootstrap())).version,'0.2.0');
  await oldApp.evaluate(({session})=>session.defaultSession.enableNetworkEmulation({offline:true}));
  await page.evaluate(async()=>{
    await window.study.selectProblem('leetcode:1');
    await window.study.setProgress('leetcode:1',{status:'completed',bookmarked:true,needsReview:true});
    const data=await window.study.bootstrap();await window.study.editSession(data.data.sessions[0].id,{durationMs:420000,outcome:'solved',reflection:'Preserve this reflection across 0.3.0.'});
    await window.study.saveDraft('leetcode:1','function twoSum(){return [0,1];}\n// preserved draft','[[[2,7,11,15],9]]');
    await window.study.recordSubmission('leetcode:1','function twoSum(){return [0,1];}',{verdict:'Accepted',passed:1,total:1,durationMs:25,cases:[{name:'Upgrade fixture',input:[[2,7,11,15],9],actual:[0,1],expected:[0,1],verdict:'Accepted',logs:['preserve console output'],durationMs:25}]});
    await window.study.selectProblem(null);
  });
}finally{await oldApp.close();}
const filename=path.join(profile,'study-data.json'),original=fs.readFileSync(filename),expected=JSON.parse(original);
const app=await launch(current);let count=0;
try{
  const page=await app.firstWindow();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.locator('.problem-table').waitFor();const bootstrap=await page.evaluate(()=>window.study.bootstrap());assert.equal(bootstrap.version,'0.3.0');assert.deepEqual(bootstrap.data,expected);
  assert.equal(hash(fs.readFileSync(filename)),hash(original),'Opening the upgraded package preserves the schema-2 profile byte for byte');
  await app.evaluate(({session})=>session.defaultSession.enableNetworkEmulation({offline:true}));
  await page.getByRole('button',{name:'Open Two Sum',exact:true}).click();await page.frameLocator('iframe').locator('#btn-next').waitFor();const frame=page.frames().find(frame=>frame.url().startsWith('study://content'));
  for(const file of bootstrap.catalog.visualizers){
    await frame.goto(`study://content/${file.split('/').map(encodeURIComponent).join('/')}?embedded=1`);await frame.locator('[data-lesson-ready="true"]').waitFor();
    await frame.locator('#btn-next').evaluate(button=>button.click());assert.equal(await frame.evaluate(()=>typeof window.study),'undefined');
    if(++count%50===0)console.log(`Upgraded package offline lessons: ${count}/250`);
  }
  const after=(await page.evaluate(()=>window.study.bootstrap())).data;
  assert.deepEqual(after.drafts,expected.drafts);assert.deepEqual(after.submissions,expected.submissions);assert.deepEqual(after.progress,expected.progress);
  assert.equal(after.sessions[0].reflection,expected.sessions[0].reflection);assert.ok(after.sessions[0].durationMs>=expected.sessions[0].durationMs);assert.deepEqual(errors,[]);
}finally{await app.close();}
fs.writeFileSync(path.join(ROOT,'test-results/upgrade-0.2.0-to-0.3.0.json'),JSON.stringify({passed:true,profile,previous,current,offline:true,lessons:count,initialProfileHash:hash(original),unchangedOnFirstLaunch:true,retained:['progress','bookmarks','review flags','study history','reflections','draft source','custom cases','submissions'],installerExecuted:false},null,2));
console.log('PASS offline packaged upgrade: original profile unchanged on first launch; all study and coding records retained.');
