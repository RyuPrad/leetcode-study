import { _electron as electron } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { ROOT } from '../scripts/content.mjs';
import { actWhileCodeRuns } from './helpers/running-code-action.mjs';
const problems=JSON.parse(fs.readFileSync(path.join(ROOT,'coding/problems.json'),'utf8'));
fs.mkdirSync(path.join(ROOT,'.test-data'),{recursive:true});fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
const directory=fs.mkdtempSync(path.join(ROOT,'.test-data/coding-e2e-'));
const env={...process.env,STUDY_DATA_DIR:directory,STUDY_HEADLESS:'0'};delete env.ELECTRON_RUN_AS_NODE;
if(process.env.STUDY_TEST_EXE)env.PATH=`${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`;
const launch=()=>electron.launch({...(process.env.STUDY_TEST_EXE?{executablePath:process.env.STUDY_TEST_EXE,args:[]}:{args:[ROOT]}),env,timeout:30000});
let app=await launch(),page=await app.firstWindow();page.setDefaultTimeout(20000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text());});
async function open(n){const p=problems.find(p=>p.number===n);if(await page.getByRole('button',{name:'Back to library',exact:true}).count())await page.getByRole('button',{name:'Back to library',exact:true}).click();await page.getByRole('searchbox',{name:'Search problems'}).fill(String(n));await page.getByRole('button',{name:`Open ${p.title}`,exact:true}).click();await page.getByRole('tab',{name:'Code',exact:true}).click();await page.locator('.monaco-editor').waitFor();}
const editorNames={javascript:'JavaScript solution',typescript:'TypeScript solution',java:'Java solution',c:'C solution'};
async function waitDraft(source,language='javascript'){for(let attempt=0;attempt<100;attempt++){if(await page.evaluate(async ({source,language})=>(await window.study.bootstrap()).data.drafts['leetcode:'+document.querySelector('.description-body h2').textContent.split('.')[0]]?.sources?.[language]?.replace(/\r\n/g,'\n')===source.replace(/\r\n/g,'\n'),{source,language}))return;await page.waitForTimeout(50);}throw Error('Draft did not reach the expected source');}
async function code(source,language='javascript'){await page.getByRole('textbox',{name:editorNames[language],exact:true}).focus();await page.keyboard.press('Control+A');await page.evaluate(text=>{const clipboardData=new DataTransfer();clipboardData.setData("text/plain",text);document.activeElement.dispatchEvent(new ClipboardEvent("paste",{bubbles:true,cancelable:true,clipboardData}));},source);await waitDraft(source,language);}
const solutionFocused=()=>page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='JavaScript solution');
async function run(source,mode='run',expected='Accepted',language='javascript'){await code(source,language);await page.getByRole('button',{name:mode==='run'?'Run':'Submit',exact:true}).click();await page.locator('.judge-summary strong').waitFor({timeout:40000});assert.equal(await page.locator('.judge-summary strong').innerText(),expected,await page.locator('.code-panel-scroll').innerText());}
try{
  await page.locator('.problem-table').waitFor();await app.evaluate(({session})=>session.defaultSession.enableNetworkEmulation({offline:true}));
  if(process.env.STUDY_TEST_EXE)assert.ok(await app.evaluate(({app})=>app.isPackaged));
  await open(1);
  await solutionFocused();await page.keyboard.insertText('// ready\n');await waitDraft('// ready\n'+problems.find(p=>p.number===1).starter);
  const tabout=()=>page.getByRole('button',{name:'TabOut',exact:true});
  assert.equal(await tabout().getAttribute('aria-pressed'),'true');
  const navigation='function twoSum() { return ["hello"]; }',cursor=navigation.indexOf('hello')+2;
  async function position(){await page.getByRole('textbox',{name:'JavaScript solution',exact:true}).focus();await page.keyboard.press('Control+Home');for(let i=0;i<cursor;i++)await page.keyboard.press('ArrowRight');}
  for(const view of ['Learn','Visualizer','Notes','History']){
    await code(navigation);await position();
    await page.getByRole('tab',{name:new RegExp('^'+view+'(?:$|\\s|\\d)')}).click();await page.getByRole('tab',{name:'Code',exact:true}).click();
    // Do not focus the editor here: typing must work from the Code tab activation.
    await solutionFocused();await page.keyboard.insertText('X');await waitDraft(navigation.slice(0,cursor)+'X'+navigation.slice(cursor));
    await page.keyboard.press('Control+Z');await waitDraft(navigation);
  }
  await position();await page.keyboard.press('Shift+ArrowRight');await page.keyboard.press('Shift+ArrowRight');
  await page.getByRole('tab',{name:'Notes',exact:true}).click();
  await page.getByRole('tab',{name:'Code',exact:true}).press('Enter');await solutionFocused();await page.keyboard.insertText('X');
  await waitDraft(navigation.slice(0,cursor)+'X'+navigation.slice(cursor+2));
  console.log('PASS first opening, all four problem tabs, keyboard tab activation, restored caret/selection and undo without refocusing');
  await code(navigation);await position();await page.keyboard.press('Tab');await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
  assert.equal((await page.evaluate(()=>window.study.bootstrap())).data.drafts['leetcode:1']?.sources?.javascript,navigation,'TabOut does not change or save source');
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
  await page.getByRole('button',{name:'Go to error line',exact:true}).first().click();await solutionFocused();
  await run('function twoSum(){while(true){}}','run','Time limit exceeded');
  await code('function twoSum(){while(true){}}');await actWhileCodeRuns(page,'Run','Stop');await page.getByText('Cancelled',{exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Stop',exact:true}).count(),0,'Stop terminates the running job');
  await run(reference);
  console.log('PASS wrong answers, syntax/runtime errors, timeout, Stop, and recovery');
  await page.getByRole('tab',{name:'Test cases',exact:true}).click();await page.getByRole('radio',{name:'Custom cases',exact:true}).check();await page.getByLabel('Custom test cases').fill('[[[4,5,9],9]]');
  await page.keyboard.press('Control+Enter');await page.locator('.judge-summary strong').waitFor();assert.equal(await page.locator('.judge-summary strong').innerText(),'Accepted');
  await page.getByRole('tab',{name:'Test cases',exact:true}).click();await page.getByLabel('Custom test cases').fill('[[[4,5,9],100]]');await page.getByRole('button',{name:'Run',exact:true}).click();await page.getByRole('alert').filter({hasText:'Exactly one'}).waitFor();await page.getByLabel('Custom test cases').fill('[[[4,5,9],9]]');
  await page.getByRole('tab',{name:/Submissions \(/}).click();assert.equal(await page.locator('.submission-list button').count(),2);await page.locator('.submission-list button').last().click();await page.getByRole('button',{name:'Reopen code',exact:true}).click();await page.getByRole('button',{name:'Replace draft',exact:true}).click();
  await page.getByRole('button',{name:'Reset code',exact:true}).click();
  assert.ok(await page.getByRole('dialog',{name:'Reset solution',exact:true}).evaluate(el=>el.contains(document.activeElement)),'reset dialog retains focus');
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  console.log('PASS custom cases, keyboard Run, invalid input, saved submission reopen, reset confirmation');
  const backupPath=path.join(directory,'coding-backup.json');
  await app.evaluate(({dialog},file)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:file});dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});},backupPath);
  await page.getByRole('button',{name:'Settings and backup',exact:true}).click();await page.getByRole('button',{name:'Export backup',exact:true}).click();await page.getByText('Your backup was exported.',{exact:true}).waitFor();
  const backup=JSON.parse(fs.readFileSync(backupPath,'utf8'));assert.equal(backup.version,4);assert.equal(backup.drafts['leetcode:1'].sources.javascript.replace(/\r\n/g,'\n'),reference);assert.equal(backup.submissions.length,2);
  await page.getByRole('button',{name:'Restore backup',exact:true}).click();await page.locator('.problem-table').waitFor();await open(1);const imported=await page.evaluate(()=>window.study.bootstrap());assert.equal(imported.data.drafts['leetcode:1'].sources.javascript,backup.drafts['leetcode:1'].sources.javascript);assert.deepEqual(imported.data.submissions,backup.submissions);
  await code('function twoSum(){while(true){}}');await actWhileCodeRuns(page,'Submit','Back to library');await page.locator('.problem-table').waitFor();await open(933);await page.waitForFunction(async()=>{const {data}=await window.study.bootstrap();return data.submissions.at(-1)?.result.verdict==='Cancelled';});
  console.log('PASS native backup export/restore includes drafts/submissions and navigation cancels running code');
  for(const n of [2,48,133,138,146,297,374,700,933,1095]){await open(n);await run(problems.find(p=>p.number===n).reference,'submit');}
  console.log('PASS list/tree/graph/design/in-place/API problems including 700 and 933');
  // Each language keeps its own draft; TypeScript runs in the same offline sandbox and can be debugged.
  await open(206);
  const javascriptDraft=problems.find(p=>p.number===206).reference;await code(javascriptDraft);
  const language=()=>page.getByRole('combobox',{name:'Language',exact:true});
  assert.equal(await language().inputValue(),'javascript');
  await language().selectOption('typescript');await page.getByRole('textbox',{name:'TypeScript solution',exact:true}).waitFor();
  assert.match(await page.locator('.contract-signature').innerText(),/reverseList\(head: ListNode \| null\): ListNode \| null/);
  assert.match((await page.locator('.code-editor').innerText()).replace(/\u00a0/g,' '),/function reverseList\(head: ListNode \| null\): ListNode \| null/,'TypeScript starter is shown');
  await run('function reverseList(head: ListNode | null): ListNode | null {\n  throw new Error("typed failure");\n','run','Syntax error','typescript');
  const typed='function reverseList(head: ListNode | null): ListNode | null {\n  let prev: ListNode | null = null;\n  while (head) { const next: ListNode | null = head.next; head.next = prev; prev = head; head = next; }\n  return prev;\n}\n';
  await run(typed,'submit','Accepted','typescript');
  assert.ok(await page.getByRole('button',{name:'Debug',exact:true}).isVisible(),'TypeScript can be debugged');
  // The debugger pauses on the first TypeScript statement and finishes with the reference result.
  await page.getByRole('button',{name:'Debug',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.debug-status.paused,.debug-result'));
  assert.equal(await page.locator('.debug-result').count(),0,'TypeScript debugging pauses before running');
  assert.equal(await page.evaluate(()=>{const arrow=document.querySelector('.debug-source .debug-current-arrow');if(!arrow)return null;const top=arrow.getBoundingClientRect().top;return [...document.querySelectorAll('.debug-source .line-numbers')].find(n=>Math.abs(n.getBoundingClientRect().top-top)<3)?.textContent;}),'2','paused on `let prev: ListNode | null = null;`');
  const moreControls=page.getByRole('button',{name:'More controls',exact:true});if(await moreControls.isVisible()&&await moreControls.getAttribute('aria-expanded')!=='true')await moreControls.click();
  await page.locator('.debug-controls').getByRole('button',{name:/Continue/}).click();
  await page.locator('.debug-result').waitFor({timeout:30000});assert.match(await page.locator('.debug-result strong').innerText(),/matches expected/);
  const closeDebugger=page.getByRole('button',{name:'Close debugger and return to code',exact:true});
  if(await closeDebugger.isVisible())await closeDebugger.click();else{if(await moreControls.isVisible()&&await moreControls.getAttribute('aria-expanded')!=='true')await moreControls.click();await page.locator('.debug-toolbar').getByRole('button',{name:/Stop \/ edit|Back to code/}).click();}
  await page.locator('.debug-workspace').waitFor({state:'detached'});
  await page.getByRole('tab',{name:/Submissions/}).click();assert.match(await page.locator('.submission-list button').first().innerText(),/Accepted[\s\S]*TypeScript/);
  let saved=(await page.evaluate(()=>window.study.bootstrap())).data;
  assert.equal(saved.submissions.at(-1).language,'typescript');assert.equal(saved.drafts['leetcode:206'].language,'typescript');assert.equal(saved.drafts['leetcode:206'].sources.javascript.replace(/\r\n/g,'\n'),javascriptDraft.replace(/\r\n/g,'\n'));
  await language().selectOption('java');await page.getByRole('textbox',{name:'Java solution',exact:true}).waitFor();
  assert.match((await page.locator('.code-editor').innerText()).replace(/\u00a0/g,' '),/class Solution/);assert.equal(await page.getByRole('button',{name:'Debug',exact:true}).count(),0,'Java has no debugger yet');
  await language().selectOption('javascript');await page.getByRole('textbox',{name:'JavaScript solution',exact:true}).waitFor();await waitDraft(javascriptDraft,'javascript');
  // Draft writes are batched for 300 ms; wait for the language switch to reach the profile.
  for(let attempt=0;attempt<100;attempt++){saved=(await page.evaluate(()=>window.study.bootstrap())).data;if(saved.drafts['leetcode:206'].language==='javascript')break;await page.waitForTimeout(50);}
  assert.equal(saved.drafts['leetcode:206'].sources.typescript.replace(/\r\n/g,'\n'),typed);assert.equal(saved.drafts['leetcode:206'].language,'javascript');
  console.log('PASS TypeScript starter, syntax error, Accepted submit, debugger lines, per-language drafts and submission language');
  // Java and C run as native programs with the bundled toolchains.
  const fixture=name=>fs.readFileSync(path.join(ROOT,'tests/fixtures/languages',name),'utf8');
  await open(1);
  await language().selectOption('java');await page.getByRole('textbox',{name:'Java solution',exact:true}).waitFor();
  assert.match(await page.locator('.native-note').innerText(),/not sandboxed/);
  assert.match(await page.locator('.contract-signature').innerText(),/int\[\] twoSum\(int\[\] nums, int target\)/);
  await run(fixture('java/1.java'),'submit','Accepted','java');
  await run(fixture('failures/compile-1.java'),'run','Syntax error','java');
  assert.match(await page.locator('.runtime-error pre').first().innerText(),/Solution\.java:3: error: ';' expected/);
  assert.ok(await page.getByRole('button',{name:'Go to error line',exact:true}).first().isVisible());
  await language().selectOption('c');await page.getByRole('textbox',{name:'C solution',exact:true}).waitFor();
  assert.match(await page.locator('.contract-signature').innerText(),/int\* twoSum\(int\* nums, int numsSize, int target, int\* returnSize\)/);
  await run(fixture('c/1.c'),'submit','Accepted','c');
  await run(fixture('failures/segfault-1.c'),'run','Runtime error','c');
  assert.match(await page.locator('.code-panel-scroll').innerText(),/Segmentation fault[\s\S]*before crash 4/);
  // Stop ends the native process well before its 2 second case limit.
  await code(fixture('failures/timeout-1.c'),'c');await page.getByRole('button',{name:'Run',exact:true}).click();
  await page.locator('.judge-running').waitFor();await page.waitForTimeout(1200);const stopped=performance.now();
  await page.getByRole('button',{name:'Stop',exact:true}).click();await page.locator('.judge-summary strong').waitFor();
  assert.equal(await page.locator('.judge-summary strong').innerText(),'Cancelled');assert.ok(performance.now()-stopped<1500);
  await run(fixture('c/1.c'),'run','Accepted','c');
  // The reference solution is revealed on request in the selected language and can become the draft.
  await page.getByRole('button',{name:'Solution',exact:true}).click();
  await page.getByRole('button',{name:'Show solution',exact:true}).click();
  const solutionText=await page.getByLabel('C reference solution',{exact:true}).innerText();
  assert.match(solutionText,/int\* twoSum\(int\* nums, int numsSize, int target, int\* returnSize\)/);
  await page.getByRole('button',{name:'Use as draft',exact:true}).click();
  await page.getByRole('dialog',{name:'Use reference solution'}).getByRole('button',{name:'Use as draft',exact:true}).click();
  await waitDraft(solutionText,'c');
  await page.getByRole('button',{name:'Submit',exact:true}).click();await page.locator('.judge-summary strong').waitFor({timeout:40000});
  assert.equal(await page.locator('.judge-summary strong').innerText(),'Accepted');
  await page.getByRole('tab',{name:'Notes',exact:true}).click();
  assert.match(await page.locator('.markdown').innerText(),/Solutions[\s\S]*TypeScript[\s\S]*Java[\s\S]*class Solution[\s\S]*\bC\b/);
  await page.getByRole('tab',{name:'Code',exact:true}).click();await page.getByRole('textbox',{name:'C solution',exact:true}).waitFor();
  saved=(await page.evaluate(()=>window.study.bootstrap())).data;
  assert.deepEqual(saved.submissions.filter(s=>s.problemId==='leetcode:1').slice(-3).map(s=>s.language),['java','c','c']);
  await language().selectOption('javascript');await page.getByRole('textbox',{name:'JavaScript solution',exact:true}).waitFor();
  console.log('PASS Java and C native Submit, compile error line, crash output, Stop and submission languages');
  // The Visualizer and Learn tabs show reference code in the Code tab's language; their picker changes it back.
  await language().selectOption('java');await page.getByRole('textbox',{name:'Java solution',exact:true}).waitFor();
  await page.getByRole('tab',{name:'Visualizer',exact:true}).click();
  const visual=page.frameLocator('iframe[title="Two Sum visualizer"]'),picker=frame=>frame.getByRole('combobox',{name:'Reference code language',exact:true});
  await visual.getByRole('region',{name:'Java reference code',exact:true}).waitFor();assert.equal(await picker(visual).inputValue(),'java');
  assert.match(await visual.getByRole('region',{name:'Java reference code',exact:true}).innerText(),/public int\[\] twoSum\(int\[\] nums, int target\)/);
  await visual.locator('#btn-next').click();await visual.locator('.study-mirror-line.active').first().waitFor();
  assert.ok(await visual.locator('.study-mirror-line.active').count()>=1,'the stepped line is highlighted in Java');assert.equal(await visual.locator('.study-code-original').isVisible(),false);
  await picker(visual).selectOption('c');await visual.getByRole('region',{name:'C reference code',exact:true}).waitFor();
  await page.getByRole('tab',{name:'Code',exact:true}).click();await page.getByRole('textbox',{name:'C solution',exact:true}).waitFor();assert.equal(await language().inputValue(),'c','the visualizer picker changes the Code tab');
  await page.getByRole('tab',{name:/Learn/}).click();const lesson=page.frameLocator('iframe[title="Two Sum guided lesson"]');
  await lesson.getByRole('region',{name:'C reference code',exact:true}).waitFor();assert.equal(await picker(lesson).inputValue(),'c');
  await page.getByRole('tab',{name:'Code',exact:true}).click();await language().selectOption('javascript');await page.getByRole('textbox',{name:'JavaScript solution',exact:true}).waitFor();
  await page.getByRole('tab',{name:'Visualizer',exact:true}).click();await visual.locator('.study-code-original').waitFor();assert.equal(await picker(visual).inputValue(),'javascript');
  console.log('PASS Visualizer and Learn reference code follow the Code tab language, and their picker changes it');
  await open(1);
  for(const scale of [1,1.25,1.5]){await app.evaluate(({BrowserWindow},factor)=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(factor),scale);await page.waitForTimeout(200);assert.ok(await page.locator('.run-actions').evaluate(el=>{const r=el.getBoundingClientRect();return r.right<=innerWidth&&r.bottom<=innerHeight;}),`Run controls fit at ${scale}`);assert.ok(await tabout().evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;}),`TabOut fits at ${scale}`);assert.ok(await page.getByRole('button',{name:'Run',exact:true}).isVisible());assert.ok(await page.getByRole('button',{name:'Submit',exact:true}).isVisible());const screenshot=await app.evaluate(async({BrowserWindow})=>(await BrowserWindow.getAllWindows()[0].webContents.capturePage()).toPNG().toString('base64'));fs.writeFileSync(path.join(ROOT,`test-results/coding-${scale}.png`),Buffer.from(screenshot,'base64'));}
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1));
  await tabout().click();
  await code(reference+'\n// persists at close');
  // A final edit closes immediately, before the 300 ms main-process debounce.
  await page.getByRole('textbox',{name:'JavaScript solution',exact:true}).focus();await page.keyboard.press('Control+End');await page.keyboard.insertText(' immediately');
  await app.close();app=await launch();page=await app.firstWindow();page.setDefaultTimeout(20000);await page.locator('.problem-table').waitFor();await open(1);
  const restored=await page.evaluate(()=>window.study.bootstrap());assert.ok(restored.data.drafts['leetcode:1'].sources.javascript.endsWith('// persists at close immediately'));assert.ok(restored.data.submissions.length>=16);assert.equal(restored.data.drafts['leetcode:206'].sources.typescript.replace(/\r\n/g,'\n'),typed);
  assert.equal(await tabout().getAttribute('aria-pressed'),'false','TabOut preference persists after restart');
  assert.deepEqual(errors,[]);console.log('PASS 100/125/150% scale, restart persistence, and no renderer errors');
  fs.writeFileSync(path.join(ROOT,`test-results/coding-${process.env.STUDY_TEST_EXE?'packaged':'e2e'}.json`),JSON.stringify({passed:true,profile:directory,packaged:!!process.env.STUDY_TEST_EXE,submissions:restored.data.submissions.length},null,2));
}finally{await app.close();}
