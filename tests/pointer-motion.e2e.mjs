import {_electron as electron} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {ROOT} from '../scripts/content.mjs';

// Run sequentially with other native tests: playback needs real OS focus.
// Set STUDY_TEST_EXE to verify the executable extracted from an installer.
const executable=process.env.STUDY_TEST_EXE;
const version=JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8')).version;
fs.mkdirSync(path.join(ROOT,'.test-data'),{recursive:true});
fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
const profile=fs.mkdtempSync(path.join(ROOT,'.test-data/pointer-motion-native-'));
const env={...process.env,STUDY_DATA_DIR:profile,STUDY_HEADLESS:'1'};
if(executable)env.PATH=`${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`;
delete env.ELECTRON_RUN_AS_NODE;
const app=await electron.launch({...(executable?{executablePath:executable,args:[]}:{args:[ROOT]}),env,timeout:30000});
const page=await app.firstWindow();page.setDefaultTimeout(20000);
const errors=[],cases=[];let transitions=0,slides=0,unchanged=0;
page.on('pageerror',error=>errors.push(error.message));
const focus=()=>app.evaluate(({BrowserWindow})=>{const win=BrowserWindow.getAllWindows()[0];win.restore();win.show();win.focus();});

function installProbe(){
 const visual=()=>document.querySelector('#visual-ui,#lists-ui,#lists');
 const motions=element=>element.getAnimations().filter(animation=>animation.effect?.getKeyframes().some(frame=>'translate'in frame));
 function sample(){
  const labels=[...visual().querySelectorAll('[data-study-pointer]')];
  const frames=new Map(labels.map(element=>[element,motions(element).map(animation=>({frames:animation.effect.getKeyframes(),duration:animation.effect.getTiming().duration}))]));
  // Keep keyframes first, then measure terminal positions without in-flight offsets.
  visual().getAnimations({subtree:true}).forEach(animation=>animation.cancel());
  const zoom=Number(getComputedStyle(document.querySelector('.study-scene')).zoom)||1;
  return {index:studyLessonSource.index(),lines:[...document.querySelectorAll('.study-code .operation-code')].map(element=>element.id),
   labels:labels.map(element=>{
    const row=element.closest('[data-study-motion-scope]');if(!row)throw Error('Pointer has no stable row identity');
    const rect=element.getBoundingClientRect(),origin=row.getBoundingClientRect();
    return {key:JSON.stringify([row.dataset.studyMotionScope,element.dataset.studyPointer]),scope:row.dataset.studyMotionScope,
     variable:element.dataset.studyPointer,target:element.dataset.studyPointerTarget,
     x:(rect.left-origin.left)/zoom,y:(rect.top-origin.top)/zoom,
     scaleX:rect.width/element.offsetWidth/zoom,scaleY:rect.height/element.offsetHeight/zoom,
     visible:rect.width>0&&rect.height>0,motions:frames.get(element)};
   }).filter(pointer=>pointer.visible)};
 }
 window.nativePointerProbe={visual,motions,sample};
}

function compare(before,after,{settle=false,requireSlide=true,label='native transition'}={}){
 transitions++;
 assert.equal(after.lines.length,1,`${label}: exactly one code line is highlighted`);
 assert.equal(new Set(after.labels.map(pointer=>pointer.key)).size,after.labels.length,`${label}: scoped label identities are unique`);
 const old=new Map(before.labels.map(pointer=>[pointer.key,pointer]));
 for(const pointer of after.labels){
  const previous=old.get(pointer.key);
  if(!previous||settle||previous.target===pointer.target){
   if(previous?.target===pointer.target)unchanged++;
   assert.equal(pointer.motions.length,0,`${label}: ${pointer.key} starts or stays at its own node`);
   continue;
  }
  const dx=(previous.x-pointer.x)/pointer.scaleX,dy=(previous.y-pointer.y)/pointer.scaleY;
  if(requireSlide&&Math.abs(dx)+Math.abs(dy)>2)assert.equal(pointer.motions.length,1,`${label}: changed pointer slides briefly`);
  for(const motion of pointer.motions){
   slides++;assert.equal(motion.duration,200,`${label}: short slide duration`);
   const values=String(motion.frames[0].translate).match(/-?[\d.]+/g)?.map(Number);
   assert.ok(values?.length>=1,`${label}: translate has coordinates`);
   if(values.length===1)values.push(0); // Chromium omits a zero second component.
   assert.ok(Math.abs(values[0]-dx)<2,`${label}: ${pointer.key} horizontal origin stays in its row (${values[0]} versus ${dx})`);
   assert.ok(Math.abs(values[1]-dy)<2,`${label}: ${pointer.key} vertical origin stays in its row (${values[1]} versus ${dy})`);
  }
 }
}

async function move(frame,action,{settle=false,requireSlide=true,label=action}={}){
 await page.waitForTimeout(100);
 const pair=await frame.evaluate(async action=>{
  const before=nativePointerProbe.sample();
  if(action==='next')document.getElementById('btn-next').click();
  else if(action==='back')document.getElementById('btn-prev').click();
  else if(action==='reset')document.getElementById('btn-reset').click();
  else if(action==='render')render();
  else if(action==='moment'){
   [...document.querySelectorAll('.operation-controls button')].find(button=>button.textContent==='Next moment').click();
   await Promise.resolve();await Promise.resolve();
  }else throw Error('Unknown native test action '+action);
  return {before,after:nativePointerProbe.sample()};
 },action);
 compare(pair.before,pair.after,{settle,requireSlide,label});return pair;
}

async function open(number){
 if(await page.getByRole('button',{name:'Back to library',exact:true}).count())await page.getByRole('button',{name:'Back to library',exact:true}).click();
 await page.getByRole('searchbox',{name:'Search problems'}).fill(String(number));
 await page.locator('.problem-table tbody tr').filter({has:page.locator('.number-col',{hasText:new RegExp(`^0*${number}$`)})}).locator('.problem-link').click();
 await page.getByRole('tab',{name:'Visualizer',exact:true}).click();
 const frame=await page.locator('.visualizer-container:not(.guided-container) iframe').elementHandle().then(element=>element.contentFrame());
 await frame.waitForFunction(()=>window.studyWalkthrough&&window.studyLessonAdapter);
 await frame.evaluate(installProbe);
 if(number===143)await frame.evaluate(()=>{if(layoutMode!=='debugger')toggleLayout();});
 assert.equal(await frame.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),false,'native test has motion enabled');
 await page.waitForTimeout(250);return frame;
}

try{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('.problem-table').waitFor();
 assert.equal(await app.evaluate(({app})=>app.getVersion()),version);
 assert.equal(await app.evaluate(({app})=>app.isPackaged),!!executable);
 await app.evaluate(({session,BrowserWindow})=>{session.defaultSession.enableNetworkEmulation({offline:true});BrowserWindow.getAllWindows()[0].setContentSize(1760,1120);});
 await focus();
 for(const number of [206,143]){
  const frame=await open(number);
  for(const mode of ['compact','detailed']){
   await frame.getByLabel('Walkthrough detail').selectOption(mode);
   await move(frame,'reset',{settle:true});
   const first=await move(frame,'next',{label:`${number} ${mode} initial Step Over`});
   if(number===206){
    const current=first.after.labels.filter(pointer=>pointer.variable==='curr');
    assert.ok(current.length>=2,'native reverse list displays curr in independent rows');
    assert.ok(current.every(pointer=>pointer.motions.length===0),'unchanged initial curr never flies from another row');
   }
   let steps=1;
   while(!await frame.locator('#btn-next').isDisabled()&&steps<120){
    const result=await move(frame,'next',{label:`${number} ${mode} Step Over ${steps}`});
    assert.equal(result.after.index,result.before.index+1,'native Step Over commits exactly one instruction');
    if(steps===10){
     await move(frame,'render',{label:`${number} ${mode} unchanged redraw`});
     const back=await move(frame,'back',{label:`${number} ${mode} Step Back`});
     assert.equal(back.after.index,back.before.index-1);
     await move(frame,'next',{label:`${number} ${mode} forward after Back`});
    }
    steps++;
   }
   assert.ok(await frame.locator('#btn-next').isDisabled(),'native default input finishes');
   cases.push(`${number} ${mode}: Step Over, Back and unchanged redraw (${steps} instructions)`);
   console.log('PASS '+cases.at(-1));
  }
  await move(frame,'reset',{settle:true});
  for(let moment=0;moment<30;moment++){
   const result=await move(frame,'moment',{label:`${number} detailed moment ${moment}`});
   assert.ok(result.after.index===result.before.index||result.after.index===result.before.index+1,'detailed moment commits at most once');
  }
  cases.push(`${number}: detailed Focus, Action and Result`);

  await move(frame,'reset',{settle:true});
  const canceled=await frame.evaluate(async()=>{
   for(let attempt=0;attempt<90&&!document.getElementById('btn-next').disabled;attempt++){
    nativePointerProbe.sample();document.getElementById('btn-next').click();
    const active=[...nativePointerProbe.visual().querySelectorAll('[data-study-pointer]')].flatMap(nativePointerProbe.motions);
    if(active.length){
     const button=[...document.querySelectorAll('.study-view-tools button')].find(button=>button.textContent==='Motion on');
     button.click();const canceled=active.every(animation=>animation.playState==='idle');
     return {active:active.length,canceled,after:nativePointerProbe.sample(),motion:button.getAttribute('aria-pressed')};
    }
    await new Promise(resolve=>setTimeout(resolve,100));
   }
   throw Error('No native pointer slide found to cancel');
  });
  assert.ok(canceled.active>0&&canceled.canceled,'Motion off immediately cancels active native Web Animations');
  assert.equal(canceled.motion,'false');
  await move(frame,'next',{settle:true,label:`${number} Motion off Step Over`});
  await frame.getByRole('button',{name:'Motion off',exact:true}).click();
  await move(frame,'reset',{settle:true,label:`${number} reset cancels animation history`});
  cases.push(`${number}: active Motion off and immediate reset`);

  for(const mode of ['compact','detailed']){
   await frame.getByLabel('Walkthrough detail').selectOption(mode);
   await move(frame,'reset',{settle:true});
   await frame.getByLabel('Playback speed',{exact:true}).selectOption('4');
   await focus();
   await frame.evaluate(()=>{
    window.nativeMotionPlayback=[];window.nativeMotionPrevious=nativePointerProbe.sample();
    window.nativeMotionUnsubscribe=studyLessonAdapter.subscribe(()=>{
     const after=nativePointerProbe.sample();
     if(after.index!==nativeMotionPrevious.index){nativeMotionPlayback.push({before:nativeMotionPrevious,after});nativeMotionPrevious=after;}
    });
   });
   try{
    await frame.getByRole('button',{name:'Play',exact:true}).click();
    await frame.waitForFunction(()=>nativeMotionPlayback.length>=12,null,{timeout:30000});
    await frame.getByRole('button',{name:'Pause',exact:true}).click();
    const recordings=await frame.evaluate(()=>nativeMotionPlayback);
    for(const recording of recordings)compare(recording.before,recording.after,{label:`${number} ${mode} native Play`});
    const index=await frame.evaluate(()=>studyLessonSource.index());
    await page.waitForTimeout(600);
    assert.equal(await frame.evaluate(()=>studyLessonSource.index()),index,'native Pause stops playback');
   }catch(error){
    console.error('Native playback state',await frame.evaluate(()=>({index:studyLessonSource.index(),mode:studyWalkthrough.mode,stage:studyWalkthrough.stage,recorded:nativeMotionPlayback.length,playing:document.getElementById('study-play').getAttribute('aria-pressed'),speed:document.getElementById('study-speed').value,hidden:document.hidden,focused:document.hasFocus(),finished:document.getElementById('btn-next').disabled})));
    console.error('Native window state',await app.evaluate(({BrowserWindow})=>{const win=BrowserWindow.getAllWindows()[0];return {focused:win.isFocused(),visible:win.isVisible(),minimized:win.isMinimized()};}));
    throw error;
   }finally{await frame.evaluate(()=>nativeMotionUnsubscribe());}
   cases.push(`${number} ${mode}: focused native Play/Pause`);
   console.log('PASS '+cases.at(-1));
  }
 }
 assert.ok(slides>10,'native coverage includes moving labels');
 assert.ok(unchanged>50,'native coverage includes unchanged labels');
 assert.deepEqual(errors,[],'packaged renderer has no errors');
 fs.writeFileSync(path.join(ROOT,`test-results/pointer-motion-${executable?'packaged':'desktop'}.json`),JSON.stringify({passed:true,version,packaged:!!executable,offline:true,profile,executable:executable||null,cases,transitions,slides,unchanged,errors},null,2));
 console.log(`PASS native pointer motion: ${transitions} transitions, ${slides} local slides, ${unchanged} unchanged labels`);
}finally{await app.close();}
