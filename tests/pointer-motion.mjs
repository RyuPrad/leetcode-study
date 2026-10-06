import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT} from '../scripts/content.mjs';

const lessons = [
  {number:206, file:'LinkedList/reverseLinkedListVisualizer.html'},
  {number:143, file:'LinkedList/reorderListVisualizer.html'}
];
const browser=await chromium.launch({headless:true}),failures=[],cases=[];
let transitions=0,slides=0,unchanged=0,appeared=0,disappeared=0;

// Measure settled labels within their own row. Keep the animation's exact
// keyframes before canceling it; the viewport position of another row is never
// a valid origin, even if it happens to be close to this one.
function installProbe(){
  const visual=()=>document.querySelector('#lists-ui,#lists');
  const animationFrames=element=>element.getAnimations().filter(animation=>
    animation.effect?.getKeyframes().some(frame=>'translate' in frame)
  ).map(animation=>({frames:animation.effect.getKeyframes(),duration:animation.effect.getTiming().duration}));
  function sample(){
    const list=[...visual().querySelectorAll('[data-study-pointer]')];
    const motions=new Map(list.map(element=>[element,animationFrames(element)]));
    visual().getAnimations({subtree:true}).forEach(animation=>animation.cancel());
    const zoom=Number(getComputedStyle(document.querySelector('.study-scene')).zoom)||1;
    const labels=list.map(element=>{
      const row=element.closest('[data-study-motion-scope]');
      if(!row)throw Error('Pointer has no motion scope');
      const rect=element.getBoundingClientRect(),origin=row.getBoundingClientRect();
      return {key:row.dataset.studyMotionScope+':'+element.dataset.studyPointer,
        variable:element.dataset.studyPointer,target:element.dataset.studyPointerTarget,
        text:element.textContent,scope:row.dataset.studyMotionScope,
        x:(rect.x-origin.x)/zoom,y:(rect.y-origin.y)/zoom,
        scaleX:rect.width/element.offsetWidth/zoom,scaleY:rect.height/element.offsetHeight/zoom,
        motions:motions.get(element),visible:rect.width>0&&rect.height>0};
    });
    return {index:studyLessonSource.index(),labels:labels.filter(label=>label.visible)};
  }
  window.pointerProbe={sample,animationFrames,visual};
}

function compare(before,after,{settle=false,requireSlide=false,label='transition'}={}){
  transitions++;
  assert.equal(new Set(after.labels.map(pointer=>pointer.key)).size,after.labels.length,`${label}: pointer identity is unique within a row`);
  const old=new Map(before.labels.map(pointer=>[pointer.key,pointer]));
  const current=new Set(after.labels.map(pointer=>pointer.key));
  disappeared+=before.labels.filter(pointer=>!current.has(pointer.key)).length;
  for(const pointer of after.labels){
    const previous=old.get(pointer.key);
    if(!previous){appeared++;assert.equal(pointer.motions.length,0,`${label}: new ${pointer.key} starts at its own node`);continue;}
    if(settle||previous.target===pointer.target){
      if(previous.target===pointer.target)unchanged++;
      assert.equal(pointer.motions.length,0,`${label}: ${pointer.key} stays still when its target is unchanged or motion is disabled`);
      continue;
    }
    const dx=previous.x-pointer.x,dy=previous.y-pointer.y,distance=Math.abs(dx)+Math.abs(dy);
    if(requireSlide&&distance>2)assert.equal(pointer.motions.length,1,`${label}: ${pointer.key} slides when its target changes`);
    for(const motion of pointer.motions){
      slides++;
      assert.equal(motion.duration,200,`${label}: short pointer slide`);
      const parts=String(motion.frames[0].translate).match(/-?[\d.]+/g)?.map(Number);
      assert.ok(parts?.length>=1,`${label}: pointer translate`);
      if(parts.length===1)parts.push(0); // CSS serializes a zero y component away.
      assert.ok(Math.abs(parts[0]*pointer.scaleX-dx)<2,`${label}: ${pointer.key} horizontal origin belongs to its own row (${parts[0]*pointer.scaleX} versus ${dx})`);
      assert.ok(Math.abs(parts[1]*pointer.scaleY-dy)<2,`${label}: ${pointer.key} vertical origin belongs to its own row (${parts[1]*pointer.scaleY} versus ${dy})`);
    }
  }
}

async function open(lesson,{layout='phase',mode='compact'}={}){
  const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'no-preference'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.join(ROOT,lesson.file)).href);
  await page.waitForFunction(()=>window.studyWalkthrough&&window.studyLessonAdapter);
  await page.evaluate(installProbe);
  await page.evaluate(({mode,layout})=>{
    studyWalkthrough.setMode(mode);
    if(studyLessonSource.spec.number===143&&layout==='debugger')toggleLayout();
  },{mode,layout});
  await page.waitForTimeout(250);
  return {page,errors};
}

async function move(page,action,{settle=false,requireSlide=true,label='step'}={}){
  await page.waitForTimeout(90);
  const result=await page.evaluate(async action=>{
    const before=pointerProbe.sample();
    if(action==='next')document.getElementById('btn-next').click();
    else if(action==='back')document.getElementById('btn-prev').click();
    else if(action==='moment')await studyWalkthrough.next();
    else if(action==='reset')studyLessonAdapter.reset();
    else if(action==='seek')await studyLessonAdapter.seek(0);
    else if(action==='render')render();
    else if(action==='labels'){
      if(studyLessonSource.spec.number===206)toggleMemoryLabels();else toggleLabels();
    }else if(action==='layout')toggleLayout();
    else throw Error('Unknown action '+action);
    return {before,after:pointerProbe.sample()};
  },action);
  compare(result.before,result.after,{settle,requireSlide,label});
  return result;
}

async function runCase(name,callback){
  try{await callback();cases.push(name);console.log('PASS '+name);}
  catch(error){failures.push({name,error:String(error),stack:error.stack});console.error('FAIL '+name+': '+error.message);}
}

try{
  for(const lesson of lessons)for(const layout of lesson.number===143?['phase','debugger']:['memory']){
    await runCase(`${lesson.number} ${layout}: forward, unchanged render, Back, label visibility, zoom`,async()=>{
      const {page,errors}=await open(lesson,{layout});
      try{
        const phases=new Set();
        for(let step=0;step<90;step++){
          if(await page.locator('#btn-next').isDisabled())break;
          const result=await move(page,'next',{label:`${lesson.number} ${layout} instruction ${step}`});
          assert.equal(result.after.index,result.before.index+1,'Step Over commits one instruction');
          phases.add(await page.evaluate(()=>studyLessonSource.read().execState||studyLessonSource.read().state));
          if(step===10){
            await move(page,'render',{label:'same-state redraw'});
            await move(page,'labels',{label:'hide or expand labels'});
            await move(page,'labels',{label:'restore labels'});
            await page.getByRole('button',{name:'Zoom in diagram',exact:true}).click();
            await page.getByRole('button',{name:'Zoom in diagram',exact:true}).click();
            await move(page,'render',{label:'zoomed redraw'});
            await move(page,'back',{label:'Back preserves pointer identity'});
            await move(page,'next',{label:'forward after Back at 120%'});
          }
        }
        assert.ok(await page.locator('#btn-next').isDisabled(),'run completes');
        assert.ok(phases.size>(lesson.number===206?5:10),'visits distinct algorithm instructions');
        await move(page,'seek',{settle:true,label:'timeline seek settles immediately'});
        assert.deepEqual(errors,[]);
      }finally{await page.close();}
    });
    await runCase(`${lesson.number} ${layout}: detailed focus/action/result replay`,async()=>{
      const {page,errors}=await open(lesson,{layout,mode:'detailed'});
      try{
        for(let moment=0;moment<45;moment++){
          const result=await move(page,'moment',{label:`detailed moment ${moment}`});
          assert.ok(result.after.index===result.before.index||result.after.index===result.before.index+1,'a moment commits at most once');
          if(moment===25){
            const replay=await page.evaluate(()=>{
              const before=pointerProbe.sample();document.querySelector('.operation-controls button').click();
              return {before,after:pointerProbe.sample()};
            });
            compare(replay.before,replay.after,{settle:true,label:'previous moment replay'});
          }
        }
        await move(page,'reset',{settle:true,label:'reset settles detailed diagram'});
        assert.deepEqual(errors,[]);
      }finally{await page.close();}
    });
  }

  for(const lesson of lessons)await runCase(`${lesson.number}: empty, singleton, repeated values`,async()=>{
    const {page,errors}=await open(lesson,{layout:lesson.number===143?'debugger':'phase'});
    try{
      for(const values of [[],[7],[7,7,7,7]]){
        const result=await page.evaluate(values=>{
          const before=pointerProbe.sample();
          if(studyLessonSource.spec.number===206){examples[1]=values;loadExample(1);}
          else {examples[1]=values;loadEx(1);}
          return {before,after:pointerProbe.sample()};
        },values);
        compare(result.before,result.after,{settle:true,label:'load example clears motion history'});
        for(let step=0;step<80&&!await page.locator('#btn-next').isDisabled();step++)
          await move(page,'next',{label:`${lesson.number} values ${JSON.stringify(values)} instruction ${step}`});
        assert.ok(await page.locator('#btn-next').isDisabled(),'edge input completes');
        const raw=await page.evaluate(()=>studyLessonSource.read());
        if(values.length>1){
          const targets=await page.evaluate(()=>[...document.querySelectorAll('#lists-ui [data-study-pointer],#lists [data-study-pointer]')].map(e=>e.dataset.studyPointerTarget));
          assert.ok(targets.some(target=>target!=='7'),'node identity is independent of repeated values');
        }
        assert.ok(raw,'actual simulator state remains available');
      }
      assert.deepEqual(errors,[]);
    }finally{await page.close();}
  });

  await runCase('206: rapid stepping cancels old motion; Motion off and reduced motion settle active slides',async()=>{
    const {page,errors}=await open(lessons[0]);
    try{
      const active=async()=>{
        for(let i=0;i<45;i++){
          await page.waitForTimeout(90);
          const found=await page.evaluate(()=>{
            pointerProbe.sample();studyLessonAdapter.next();
            const pointers=[...pointerProbe.visual().querySelectorAll('[data-study-pointer]')];
            window.savedPointerAnimations=pointers.flatMap(pointer=>pointer.getAnimations()).filter(animation=>animation.effect.getKeyframes().some(frame=>'translate' in frame));
            return savedPointerAnimations.length>0;
          });
          if(found)return;
        }
        throw Error('Expected an active pointer slide');
      };
      await active();
      const rapid=await page.evaluate(()=>{
        studyLessonAdapter.next();
        return {canceled:savedPointerAnimations.every(animation=>animation.playState==='idle'),after:pointerProbe.sample()};
      });
      assert.ok(rapid.canceled,'a rapid next render cancels animations on removed labels');
      await active();
      await page.getByRole('button',{name:'Motion on',exact:true}).click();
      assert.ok(await page.evaluate(()=>savedPointerAnimations.every(animation=>animation.playState==='idle')),'Motion off cancels currently active Web Animations');
      await move(page,'next',{settle:true,label:'Motion off instruction'});
      await page.getByRole('button',{name:'Motion off',exact:true}).click();
      await active();
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForTimeout(20);
      assert.ok(await page.evaluate(()=>savedPointerAnimations.every(animation=>animation.playState==='idle')),'switching reduced motion cancels active slides');
      await move(page,'next',{settle:true,label:'reduced motion instruction'});
      assert.deepEqual(errors,[]);
    }finally{await page.close();}
  });

  for(const lesson of lessons)await runCase(`${lesson.number}: Play uses the same local pointer origins`,async()=>{
    const {page,errors}=await open(lesson,{layout:lesson.number===143?'debugger':'phase'});
    try{
      await page.locator('#study-speed').selectOption('4');
      await page.evaluate(()=>{
        window.motionPlayback=[];window.motionPrevious=pointerProbe.sample();
        window.motionObserver=new MutationObserver(()=>{
          const after=pointerProbe.sample();
          if(after.index!==motionPrevious.index){motionPlayback.push({before:motionPrevious,after});motionPrevious=after;}
        });
        motionObserver.observe(pointerProbe.visual(),{childList:true,subtree:true});
      });
      await page.getByRole('button',{name:'Play',exact:true}).click();
      await page.waitForFunction(()=>motionPlayback.length>=12,{},{timeout:10000});
      await page.getByRole('button',{name:'Pause',exact:true}).click();
      const recordings=await page.evaluate(()=>{motionObserver.disconnect();return motionPlayback;});
      for(const {before,after} of recordings)compare(before,after,{requireSlide:true,label:'automatic playback'});
      assert.deepEqual(errors,[]);
    }finally{await page.close();}
  });

  await runCase('143: phase/debugger layout changes preserve independent pointer views',async()=>{
    const {page,errors}=await open(lessons[1]);
    try{
      for(let i=0;i<18;i++)await move(page,'next');
      await move(page,'layout',{label:'phase to debugger layout'});
      await move(page,'render',{label:'debugger redraw after layout change'});
      await move(page,'layout',{label:'debugger to phase layout'});
      assert.deepEqual(errors,[]);
    }finally{await page.close();}
  });

  await runCase('Unannotated fallback: duplicate labels stay still; unique labels retain local motion',async()=>{
    const {page,errors}=await open(lessons[0]);
    try{
      await page.evaluate(()=>{
        const originalPointer=addPointer,originalMemory=buildMemoryRow,originalChain=buildChainRow;
        addPointer=function(...args){
          originalPointer(...args);const pointer=args[0].lastElementChild;
          pointer.removeAttribute('data-study-pointer');pointer.removeAttribute('data-study-pointer-target');
          if(args[0].classList.contains('memory')&&pointer.textContent==='curr')pointer.textContent='memory-curr';
        };
        buildMemoryRow=function(...args){const row=originalMemory(...args);row.removeAttribute('data-study-motion-scope');return row;};
        buildChainRow=function(...args){const row=originalChain(...args);row.removeAttribute('data-study-motion-scope');return row;};
        window.sampleFallback=()=>{
          const elements=[...pointerProbe.visual().querySelectorAll('.pointer')];
          const motions=new Map(elements.map(element=>[element,pointerProbe.animationFrames(element)]));
          pointerProbe.visual().getAnimations({subtree:true}).forEach(animation=>animation.cancel());
          const origin=pointerProbe.visual().getBoundingClientRect();
          return elements.map(element=>{const rect=element.getBoundingClientRect();return {name:element.textContent,x:rect.x-origin.x,y:rect.y-origin.y,scaleX:rect.width/element.offsetWidth,scaleY:rect.height/element.offsetHeight,motions:motions.get(element)};});
        };
        init();
      });
      let uniqueSlides=0,duplicateLabels=0;
      for(let i=0;i<30;i++){
        await page.waitForTimeout(90);
        const {before,after}=await page.evaluate(()=>{const before=sampleFallback();studyLessonAdapter.next();return {before,after:sampleFallback()};});
        const counts=new Map();for(const pointer of after)counts.set(pointer.name,(counts.get(pointer.name)||0)+1);
        for(const pointer of after){
          if(counts.get(pointer.name)>1){duplicateLabels++;assert.equal(pointer.motions.length,0,'ambiguous fallback duplicates never borrow a position');}
          if(pointer.name!=='memory-curr')continue;
          const old=before.find(item=>item.name===pointer.name);
          if(!old){assert.equal(pointer.motions.length,0,'new unique fallback reference starts in place');continue;}
          for(const motion of pointer.motions){
            uniqueSlides++;assert.equal(motion.duration,200);
            const values=String(motion.frames[0].translate).match(/-?[\d.]+/g).map(Number);if(values.length===1)values.push(0);
            assert.ok(Math.abs(values[0]*pointer.scaleX-(old.x-pointer.x))<2,'unique fallback horizontal origin');
            assert.ok(Math.abs(values[1]*pointer.scaleY-(old.y-pointer.y))<2,'unique fallback vertical origin');
          }
        }
      }
      assert.ok(duplicateLabels>10,'duplicate fallback labels were present');
      assert.ok(uniqueSlides>1,'unique fallback references still animate');
      assert.deepEqual(errors,[]);
    }finally{await page.close();}
  });

  assert.ok(slides>15,'coverage includes genuine moving references');
  assert.ok(unchanged>100,'coverage includes labels that must stay still');
  assert.ok(appeared>10&&disappeared>10,'coverage includes labels appearing and disappearing at null references');
}catch(error){failures.push({name:'coverage',error:String(error),stack:error.stack});}
finally{await browser.close();}
fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
const report={passed:failures.length===0,cases,transitions,slides,unchanged,appeared,disappeared,failures};
fs.writeFileSync(path.join(ROOT,'test-results/pointer-motion.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(failures.length)process.exitCode=1;
