import { _electron as electron } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { ROOT } from '../scripts/content.mjs';
const problems=JSON.parse(fs.readFileSync(path.join(ROOT,'coding/problems.json'),'utf8'));
fs.mkdirSync(path.join(ROOT,'.test-data'),{recursive:true});fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
const directory=fs.mkdtempSync(path.join(ROOT,'.test-data/coding-e2e-'));
const env={...process.env,STUDY_DATA_DIR:directory,STUDY_HEADLESS:'0'};delete env.ELECTRON_RUN_AS_NODE;
if(process.env.STUDY_TEST_EXE)env.PATH=`${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`;
const launch=()=>electron.launch({...(process.env.STUDY_TEST_EXE?{executablePath:process.env.STUDY_TEST_EXE,args:[]}:{args:[ROOT]}),env,timeout:30000});
let app=await launch(),page=await app.firstWindow();page.setDefaultTimeout(20000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text());});
async function open(n){const p=problems.find(p=>p.number===n);if(await page.getByRole('button',{name:'Back to library',exact:true}).count())await page.getByRole('button',{name:'Back to library',exact:true}).click();await page.getByRole('searchbox',{name:'Search problems'}).fill(String(n));await page.getByRole('button',{name:`Open ${p.title}`,exact:true}).click();await page.getByRole('tab',{name:'Code',exact:true}).click();await page.locator('.monaco-editor').waitFor();}
async function waitDraft(source){for(let attempt=0;attempt<100;attempt++){if(await page.evaluate(async source=>(await window.study.bootstrap()).data.drafts['leetcode:'+document.querySelector('.description-body h2').textContent.split('.')[0]]?.source.replace(/\r\n/g,'\n')===source.replace(/\r\n/g,'\n'),source))return;await page.waitForTimeout(50);}throw Error('Draft did not reach the expected source');}
async function code(source){await page.getByRole('textbox',{name:'JavaScript solution',exact:true}).focus();await page.keyboard.press('Control+A');await page.evaluate(text=>{const clipboardData=new DataTransfer();clipboardData.setData("text/plain",text);document.activeElement.dispatchEvent(new ClipboardEvent("paste",{bubbles:true,cancelable:true,clipboardData}));},source);await waitDraft(source);}
async function run(source,mode='run',expected='Accepted'){await code(source);await page.getByRole('button',{name:mode==='run'?'Run':'Submit',exact:true}).click();await page.locator('.judge-summary strong').waitFor({timeout:40000});assert.equal(await page.locator('.judge-summary strong').innerText(),expected,await page.locator('.code-panel-scroll').innerText());}
try{
  await page.locator('.problem-table').waitFor();await app.evaluate(({session})=>session.defaultSession.enableNetworkEmulation({offline:true}));
  if(process.env.STUDY_TEST_EXE)assert.ok(await app.evaluate(({app})=>app.isPackaged));
  await open(1);
  const tabout=()=>page.getByRole('button',{name:'TabOut',exact:true});
  assert.equal(await tabout().getAttribute('aria-pressed'),'true');
  const navigation='function twoSum() { return ["hello"]; }',cursor=navigation.indexOf('hello')+2;
  async function position(){await page.getByRole('textbox',{name:'JavaScript solution',exact:true}).focus();await page.keyboard.press('Control+Home');for(let i=0;i<cursor;i++)await page.keyboard.press('ArrowRight');}
  await code(navigation);await position();await page.keyboard.press('Tab');await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
  assert.equal((await page.evaluate(()=>window.study.bootstrap())).data.drafts['leetcode:1']?.source,navigation,'TabOut does not change or save source');
  await page.keyboard.insertText('/*cursor*/');const expected=navigation.replace('"]','"/*cursor*/]');
  await waitDraft(expected);
  await tabout().click();await code(navigation);await position();await page.keyboard.press('Tab');
  await waitDraft(navigation.slice(0,cursor)+' '.repeat(2-cursor%2)+navigation.slice(cursor));
  await open(217);assert.equal(await tabout().getAttribute('aria-pressed'),'false');await open(1);assert.equal(await tabout().getAttribute('aria-pressed'),'false');await tabout().click();
  console.log('PASS native Tab/Shift+Tab, unchanged draft during jumps, toggle fallback and preference across problems');
  const reference=problems.find(p=>p.number===1).reference;
  await run(reference);assert.notEqual(await page.getByLabel('Problem progress').inputValue(),'completed');
  await run(reference,'submit');await page.waitForFunction(()=>document.querySelector('.progress-select')?.value==='completed');
  await page.screenshot({path:path.join(ROOT,'test-results/coding-workspace.png')});
  console.log('PASS offline editor, Run, Submit, Accepted progress');
  await run('function twoSum(){return [0,0];}','submit','Wrong answer');assert.equal(await page.getByLabel('Problem progress').inputValue(),'completed');
  await run('function twoSum( {','run','Syntax error');
  await run('function twoSum(){throw new Error("location");}','run','Runtime error');
  await run('function twoSum(){while(true){}}','run','Time limit exceeded');
  await code('function twoSum(){while(true){}}');await page.getByRole('button',{name:'Run',exact:true}).click();await page.getByRole('button',{name:'Stop',exact:true}).click();await page.getByText('Cancelled',{exact:true}).waitFor();
  await run(reference);
  console.log('PASS wrong answers, syntax/runtime errors, timeout, Stop, and recovery');
  await page.getByRole('tab',{name:'Test cases',exact:true}).click();await page.getByRole('radio',{name:'Custom cases',exact:true}).check();await page.getByLabel('Custom test cases').fill('[[[4,5,9],9]]');
  await page.keyboard.press('Control+Enter');await page.locator('.judge-summary strong').waitFor();assert.equal(await page.locator('.judge-summary strong').innerText(),'Accepted');
  await page.getByRole('tab',{name:'Test cases',exact:true}).click();await page.getByLabel('Custom test cases').fill('[[[4,5,9],100]]');await page.getByRole('button',{name:'Run',exact:true}).click();await page.getByRole('alert').filter({hasText:'Exactly one'}).waitFor();await page.getByLabel('Custom test cases').fill('[[[4,5,9],9]]');
  await page.getByRole('tab',{name:/Submissions \(/}).click();assert.equal(await page.locator('.submission-list button').count(),2);await page.locator('.submission-list button').last().click();await page.getByRole('button',{name:'Reopen code',exact:true}).click();await page.getByRole('button',{name:'Replace draft',exact:true}).click();
  await page.getByRole('button',{name:'Reset code',exact:true}).click();await page.getByRole('button',{name:'Cancel',exact:true}).click();
  console.log('PASS custom cases, keyboard Run, invalid input, saved submission reopen, reset confirmation');
  const backupPath=path.join(directory,'coding-backup.json');
  await app.evaluate(({dialog},file)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:file});dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});},backupPath);
  await page.getByRole('button',{name:'Settings and backup',exact:true}).click();await page.getByRole('button',{name:'Export backup',exact:true}).click();await page.getByText('Your backup was exported.',{exact:true}).waitFor();
  const backup=JSON.parse(fs.readFileSync(backupPath,'utf8'));assert.equal(backup.version,3);assert.equal(backup.drafts['leetcode:1'].source.replace(/\r\n/g,'\n'),reference);assert.equal(backup.submissions.length,2);
  await page.getByRole('button',{name:'Restore backup',exact:true}).click();await page.locator('.problem-table').waitFor();await open(1);const imported=await page.evaluate(()=>window.study.bootstrap());assert.equal(imported.data.drafts['leetcode:1'].source,backup.drafts['leetcode:1'].source);assert.deepEqual(imported.data.submissions,backup.submissions);
  await code('function twoSum(){while(true){}}');await page.getByRole('button',{name:'Submit',exact:true}).click();await open(933);await page.waitForFunction(async()=>{const {data}=await window.study.bootstrap();return data.submissions.at(-1)?.result.verdict==='Cancelled';});
  console.log('PASS native backup export/restore includes drafts/submissions and navigation cancels running code');
  for(const n of [2,48,133,138,146,297,374,700,933,1095]){await open(n);await run(problems.find(p=>p.number===n).reference,'submit');}
  console.log('PASS list/tree/graph/design/in-place/API problems including 700 and 933');
  await open(1);
  for(const scale of [1,1.25,1.5]){await app.evaluate(({BrowserWindow},factor)=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(factor),scale);await page.waitForTimeout(200);assert.ok(await page.locator('.run-actions').evaluate(el=>{const r=el.getBoundingClientRect();return r.right<=innerWidth&&r.bottom<=innerHeight;}),`Run controls fit at ${scale}`);assert.ok(await tabout().evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;}),`TabOut fits at ${scale}`);assert.ok(await page.getByRole('button',{name:'Run',exact:true}).isVisible());assert.ok(await page.getByRole('button',{name:'Submit',exact:true}).isVisible());const screenshot=await app.evaluate(async({BrowserWindow})=>(await BrowserWindow.getAllWindows()[0].webContents.capturePage()).toPNG().toString('base64'));fs.writeFileSync(path.join(ROOT,`test-results/coding-${scale}.png`),Buffer.from(screenshot,'base64'));}
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1));
  await tabout().click();
  await code(reference+'\n// persists at close');
  // A final edit closes immediately, before the 300 ms main-process debounce.
  await page.getByRole('textbox',{name:'JavaScript solution',exact:true}).focus();await page.keyboard.press('Control+End');await page.keyboard.insertText(' immediately');
  await app.close();app=await launch();page=await app.firstWindow();page.setDefaultTimeout(20000);await page.locator('.problem-table').waitFor();await open(1);
  const restored=await page.evaluate(()=>window.study.bootstrap());assert.ok(restored.data.drafts['leetcode:1'].source.endsWith('// persists at close immediately'));assert.ok(restored.data.submissions.length>=12);
  assert.equal(await tabout().getAttribute('aria-pressed'),'false','TabOut preference persists after restart');
  assert.deepEqual(errors,[]);console.log('PASS 100/125/150% scale, restart persistence, and no renderer errors');
  fs.writeFileSync(path.join(ROOT,`test-results/coding-${process.env.STUDY_TEST_EXE?'packaged':'e2e'}.json`),JSON.stringify({passed:true,profile:directory,packaged:!!process.env.STUDY_TEST_EXE,submissions:restored.data.submissions.length},null,2));
}finally{await app.close();}
