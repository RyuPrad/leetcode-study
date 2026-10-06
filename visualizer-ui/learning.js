/* Visual teaching layer. The source adapter reads each lesson's real state. */
(() => {
  const make=(tag,className,text)=>{const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;};
  const readable=value=>value===undefined?'undefined':typeof value==='object'&&value!==null?'special'in value?value.special:'ref'in value?value.ref:JSON.stringify(value):typeof value==='string'?JSON.stringify(value):String(value);
  const omitted=new Set(['line','lines','hl','codeLines','highlight','highlightLines','executedLine','narr','narration','phase','execState','state','traceLen','traceLength','kind','action','message','recurrence','formula','svgNS','NS']);
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
    const originalRender=window.render,originalNext=window.nextStep,originalPrevious=window.prevStep;
    let muted=false,seeking=false,epoch=0,total=source.count(),extent=0,phaseEntries=[],lastCapture=null,currentFrame=null,zoom=1,animations=true,lastIndex=-1;
    const listeners=new Set(),positionCache=new Map(),journal=new Map();let lastAnimation=0,flowTask=0,committingStep=0,loading=0,currentView=null,settleMotion=false;const runningAnimations=[];
    const objectContainer=document.getElementById('study-object-view');
    let objectDisplayEpoch=-1,objectDisplayIndex=-1;
    const requestedParentOrigin=new URLSearchParams(location.search).get('parentOrigin'),parentOrigin=/^http:\/\/127\.0\.0\.1:\d+$/.test(requestedParentOrigin||'')?requestedParentOrigin:'study://app';
    let objectSelection=null,objectHostFocused=false,normalPageScroll=null,pendingPageScroll=null,operationSlot=null,focusedOperation=null,focusedInstruction=null,instructionSummary=null,instructionObserver=null,focusSizeTask=0;
    function restoreObjectPageScroll(){
      if(!pendingPageScroll||objectHostFocused)return;
      const saved=pendingPageScroll,root=document.scrollingElement;
      if(parent!==window&&Math.abs(innerWidth-saved.focusWidth)<1&&Math.abs(innerHeight-saved.focusHeight)<1&&(Math.abs(saved.width-saved.focusWidth)>1||Math.abs(saved.height-saved.focusHeight)>1))return;
      if(saved.x>root.scrollWidth-root.clientWidth+1||saved.y>root.scrollHeight-root.clientHeight+1)return;
      window.scrollTo(saved.x,saved.y);pendingPageScroll=null;
    }
    function updateFocusedInstruction(){
      if(!instructionSummary||!focusedOperation)return;
      const moment=focusedOperation.querySelector('.operation-position')?.textContent||'Current instruction',expression=focusedOperation.querySelector('.operation-expression')?.textContent||'';
      const text=`${moment} · ${expression}`;if(instructionSummary.textContent!==text)instructionSummary.textContent=text;
      instructionSummary.title=text;instructionSummary.setAttribute('aria-description',text);scheduleObjectFocusSize();
    }
    function scheduleObjectFocusSize(){
      if(!objectHostFocused||focusSizeTask)return;
      focusSizeTask=requestAnimationFrame(()=>{
        focusSizeTask=0;if(!objectHostFocused)return;
        const body=objectContainer.querySelector('.study-object-body');
        if(body){const panel=body.closest('.study-panel-body')||body.closest('.study-inspector-panel'),card=body.closest('.study-object-card'),bottom=Math.min(innerHeight,panel.getBoundingClientRect().bottom)-parseFloat(getComputedStyle(panel).paddingBottom)-parseFloat(getComputedStyle(card).paddingBottom)-2,height=Math.max(0,bottom-body.getBoundingClientRect().top);objectContainer.style.setProperty('--study-object-focus-height',`${height}px`);}
      });
    }
    function updateObjectHost(){
      const objectsSelected=window.studyPanelLayout?true:document.getElementById('inspector-objects-tab')?.getAttribute('aria-selected')==='true',focused=!!objectSelection&&objectsSelected;
      if(focused===objectHostFocused){scheduleObjectFocusSize();return;}
      clearMotion();settleMotion=true;objectHostFocused=focused;
      if(parent!==window)parent.postMessage({type:'study:object-focus',focused},parentOrigin);
      if(window.studyPanelLayout)window.studyPanelLayout.focus('objects',focused);
      const extraControls=toolbar.querySelector('.study-extra-controls');
      if(focused){
        pendingPageScroll=null;normalPageScroll={x:scrollX,y:scrollY,width:innerWidth,height:innerHeight};
        if(extraControls)extraControls.open=false;
        focusedOperation=diagram.querySelector('.study-operation');
        if(focusedOperation){
          operationSlot=document.createComment('Object focus instruction origin');focusedOperation.before(operationSlot);
          focusedInstruction=make('section',window.studyPanelLayout?'study-panels-focused-instruction':'study-focused-instruction');const disclosure=make('details','study-instruction-disclosure');instructionSummary=make('summary');instructionSummary.setAttribute('aria-label','Current instruction and walkthrough controls');disclosure.append(instructionSummary);focusedInstruction.append(disclosure,focusedOperation);workspace.insertBefore(focusedInstruction,workspace.querySelector('.study-panels-host')||document.querySelector('.study-inspector'));
          disclosure.addEventListener('toggle',()=>{if(disclosure.open){const secondary=toolbar.querySelector('.study-extra-controls');if(secondary)secondary.open=false;}});
          instructionObserver=new MutationObserver(updateFocusedInstruction);instructionObserver.observe(focusedOperation,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']});updateFocusedInstruction();
        }
        if(!window.studyPanelLayout){workspace.classList.add('study-object-focus');document.documentElement.classList.add('study-object-reading');window.scrollTo(0,0);}scheduleObjectFocusSize();
      }else{
        workspace.classList.remove('study-object-focus');document.documentElement.classList.remove('study-object-reading');
        if(extraControls)extraControls.open=true;
        if(operationSlot&&focusedOperation){instructionObserver?.disconnect();instructionObserver=null;operationSlot.replaceWith(focusedOperation);focusedInstruction?.remove();operationSlot=null;focusedOperation=null;focusedInstruction=null;instructionSummary=null;}
        objectContainer.style.removeProperty('--study-object-focus-height');
        decorate(false);
        const saved=normalPageScroll;normalPageScroll=null;if(saved){pendingPageScroll={...saved,focusWidth:innerWidth,focusHeight:innerHeight};requestAnimationFrame(restoreObjectPageScroll);}
      }
      scheduleFlows();
    }
    function onObjectFocusChange(selection){objectSelection=selection;updateObjectHost();}
    workspace.addEventListener('study:inspector-tab',updateObjectHost);
    toolbar.querySelector('.study-extra-controls')?.addEventListener('toggle',event=>{if(objectHostFocused&&event.currentTarget.open){const disclosure=focusedInstruction?.querySelector('details');if(disclosure)disclosure.open=false;}});
    document.addEventListener('pointerdown',event=>{if(!objectHostFocused)pendingPageScroll=null;if(objectHostFocused&&focusedInstruction&&!focusedInstruction.contains(event.target)){const disclosure=focusedInstruction.querySelector('details');if(disclosure)disclosure.open=false;}},{capture:true});
    document.addEventListener('wheel',()=>{if(!objectHostFocused)pendingPageScroll=null;},{capture:true,passive:true});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&objectHostFocused){event.preventDefault();event.stopPropagation();objectContainer.querySelector('.study-object-back')?.click();}},true);
    window.addEventListener('resize',()=>{scheduleObjectFocusSize();restoreObjectPageScroll();});
    const objectLayoutObserver=new ResizeObserver(()=>{scheduleObjectFocusSize();restoreObjectPageScroll();});objectLayoutObserver.observe(objectContainer);objectLayoutObserver.observe(workspace);
    function objectSnapshot(index=source.index()){
      if(!Number.isInteger(index)||index<0||index>(source.count()===null?source.index():source.count()-1))throw RangeError('Object snapshot index is outside the recorded timeline.');
      if(typeof source.objectFrame!=='function')throw Error(`Missing semantic Object View for problem ${spec.number}.`);
      const state=source.objectFrame(index);
      const line=journal.get(index)?.instruction.line||(source.readAt?.(index)?.executedLine)||currentFrame?.location.line||1;
      const location={line,column:1,endLine:line,endColumn:1};
      return {...state,stack:state.stack.map(call=>({...call,location})),index,location,phase:'Reference solution',action:'',explanation:spec.why,reads:state.reads||[],changes:state.changes||[],logs:[]};
    }
    function showObjects(frame){
      const previousFrame=frame.index>0?objectSnapshot(frame.index-1):undefined;
      window.StudyObjectView.render(objectContainer,frame,{runId:epoch,previousFrame,mode:'reference',onFocusChange:onObjectFocusChange});
      objectDisplayEpoch=epoch;objectDisplayIndex=frame.index;
    }
    function showObjectIndex(index){
      if(new URLSearchParams(location.search).has('guided')||objectDisplayEpoch===epoch&&objectDisplayIndex===index)return;
      showObjects(objectSnapshot(index));
    }
    const motionPreference=matchMedia('(prefers-reduced-motion: reduce)'),pointerSelector='.pointer,.ptr,.badge,.pointer-label';
    function cancelAnimations(){for(const animation of runningAnimations.splice(0))animation.cancel();}
    function clearMotion(){cancelAnimations();positionCache.clear();lastAnimation=0;}
    motionPreference.addEventListener('change',()=>clearMotion());
    const scheduleFlows=()=>{if(!flowTask)flowTask=requestAnimationFrame(()=>{flowTask=0;drawFlows();});};
    workspace.addEventListener('study:panel-geometry',()=>{clearMotion();settleMotion=true;scheduleFlows();scheduleObjectFocusSize();if(window.studyPanelLayout){const selected=window.studyPanelLayout.snapshot().maximized==='diagram';focus.setAttribute('aria-pressed',String(selected));focus.textContent=selected?'Restore diagram':'Focus diagram';}});
    const phase=raw=>{const label=[raw.phase,raw.execState,raw.state,raw.kind,raw.action,raw.stage,raw.type].find(value=>typeof value==='string'&&value.length>0);const candidate=raw.executedLine??raw.line??raw.lines??raw.hl??raw.codeLines??raw.highlight??raw.highlightLines;const line=Array.isArray(candidate)?candidate[0]:candidate;return String(label||(Number.isInteger(line)&&line>0?`Line ${line}`:'Ready')).replace(/[_-]+/g,' ');};
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
    function setZoom(value){clearMotion();zoom=Math.max(.3,Math.min(2,value));scene.style.zoom=String(zoom);zoomLabel.value=`${Math.round(zoom*100)}%`;scheduleFlows();}
    minus.onclick=()=>setZoom(zoom-.1);plus.onclick=()=>setZoom(zoom+.1);fit.onclick=()=>{scene.style.zoom='1';setZoom(Math.min(1,(viewport.clientWidth-24)/Math.max(1,visual.scrollWidth)));viewport.scrollTop=viewport.scrollLeft=0;};
    focus.onclick=()=>{if(window.studyPanelLayout){const selected=window.studyPanelLayout.snapshot().maximized!=='diagram';window.studyPanelLayout.maximize('diagram',selected);focus.setAttribute('aria-pressed',String(selected));focus.textContent=selected?'Restore diagram':'Focus diagram';return;}const selected=workspace.classList.toggle('study-focus');focus.setAttribute('aria-pressed',String(selected));focus.textContent=selected?'Show code':'Focus diagram';scheduleFlows();};
    motion.onclick=()=>{animations=!animations;clearMotion();motion.setAttribute('aria-pressed',String(animations));motion.textContent=animations?'Motion on':'Motion off';workspace.classList.toggle('study-no-motion',!animations);};
    let pan=null;viewport.addEventListener('pointerdown',event=>{if(!event.altKey&&event.target!==viewport&&event.target!==scene)return;event.preventDefault();pan={x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(event.pointerId);});viewport.addEventListener('pointermove',event=>{if(pan){viewport.scrollLeft=pan.left+pan.x-event.clientX;viewport.scrollTop=pan.top+pan.y-event.clientY;}});viewport.addEventListener('pointerup',()=>pan=null);viewport.addEventListener('lostpointercapture',()=>pan=null);
    const splitter=make('div','study-diagram-splitter');splitter.tabIndex=0;splitter.setAttribute('role','separator');splitter.setAttribute('aria-label','Resize lesson diagram');splitter.setAttribute('aria-orientation','vertical');splitter.setAttribute('aria-valuenow','60');diagram.after(splitter);
    const resize=percent=>{const value=Math.max(30,Math.min(75,percent));workspace.style.setProperty('--study-diagram-width',`${value}%`);splitter.setAttribute('aria-valuenow',String(Math.round(value)));scheduleFlows();};
    splitter.onkeydown=event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();event.stopPropagation();resize(Number(splitter.getAttribute('aria-valuenow'))+(event.key==='ArrowLeft'?-2:2));}};
    splitter.onpointerdown=event=>{splitter.setPointerCapture(event.pointerId);const move=e=>{const rect=workspace.getBoundingClientRect();resize((e.clientX-rect.left)/rect.width*100);};const end=()=>{splitter.removeEventListener('pointermove',move);splitter.removeEventListener('lostpointercapture',end);};splitter.addEventListener('pointermove',move);splitter.addEventListener('lostpointercapture',end);};
    const selector=[...spec.entityClasses.map(name=>'.'+name),...(spec.entitySelectors||[])].join(',')||'.cell';
    function entities(){return [...visual.querySelectorAll(selector)].filter(element=>!element.closest('.legend,.mini-legend')&&element.getBoundingClientRect().width>0);}
    function identify(element,counts){const base=spec.entityClasses.find(name=>element.classList.contains(name))||element.tagName;const pointer=/pointer|ptr|badge/.test(element.className?.baseVal||element.className||'');const label=pointer?element.textContent.trim().split(/\s*[=:]\s*/)[0]:'';const intrinsic=element.getAttribute('data-id')||element.getAttribute('data-node-id')||element.id;const family=label?`${base}:${label}`:base;const ordinal=counts.get(family)||0;counts.set(family,ordinal+1);return `${family}:${intrinsic||ordinal}`;}
    function measurePointers(){
      const entries=new Map();
      for(const element of visual.querySelectorAll(pointerSelector)){
        const rect=element.getBoundingClientRect();if(!rect.width||!rect.height||element.closest('.legend,.mini-legend'))continue;
        const scope=element.closest('[data-study-motion-scope]'),name=element.dataset.studyPointer||element.textContent.trim().replace(/\s*[=:].*$/,''),key='pointer:'+JSON.stringify([scope?.dataset.studyMotionScope||'',name]);
        const origin=(scope||visual).getBoundingClientRect();
        const item={element,key,text:element.textContent,target:element.getAttribute('data-study-pointer-target'),x:(rect.left-origin.left)/zoom,y:(rect.top-origin.top)/zoom,scaleX:element.offsetWidth?rect.width/element.offsetWidth/zoom:1,scaleY:element.offsetHeight?rect.height/element.offsetHeight/zoom:1};
        // A duplicate without an explicit view identity cannot safely borrow a position.
        if(entries.has(key))entries.set(key,null);else entries.set(key,item);
      }
      return [...entries.values()].filter(Boolean);
    }
    function remember(){
      cancelAnimations();positionCache.clear();if(loading||seeking||settleMotion||!diagram.getClientRects().length)return;
      const counts=new Map();for(const element of entities()){const key=identify(element,counts);positionCache.set(key,{rect:element.getBoundingClientRect(),text:element.textContent});}
      for(const item of measurePointers())positionCache.set(item.key,item);
    }
    function decorate(compareText=true){
      cancelAnimations();
      if(!diagram.getClientRects().length){positionCache.clear();settleMotion=true;return;}
      // Measure children before any ancestor starts moving, using each row's own origin.
      const counts=new Map(),reduced=motionPreference.matches||seeking||loading||settleMotion||performance.now()-lastAnimation<80,measured=entities().map(element=>({element,rect:element.getBoundingClientRect()})),pointers=measurePointers();if(!reduced)lastAnimation=performance.now();
      for(const {element,rect} of measured){
        const key=identify(element,counts),previous=positionCache.get(key),classes=element.getAttribute('class')||'';
        element.dataset.studyKey=key;
        const changed=compareText&&previous&&previous.text!==element.textContent;
        const role=changed||/(?:^|\s)(?:writing|write|written|updated|changed|just-added|just-pushed|swapped|storing|pushing)(?:\s|$)/.test(classes)?'changed':/(?:^|\s)(?:answer|result|found|visited|done|settled|complete)(?:\s|$)/.test(classes)?'complete':/(?:^|\s)(?:reading|read|source|dependency|active-read|prev1|prev2)(?:\s|$)/.test(classes)?'read':/(?:^|\s)(?:current|active|target|selected|scan|pivot|comparing)(?:\s|$)/.test(classes)?'active':/(?:^|\s)(?:discarded|eliminated|excluded|skipped)(?:\s|$)/.test(classes)?'discarded':/(?:^|\s)(?:onpath|path|onstack)(?:\s|$)/.test(classes)?'path':'';
        element.dataset.studyRole=role;
        if(changed){element.dataset.studyBefore=previous.text.trim().slice(0,70);element.title=`Changed: ${previous.text.trim()} → ${element.textContent.trim()}`;}
        if(!element.matches(pointerSelector)&&animations&&!reduced&&previous&&element.animate){const dx=(previous.rect.left-rect.left)/zoom,dy=(previous.rect.top-rect.top)/zoom;if((element.id||element.hasAttribute('data-node-id'))&&Math.abs(dx)+Math.abs(dy)>2)runningAnimations.push(element.animate([{translate:`${dx}px ${dy}px`},{translate:'0px 0px'}],{duration:200,easing:'ease-out'}));else if(changed)runningAnimations.push(element.animate([{opacity:.35},{opacity:1}],{duration:200}));}
        if(!element.matches(pointerSelector)&&animations&&!reduced&&!previous&&element.animate)runningAnimations.push(element.animate([{opacity:0,translate:'0 7px'},{opacity:1,translate:'0 0'}],{duration:200}));
      }
      // A reference belongs to its view; its target changes without changing its identity.
      for(const item of pointers){
        const old=positionCache.get(item.key),{element,target,scaleX,scaleY}=item;
        if(!old||!animations||reduced||!element.animate||target!==null&&old.target===target)continue;
        const dx=(old.x-item.x)/scaleX,dy=(old.y-item.y)/scaleY;
        if(Math.abs(dx)+Math.abs(dy)>2)runningAnimations.push(element.animate([{translate:`${dx}px ${dy}px`},{translate:'0px 0px'}],{duration:200,easing:'ease-out'}));
      }
      settleMotion=false;
      scheduleFlows();
    }
    function drawFlows(){
      flow.replaceChildren();if(!diagram.getClientRects().length)return;flow.setAttribute('width','0');flow.setAttribute('height','0');flow.setAttribute('width',String(scene.scrollWidth));flow.setAttribute('height',String(scene.scrollHeight));
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
    function pendingInstruction(){
      if(source.pendingInstruction)return source.pendingInstruction();
      if(spec.mode==='precomputed'){
        if(source.index()+1>=source.count())return null;
        const raw=source.readAt(source.index()+1),line=raw.executedLine;
        return Number.isInteger(line)?{line,phase:String(raw.execState||raw.phase||raw.state||phase(raw))}:null;
      }
      throw Error('A history lesson must identify its pending instruction.');
    }
    function inputsOf(state){
      const objects=new Map(state.frame.objects.map(object=>[object.id,object]));
      const text=value=>value&&typeof value==='object'&&'ref'in value?(()=>{const object=objects.get(value.ref);return object?`${object.kind} [${object.entries.slice(0,5).map(entry=>`${entry.key}: ${readable(entry.value)}`).join(', ')}${object.entries.length>5?', …':''}]`:value.ref;})():readable(value);
      return Object.fromEntries(state.frame.stack[0].variables.map(variable=>[variable.name,text(variable.value)]));
    }
    function contextOf(raw){
      const context=Object.fromEntries(Object.entries(raw).filter(([,value])=>value===null||['boolean','number','string'].includes(typeof value)));
      if(Array.isArray(raw.nums)){context.numsLength=raw.nums.length;context.currentNum=raw.nums[raw.i]??null;}
      return context;
    }
    function observedChanges(before,after){
      const changes=[];
      for(const name of new Set([...before.flat.keys(),...after.flat.keys()])){
        if(/^(?:history|historyStack|trace|steps|snapshots|masterTrace)(?:[.\[]|$)/.test(name)||omitted.has(name))continue;
        const old=before.flat.get(name),value=after.flat.get(name);
        if(JSON.stringify(old)!==JSON.stringify(value))changes.push({name,before:old,after:value});
      }
      return changes.slice(0,100);
    }
    function captureState(raw,index,instruction){
      return capture(raw,index,phase(raw),String(raw.lastAction||raw.action||raw.narration||raw.narr||phase(raw)),spec.why,instruction?.line||1);
    }
    function recordTransition(fromIndex,toIndex,instruction,beforeRaw,before,afterRaw,after){
      const entry={fromIndex,toIndex,instruction,beforeInputs:inputsOf(before),afterInputs:inputsOf(after),context:contextOf(beforeRaw),changes:observedChanges(before,after),action:after.frame.action};
      const caption=source.resultCaption?.(instruction,entry.context,afterRaw);if(caption)entry.resultCaption=String(caption);
      journal.set(toIndex,entry);return entry;
    }
    function currentTransition(){
      const index=source.index();if(index===0)return null;
      if(journal.has(index))return journal.get(index);
      if(spec.mode!=='precomputed'||!source.readAt)return null;
      const beforeRaw=source.readAt(index-1),raw=source.readAt(index),line=raw.executedLine;
      if(!Number.isInteger(line))return null;
      const instruction={line,phase:String(raw.execState||raw.phase||raw.state||phase(raw))};
      return recordTransition(index-1,index,instruction,beforeRaw,captureState(beforeRaw,index-1,instruction),raw,captureState(raw,index,instruction));
    }
    let previewing=false;
    function beforeView(){
      const index=source.index();if(currentView?.index===index)return currentView.before;
      if(index===0)return null;
      let clone=null;
      if(source.preview){previewing=true;try{clone=source.preview(index-1);}finally{previewing=false;}}
      else if(source.jump){
        previewing=true;
        try{source.jump(index-1);clone=visual.cloneNode(true);}finally{source.jump(index);previewing=false;}
      }
      if(clone)currentView={index,before:clone};return clone;
    }
    function trackedNext(...args){
      const fromIndex=source.index(),beforeRaw=source.read(),instruction=pendingInstruction();
      const before=captureState(beforeRaw,fromIndex,instruction),clone=muted?null:visual.cloneNode(true);
      committingStep++;let result;
      try{result=originalNext.apply(this,args);}finally{committingStep--;}
      const toIndex=source.index();
      if(toIndex!==fromIndex){
        if(toIndex!==fromIndex+1)throw Error('An instruction must advance exactly one timeline step.');
        if(!instruction)throw Error('The executed reference instruction is missing its location.');
        const afterRaw=source.read(),after=captureState(afterRaw,toIndex,instruction);
        recordTransition(fromIndex,toIndex,instruction,beforeRaw,before,afterRaw,after);
        currentView=clone?{index:toIndex,before:clone}:null;
      }
      if(!muted&&!loading)update();return result;
    }
    function update(){
      if(committingStep||loading)return;
      const raw=source.read(),index=source.index(),next=document.getElementById('btn-next');extent=Math.max(extent,index);
      if(next.disabled)total=index+1;
      if(spec.mode==='history'&&!phaseEntries.some(entry=>entry.phase===phase(raw))){phaseEntries.push({index,phase:phase(raw)});updateChapters();}
      const instruction=pendingInstruction(),line=instruction?.line||currentTransition()?.instruction.line||1,action=narration?.textContent.trim()||phase(raw);
      const state=capture(raw,index,phase(raw),action,spec.why,line);
      state.frame.changes=currentTransition()?.changes||[];
      changes.replaceChildren();for(const change of state.frame.changes.slice(0,8)){const chip=make('button','viz-change',`${change.name}: ${readable(change.before)} → ${readable(change.after)}`);const root=change.name.split(/[.[]/)[0];chip.title=spec.meanings[root]||root;chip.onclick=()=>{document.getElementById('inspector-variables-tab')?.click();const panel=document.getElementById('inspector-variables');panel?.scrollIntoView({block:'nearest'});};changes.append(chip);}
      coachTitle.textContent=`WHAT HAPPENED · ${phase(raw).toUpperCase()}`;
      progress.value=total===null?`Step ${index+1} · ${extent+1} recorded`:`Step ${index+1} of ${total}`;range.max=String(total===null?extent:Math.max(0,total-1));range.value=String(index);range.setAttribute('aria-valuetext',progress.value);
      const didAdvance=index===lastIndex+1;currentFrame=state.frame;lastCapture=state;lastIndex=index;decorate(didAdvance);
      showObjectIndex(index);
      for(const listener of listeners)listener(currentFrame);
      workspace.dataset.lessonReady='true';
    }
    window.render=function(...args){if(previewing)return originalRender.apply(this,args);if(muted)return;window.studyWalkthrough?.restoreLiveView();remember();const result=originalRender.apply(this,args);update();return result;};
    window.nextStep=trackedNext;
    async function seek(index){
      if(seeking)return;pause();seeking=true;clearMotion();const version=epoch;range.disabled=chapters.disabled=true;
      try{
        const target=Math.max(0,Math.min(total===null?50000:total-1,Math.floor(index)));
        if(source.jump){source.jump(target);return;}
        while(source.index()!==target&&version===epoch){let count=0;muted=true;try{while(source.index()!==target&&count++<150){const before=source.index();if(before<target)trackedNext();else originalPrevious();if(before===source.index())break;}}finally{muted=false;window.render();}if(count<150)break;await new Promise(resolve=>setTimeout(resolve,0));}
      }finally{clearMotion();seeking=false;range.disabled=chapters.disabled=false;}
    }
    range.oninput=()=>{void seek(Number(range.value));};chapters.onchange=()=>{if(chapters.value!=='')void seek(Number(chapters.value));};
    function resetRun(){clearMotion();settleMotion=true;epoch++;window.StudyObjectView.reset(objectContainer);if(!window.studyPanelLayout)document.getElementById('inspector-objects-tab')?.click();lastCapture=null;lastIndex=-1;extent=0;journal.clear();currentView=null;total=null;}
    if(typeof window.init==='function'){const original=window.init;window.init=function(...args){resetRun();loading++;let result;try{result=original.apply(this,args);}finally{loading--;if(!loading){prepare();update();}}return result;};}
    for(const name of ['loadExample','loadEx','loadCustom'])if(typeof window[name]==='function'){
      const original=window[name];window[name]=function(...args){const version=epoch;loading++;let result;try{result=original.apply(this,args);}finally{loading--;}
        if(result===false)return false;
        if(epoch===version&&source.index()===0)resetRun();
        if(!loading){prepare();update();}return result;
      };
    }
    /** @type {import('../shared/visualization').LessonAdapter} */
    const adapter={snapshot:()=>currentFrame,objectSnapshot,currentTransition,next:()=>{pause();trackedNext();},previous:()=>{pause();originalPrevious();},reset:()=>document.getElementById('btn-reset').click(),seek,subscribe:listener=>{listeners.add(listener);return()=>listeners.delete(listener);}};
    window.studyLessonAdapter=adapter;
    new ResizeObserver(()=>scheduleFlows()).observe(viewport);
    prepare();update();
    window.studyWalkthrough=window.StudyOperations.create({source,adapter,diagram,visual,onChange:scheduleFlows,getPendingInstruction:pendingInstruction,getCurrentTransition:currentTransition,getBeforeView:beforeView,onObjectIndex:showObjectIndex});
    if(!new URLSearchParams(location.search).has('guided'))window.StudyPanelLayout.mountReference('visualizer');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
