import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';
import {cardFor,settle,checkTextSize,checkCardGeometry,checkIndependentScroll,checkFocusRestore,presentation,assertPresentation} from './object-view-interactions.mjs';

fs.mkdirSync(path.join(ROOT,'.test-data'),{recursive:true});fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
const directory=fs.mkdtempSync(path.join(ROOT,'.test-data/object-view-ui-'));
fs.writeFileSync(path.join(directory,'index.html'),'<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><div id="root"></div><div id="reference"></div><script type="module" src="./harness.tsx"></script></body></html>');
fs.writeFileSync(path.join(directory,'harness.tsx'),`
import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import FrameView from '/src/visualization/FrameView';
import {PanelWorkspace} from '/src/visualization/PanelWorkspace';
import '/src/coding/debugging.css';
function make(index){
 const head={val:index+1,next:null};let current=head;for(let i=2;i<=18;i++){current.next={val:i,next:null};current=current.next;}
 const cycle={val:1,next:null};cycle.next=cycle;
 const tree=depth=>depth?{val:depth,left:tree(depth-1),right:tree(depth-1)}:null;
 const roots={n:index,head,alias:head,...(index===2?{}:{array:Array.from({length:180},(_,i)=>i===179?'FINAL_LONG_ARRAY_'+('x'.repeat(110)):i)}),matrix:Array.from({length:12},(_,r)=>Array.from({length:20},(_,c)=>r*20+c)),tree:tree(4),cycle,map:new Map([[1,'number'],['1','string']]),set:new Set([1,2]),unsafe:'<img src=x onerror="window.injection=true">'};
 const captured=StudyObjectView.capture(roots,{idOf:(object,path)=>'fixture:'+path,frameId:1,frameName:'walk'});
 const inner=StudyObjectView.capture({n:10+index},{frameId:2,frameName:'walk'});
 return {...captured,index,location:{line:2,column:1,endLine:2,endColumn:1},phase:'before',action:'Inspect',explanation:'',stack:[...captured.stack,...inner.stack],reads:[],changes:[],logs:[]};
}
function Harness(){
 const [index,setIndex]=useState(0),[run,setRun]=useState(0),[moment,setMoment]=useState(2),[textSize,setTextSize]=useState(16);
 const frame=make(index),prior=index?make(index-1):undefined,display=moment<2&&prior?{...prior,reads:[],changes:[]}:frame;
 Object.assign(window.fixture??={}, {setIndex,setRun,setMoment,flushSync,make});
 useEffect(()=>{StudyObjectView.render(document.getElementById('reference'),display,{runId:run,mode:'reference',previousFrame:moment<2?undefined:prior});},[index,run,moment]);
 return <><button id="next" onClick={()=>setIndex(v=>v+1)}>Next</button><button id="reset" onClick={()=>{setIndex(0);setRun(v=>v+1);setMoment(2);}}>Reset</button><div className="debug-workspace debug-free-panels" style={{position:'relative',height:900}}><PanelWorkspace view="debug" onInteraction={()=>{}}><FrameView key={run} frame={display} previousFrame={moment<2?undefined:prior} operationFrame={frame} moment={moment} objectTextSize={textSize} onObjectTextSizeChange={setTextSize}/></PanelWorkspace></div></>;
}
createRoot(document.getElementById('root')!).render(<Harness/>);
`);
const server=await createServer({configFile:false,root:ROOT,plugins:[react()],server:{host:'127.0.0.1',port:0},logLevel:'error'});await server.listen();
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1500,height:1100},reducedMotion:'reduce'}),errors=[];page.on('pageerror',error=>errors.push(error.message));
const container=()=>page.locator('#debug-objects-panel .study-object-view'),reference=()=>page.locator('#reference'),card=name=>cardFor(container(),name,1),body=name=>card(name).locator('.study-object-body');
const scroll=[],geometry=[];
try{
 await page.goto(`${server.resolvedUrls.local[0]}.test-data/${path.basename(directory)}/index.html`);await container().locator('.study-object-card').first().waitFor();
 assert.ok(await page.locator('[data-study-panel=objects]').isVisible());assert.ok(await page.locator('[data-study-panel=diagram]').isVisible());
 await page.evaluate(()=>document.querySelector('.debug-panel-workspace').studyPanelLayout.show('objects'));
 assert.equal(await container().locator('[data-variable-id="n"]').count(),2);assert.equal(await page.locator('.viz-stack>button').count(),2);
 assert.equal((await cardFor(container(),'n',2).locator('.study-object-body').innerText()).trim(),'10');
 assert.equal(await page.locator('.study-object-view img').count(),0);assert.equal(await page.evaluate(()=>window.injection),undefined);
 assert.match(await card('map').textContent(),/1 => "number"/);assert.match(await card('map').textContent(),/"1" => "string"/);
 assert.match(await card('cycle').textContent(),/circular reference/);assert.ok(await card('head').locator('.study-object-alias[data-alias="alias"]').first().isVisible());
 await checkTextSize(page,container());await checkTextSize(page,reference());
 for(const [width,columns]of [[1240,3],[1200,3],[1199,2],[840,2],[800,2],[799,1],[520,1]]){
  await reference().evaluate((container,width)=>{container.style.width=`${width}px`;container.style.maxWidth='none';},width);await settle(page);
  const result=await checkCardGeometry(reference());assert.equal(result.columns,columns);geometry.push(result);
 }
 await reference().evaluate(container=>{container.style.width='';container.style.maxWidth='';});
 for(const target of [container(),reference()]){
  await cardFor(target,'array',1).getByRole('button',{name:'Show 130 more entries',exact:true}).click();
  await cardFor(target,'head',1).locator('.study-object-toggle').first().click();
  const scalar=await cardFor(target,'n',1).boundingBox(),long=await cardFor(target,'array',1).boundingBox();
  assert.ok(scalar.height<170&&scalar.height<long.height/2,'Scalar cards do not stretch to fill a tall neighboring value.');
  scroll.push(await checkIndependentScroll(page,page,target,'array','[data-entry="179"]',{frameId:1,neighborName:'matrix',horizontal:true}));
  // The classic formatter owns body/toggle state; actual reference workspace
  // page restoration is covered by the reference visual and native suites.
  await checkFocusRestore(page,target,'array',{frameId:1,collapsedName:'head',verifyAncestors:await target.getAttribute('data-object-view-mode')==='code'});
 }
 await card('head').locator('.study-object-toggle').first().click();
 for(let i=0;i<30&&await card('head').locator('.study-object-toggle[aria-expanded="false"]').count();i++)await card('head').locator('.study-object-toggle[aria-expanded="false"]').first().click();
 scroll.push(await checkIndependentScroll(page,page,container(),'head','[data-entry="val"]',{frameId:1,neighborName:'matrix'}));
 scroll.push(await checkIndependentScroll(page,page,container(),'matrix','[data-entry="19"]',{frameId:1,neighborName:'array'}));
 scroll.push(await checkIndependentScroll(page,page,container(),'tree','[data-entry="val"]',{frameId:1,neighborName:'matrix'}));
 // Focus is tied to a scoped variable identity, including a checkpoint where it disappears.
 for(const target of [container(),reference()]){
  await cardFor(target,'array',1).getByRole('button',{name:'Expand array',exact:true}).click();
  await page.evaluate(()=>fixture.flushSync(()=>fixture.setIndex(2)));assert.ok(await target.locator('.study-object-out-of-scope').isVisible());assert.equal(await target.locator('.study-object-card').count(),0);
  assert.equal(await target.getAttribute('data-object-focused'),'true');assert.equal((await presentation(page)).index,2);
  await page.evaluate(()=>fixture.flushSync(()=>fixture.setIndex(1)));assert.ok(await cardFor(target,'array',1).isVisible());
  await target.locator('.study-object-back').click();assert.equal((await presentation(page)).index,1);
 }
 await page.evaluate(()=>fixture.flushSync(()=>fixture.setMoment(0)));assert.equal(await container().getAttribute('data-object-view-index'),'0');assert.match(await card('head').textContent(),/val: 1,/);
 await page.evaluate(()=>fixture.flushSync(()=>fixture.setMoment(2)));assert.equal(await container().getAttribute('data-object-view-index'),'1');assert.match(await card('head').textContent(),/val: 2,/);
 await page.evaluate(()=>document.querySelector('.debug-panel-workspace').studyPanelLayout.show('diagram'));await settle(page);assert.ok(await page.locator('#debug-objects-panel').isVisible());
 assert.equal(await page.locator('.viz-stage').evaluate(stage=>stage.getAnimations({subtree:true}).filter(animation=>animation.effect?.getKeyframes().some(frame=>frame.translate)).length),0);
 await page.evaluate(()=>document.querySelector('.debug-panel-workspace').studyPanelLayout.show('objects'));assert.equal(await page.getByRole('button',{name:'Move Objects',exact:true}).evaluate(button=>button===document.activeElement),true);
 await card('head').locator('.study-object-toggle').first().click();
 for(const target of [container(),reference()])await target.getByRole('button',{name:'Increase Object View text size',exact:true}).click();
 for(const target of [container(),reference()]){await cardFor(target,'head',1).getByRole('button',{name:'Expand head',exact:true}).click();assert.equal(await target.getAttribute('data-object-focused'),'true');}
 await page.locator('#reset').click();
 assert.ok(await page.locator('[data-study-panel=objects]').isVisible());assert.equal(await card('head').locator('.study-object-toggle').first().getAttribute('aria-expanded'),'true');assert.notEqual(await container().getAttribute('data-object-focused'),'true');
 for(const target of [container(),reference()]){assert.notEqual(await target.getAttribute('data-object-focused'),'true','A fresh run clears the previous selected root.');assert.equal(await target.locator('.study-object-body').first().evaluate(body=>getComputedStyle(body).fontSize),'18px','A run reset retains the text size for the current problem visit.');await target.getByRole('button',{name:'Decrease Object View text size',exact:true}).click();}
 assert.equal(await reference().locator('.study-object-frame>h3,.study-object-scope>h4').count(),0);assert.ok(await container().locator('.study-object-frame>h3').count()>0);
 assert.deepEqual(errors,[]);await container().screenshot({path:path.join(ROOT,'test-results/object-view-code.png')});
 fs.writeFileSync(path.join(ROOT,'test-results/object-view-ui.json'),JSON.stringify({passed:true,geometry,scroll,cases:['independent card scroll','keyboard final entries','horizontal long lines','font bounds','scalar sizing','scoped focus','Back/Escape restore','out of scope','pure moments','fresh reset','safe strings','cycles']},null,2));
 console.log('PASS Code and reference Objects: independent wheel/keyboard scrolling, reachable final entries, readable text, 3/2/1 columns, focus restoration, out-of-scope values and pure moments.');
}finally{await browser.close();await server.close();}
