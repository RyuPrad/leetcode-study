// Typing practice in a real browser: keyboard input, automatic indentation, mistakes and Backspace,
// pausing, results, saved runs, the spoiler filter and the Type tab's reveal step.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';

fs.mkdirSync(path.join(ROOT,'.test-data'),{recursive:true});fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
const fixture=fs.mkdtempSync(path.join(ROOT,'.test-data/typing-browser-'));
const SOURCE=['int* pick(int** grid, int n) {','    // choose the corner','    if (grid[0][n - 1] != NULL && n >= 2) { return &grid[1][0]; } // why','    return (int*)0;','}'].join('\n');
fs.writeFileSync(path.join(fixture,'index.html'),'<div id="root"></div><script type="module" src="./harness.tsx"></script>');
fs.writeFileSync(path.join(fixture,'harness.tsx'),`
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import TypingTrainer from '/src/typing/TypingTrainer';
import TypingPractice from '/src/typing/TypingPractice';
import {normalize,toLines} from '/src/typing/snippets';
import '/src/styles.css';
const params=new URLSearchParams(location.search),view=params.get('view');
const lines=toLines(normalize(${JSON.stringify(SOURCE)}),'c');
const entries=[{id:'leetcode:1',number:1,title:'Two Sum',topic:'Array & Hashing',notePath:'a.md',markdown:'',searchText:''},{id:'leetcode:20',number:20,title:'Valid Parentheses',topic:'Stack',notePath:'b.md',markdown:'',searchText:''}];
window.fixture={lines,finished:[],searches:0};
window.addEventListener('keydown',e=>{if(e.ctrlKey&&e.key.toLowerCase()==='k'){e.preventDefault();fixture.searches++;}});
function Harness(){
 const [active,setActive]=useState(true);fixture.setActive=setActive;
 if(view==='catalog')return <div className="main-content"><TypingPractice kind="catalog" entries={entries} progress={JSON.parse(params.get('progress')||'{}')} topics={['Array & Hashing','Stack']} active={active} onOpenProblem={e=>{fixture.opened=e.id;}}/></div>;
 if(view==='problem')return <div style={{display:'flex',height:'90vh'}}><TypingPractice kind="problem" problemId="leetcode:20" language="java" active={active}/></div>;
 return <div style={{padding:20}}><TypingTrainer lines={lines} active={active} best={50} onFinish={s=>fixture.finished.push(s)} actions={<button className="primary-button" autoFocus>Next snippet</button>}/><button id="outside">Outside</button></div>;
}
createRoot(document.getElementById('root')).render(<Harness/>);
`);
// No file watcher: crawling the repository's generated test data made the first request take over 30 seconds.
const server=await createServer({configFile:false,root:ROOT,plugins:[react()],server:{host:'127.0.0.1',port:0,watch:null},logLevel:'error'});
await server.listen();
const base=`${server.resolvedUrls.local[0]}.test-data/${path.basename(fixture)}/index.html`;
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const report={};
const caretTarget=()=>page.evaluate(()=>{const t=document.querySelector('[data-caret]');const lines=[...document.querySelectorAll('.typing-line')];return t?{line:lines.indexOf(t.closest('.typing-line')),text:t.textContent,left:t.offsetLeft,eol:t.classList.contains('typing-eol')}:null;});
const caretX=()=>page.locator('.typing-caret').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m41);
const counts=()=>page.evaluate(()=>({ok:document.querySelectorAll('.typing-line .ok').length,bad:document.querySelectorAll('.typing-line .bad').length,extra:document.querySelector('.typing-line .extra')?.textContent??''}));
const clock=()=>page.locator('.typing-live b').first().textContent();
// Rendered code of each typed line, without comments, the line-end mark or extras.
const codeLines=()=>page.evaluate(()=>[...document.querySelectorAll('.typing-line:not(.skip)')].map(l=>[...l.children].filter(c=>!c.matches('.typing-comment,.typing-eol,.extra')).map(c=>c.textContent).join('')));
async function typeLines(lines,delay=0){for(let i=0;i<lines.length;i++){await page.keyboard.type(lines[i],{delay});if(i<lines.length-1)await page.keyboard.press('Enter');}}
try{
 await page.goto(`${base}?view=trainer`);await page.locator('.typing-text').waitFor();
 assert.equal(await page.evaluate(()=>document.activeElement?.classList.contains('typing-input')),true,'the hidden input is focused on open');
 assert.equal(await page.locator('.typing-overlay').count(),0);
 const first='int* pick(int** grid, int n) {';
 await page.keyboard.type(first);
 assert.deepEqual(await counts(),{ok:first.length,bad:0,extra:''});
 assert.equal((await caretTarget()).eol,true,'the caret waits at the line end for Enter');
 await page.keyboard.type('};');assert.equal((await counts()).extra,'};','characters past the end are extras');
 await page.keyboard.press('Backspace');await page.keyboard.press('Backspace');
 const firstLeft=await page.locator('.typing-line').first().locator('span').first().evaluate(el=>el.offsetLeft);
 await page.keyboard.press('Enter');
 let target=await caretTarget();
 assert.deepEqual([target.line,target.text],[2,'i'],'Enter skips the comment line and the indentation');
 assert.ok(target.left>=firstLeft+3*8,'the next character is indented');await page.waitForTimeout(150);assert.ok(Math.abs(await caretX()-target.left)<=1,'the caret sits on it');
 await page.keyboard.type('iX');assert.equal((await counts()).bad,1);
 assert.equal(await page.locator('.typing-line.current .bad').textContent(),'f','a mistake shows the expected character');
 await page.keyboard.press('Backspace');assert.equal((await counts()).bad,0);
 const before=await counts();
 await page.locator('.typing-input').evaluate(el=>{for(const inputType of ['insertFromPaste','insertFromDrop','historyUndo'])el.dispatchEvent(new InputEvent('beforeinput',{inputType,data:'zzz',cancelable:true,bubbles:true}));});
 assert.deepEqual(await counts(),before,'paste, drop and undo are ignored');assert.equal(await page.locator('.typing-input').inputValue(),'');
 await page.keyboard.press('Control+K');assert.equal(await page.evaluate(()=>fixture.searches),1,'Ctrl+K still reaches the app');assert.deepEqual(await counts(),before);
 report.input='typing, extras, automatic indentation, mistakes, Backspace, ignored paste and passed-through shortcuts';
 await page.locator('#outside').click();
 await page.locator('.typing-overlay').filter({hasText:'Paused'}).waitFor();
 const paused=await clock();await page.waitForTimeout(1300);assert.equal(await clock(),paused,'the clock stops while unfocused');
 await page.keyboard.press('a');assert.equal(await page.evaluate(()=>document.activeElement?.id),'outside','a key does not steal focus from another control');
 await page.locator('.typing-frame').click();assert.equal(await page.locator('.typing-overlay').count(),0);
 await page.evaluate(()=>fixture.setActive(false));await page.locator('.typing-overlay').filter({hasText:'Paused'}).waitFor();
 await page.evaluate(()=>fixture.setActive(true));await page.waitForFunction(()=>document.activeElement?.classList.contains('typing-input'));
 report.pause='blur, another control and an inactive view pause the clock; clicking the text resumes';
 await page.keyboard.type('f (grid[0][n - 1] != NULL && n >= 2) { return &grid[1][0]; }',{delay:12});await page.keyboard.press('Enter');
 target=await caretTarget();assert.deepEqual([target.line,target.text],[3,'r'],'the trailing comment is not typed');
 await typeLines(['return (int*)0;','}'],12);
 await page.locator('.typing-results').waitFor();
 const stats=await page.evaluate(()=>fixture.finished);assert.equal(stats.length,1);
 assert.equal(stats[0].incorrect,0);assert.ok(stats[0].accuracy<100,'corrected mistakes still count against accuracy');
 assert.deepEqual(stats[0].misses.map(m=>m[0]).sort(),['\n','f'].sort());
 assert.equal(Number(await page.locator('.typing-score strong').first().textContent()),Math.round(stats[0].wpm));
 assert.ok(stats[0].samples.length>=2);await page.locator('.typing-chart svg').waitFor();
 assert.equal(await page.evaluate(()=>document.activeElement?.textContent),'Next snippet','the next action takes focus');
 await page.locator('.typing-chart svg').focus();await page.keyboard.press('ArrowLeft');await page.locator('.typing-tooltip').waitFor();
 report.results='results card, WPM, accuracy, most-missed keys, chart with keyboard tooltip';
 await page.goto(`${base}?view=trainer`);await page.locator('.typing-text').waitFor();
 await page.keyboard.type('int');await page.keyboard.press('Tab');
 assert.equal(await page.evaluate(()=>document.activeElement?.textContent),'Restart','Tab reaches Restart');
 await page.keyboard.press('Enter');await page.waitForFunction(()=>document.activeElement?.classList.contains('typing-input'));
 assert.equal((await counts()).ok,0,'Restart starts a fresh attempt');
 assert.notEqual(await page.locator('.typing-caret').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('.typing-caret').evaluate(el=>getComputedStyle(el).transitionDuration),'0s','reduced motion stops the caret sliding');
 await page.emulateMedia({reducedMotion:null});
 report.restart='Tab then Enter restarts; reduced motion';

 await page.goto(`${base}?view=catalog`);await page.evaluate(()=>localStorage.clear());await page.reload();
 await page.getByText('No problems to type yet').waitFor();
 await page.getByRole('button',{name:'Include all problems'}).click();await page.locator('.typing-snippet-head strong').waitFor();
 assert.equal(JSON.parse(await page.evaluate(()=>localStorage.getItem('study.typingSettings'))).source,'all');
 await page.evaluate(()=>localStorage.clear());
 await page.goto(`${base}?view=catalog&progress=${encodeURIComponent(JSON.stringify({'leetcode:1':{status:'in-progress',bookmarked:false,needsReview:false,updatedAt:'2026-10-14T00:00:00.000Z'}}))}`);
 await page.locator('.typing-snippet-head strong').filter({hasText:'1. Two Sum'}).waitFor();
 assert.match(await page.locator('.typing-snippet-head span').textContent(),/Array & Hashing · JavaScript · twoSum/);
 assert.equal(await page.locator('.typing-pool').textContent(),'1 problem','only started problems by default');
 await page.locator('.typing-frame').click();await typeLines(await codeLines());
 await page.locator('.typing-results').waitFor();
 const saved=JSON.parse(await page.evaluate(()=>localStorage.getItem('study.typingResults')));
 assert.equal(saved.length,1);assert.deepEqual([saved[0].problemId,saved[0].language,saved[0].mode,saved[0].unit,saved[0].accuracy],['leetcode:1','javascript','snippet','twoSum',100]);
 assert.equal(await page.locator('.typing-runs li').count(),1);
 assert.notEqual(await page.locator('.stat').filter({hasText:'JavaScript'}).locator('strong').textContent(),'– wpm');
 await page.getByRole('button',{name:'Whole solution'}).click();await page.locator('.typing-snippet-head span').filter({hasText:'Whole solution'}).waitFor();
 await page.getByLabel('Typing language').selectOption('java');await page.locator('.typing-snippet-head span').filter({hasText:'Java · Whole solution'}).waitFor();
 assert.match((await codeLines()).join('\n'),/public int\[\] twoSum/);
 await page.getByRole('button',{name:'Open problem'}).click();assert.equal(await page.evaluate(()=>fixture.opened),'leetcode:1');
 report.catalog='spoiler filter and empty state, saved results, personal bests, recent runs, modes and languages';

 await page.goto(`${base}?view=problem`);await page.getByText('Reveal the solution?').waitFor();
 assert.equal(await page.locator('.typing-text').count(),0,'nothing is shown before revealing');
 await page.getByRole('button',{name:'Show solution and type it'}).click();await page.locator('.typing-text').waitFor();
 assert.match((await codeLines()).join('\n'),/isValid\(String s\)/);
 report.problem='the Type tab asks before showing the reference solution';
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(ROOT,'test-results/typing.json'),JSON.stringify({passed:true,...report},null,2));
 for(const line of Object.values(report))console.log(`PASS ${line}`);
}finally{await browser.close();await server.close();fs.rmSync(fixture,{recursive:true,force:true});}
