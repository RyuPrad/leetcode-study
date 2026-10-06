import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';
import {ROOT,collectCatalog} from '../scripts/content.mjs';
const catalog=collectCatalog(),browser=await chromium.launch(),results=[],errors=[];
const server=http.createServer((req,res)=>{
 const file=path.resolve(ROOT,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)||!(/\.(html|css|js|json)$/.test(file))||file.includes(path.sep+'.')){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'text/html');fs.createReadStream(file).pipe(res);
});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,context=await browser.newContext({viewport:{width:1480,height:940}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(7000);
const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function open(number,guided=false){await page.goto(base+'/'+catalog.entries.find(e=>e.number===number).visualizerPath+'?embedded=1&walkthrough=compact'+(guided?'&guided=1':''));await page.waitForFunction(()=>window.studyPanelLayout&&window.studyLessonAdapter&&(!window.studyGuidedController||window.studyGuidedController.progress));await settle();}
const snapshot=()=>page.evaluate(()=>studyPanelLayout.snapshot());
const state=()=>page.evaluate(()=>JSON.stringify({index:studyLessonSource.index(),frame:studyLessonAdapter.objectSnapshot(),progress:window.studyGuidedController?.progress}));
const panel=id=>page.locator(`[data-study-panel="${id}"]`);
async function show(id){await page.getByText('Panels',{exact:true}).click();const title=await panel(id).locator('.study-panel-title').textContent();await page.getByRole('button',{name:`Show ${title}`,exact:true}).click();await settle();}
async function drag(id,dx,dy,edge){const handle=edge?panel(id).locator(`[data-resize="${edge}"]`):panel(id).locator('.study-panel-title');await handle.scrollIntoViewIfNeeded();const box=await handle.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+dx,box.y+box.height/2+dy,{steps:6});await page.mouse.up();await settle();}
const close=(a,b,label)=>assert.ok(Math.abs(a-b)<2,`${label}: ${a} != ${b}`);
const shape=r=>[r.x,r.y,r.width,r.height];
try{
 await open(206);const before=await state(),initial=await snapshot();
 assert.deepEqual(Object.keys(initial.panels).sort(),['code','diagram','guide','objects','variables']);
 await drag('code',-160,55);let next=await snapshot();close(next.panels.code.x,initial.panels.code.x-160,'drag x');close(next.panels.code.y,55,'drag y');assert.equal(await state(),before);
 await drag('code',45,35,'se');let sized=await snapshot();close(sized.panels.code.width,next.panels.code.width+45,'resize width');close(sized.panels.code.height,next.panels.code.height+35,'resize height');
 await panel('code').getByRole('button',{name:'Move Reference Code',exact:true}).press('Enter');await page.keyboard.press('ArrowLeft');await page.keyboard.press('Shift+ArrowDown');await page.keyboard.press('Enter');let moved=await snapshot();close(moved.panels.code.x,sized.panels.code.x-10,'keyboard x');close(moved.panels.code.y,sized.panels.code.y+1,'fine keyboard y');
 await panel('code').getByRole('button',{name:'Resize Reference Code',exact:true}).click();await page.keyboard.press('ArrowDown');await page.keyboard.press('Escape');assert.deepEqual(shape((await snapshot()).panels.code),shape(moved.panels.code));assert.equal(await state(),before);
 const header=panel('code').locator('.study-panel-title'),box=await header.boundingBox();await page.mouse.move(box.x+30,box.y+10);await page.mouse.down();await page.mouse.move(box.x-10,box.y+50);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.mouse.up();assert.deepEqual(shape((await snapshot()).panels.code),shape(moved.panels.code));
 await page.locator('#study-play').click();await drag('code',-20,5);assert.equal(await page.locator('#study-play').getAttribute('aria-pressed'),'false');assert.equal(await state(),before);
 const kept=shape((await snapshot()).panels.code);await open(21);assert.deepEqual(shape((await snapshot()).panels.code),kept,'arrangement spans problems');await page.reload();await page.waitForFunction(()=>window.studyPanelLayout);assert.deepEqual(shape((await snapshot()).panels.code),kept,'arrangement survives reload');
 await show('objects');const edgeStart=await page.locator('.study-panel-scroll').evaluate(el=>el.scrollTop),edgeY=(await snapshot()).panels.objects.y;
 const edgeBox=await panel('objects').locator('.study-panel-title').boundingBox(),scrollBox=await page.locator('.study-panel-scroll').boundingBox();
 await page.mouse.move(edgeBox.x+40,edgeBox.y+edgeBox.height/2);await page.mouse.down();await page.mouse.move(edgeBox.x+40,scrollBox.y+3,{steps:3});await page.waitForTimeout(180);await page.mouse.up();await settle();
 assert.ok(await page.locator('.study-panel-scroll').evaluate(el=>el.scrollTop)<edgeStart-20,'dragging near the top scrolls toward earlier rows');assert.ok((await snapshot()).panels.objects.y<edgeY-20,'edge scrolling moves the same panel through the workspace');
 await show('objects');const objectGeometry=shape((await snapshot()).panels.objects),objectState=await state();await page.getByRole('button',{name:'Expand list1',exact:true}).click();await settle();assert.equal((await snapshot()).maximized,'objects');assert.equal(await page.locator('#study-object-view').getAttribute('data-object-focused'),'true');await page.keyboard.press('Escape');await settle();assert.equal((await snapshot()).maximized,null);assert.deepEqual(shape((await snapshot()).panels.objects),objectGeometry);assert.equal(await state(),objectState);
 await show('variables');assert.ok((await snapshot()).panels.variables.visible);await panel('variables').getByRole('button',{name:'Hide Variables',exact:true}).click();assert.ok(!(await snapshot()).panels.variables.visible);await show('variables');
 await panel('variables').getByRole('button',{name:'Maximize Variables',exact:true}).click();assert.equal((await snapshot()).maximized,'variables');await panel('variables').getByRole('button',{name:'Restore Variables',exact:true}).click();assert.equal((await snapshot()).maximized,null);
 await page.setViewportSize({width:586,height:300});await settle();await show('code');const small=await panel('code').boundingBox();assert.ok(small.x>=0&&small.x+small.width<=586,'fit a stored wide panel into a narrow viewport');await page.setViewportSize({width:1480,height:940});await settle();assert.deepEqual(shape((await snapshot()).panels.code),kept,'temporary fitting preserves large-window arrangement');
 await open(143,true);await page.getByRole('button',{name:'Next prediction',exact:true}).click();await page.locator('.guided-choice').first().waitFor();const choiceCount=await page.locator('.guided-choice').count();const guidedBefore=await state();assert.deepEqual(Object.keys((await snapshot()).panels).sort(),['code','diagram','question']);await drag('question',25,25);assert.equal(await state(),guidedBefore,'moving a prediction cannot answer or execute it');assert.equal(await page.locator('.guided-choice').count(),choiceCount);const guidedKept=shape((await snapshot()).panels.question);
 await open(206);assert.deepEqual(shape((await snapshot()).panels.code),kept,'Learn arrangement is separate');await page.getByRole('button',{name:'Reset layout',exact:true}).click();assert.equal((await snapshot()).panels.code.y,0);assert.ok((await snapshot()).panels.variables.hidden);
 await open(143,true);assert.deepEqual(shape((await snapshot()).panels.question),guidedKept);await page.getByRole('button',{name:'Reset layout',exact:true}).click();
 await page.evaluate(()=>localStorage.setItem('study.panelLayout.v1.visualizer','{broken'));await open(206);assert.equal((await snapshot()).panels.code.y,0);
 assert.deepEqual(errors,[]);results.push('pointer move/resize, keyboard commit/cancel, blur cancellation, pause without execution, persistence, separate views, focus restoration, small-window recovery and reset');
 fs.writeFileSync(path.join(ROOT,'test-results/panel-layout.json'),JSON.stringify({passed:true,results},null,2));console.log('PASS '+results[0]);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
