/* Guided practice owns navigation before transitions, never after rendering an answer. */
(() => {
  const params=new URLSearchParams(location.search);if(!params.has('guided'))return;
  const embedded=window.parent!==window,session=params.get('session')||crypto.randomUUID();
  const requested=params.get('parentOrigin'),parentOrigin=/^http:\/\/127\.0\.0\.1:\d+$/.test(requested||'')?requested:'study://app';
  const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
  const send=data=>{if(embedded)parent.postMessage({...data,session},parentOrigin);};
  function loadScript(file){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=`../visualizer-ui/${file}`;script.onload=resolve;script.onerror=()=>reject(Error('The guided lesson content could not be loaded.'));document.head.append(script);});}
  async function mount(){
    document.body.classList.add('guided-mode');
    const css=document.createElement('link');css.rel='stylesheet';css.href='../visualizer-ui/guided.css';const stylesReady=new Promise((resolve,reject)=>{css.onload=resolve;css.onerror=()=>reject(Error('The guided layout could not be loaded.'));});document.head.append(css);
    const workspace=document.querySelector('.study-workspace'),diagram=document.querySelector('.study-diagram');
    const panel=make('section','guided-panel');panel.setAttribute('aria-label','Guided lesson');workspace.insertBefore(panel,diagram);
    panel.append(make('p','','Opening your guided lesson…'));
    try{
      await Promise.all([loadScript('guided-lessons.js'),stylesReady]);
      const source=window.studyLessonSource,underlying=window.studyLessonAdapter;
      const lesson=window.studyGuidedLessons.find(l=>l.id===`leetcode:${source.spec.number}`);
      if(!lesson)throw Error('This problem does not have a guided lesson.');
      const core=window.StudyGuided,originalNext=window.nextStep,originalPrevious=window.prevStep;
      [...document.querySelectorAll('.study-view-tools button')].find(button=>button.textContent==='Focus diagram')?.remove();
      const caption=document.querySelector('.study-view-tools small');if(caption)caption.textContent='Alt + drag to pan. Outlined items can answer a prediction.';
      const splitter=document.querySelector('.study-diagram-splitter');
      splitter.onpointerdown=event=>{splitter.setPointerCapture(event.pointerId);const move=e=>{const box=workspace.getBoundingClientRect(),guide=panel.getBoundingClientRect(),available=box.right-guide.right;const percent=Math.max(30,Math.min(75,(e.clientX-guide.right)/available*100));workspace.style.setProperty('--study-diagram-width',`${percent}%`);splitter.setAttribute('aria-valuenow',String(Math.round(percent)));};const end=()=>{splitter.removeEventListener('pointermove',move);splitter.removeEventListener('lostpointercapture',end);};splitter.addEventListener('pointermove',move);splitter.addEventListener('lostpointercapture',end);};
      const loader=lesson.loader?window[lesson.loader.functionName]:null;
      let progress=null,initialized=false,active=!embedded,busy=false,playing=false,timer=null,speed=1,generation=0,internal=0,resetting=false,sequence=0,justRevealed=null,pendingReveal=null,feedback='',error='',targets=[];
      let priorVersion=false,initialValues=null;
      const terminal=lesson.checkpoints.at(-1).afterIndex;
      const controls=make('section','guided-controls');controls.setAttribute('aria-label','Guided playback');workspace.insertBefore(controls,workspace.querySelector('.study-diagram'));
      const button=(text,action,cls='')=>{const el=make('button',cls,text);el.type='button';el.onclick=action;return el;};
      const playButton=button('Play',()=>{if(playing||currentCheckpoint())pause();else startPlayback();});
      const nextButton=button('Next step',()=>void next());
      const previousButton=button('Previous step',()=>void seek(Math.max(0,source.index()-1)));
      const jumpButton=button('Next prediction',()=>{justRevealed=null;void seek(core.limit(lesson,progress));});
      const restartButton=button('Restart lesson',()=>void initialize(core.fresh(lesson,progress),true));
      const speedLabel=make('label','','Speed '),select=make('select');select.setAttribute('aria-label','Guided playback speed');
      for(const value of [.5,1,2,4]){const option=make('option','',`${value}×`);option.value=String(value);option.selected=value===1;select.append(option);}select.onchange=()=>{speed=Number(select.value);if(playing)schedule();};speedLabel.append(select);
      const range=make('input');range.type='range';range.min='0';range.max=String(terminal);range.value='0';range.setAttribute('aria-label','Guided lesson timeline');range.oninput=()=>{justRevealed=null;void seek(Number(range.value));};
      const position=make('span','guided-position');controls.append(previousButton,playButton,nextButton,jumpButton,speedLabel,restartButton,range,position);
      function pause(){playing=false;clearTimeout(timer);timer=null;renderControls();}
      function schedule(){clearTimeout(timer);if(!playing)return;timer=setTimeout(async()=>{if(!active||document.hidden){pause();return;}if(currentCheckpoint()){pause();return;}await window.studyWalkthrough.next();if(playing)schedule();},(window.studyWalkthrough.mode==='detailed'?2000:1000)/speed);}
      window.addEventListener('study:moment-pause',pause);
      function beginReveal(cp){
        if(!core.resolved(progress.answers[cp.id]))return false;
        if(source.index()===cp.beforeIndex)check(cp.before,'before-state');
        pendingReveal=cp;justRevealed=null;feedback='';return true;
      }
      function restorePendingReveal(){pendingReveal=lesson.checkpoints.find(cp=>core.resolved(progress.answers[cp.id])&&cp.beforeIndex<source.index()&&source.index()<cp.afterIndex)||null;}
      function startPlayback(cp=null){
        if(!initialized||busy||!active||error||source.index()>=terminal)return;
        try{
          const ready=cp||lesson.checkpoints.find(item=>item.beforeIndex===source.index()&&core.resolved(progress.answers[item.id]));
          if(ready){if(!beginReveal(ready))return;window.studyWalkthrough.refresh();}
          else if(justRevealed){justRevealed=null;feedback='';}
          playing=true;render();schedule();
        }catch(e){error=e.message;pause();render();}
      }
      function watch(cp){startPlayback(cp);}
      function announceRun(){send({type:'guided:run',lessonId:lesson.id,version:lesson.version,caseId:lesson.caseId,runId:progress.runId,sequence:++sequence});}
      function persist(){if(!progress)return;progress.cursor=source.index();send({type:'guided:progress',lessonId:lesson.id,version:lesson.version,caseId:lesson.caseId,runId:progress.runId,sequence:++sequence,progress:structuredClone(progress)});}
      function currentCheckpoint(){return lesson.checkpoints.find(cp=>cp.beforeIndex===source.index()&&!core.resolved(progress?.answers[cp.id]));}
      function state(){return core.project(underlying.snapshot());}
      function check(assertions,label){if(!core.matches(state(),assertions))throw Error(`This lesson's ${label} no longer matches the animation. Restart the lesson or use the Visualizer tab.`);}
      function clearTargets(){for(const item of targets){item.el.classList.remove('guided-target');for(const [key,value]of Object.entries(item.attrs))value===null?item.el.removeAttribute(key):item.el.setAttribute(key,value);}targets=[];document.querySelectorAll('.guided-code-focus').forEach(el=>el.classList.remove('guided-code-focus'));}
      function renderControls(){const index=source.index();for(const el of [playButton,nextButton,previousButton,jumpButton,restartButton,select,range])el.disabled=!initialized||busy||!active||!!error;restartButton.disabled=busy||!active;previousButton.disabled ||=index===0;nextButton.disabled ||=index>=terminal;playButton.disabled ||=index>=terminal;playButton.textContent=playing?'Pause':'Play';playButton.setAttribute('aria-pressed',String(playing));range.value=String(index);position.textContent=`Step ${index+1} · ${lesson.checkpoints.filter(cp=>core.resolved(progress?.answers[cp.id])).length}/3 predictions explored`;range.setAttribute('aria-valuetext',position.textContent);window.studyWalkthrough.setGate({canAdvance:!!progress&&!currentCheckpoint(),active:initialized&&active&&!busy&&!error,isPlaying:playing,nextStep:()=>next(true)});}
      function basics(cp){const details=make('details','guided-basics');details.append(make('summary','','Explain the code'),make('p','',cp.basics));const labels=cp.codeLines.join(', ');details.append(make('small','',`Look at reference ${cp.codeLines.length===1?'line':'lines'} ${labels}.`));return details;}
      function render(){
        clearTargets();renderControls();panel.replaceChildren();
        if(error){panel.append(make('p','guided-error',error));panel.setAttribute('role','alert');return;}
        panel.removeAttribute('role');if(!initialized){panel.append(make('p','','Restoring your guided lesson…'));return;}
        const heading=make('div','guided-heading');heading.append(make('span','viz-eyebrow','LEARN BY PREDICTING'),make('span','guided-position',`${lesson.checkpoints.filter(cp=>core.resolved(progress.answers[cp.id])).length}/3 explored`));panel.append(heading);
        if(priorVersion)panel.append(make('p','guided-notice',`This lesson has changed. This walkthrough starts with the updated example.${progress.previousCompletion?' Your earlier completion is saved.':''}`));
        else if(progress.previousCompletion&&!progress.completedAt)panel.append(make('small','guided-notice','Your previous walkthrough is saved. This is a fresh practice attempt.'));
        const intro=make('details','guided-intro');intro.open=source.index()===0&&!Object.keys(progress.answers).length;intro.append(make('summary','',lesson.title),make('p','',lesson.intro));
        const terms=make('div','guided-concepts');for(const key of lesson.concepts){const item=core.glossary[key];if(!item)continue;const detail=make('details');detail.append(make('summary','',item[0]),make('p','',item[1]));terms.append(detail);}intro.append(terms);panel.append(intro);
        if(justRevealed){const cp=justRevealed;panel.append(make('h3','','Here is why'),make('p','guided-explanation',cp.explanation),basics(cp),button('Continue',()=>{justRevealed=null;feedback='';render();},'guided-primary'));return;}
        if(progress.completedAt&&source.index()>=terminal){
          panel.append(make('h3','','Lesson explored'),make('p','',lesson.recap),make('p','',`Watch out: ${lesson.commonMistake}`));
          const results=make('ul','guided-results');for(const cp of lesson.checkpoints){const a=progress.answers[cp.id];results.append(make('li','',`${cp.prompt} — ${a.revealed?'Shown for you':a.hintLevel?'Answered with hints':'Answered'}${a.attempts>1?` (${a.attempts} attempts)`:''}`));}panel.append(results,make('small','','This records visual practice. Your coding problem status is unchanged.'));return;
        }
        const cp=currentCheckpoint();
        if(!cp){const ready=lesson.checkpoints.find(c=>c.beforeIndex===source.index()&&core.resolved(progress.answers[c.id]));if(ready){const answer=progress.answers[ready.id];panel.append(make('h3','',ready.prompt),make('p','guided-feedback',answer.revealed?'Let’s watch it together.':ready.options.find(o=>o.id===answer.choiceId)?.feedback||'Correct. Watch what changes next.'),basics(ready),button('Watch the change',()=>watch(ready),'guided-primary'));}else panel.append(make('p','guided-instruction','Watch the diagram and highlighted code. Use Next prediction to reach the next question.'),make('small','','The guided example is fixed. Explore other inputs in the Visualizer tab.'));return;}
        try{check(cp.before,'prediction state');}catch(e){error=e.message;pause();render();return;}
        const predictionLine=underlying.snapshot().location.line;
        (document.getElementById(`line-${predictionLine}`)||document.getElementById(`l${predictionLine}`))?.classList.add('guided-code-focus');
        panel.append(make('h3','guided-question',cp.prompt));
        const answer=progress.answers[cp.id]||{attempts:0,hintLevel:0,revealed:false,correct:false};
        const choices=make('div','guided-choices');for(const option of cp.options){const el=button(option.text,()=>choose(cp,option.id),'guided-choice');el.dataset.optionId=option.id;el.setAttribute('aria-pressed',String(answer.choiceId===option.id));choices.append(el);}panel.append(choices);
        const status=make('p','guided-feedback',feedback);status.setAttribute('role','status');status.setAttribute('aria-live','polite');panel.append(status);
        const actions=make('div','guided-actions'),hint=button(answer.hintLevel?'Another hint':'Hint',()=>{answer.hintLevel=Math.min(2,answer.hintLevel+1);progress.answers[cp.id]=answer;persist();render();});hint.disabled=answer.hintLevel===2;
        actions.append(hint,button('Show me',()=>{progress.answers[cp.id]={...answer,revealed:true};persist();watch(cp);}));panel.append(actions);
        for(let i=0;i<answer.hintLevel;i++)panel.append(make('p','guided-hint',`Hint ${i+1}: ${cp.hints[i]}`));panel.append(basics(cp));
        for(const target of cp.targets||[]){for(const el of document.querySelectorAll(target.selector)){const attrs=Object.fromEntries(['tabindex','role','aria-label'].map(key=>[key,el.getAttribute(key)]));el.classList.add('guided-target');el.setAttribute('tabindex','0');el.setAttribute('role','button');el.setAttribute('aria-label',target.label);targets.push({el,attrs,optionId:target.optionId,cp});}}
      }
      function choose(cp,id){
        if(busy||!active||currentCheckpoint()?.id!==cp.id)return;
        const old=progress.answers[cp.id]||{attempts:0,hintLevel:0,revealed:false,correct:false};
        const correct=id===cp.correctOptionId;progress.answers[cp.id]={...old,attempts:Math.min(10000,old.attempts+1),choiceId:id,correct};feedback=cp.options.find(o=>o.id===id).feedback;
        persist();render();
      }
      function completeIfReady(){if(source.index()>=terminal&&lesson.checkpoints.every(cp=>core.resolved(progress.answers[cp.id]))){check(lesson.checkpoints.at(-1).after,'final state');progress.completedAt ||=new Date().toISOString();}}
      async function seek(target){
        if(!initialized||busy||!active)return;
        pause();const token=generation;busy=true;pendingReveal=null;justRevealed=null;clearTargets();renderControls();
        try{const bound=Math.min(terminal,core.limit(lesson,progress));target=Math.max(0,Math.min(Math.floor(target),bound));internal++;await underlying.seek(target);if(token!==generation)return;progress.cursor=source.index();feedback='';restorePendingReveal();completeIfReady();persist();}
        catch(e){if(token===generation)error=e.message;}
        finally{internal--;if(token===generation){busy=false;if(currentCheckpoint())pause();render();}}
      }
      async function next(fromPlay=false){
        if(!initialized||busy||!active||error)return false;
        if(!fromPlay)pause();
        if(currentCheckpoint()||source.index()>=terminal){pause();render();return false;}
        const token=generation,before=source.index();let entered=false;
        try{
          const ready=lesson.checkpoints.find(cp=>cp.beforeIndex===before&&core.resolved(progress.answers[cp.id]));
          if(ready)beginReveal(ready);
          justRevealed=null;busy=true;clearTargets();renderControls();internal++;entered=true;
          await underlying.next();if(token!==generation)return false;
          if(source.index()!==before+1)throw Error('This lesson did not advance by one instruction. Restart the lesson or use the Visualizer tab.');
          if(pendingReveal&&source.index()===pendingReveal.afterIndex){check(pendingReveal.after,'revealed state');justRevealed=pendingReveal;pendingReveal=null;pause();}
          completeIfReady();feedback='';persist();return true;
        }catch(e){if(token===generation){error=e.message;pause();}return false;}
        finally{if(entered)internal--;if(token===generation){busy=false;if(currentCheckpoint()||source.index()>=terminal)pause();render();}}
      }
      async function initialize(saved,isRestart=false){
        generation++;pause();busy=true;initialized=false;error='';feedback='';justRevealed=null;pendingReveal=null;clearTargets();render();
        const token=generation;
        progress=isRestart?saved:core.restore(lesson,saved);priorVersion=!!saved&&saved.lessonVersion!==lesson.version;
        try{internal++;resetting=true;try{if(loader)loader(...lesson.loader.args);else underlying.reset();}finally{resetting=false;}initialValues=state().values;
          if(lesson.expectedInput&&JSON.stringify(initialValues)!==JSON.stringify(lesson.expectedInput))throw Error('The guided example does not match this lesson. Use the Visualizer tab while this content is updated.');
          await underlying.seek(progress.cursor);if(token!==generation)return;restorePendingReveal();initialized=true;announceRun();persist();
        }catch(e){if(token===generation)error=e.message;}
        finally{internal--;if(token===generation){busy=false;render();}}
      }
      document.addEventListener('click',event=>{
        if(resetting)return;
        const blocked=event.target.closest?.('#btn-next,#btn-prev,#btn-reset,#study-play,.study-timeline,.study-controls');
        if(blocked){event.preventDefault();event.stopImmediatePropagation();if(blocked.id==='btn-next')void next();else if(blocked.id==='btn-prev')void seek(source.index()-1);else if(blocked.id==='btn-reset')void initialize(core.fresh(lesson,progress),true);return;}
        const target=targets.find(t=>t.el===event.target||t.el.contains(event.target));if(target){event.preventDefault();event.stopImmediatePropagation();choose(target.cp,target.optionId);}
      },true);
      document.addEventListener('keydown',event=>{const target=targets.find(t=>t.el===event.target);if(target&&['Enter',' '].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();choose(target.cp,target.optionId);return;}if(!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.target.closest?.('input,textarea,select,[contenteditable="true"],[role="tablist"],[role="separator"]')&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();if(event.key==='ArrowRight')void next();else void seek(source.index()-1);}},true);
      window.nextStep=()=>internal?originalNext():void next();window.prevStep=()=>internal?originalPrevious():void seek(source.index()-1);
      window.studyLessonAdapter={...underlying,next:()=>void next(),previous:()=>void seek(source.index()-1),seek:index=>seek(index),reset:()=>void initialize(core.fresh(lesson,progress),true),loadGuidedCase:()=>initialize(core.fresh(lesson,progress),true)};
      window.studyGuidedController={get lesson(){return lesson;},get progress(){return progress?structuredClone(progress):null;},get busy(){return busy;},get error(){return error;},pause,seek,next,restart:()=>initialize(core.fresh(lesson,progress),true)};
      window.addEventListener('message',event=>{if(!embedded||event.source!==parent||event.origin!==parentOrigin)return;const message=event.data;
        if(message?.type==='study:pause'){pause();return;}
        if(message?.session!==session||message.lessonId!==lesson.id)return;
        if(message.type==='guided:init'&&!initialized&&!progress){active=!!message.active;void initialize(message.progress);}
        else if(message.type==='guided:active'){active=!!message.active;if(!active)pause();renderControls();}
      });
      document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
      window.addEventListener('pagehide',()=>{generation++;pause();clearTargets();window.nextStep=originalNext;window.prevStep=originalPrevious;});
      if(!embedded)window.addEventListener('blur',pause);
      if(embedded)send({type:'guided:ready',lessonId:lesson.id,version:lesson.version,caseId:lesson.caseId});else await initialize(null);
    }catch(e){panel.replaceChildren(make('p','guided-error',e.message));panel.setAttribute('role','alert');}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void mount(),{once:true});else void mount();
})();
