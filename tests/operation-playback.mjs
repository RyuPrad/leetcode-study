import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const b=await chromium.launch({headless:true}),p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
try{
 await p.clock.install({time:new Date('2026-01-01T00:00:00Z')});await p.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
 await p.goto(pathToFileURL(process.cwd()+'/Array & Hashing/two_sum_visualizer.html').href);await p.waitForFunction(()=>window.studyWalkthrough);
 const index=()=>p.evaluate(()=>studyLessonSource.index());const click=name=>p.getByRole('button',{name,exact:true}).click();
 for(const speed of [.5,1,2,4]){
  await p.locator('#btn-reset').click();await p.locator('#study-speed').selectOption(String(speed));await click('Play');
  await p.clock.runFor(2000/speed);assert.equal(await index(),0);assert.equal(await p.evaluate(()=>studyWalkthrough.stage),1);
  await click('Pause');await p.clock.runFor(10000);assert.equal(await index(),0);
  await click('Play');await p.clock.runFor(2000/speed);assert.equal(await index(),1);assert.equal(await p.evaluate(()=>studyWalkthrough.stage),2);await click('Pause');
 }
 await p.getByLabel('Walkthrough detail').selectOption('compact');const prior=await index();await click('Play');await p.clock.runFor(250);assert.equal(await index(),prior+1);await click('Pause');
 await p.getByLabel('Walkthrough detail').selectOption('detailed');await p.reload();assert.equal(await p.getByLabel('Walkthrough detail').inputValue(),'detailed');assert.deepEqual(errors,[]);
 console.log('PASS Detailed dwell, all speeds, pause/resume, Compact pacing and local preference');fs.writeFileSync('test-results/operation-playback.json',JSON.stringify({passed:true},null,2));
}finally{await b.close();}
