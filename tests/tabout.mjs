import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';

fs.mkdirSync(path.join(ROOT,'.test-data'),{recursive:true});fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
const fixture=fs.mkdtempSync(path.join(ROOT,'.test-data/tabout-browser-'));
fs.writeFileSync(path.join(fixture,'index.html'),'<div id="root"></div><script type="module" src="./harness.tsx"></script>');
fs.writeFileSync(path.join(fixture,'harness.tsx'),`
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import * as monaco from 'monaco-editor/editor/editor.api.js';
import CodeEditor from '/src/coding/CodeEditor';
import {collectTabOutTargets,tabOutTarget} from '/src/coding/tab-out-targets';
import '/src/coding/coding.css';
function Harness(){
 const [source,setSource]=useState('fn(value)'),[enabled,setEnabled]=useState(true),[readOnly,setReadOnly]=useState(false);
 Object.assign(window.fixture??=( {} ),{editor:()=>monaco.editor.getEditors()[0],monaco,setEnabled,setReadOnly,collectTabOutTargets,tabOutTarget,flushSync});
 return <><div style={{height:500,display:'flex',flexDirection:'column'}}><CodeEditor source={source} onChange={setSource} problemId="keyboard-test" active line={null} tabOutEnabled={enabled} readOnly={readOnly}/></div><button id="after-editor">After editor</button></>;
}
createRoot(document.getElementById('root')!).render(<Harness/>);
`);
const server=await createServer({configFile:false,root:ROOT,plugins:[react()],server:{host:'127.0.0.1',port:0},logLevel:'error'});
await server.listen();
const browser=await chromium.launch({headless:true}),page=await browser.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const read=()=>page.evaluate(()=>{const e=fixture.editor();return {value:e.getValue(),position:e.getPosition(),selection:e.getSelection(),version:e.getModel().getVersionId()};});
async function setup(marked){
 const offset=marked.indexOf('|');assert.ok(offset>=0);const source=marked.slice(0,offset)+marked.slice(offset+1);
 await page.evaluate(({source,offset})=>{const e=fixture.editor();e.trigger('test','leaveSnippet',{});e.trigger('test','hideSuggestWidget',{});fixture.flushSync(()=>e.setValue(source));e.setPosition(e.getModel().getPositionAt(offset));e.focus();},{source,offset});
 return source;
}
async function jump(marked,key,expected){
 const source=await setup(marked),before=await read();await page.keyboard.press(key);const after=await read();
 assert.equal(after.value,source,`${key} must not edit ${marked}`);assert.equal(after.version,before.version,`${key} must not create an edit`);
 const offset=expected.indexOf('|'),prefix=expected.slice(0,offset),parts=prefix.split('\n');
 assert.deepEqual(after.position,{lineNumber:parts.length,column:parts.at(-1).length+1},`${marked} ${key}`);
}
try{
 await page.goto(`${server.resolvedUrls.local[0]}.test-data/${path.basename(fixture)}/index.html`);await page.waitForFunction(()=>window.fixture?.editor());
 for(const [from,key,to] of [
  ['console.log("hel|lo");','Tab','console.log("hello"|);'],
  ['console.log("hello"|);','Tab','console.log("hello")|;'],
  ['console.log("hello")|;','Shift+Tab','console.log("hello"|);'],
  ['fn([va|lue])','Tab','fn([value]|)'],
  ['fn([value]|)','Tab','fn([value])|'],
  ['fn([value]|)','Shift+Tab','fn([value|])'],
  ['fn("a|\\\"[)]b")','Tab','fn("a\\\"[)]b"|)'],
  ["fn('a|\\'b')",'Tab',"fn('a\\'b'|)"],
  ['fn(`a|${value}`)','Tab','fn(`a${value}|`)'],
  ['fn(`a${go("x|")}b`)','Tab','fn(`a${go("x"|)}b`)'],
  ['fn(`a${go("x")}b|`)','Tab','fn(`a${go("x")}b`|)'],
  ['fn(`a\\`b|`)','Tab','fn(`a\\`b`|)'],
  ['fn(`a${`b${va|lue}`}c`)','Tab','fn(`a${`b${value}|`}c`)'],
  ['fn(`one\ntw|o`)','Tab','fn(`one\ntwo`|)'],
  ['fn(/* [" */ /[)]/, va|lue)','Tab','fn(/* [" */ /[)]/, value)|'],
  ['fn(/ab[)]"/, va|lue)','Shift+Tab','fn|(/ab[)]"/, value)'],
  ['fn("😀he|llo")','Tab','fn("😀hello"|)'],
  ['fn(|)','Tab','fn()|'],['fn([|])','Tab','fn([]|)']
 ])await jump(from,key,to);
 console.log('PASS real JavaScript tokenization, nested and empty pairs, escaped quotes, templates, regex/comments, UTF-16 and reverse jumps');
 for(const marked of ['  |fn(value)','fn(val|ue\n)','fn("unfin|ished )','// comm|ent )','fn(/* com|ment ) */ value)','fn(/ab|[)]/, value)']){
  const source=await setup(marked);await page.keyboard.press('Tab');assert.notEqual((await read()).value,source,`native Tab for ${marked}`);
 }
 await setup('  |fn(value)');await page.keyboard.press('Shift+Tab');assert.equal((await read()).value,'fn(value)');
 await setup('fn(va|lue)');await page.keyboard.press('Control+A');await page.keyboard.press('Tab');assert.equal((await read()).value,'  fn(value)');await page.keyboard.press('Shift+Tab');assert.equal((await read()).value,'fn(value)');
 await setup('fn(va|lue)\nfn(value)');await page.evaluate(()=>fixture.editor().setSelections([new fixture.monaco.Selection(1,6,1,6),new fixture.monaco.Selection(2,6,2,6)]));await page.keyboard.press('Tab');assert.equal((await read()).value,'fn(va lue)\nfn(va lue)');
 await setup('fn(va|lue)');await page.evaluate(()=>fixture.setEnabled(false));await page.waitForTimeout(50);await page.keyboard.press('Tab');assert.equal((await read()).value,'fn(va lue)');await page.evaluate(()=>fixture.setEnabled(true));await page.waitForTimeout(50);
 await setup('fn(va|lue)');await page.evaluate(()=>fixture.setReadOnly(true));await page.waitForTimeout(50);const readonly=await read();await page.keyboard.press('Tab');assert.deepEqual(await read(),readonly);await page.evaluate(()=>fixture.setReadOnly(false));await page.waitForTimeout(50);
 await setup('fn(va|lue)');await page.evaluate(()=>fixture.editor().updateOptions({tabFocusMode:true}));const focusBefore=await read();await page.keyboard.press('Tab');assert.equal(await page.locator('#after-editor').evaluate(el=>el===document.activeElement),true);assert.equal((await read()).value,focusBefore.value);await page.evaluate(()=>fixture.editor().updateOptions({tabFocusMode:false}));
 console.log('PASS indentation, selections, multiple cursors, disabled/read-only editors and Tab focus navigation');
 await setup('fn(taboutC|)');await page.evaluate(()=>{
  fixture.completion=fixture.monaco.languages.registerCompletionItemProvider('javascript',{provideCompletionItems(model,position){const word=model.getWordUntilPosition(position);return {suggestions:[{label:'taboutCandidate',kind:fixture.monaco.languages.CompletionItemKind.Variable,insertText:'taboutCandidate',sortText:'000',range:new fixture.monaco.Range(position.lineNumber,word.startColumn,position.lineNumber,word.endColumn)}]};}});
  fixture.editor().trigger('test','editor.action.triggerSuggest',{});
 });await page.locator('.suggest-widget.visible .monaco-list-row.focused').filter({hasText:'taboutCandidate'}).waitFor();await page.keyboard.press('Tab');assert.equal((await read()).value,'fn(taboutCandidate)');assert.equal((await read()).position.column,'fn(taboutCandidate'.length+1);await page.evaluate(()=>fixture.completion.dispose());
 await setup('|');await page.evaluate(()=>fixture.editor().getContribution('snippetController2').insert('fn(${1:value}, ${2:other})$0'));
 await page.keyboard.insertText('first');await page.evaluate(()=>fixture.editor().trigger('test','hideSuggestWidget',{}));await page.keyboard.press('Tab');assert.equal((await read()).selection.startColumn,11);assert.equal((await read()).selection.endColumn,16);
 await page.keyboard.press('Shift+Tab');assert.equal((await read()).selection.startColumn,4);assert.equal((await read()).selection.endColumn,9);
 console.log('PASS autocomplete acceptance and forward/backward snippet navigation take priority');
 await setup('fn(va|lue)');await page.keyboard.insertText('X');await page.keyboard.press('Escape');await page.keyboard.press('Tab');await page.keyboard.press('Control+Z');assert.equal((await read()).value,'fn(value)');
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(ROOT,'test-results/tabout.json'),JSON.stringify({passed:true,keyboard:true,realJavaScriptLexer:true,fixture},null,2));
}finally{await browser.close();await server.close();}
