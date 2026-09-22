import { _electron as electron } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { ROOT } from '../scripts/content.mjs';

const definitions=JSON.parse(fs.readFileSync(path.join(ROOT,'coding/problems.json'),'utf8'));
const profile=fs.mkdtempSync(path.join(ROOT,'.test-data/debugger-e2e-'));
const env={...process.env,STUDY_DATA_DIR:profile,STUDY_HEADLESS:'0'};delete env.ELECTRON_RUN_AS_NODE;
if(process.env.STUDY_TEST_EXE)env.PATH=`${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`;
const app=await electron.launch({...(process.env.STUDY_TEST_EXE?{executablePath:process.env.STUDY_TEST_EXE,args:[]}:{args:[ROOT]}),env,timeout:30000});
const page=await app.firstWindow();page.setDefaultTimeout(20000);
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const focus=()=>app.evaluate(({BrowserWindow})=>{const win=BrowserWindow.getAllWindows()[0];win.restore();win.show();win.focus();});
const control=name=>page.locator('.debug-controls').getByRole('button',{name:new RegExp(name)});
const paused=()=>page.waitForFunction(()=>document.querySelector('.debug-status.paused'));
const index=()=>page.locator('.debug-timeline>span').innerText();
async function open(number){
  if(await page.getByRole('button',{name:'Back to library',exact:true}).count())await page.getByRole('button',{name:'Back to library',exact:true}).click();
  await page.getByRole('searchbox',{name:'Search problems'}).fill(String(number));
  await page.getByRole('button',{name:`Open ${definitions.find(p=>p.number===number).title}`,exact:true}).click();
  await page.getByRole('tab',{name:'Code',exact:true}).click();await page.getByRole('textbox',{name:'JavaScript solution',exact:true}).waitFor();
}
async function code(source){
  await page.getByRole('textbox',{name:'JavaScript solution',exact:true}).focus();await page.keyboard.press('Control+A');
  await page.evaluate(text=>{const clipboardData=new DataTransfer();clipboardData.setData('text/plain',text);document.activeElement.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData}));},source);
  await page.waitForFunction(async text=>(await window.study.bootstrap()).data.drafts['leetcode:'+document.querySelector('.description-body h2').textContent.split('.')[0]]?.source===text,source);
}
async function start(source){await code(source);await focus();await page.getByRole('button',{name:'Debug',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.debug-status.paused,.debug-result'));}
async function step(name){const before=await index();await control(name).click();await page.waitForFunction(before=>document.querySelector('.debug-status.paused')&&document.querySelector('.debug-timeline>span').textContent!==before,before);}
async function breakpoint(line){const editor=page.locator('.debug-source .monaco-editor');const number=editor.locator('.line-numbers').filter({hasText:new RegExp(`^${line}$`)});const row=await number.boundingBox(),box=await editor.boundingBox();assert.ok(row&&box);await page.mouse.click(box.x+10,row.y+row.height/2);}
async function close(){await page.locator('.debug-toolbar').getByRole('button',{name:/Stop \/ edit|Back to code/}).click();await page.locator('.debug-workspace').waitFor({state:'detached'});}
async function finish(){await control('Continue').click();await page.locator('.debug-result').waitFor({timeout:30000});assert.match(await page.locator('.debug-result strong').innerText(),/matches expected/);}
const source=`function twoSum(nums,target) {
  const seen = new Map();
  function remember(value,index) {
    seen.set(value,index);
  }
  for (let i=0;i<nums.length;i++) {
    const need=target-nums[i];
    if (seen.has(need)) return [seen.get(need),i];
    remember(nums[i],i);
  }
}`;
try{
  await page.locator('.problem-table').waitFor();await app.evaluate(({session})=>session.defaultSession.enableNetworkEmulation({offline:true}));
  await open(1);await start(source);await paused();
  const frozen=await index();await page.waitForTimeout(200);assert.equal(await index(),frozen);
  await breakpoint(9);await page.locator('.debug-breakpoint:not(.pending)').waitFor();await control('Continue').click();await page.waitForFunction(()=>document.querySelector('.debug-status')?.textContent==='Breakpoint');
  assert.match(await page.locator('.viz-explanation').innerText(),/LINE 9/);
  await step('Step Into');assert.equal(await page.locator('.viz-stack>button').count(),2);
  await step('Step Out');assert.equal(await page.locator('.viz-stack>button').count(),1);
  await page.getByLabel('View object-1 as',{exact:true}).selectOption('heap');assert.equal(await page.locator('.viz-heap-graph path').count(),3);await page.getByLabel('View object-1 as',{exact:true}).selectOption('array');
  await breakpoint(9);await page.locator('.debug-breakpoint').waitFor({state:'detached'});
  await page.getByRole('textbox',{name:'Debug source',exact:true}).focus();await page.keyboard.insertText('SHOULD_NOT_EDIT');
  assert.equal((await page.evaluate(()=>window.study.bootstrap())).data.drafts['leetcode:1'].source,source);
  await page.getByRole('slider',{name:'Debug history'}).fill('0');assert.ok(await control('Step Into').isDisabled());await page.getByRole('button',{name:'Return to live',exact:true}).click();
  await control('Play').click();await page.getByLabel('Debug playback speed').selectOption('4');await page.waitForTimeout(350);await control('Pause').click();await paused();
  const stopped=await index();await page.waitForTimeout(350);assert.equal(await index(),stopped);
  console.log('PASS real suspension, source breakpoints, Into/Out, read-only source, history, Play/speed/Pause');

  for(const zoom of [1,1.25,1.5]){
    await app.evaluate(({BrowserWindow},zoom)=>{const win=BrowserWindow.getAllWindows()[0];win.setContentSize(1440,900);win.webContents.setZoomFactor(zoom);},zoom);await page.waitForTimeout(150);
    assert.ok(await page.locator('.debug-controls').evaluate(el=>[...el.querySelectorAll('button')].every(button=>{const r=button.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;})),`Debug controls fit at ${zoom}`);
    const png=await app.evaluate(async({BrowserWindow})=>(await BrowserWindow.getAllWindows()[0].webContents.capturePage()).toPNG().toString('base64'));fs.writeFileSync(path.join(ROOT,`test-results/debugger-${zoom}.png`),Buffer.from(png,'base64'));
  }
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1));
  await page.getByLabel('Debug test case').selectOption('1');await paused();await step('Step Over');
  await page.getByRole('button',{name:'Focus diagram',exact:true}).click();assert.ok(await page.locator('.debug-source').isHidden());await page.getByRole('button',{name:'Focus diagram',exact:true}).click();
  for(const [pauseName,pauseAction] of [['tab',async()=>{await page.getByRole('tab',{name:'Notes',exact:true}).click();}],['minimize',async()=>{await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].minimize());}],['blur event',async()=>{await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].emit('blur'));}],['suspend',async()=>{await app.evaluate(({powerMonitor})=>powerMonitor.emit('suspend'));}]]){
    console.log('Testing pause',pauseName);await page.locator('.debug-toolbar').getByRole('button',{name:/Restart/}).click();await paused();await focus();await control('Play').click();await pauseAction();await paused();const stopped=await index();await page.waitForTimeout(300);assert.equal(await index(),stopped);await page.getByRole('tab',{name:'Code',exact:true}).click();await focus();assert.equal(await index(),stopped);
  }
  await finish();const state=await page.evaluate(()=>window.study.bootstrap());assert.equal(state.data.submissions.length,0);assert.notEqual(await page.getByLabel('Problem progress').inputValue(),'completed');await close();
  console.log('PASS case switching, focus, zoom, tab/native pauses, expected result, no submission side effects');

  await page.getByRole('tab',{name:'Test cases',exact:true}).click();await page.getByRole('radio',{name:'Custom cases',exact:true}).check();await page.getByLabel('Custom test cases').fill('[[[4,5,9],9]]');await start(definitions.find(p=>p.number===1).reference);await finish();await close();
  for(const [bad,diagnostic] of [['async function twoSum(){}',/synchronous/],['function twoSum( {',/Unexpected token/],['function twoSum(){throw Error("debug test");}',/debug test/]]){
    await start(bad);if(await page.locator('.debug-status.paused').count()){await control('Continue').click();}await page.locator('.debug-result').waitFor();assert.match(await page.locator('.debug-result').innerText(),diagnostic);await close();
  }
  await start('function twoSum(){while(true){}}');await control('Continue').click();await page.waitForTimeout(150);await close();await start(source);await page.locator('.debug-toolbar').getByRole('button',{name:/Restart/}).click();await paused();await finish();await close();
  console.log('PASS custom case, diagnostics, exception, Stop infinite loop, restart and recovery');

  for(const number of [64,133,700,933]){await open(number);await start(definitions.find(p=>p.number===number).reference);if(number===64)assert.ok(await page.locator('.viz-matrix').count());else if(number===133){for(let i=0;i<20&&await page.locator('.viz-node-graph path[marker-end]').count()<8;i++)await step('Step Into');assert.ok(await page.locator('.viz-node-graph path[marker-end]').count()>=8);}else if(number===700){assert.ok(await page.locator('.viz-node-graph').count());}await finish();await close();}
  await open(1);await start(source);await page.getByRole('button',{name:'Back to library',exact:true}).click();assert.equal(await page.locator('.debug-workspace').count(),0);
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(ROOT,`test-results/debugger-${process.env.STUDY_TEST_EXE?'packaged':'e2e'}.json`),JSON.stringify({passed:true,offline:true,profile,packaged:!!process.env.STUDY_TEST_EXE},null,2));
  console.log('PASS graph/tree/design problems, navigation cleanup, no renderer errors');
}catch(error){await page.screenshot({path:path.join(ROOT,'test-results/debugger-failure.png')}).catch(()=>{});console.error(await page.locator('.debug-workspace').innerText().catch(()=>''));throw error;}
finally{await app.close();}
