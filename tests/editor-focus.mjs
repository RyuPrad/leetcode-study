import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';

fs.mkdirSync(path.join(ROOT,'.test-data'),{recursive:true});
fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
const directory=fs.mkdtempSync(path.join(ROOT,'.test-data/editor-focus-'));
fs.writeFileSync(path.join(directory,'index.html'),'<div id="root"></div><script type="module" src="./harness.tsx"></script>');
fs.writeFileSync(path.join(directory,'harness.tsx'),`
import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import * as monaco from 'monaco-editor/editor/editor.api.js';
import CodeEditor from '/src/coding/CodeEditor';
import {useEditorFocusRequest} from '/src/coding/editor-focus';
import '/src/coding/coding.css';
function Harness(){
 const [source,setSource]=useState('fn(value)'),[active,setActive]=useState(false),[loaded,setLoaded]=useState(false);
 const [modal,setModal]=useState(false),[debug,setDebug]=useState(false),[problem,setProblem]=useState('first'),[tick,setTick]=useState(0);
 const [request,requestFocus]=useEditorFocusRequest(active&&!modal);
 const dialog=useRef(null);useEffect(()=>{if(modal)dialog.current.showModal();},[modal]);
 Object.assign(window.fixture??={}, {editor:()=>monaco.editor.getEditors()[0],monaco,flushSync,setSource,setLoaded,setProblem,setTick});
 return <>
  <button id="code" onClick={()=>{setActive(true);requestFocus();}}>Code</button>
  <button id="away" onClick={()=>setActive(false)}>Notes</button>
  <button id="modal" onClick={()=>setModal(true)}>Settings</button>
  <input id="search" aria-label="Search"/>
  <button id="debug" onClick={()=>setDebug(true)}>Debug</button>
  {debug&&<button id="stop" onClick={()=>{setDebug(false);requestFocus();}}>Stop / edit</button>}
  <span>{tick}</span>
  <div hidden={!active} style={{height:360,width:780,display:active?'flex':'none',flexDirection:'column'}}>
   {loaded&&<CodeEditor source={source} onChange={setSource} problemId={problem} active={active&&!modal&&!debug} focusRequest={request} line={null} tabOutEnabled/>}
  </div>
  {modal&&<dialog ref={dialog}><input id="dialog-input"/><button id="close" onClick={()=>setModal(false)}>Close</button></dialog>}
 </>;
}
createRoot(document.getElementById('root')!).render(<Harness/>);
`);
const server=await createServer({configFile:false,root:ROOT,plugins:[react()],server:{host:'127.0.0.1',port:0},logLevel:'error'});
await server.listen();
const browser=await chromium.launch({headless:true}),page=await browser.newPage(),errors=[];
page.on('pageerror',error=>errors.push(error.message));
const url=`${server.resolvedUrls.local[0]}.test-data/${path.basename(directory)}/index.html`;
const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const focused=()=>page.waitForFunction(()=>fixture.editor()?.hasTextFocus());
const mount=()=>page.evaluate(()=>fixture.flushSync(()=>fixture.setLoaded(true)));
const read=()=>page.evaluate(()=>{const e=fixture.editor();return {value:e.getValue(),selections:e.getSelections(),top:e.getScrollTop(),left:e.getScrollLeft(),version:e.getModel().getVersionId(),focused:e.hasTextFocus()};});
async function setup(source,selections,top=0){
 await page.evaluate(({source,selections,top})=>{
  const e=fixture.editor();fixture.flushSync(()=>e.setValue(source));
  e.setSelections(selections.map(s=>new fixture.monaco.Selection(...s)));e.setScrollTop(top);e.focus();
 },{source,selections,top});await settle();
}
async function roundtrip(expectFocus=true){await page.locator('#away').click();await settle();await page.locator('#code').click();if(expectFocus)await focused();await settle();}
try{
 await page.goto(url);await page.locator('#code').click();await mount();await focused();
 await page.keyboard.insertText('/*first*/');assert.equal((await read()).value,'/*first*/fn(value)');
 console.log('PASS first Code activation focuses after deferred editor mount');

 await setup('fn(value)',[[1,6,1,6]]);await roundtrip();await page.keyboard.insertText('X');assert.equal((await read()).value,'fn(vaXlue)');
 await page.keyboard.press('Control+Z');assert.equal((await read()).value,'fn(value)','tab switches preserve undo');
 await page.keyboard.press('Tab');assert.equal((await read()).selections[0].positionColumn,10,'TabOut works immediately on return');

 const long=Array.from({length:100},(_,i)=>'// line '+String(i+1).padStart(3,'0')+' abcdef').join('\n');
 await setup(long,[[42,12,40,4]],690);const selected=await read();await roundtrip();const returned=await read();
 assert.deepEqual(returned,selected,'reversed selection, view and model version survive hidden layout');
 await page.keyboard.insertText('REPLACED');assert.ok((await read()).value.includes('REPLACED'));
 await setup(long,[[40,12,40,12],[43,12,43,12]],710);const multiple=await read();await roundtrip();assert.deepEqual(await read(),multiple,'all carets and scroll are restored');
 await page.keyboard.insertText('X');assert.equal((await read()).value.split('X').length-1,2);
 await setup(long,[[2,4,2,4]],1000);const offscreen=await read();await roundtrip();assert.deepEqual(await read(),offscreen,'scroll stays put even when the caret is offscreen');
 await page.locator('#away').click();await settle();
 await page.evaluate(()=>{fixture.flushSync(()=>document.getElementById('code').click());fixture.flushSync(()=>document.getElementById('away').click());});
 await settle();await page.locator('#code').click();await focused();await settle();assert.deepEqual(await read(),offscreen,'an interrupted return preserves the original view');
 console.log('PASS caret, reversed selection, multiple cursors, scroll, undo and TabOut');

 await page.locator('#search').focus();await page.evaluate(()=>fixture.setTick(v=>v+1));await settle();
 assert.equal(await page.locator('#search').evaluate(el=>el===document.activeElement),true,'background render cannot take focus');
 await page.locator('#modal').click();await page.locator('#dialog-input').fill('settings');await settle();
 assert.equal((await read()).focused,false);await page.locator('#close').click();await settle();assert.equal((await read()).focused,false,'closing a dialog does not replay an old request');
 await page.locator('#code').click();await focused();

 // Make the competing action happen in the same task, before the focus frame.
 for(const action of ['search','away','modal','keyboard','blur']){
  await page.locator('#away').click();
  await page.evaluate(action=>{
   fixture.flushSync(()=>document.getElementById('code').click());
   if(action==='search')document.getElementById('search').focus();
   else if(action==='keyboard')document.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true}));
   else if(action==='blur')window.dispatchEvent(new Event('blur'));
   else fixture.flushSync(()=>document.getElementById(action).click());
  },action);await settle();
  assert.equal((await read()).focused,false,action+' cancels the pending focus');
  if(action==='modal'){await page.locator('#close').click();await settle();assert.equal((await read()).focused,false);}
 }
 console.log('PASS background renders, dialogs, rapid tab switches and competing focus cancel pending requests');

 await page.locator('#code').click();await focused();await setup('fn(value)',[[1,6,1,6]]);
 await page.locator('#debug').click();await roundtrip(false);assert.equal((await read()).focused,false,'solution must not focus behind Debug');
 await page.locator('#stop').click();await focused();await page.keyboard.insertText('X');assert.equal((await read()).value,'fn(vaXlue)');

 await setup(long,[[80,8,80,8]],1200);await page.locator('#away').click();
 await page.evaluate(()=>fixture.setSource('replacement()'));await settle();await page.locator('#code').click();await focused();
 assert.equal((await read()).top,0);assert.equal((await read()).selections[0].positionLineNumber,1);
 await page.locator('#away').click();await page.evaluate(()=>fixture.flushSync(()=>{fixture.setSource('newProblem()');fixture.setProblem('second');}));
 await page.locator('#code').click();await focused();await page.keyboard.insertText('/*new*/');assert.equal((await read()).value,'/*new*/newProblem()');
 console.log('PASS Stop/edit resumes solution, replacements and new models discard stale view state');

 // Repeat with no mounted editor to cover cancellation during lazy loading.
 for(const action of ['search','away','modal']){
  await page.goto(url);await page.locator('#code').click();
  if(action==='search')await page.locator('#search').fill('keep focus');else await page.locator('#'+action).click();
  await mount();await settle();assert.equal((await read()).focused,false,action+' cancels before first mount');
  if(action==='modal'){await page.locator('#close').click();await settle();assert.equal((await read()).focused,false);}
  await page.locator('#code').click();await focused();
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(ROOT,'test-results/editor-focus.json'),JSON.stringify({passed:true,realMonaco:true,keyboard:true,deferredMount:true,directory},null,2));
 console.log('PASS delayed-load cancellation and fresh activation after cancellation');
}finally{await browser.close();await server.close();}
