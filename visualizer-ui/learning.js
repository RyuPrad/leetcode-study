/* Visual teaching layer. The source adapter reads each lesson's real state. */
(() => {
  const make=(tag,className,text)=>{const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;};
  const readable=value=>value===undefined?'undefined':typeof value==='object'&&value!==null?'special'in value?value.special:'ref'in value?value.ref:JSON.stringify(value):typeof value==='string'?JSON.stringify(value):String(value);
  const omitted=new Set(['line','lines','hl','narr','narration','phase','execState','state','traceLen','traceLength','kind','action','message','recurrence','formula','svgNS','NS']);
  function capture(raw,index,phase,action,explanation,line){
    const objects=[],variables=[],flat=new Map(),visited=new WeakMap();let count=0;
    function value(input,path,depth){
      if(++count>3000||depth>7)return {special:'… display limit'};
      if(input===null||typeof input==='boolean'||typeof input==='number'&&Number.isFinite(input)){flat.set(path,input);return input;}
      if(typeof input==='string'){const text=input.length>800?input.slice(0,800)+'…':input;flat.set(path,text);return text;}
      if(typeof input==='undefined'||typeof input==='bigint'||typeof input==='number'){const special=String(input)+(typeof input==='bigint'?'n':'');flat.set(path,{special});return {special};}
      if(typeof input==='function'||input instanceof Element)return {special:'not displayed'};
      if(visited.has(input))return {ref:visited.get(input)};
      const id=path;visited.set(input,id);const object={id,kind:Array.isArray(input)?'array':input instanceof Map?'map':input instanceof Set?'set':'object',label:path,entries:[]};objects.push(object);
      const entries=input instanceof Map?[...input].map(([key,val])=>[String(key),val]):input instanceof Set?[...input].map((val,i)=>[String(i),val]):Object.entries(input).filter(([key])=>!['ref','parent','parentNode'].includes(key));
      if(Array.isArray(input))object.size=input.length;
      for(const [key,item] of entries.slice(0,160)){if(count>3000){object.truncated=true;break;}const child=Array.isArray(input)?`${path}[${key}]`:`${path}.${key}`;object.entries.push({key,value:value(item,child,depth+1)});}
      if(entries.length>160)object.truncated=true;
      return {ref:id};
    }
    for(const [name,input] of Object.entries(raw))if(!omitted.has(name))variables.push({id:name,name,scope:'Reference solution',value:value(input,name,0)});
    const location={line,column:1,endLine:line,endColumn:1};
    return {frame:{index,location,phase,action,explanation,stack:[{id:0,name:'Reference solution',location,variables}],objects,reads:[],changes:[],logs:[],truncated:count>3000},flat};
  }
  function mount(){
    const source=window.studyLessonSource,workspace=document.querySelector('.study-workspace');
    if(!source||!workspace)throw new Error('The lesson is missing its teaching adapter.');
    const spec=source.spec,diagram=document.querySelector('.study-diagram'),code=document.querySelector('.study-code'),visual=document.querySelector('#visual-ui,#lists-ui,#svg,#lists'),toolbar=document.querySelector('.study-controls');
    if(code?.querySelector('h2'))code.querySelector('h2').textContent='Reference code';
    const learnedNames=new Set(Object.keys(spec.meanings).map(name=>name.replace(/`/g,'').split(/[.\[ (]/)[0]));
    const originalRender=window.render,originalNext=window.nextStep,originalPrevious=window.prevStep;
    let muted=false,seeking=false,epoch=0,total=source.count(),extent=0,phaseEntries=[],lastCapture=null,currentFrame=null,zoom=1,animations=true,lastIndex=-1;
    const listeners=new Set(),positionCache=new Map(),recordedChanges=new Map();let lastAnimation=0,flowTask=0;const runningAnimations=[];
    const scheduleFlows=()=>{if(!flowTask)flowTask=requestAnimationFrame(()=>{flowTask=0;drawFlows();});};
    const phase=raw=>{const label=[raw.phase,raw.execState,raw.state,raw.kind,raw.action,raw.stage,raw.type].find(value=>typeof value==='string'&&value.length>0);const line=raw.line||(raw.lines||raw.hl||raw.highlight||raw.highlightLines||[])[0];return String(label||(line?`Line ${line}`:'Ready')).replace(/[_-]+/g,' ');};
    const pause=()=>{const button=document.getElementById('study-play');if(button?.getAttribute('aria-pressed')==='true')button.click();};
    const coach=make('section','study-coach');coach.setAttribute('aria-label','Step explanation');
    const coachTitle=make('div','viz-eyebrow','WHAT HAPPENED');coach.append(coachTitle);
    const narration=document.querySelector('#narration-ui,#narration,#narr');if(narration)coach.append(narration);
    const why=make('div','study-why');why.append(make('b','','Why this matters'),make('p','',spec.why));coach.append(why);
    const changes=make('div','viz-changes study-changes');changes.setAttribute('aria-label','What changed');coach.append(changes);
    diagram.insertBefore(coach,diagram.querySelector('h2')?.nextSibling||diagram.firstChild);
    const legend=make('div','viz-legend');for(const [cls,label] of [['active','● Active'],['read','◉ Read'],['changed','◆ Changed'],['complete','✓ Result'],['path','↗ Path / dependency'],['discarded','− Discarded']])legend.append(make('span',cls,label));coach.append(legend);
    const timeline=make('section','study-timeline');timeline.setAttribute('aria-label','Lesson timeline');
    const progress=make('output','study-step-count'),range=make('input');range.type='range';range.min='0';range.step='1';range.setAttribute('aria-label','Seek lesson step');
    const chapters=make('select');chapters.setAttribute('aria-label','Jump to lesson phase');
    timeline.append(progress,range,chapters);if(spec.mode==='history'){const hint=make('small','','Timeline grows as you step or play.');timeline.append(hint);}toolbar.after(timeline);
    const tools=make('div','viz-view-tools study-view-tools');tools.append(make('span','','Diagram'));
    const minus=make('button','','−'),plus=make('button','','+'),fit=make('button','','Fit'),zoomLabel=make('output','','100%'),focus=make('button','','Focus diagram'),motion=make('button','','Motion on');
    minus.setAttribute('aria-label','Zoom out diagram');plus.setAttribute('aria-label','Zoom in diagram');focus.setAttribute('aria-pressed','false');motion.setAttribute('aria-pressed','true');
    tools.append(minus,zoomLabel,plus,fit,focus,motion);tools.append(make('small','','Alt + drag to pan · Select a changed value to inspect its variable'));
    const viewport=make('div','study-viewport'),scene=make('div','study-scene');visual.replaceWith(viewport);viewport.append(scene);scene.append(visual);viewport.before(tools);
    const flow=document.createElementNS('http://www.w3.org/2000/svg','svg');flow.classList.add('study-flow');flow.setAttribute('aria-hidden','true');scene.append(flow);
    function setZoom(value){zoom=Math.max(.3,Math.min(2,value));scene.style.zoom=String(zoom);zoomLabel.value=`${Math.round(zoom*100)}%`;scheduleFlows();}
    minus.onclick=()=>setZoom(zoom-.1);plus.onclick=()=>setZoom(zoom+.1);fit.onclick=()=>{scene.style.zoom='1';setZoom(Math.min(1,(viewport.clientWidth-24)/Math.max(1,visual.scrollWidth)));viewport.scrollTop=viewport.scrollLeft=0;};
    focus.onclick=()=>{const selected=workspace.classList.toggle('study-focus');focus.setAttribute('aria-pressed',String(selected));focus.textContent=selected?'Show code':'Focus diagram';scheduleFlows();};
    motion.onclick=()=>{animations=!animations;motion.setAttribute('aria-pressed',String(animations));motion.textContent=animations?'Motion on':'Motion off';workspace.classList.toggle('study-no-motion',!animations);};
    let pan=null;viewport.addEventListener('pointerdown',event=>{if(!event.altKey&&event.target!==viewport&&event.target!==scene)return;event.preventDefault();pan={x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(event.pointerId);});viewport.addEventListener('pointermove',event=>{if(pan){viewport.scrollLeft=pan.left+pan.x-event.clientX;viewport.scrollTop=pan.top+pan.y-event.clientY;}});viewport.addEventListener('pointerup',()=>pan=null);viewport.addEventListener('lostpointercapture',()=>pan=null);
    const splitter=make('div','study-diagram-splitter');splitter.tabIndex=0;splitter.setAttribute('role','separator');splitter.setAttribute('aria-label','Resize lesson diagram');splitter.setAttribute('aria-orientation','vertical');splitter.setAttribute('aria-valuenow','60');diagram.after(splitter);
    const resize=percent=>{const value=Math.max(30,Math.min(75,percent));workspace.style.setProperty('--study-diagram-width',`${value}%`);splitter.setAttribute('aria-valuenow',String(Math.round(value)));scheduleFlows();};
    splitter.onkeydown=event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();event.stopPropagation();resize(Number(splitter.getAttribute('aria-valuenow'))+(event.key==='ArrowLeft'?-2:2));}};
    splitter.onpointerdown=event=>{splitter.setPointerCapture(event.pointerId);const move=e=>{const rect=workspace.getBoundingClientRect();resize((e.clientX-rect.left)/rect.width*100);};const end=()=>{splitter.removeEventListener('pointermove',move);splitter.removeEventListener('lostpointercapture',end);};splitter.addEventListener('pointermove',move);splitter.addEventListener('lostpointercapture',end);};
    const selector=[...spec.entityClasses.map(name=>'.'+name),...(spec.entitySelectors||[])].join(',')||'.cell';
    function entities(){return [...visual.querySelectorAll(selector)].filter(element=>!element.closest('.legend,.mini-legend')&&element.getBoundingClientRect().width>0);}
    function identify(element,counts){const base=spec.entityClasses.find(name=>element.classList.contains(name))||element.tagName;const pointer=/pointer|ptr|badge/.test(element.className?.baseVal||element.className||'');const label=pointer?element.textContent.trim().split(/\s*[=:]\s*/)[0]:'';const intrinsic=element.getAttribute('data-id')||element.getAttribute('data-node-id')||element.id;const family=label?`${base}:${label}`:base;const ordinal=counts.get(family)||0;counts.set(family,ordinal+1);return `${family}:${intrinsic||ordinal}`;}
    function remember(){for(const animation of runningAnimations.splice(0))animation.cancel();positionCache.clear();const counts=new Map();for(const element of entities()){const key=identify(element,counts);positionCache.set(key,{rect:element.getBoundingClientRect(),text:element.textContent});}for(const pointer of visual.querySelectorAll('.pointer,.ptr,.badge,.pointer-label'))positionCache.set('pointer:'+pointer.textContent.trim().replace(/\s*[=:].*$/,''),{rect:pointer.getBoundingClientRect(),text:pointer.textContent});}
    function decorate(compareText=true){
      const counts=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||performance.now()-lastAnimation<80,measured=entities().map(element=>({element,rect:element.getBoundingClientRect()}));if(!reduced)lastAnimation=performance.now();
      for(const {element,rect} of measured){
        const key=identify(element,counts),previous=positionCache.get(key),classes=element.getAttribute('class')||'';
        element.dataset.studyKey=key;
        const changed=compareText&&previous&&previous.text!==element.textContent;
        const role=changed||/(?:^|\s)(?:writing|write|written|updated|changed|just-added|just-pushed|swapped|storing|pushing)(?:\s|$)/.test(classes)?'changed':/(?:^|\s)(?:answer|result|found|visited|done|settled|complete)(?:\s|$)/.test(classes)?'complete':/(?:^|\s)(?:reading|read|source|dependency|active-read|prev1|prev2)(?:\s|$)/.test(classes)?'read':/(?:^|\s)(?:current|active|target|selected|scan|pivot|comparing)(?:\s|$)/.test(classes)?'active':/(?:^|\s)(?:discarded|eliminated|excluded|skipped)(?:\s|$)/.test(classes)?'discarded':/(?:^|\s)(?:onpath|path|onstack)(?:\s|$)/.test(classes)?'path':'';
        element.dataset.studyRole=role;
        if(changed){element.dataset.studyBefore=previous.text.trim().slice(0,70);element.title=`Changed: ${previous.text.trim()} → ${element.textContent.trim()}`;}
        if(animations&&!reduced&&previous&&element.animate){const dx=(previous.rect.left-rect.left)/zoom,dy=(previous.rect.top-rect.top)/zoom;if((element.id||element.hasAttribute('data-node-id'))&&Math.abs(dx)+Math.abs(dy)>2)runningAnimations.push(element.animate([{translate:`${dx}px ${dy}px`},{translate:'0px 0px'}],{duration:200,easing:'ease-out'}));else if(changed)runningAnimations.push(element.animate([{opacity:.35},{opacity:1}],{duration:200}));}
        if(animations&&!reduced&&!previous&&element.animate)runningAnimations.push(element.animate([{opacity:0,translate:'0 7px'},{opacity:1,translate:'0 0'}],{duration:200}));
      }
      // Pointer labels identify the moving reference even when its cell changes.
      const pointers=[...visual.querySelectorAll('.pointer,.ptr,.badge,.pointer-label')],seen=new Map();
      for(const pointer of pointers){const key='pointer:'+pointer.textContent.trim().replace(/\s*[=:].*$/,'');const old=positionCache.get(key),rect=pointer.getBoundingClientRect();if(old&&animations&&!reduced)pointer.animate([{translate:`${(old.rect.x-rect.x)/zoom}px ${(old.rect.y-rect.y)/zoom}px`},{translate:'0 0'}],{duration:200,easing:'ease-out'});seen.set(key,{rect,text:pointer.textContent});}
      for(const [key,item] of seen)positionCache.set(key,item);
      scheduleFlows();
    }
    function drawFlows(){
      flow.replaceChildren();flow.setAttribute('width','0');flow.setAttribute('height','0');flow.setAttribute('width',String(scene.scrollWidth));flow.setAttribute('height',String(scene.scrollHeight));
      const roots=scene.getBoundingClientRect();
      const relationships=(window.studyWalkthrough?.links||[]).map(link=>[visual.querySelector(link.from),visual.querySelector(link.to),link.label]);
      const symbols={active:['●','#8db4ff'],read:['◉','#7dd3e8'],changed:['◆','#e7c779'],complete:['✓','#79d5af'],path:['↗','#b99cfa'],discarded:['−','#8493ab']};
      const annotated=[...visual.querySelectorAll('[data-study-role]')].filter(e=>symbols[e.dataset.studyRole]).slice(0,80).map(element=>({element,rect:element.getBoundingClientRect()}));
      for(const {element,rect} of annotated){const [symbol,color]=symbols[element.dataset.studyRole],badge=document.createElementNS('http://www.w3.org/2000/svg','text');badge.textContent=symbol;badge.setAttribute('x',String((rect.right-roots.x)/zoom-10));badge.setAttribute('y',String((rect.top-roots.y)/zoom+11));badge.setAttribute('fill',color);badge.setAttribute('font-size','10');badge.setAttribute('paint-order','stroke');badge.setAttribute('stroke','#101a29');badge.setAttribute('stroke-width','3');flow.append(badge);}
      if(!relationships.length)return;
      const ns='http://www.w3.org/2000/svg',defs=document.createElementNS(ns,'defs'),marker=document.createElementNS(ns,'marker');marker.id='study-dependency-arrow';marker.setAttribute('viewBox','0 0 10 10');marker.setAttribute('refX','9');marker.setAttribute('refY','5');marker.setAttribute('markerWidth','6');marker.setAttribute('markerHeight','6');marker.setAttribute('orient','auto');const arrow=document.createElementNS(ns,'path');arrow.setAttribute('d','M0 0L10 5L0 10z');arrow.setAttribute('fill','#e7c779');marker.append(arrow);defs.append(marker);flow.append(defs);
      for(const [from,to,label] of relationships){if(!from||!to||from===to||from.contains(to)||to.contains(from))continue;const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();if(!a.width||!b.width)continue;const x1=(a.x+a.width/2-roots.x)/zoom,y1=(a.y-roots.y)/zoom,x2=(b.x+b.width/2-roots.x)/zoom,y2=(b.y-roots.y)/zoom;const path=document.createElementNS(ns,'path');path.setAttribute('d',`M${x1},${y1} C${x1},${Math.min(y1,y2)-27} ${x2},${Math.min(y1,y2)-27} ${x2},${y2}`);path.setAttribute('class','study-transfer');path.setAttribute('marker-end','url(#study-dependency-arrow)');const text=document.createElementNS(ns,'text');text.textContent=label;text.setAttribute('x',String((x1+x2)/2));text.setAttribute('y',String(Math.min(y1,y2)-16));text.setAttribute('class','operation-link-label');flow.append(path,text);}
    }
    function updateChapters(){const old=chapters.value;chapters.replaceChildren(make('option','','Jump to phase…'));chapters.firstChild.value='';for(const entry of phaseEntries){const option=make('option','',`${entry.index+1} · ${entry.phase}`);option.value=String(entry.index);chapters.append(option);}chapters.value=old||'';}
    function prepare(){
      total=source.count();phaseEntries=[];const seen=new Set();
      if(total!==null){for(const entry of source.phases())if(entry.phase&&!seen.has(entry.phase)){seen.add(entry.phase);phaseEntries.push({index:entry.index,phase:entry.phase.replace(/[_-]+/g,' ')});}}
      if(total!==null&&total>1&&!phaseEntries.some(p=>p.index===total-1))phaseEntries.push({index:total-1,phase:'Result'});
      updateChapters();
    }
    function update(){
      const raw=source.read(),index=source.index(),next=document.getElementById('btn-next');extent=Math.max(extent,index);
      if(next.disabled)total=index+1;
      if(spec.mode==='history'&&!phaseEntries.some(entry=>entry.phase===phase(raw))){phaseEntries.push({index,phase:phase(raw)});updateChapters();}
      const active=[...document.querySelectorAll('.code-line.active,.cl.active')],line=Number(active[0]?.id.match(/\d+/)?.[0]||1),action=narration?.textContent.trim()||phase(raw);
      const state=capture(raw,index,phase(raw),action,spec.why,line);
      const previous=index>0?(lastIndex===index-1?lastCapture:source.readAt?capture(source.readAt(index-1),index-1,'','','',line):null):null;
      if(recordedChanges.has(index))state.frame.changes=recordedChanges.get(index);
      else if(previous){for(const name of new Set([...previous.flat.keys(),...state.flat.keys()])){const value=state.flat.get(name);if(!learnedNames.has(name.split(/[.[]/)[0]))continue;const before=previous.flat.get(name);if(JSON.stringify(before)!==JSON.stringify(value))state.frame.changes.push({name,before,after:value});}state.frame.changes=state.frame.changes.slice(0,100);}
      recordedChanges.set(index,state.frame.changes);if(recordedChanges.size>5000)recordedChanges.delete(recordedChanges.keys().next().value);
      changes.replaceChildren();for(const change of state.frame.changes.slice(0,8)){const chip=make('button','viz-change',`${change.name}: ${readable(change.before)} → ${readable(change.after)}`);const root=change.name.split(/[.[]/)[0];chip.title=spec.meanings[root]||root;chip.onclick=()=>{document.getElementById('inspector-variables-tab')?.click();const panel=document.getElementById('inspector-variables');panel?.scrollIntoView({block:'nearest'});};changes.append(chip);}
      coachTitle.textContent=`WHAT HAPPENED · ${phase(raw).toUpperCase()}`;
      progress.value=total===null?`Step ${index+1} · ${extent+1} recorded`:`Step ${index+1} of ${total}`;range.max=String(total===null?extent:Math.max(0,total-1));range.value=String(index);range.setAttribute('aria-valuetext',progress.value);
      const didAdvance=index===lastIndex+1;currentFrame=state.frame;lastCapture=state;lastIndex=index;decorate(didAdvance);
      for(const listener of listeners)listener(currentFrame);
      workspace.dataset.lessonReady='true';
    }
    window.render=function(...args){if(muted)return;window.studyWalkthrough?.restoreLiveView();remember();const result=originalRender.apply(this,args);update();return result;};
    async function seek(index){
      if(seeking)return;pause();seeking=true;const version=epoch;range.disabled=chapters.disabled=true;
      try{
        const target=Math.max(0,Math.min(total===null?50000:total-1,Math.floor(index)));
        if(source.jump){source.jump(target);return;}
        while(source.index()!==target&&version===epoch){let count=0;muted=true;try{while(source.index()!==target&&count++<150){const before=source.index();if(before<target)originalNext();else originalPrevious();if(before===source.index())break;}}finally{muted=false;window.render();}if(count<150)break;await new Promise(resolve=>setTimeout(resolve,0));}
      }finally{seeking=false;range.disabled=chapters.disabled=false;}
    }
    range.oninput=()=>{void seek(Number(range.value));};chapters.onchange=()=>{if(chapters.value!=='')void seek(Number(chapters.value));};
    for(const name of ['init','loadExample','loadCustom'])if(typeof window[name]==='function'){const original=window[name];window[name]=function(...args){epoch++;lastCapture=null;lastIndex=-1;extent=0;recordedChanges.clear();total=null;try{return original.apply(this,args);}finally{prepare();update();}};}
    /** @type {import('../shared/visualization').LessonAdapter} */
    const adapter={snapshot:()=>currentFrame,next:()=>{pause();originalNext();},previous:()=>{pause();originalPrevious();},reset:()=>document.getElementById('btn-reset').click(),seek,subscribe:listener=>{listeners.add(listener);return()=>listeners.delete(listener);}};
    window.studyLessonAdapter=adapter;
    new ResizeObserver(()=>scheduleFlows()).observe(viewport);
    prepare();update();
    window.studyWalkthrough=window.StudyOperations.create({source,adapter,diagram,visual,onChange:scheduleFlows});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
