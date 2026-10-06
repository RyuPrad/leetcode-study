/* Shared window manager. Geometry is presentation state; it never runs a lesson. */
(() => {
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const copy = value => JSON.parse(JSON.stringify(value));
  const make = (tag, cls, text) => { const el = document.createElement(tag); el.className = cls.trim(); if (text) el.textContent = text; return el; };
  const validId = id => typeof id === 'string' && /^[a-z][a-z0-9-]{0,39}$/.test(id);
  function parse(value) {
    try {
      const data = JSON.parse(value);
      if (data?.version !== 1 || !data.panels || typeof data.panels !== 'object' || Array.isArray(data.panels)) return {};
      return Object.fromEntries(Object.entries(data.panels).slice(0, 32).filter(([id, r]) => validId(id) && r && ['x','y','width','height','workspaceWidth','z'].every(k => Number.isFinite(r[k])) && r.width > 0 && r.height > 0 && r.workspaceWidth > 0 && typeof r.hidden === 'boolean').map(([id,r]) => [id, {x:clamp(r.x,0,20000),y:clamp(r.y,0,20000),width:clamp(r.width,160,10000),height:clamp(r.height,160,3000),workspaceWidth:clamp(r.workspaceWidth,160,10000),z:clamp(r.z,0,1000),hidden:r.hidden,placed:r.placed===true}]));
    } catch { return {}; }
  }
  function create({host, view, onInteraction = () => {}, onGeometry = () => {}}) {
    if (!['visualizer','learn','debug'].includes(view)) throw Error('Unknown panel workspace');
    const key = `study.panelLayout.v1.${view}`, entries = new Map(), listeners = new Set(), abort = new AbortController();
    let saved = {}, gesture = null, maximized = null, focused = null, focusReturn = null, pendingScrollReturn = null, disposed = false, raf = 0, dragFrame = 0, serial = 0;
    try { saved = parse(localStorage.getItem(key)); } catch { /* Storage can be unavailable in a standalone document. */ }
    host.classList.add('study-panels-host'); host.dataset.panelView = view;
    const bar = make('div','study-panels-bar'), menu = make('details','study-panels-menu'), summary = make('summary','','Panels'), menuBody = make('div','study-panels-menu-body');
    summary.setAttribute('aria-label','Panels'); menu.append(summary,menuBody);
    const reset = make('button','study-panels-reset','Reset layout'); reset.type = 'button';
    const hint = make('span','study-panels-hint','Drag a title bar to move · Drag an edge to resize');
    const status = make('span','study-panels-status'); status.setAttribute('role','status'); status.setAttribute('aria-live','polite');
    bar.append(menu,reset,hint,status);
    const scroll = make('div','study-panel-scroll'), canvas = make('div','study-panel-canvas'); scroll.append(canvas); host.append(bar,scroll);
    const listen = (el,type,fn,options={}) => el.addEventListener(type,fn,{...options,signal:abort.signal});
    const width = () => Math.max(1,scroll.clientWidth-8), height = () => Math.max(80,scroll.clientHeight-8);
    function defaults(id) {
      const w=width(), h=Math.max(360,Math.min(560,height()*.9)), gap=12;
      const primary=view==='learn'?['question','diagram','code']:view==='debug'?['operation','diagram','code','objects']:['diagram','code','objects'];
      let r={x:24,y:scroll.scrollTop+24,width:Math.min(600,w),height:h,workspaceWidth:w,z:primary.indexOf(id)+1,hidden:!primary.includes(id)};
      if(w<800){const index=primary.indexOf(id);if(index>=0)r={...r,x:0,y:index*(h+gap),width:w};}
      else if(view==='learn') {
        if(w>=1050){const q=(w-2*gap)*.28,d=(w-2*gap)*.42;r={...r,x:id==='question'?0:id==='diagram'?q+gap:q+d+2*gap,y:0,width:id==='question'?q:id==='diagram'?d:(w-2*gap)*.30,height:Math.max(420,height())};}
        else if(id==='question')r={...r,x:0,y:0,width:w,height:300};
        else r={...r,x:id==='diagram'?0:(w-gap)*.6+gap,y:312,width:(w-gap)*(id==='diagram'?.6:.4)};
      } else {
        const top=view==='debug'?192:0;
        if(id==='operation')r={...r,x:0,y:0,width:w,height:180};
        if(id==='diagram'||id==='code')r={...r,x:id==='diagram'?0:(w-gap)*.6+gap,y:top,width:(w-gap)*(id==='diagram'?.6:.4)};
        if(id==='objects')r={...r,x:0,y:top+h+gap,width:w,height:Math.max(400,h)};
      }
      return r;
    }
    function raw(id){const base=defaults(id),stored=saved[id];return stored?.placed?stored:{...base,z:stored?.z??base.z,hidden:stored?.hidden??base.hidden,placed:false};}
    function rect(id) {
      const r=entries.get(id).draft||raw(id), w=width(), scale=w/r.workspaceWidth;
      const panelWidth=clamp(r.width*scale,Math.min(280,w),w);
      return {...r,x:clamp(r.x*scale,0,Math.max(0,w-panelWidth)),width:panelWidth,y:clamp(r.y,0,20000),height:clamp(r.height,160,3000),workspaceWidth:w};
    }
    function emit() { for(const fn of listeners)fn(); onGeometry(); host.dispatchEvent(new CustomEvent('study:panel-geometry',{bubbles:true})); }
    function paint() {
      raf=0;if(disposed)return;
      let bottom=height(),geometryChanged=false;reset.disabled=!!focused;host.dataset.panelFocus=focused||'';
      for(const [id,item] of entries){
        const r=rect(id), isMax=maximized===id, temporaryHidden=!!maximized&&!isMax;
        item.window.hidden=r.hidden||temporaryHidden;item.window.classList.toggle('study-panel-maximized',isMax);
        item.window.dataset.panelHidden=String(r.hidden);item.window.style.zIndex=String(isMax?1100:r.z+1);
        const visibleRect=isMax?{x:0,y:scroll.scrollTop,width:width(),height:height()}:r;
        // Leave room for the window title, object toolbar and value name. A
        // long value must fit both its window and the visible scrolled canvas.
        item.window.style.setProperty('--study-panel-reading-height',`${Math.max(26,Math.min(height()-64,visibleRect.height-200))}px`);
        const geometry=[visibleRect.x,visibleRect.y,visibleRect.width,visibleRect.height,r.hidden,temporaryHidden].join('|');
        if(item.lastGeometry!==geometry){geometryChanged=true;item.lastGeometry=geometry;}
        for(const p of ['width','height'])item.window.style[p]=`${visibleRect[p]}px`;
        item.window.style.left=`${visibleRect.x}px`;item.window.style.top=`${visibleRect.y}px`;
        item.max.textContent=isMax?'↙':'□';item.max.setAttribute('aria-label',`${isMax?'Restore':'Maximize'} ${item.title}`);
        item.max.disabled=focused===id;item.hide.disabled=focused===id;
        item.move.disabled=!!maximized;item.resize.disabled=!!maximized;item.menu.disabled=!!focused&&focused!==id;
        item.menu.setAttribute('aria-pressed',String(!r.hidden));
        if(!r.hidden&&!temporaryHidden)bottom=Math.max(bottom,visibleRect.y+visibleRect.height+12);
      }
      canvas.style.height=`${Math.ceil(bottom)}px`;scroll.classList.toggle('study-panels-maximized',!!maximized);
      if(pendingScrollReturn){
        const p=pendingScrollReturn,waitingForHost=p.width!==p.focusWidth||p.height!==p.focusHeight;
        if((!waitingForHost||innerWidth!==p.focusWidth||innerHeight!==p.focusHeight)&&p.scroll<=scroll.scrollHeight-scroll.clientHeight+1){scroll.scrollTop=p.scroll;pendingScrollReturn=null;}
      }
      if(geometryChanged)emit();
    }
    function schedule(){if(!raf&&!disposed)raf=requestAnimationFrame(paint);}
    function persist(){try{localStorage.setItem(key,JSON.stringify({version:1,panels:saved}));}catch{status.textContent='Layout will last for this visit; storage is unavailable.';}}
    function storeRect(id,r){saved[id]={x:r.x,y:r.y,width:r.width,height:r.height,workspaceWidth:r.workspaceWidth,z:r.z,hidden:r.hidden,placed:!!r.placed};}
    function raise(id,save=true){
      const ordered=[...entries.keys()].sort((a,b)=>rect(a).z-rect(b).z).filter(value=>value!==id);ordered.push(id);
      ordered.forEach((name,index)=>storeRect(name,{...raw(name),z:index+1}));
      if(save)persist();paint();
    }
    function show(id){const item=entries.get(id);if(!item)return;cancel();if(focused&&focused!==id)return;if(maximized&&maximized!==id)maximized=null;storeRect(id,{...raw(id),hidden:false});raise(id);paint();scroll.scrollTop=rect(id).y;item.move.focus({preventScroll:true});menu.open=false;}
    function setMaximized(id,enabled=true){
      if(!entries.has(id)||focused)return;
      cancel();onInteraction();
      if(enabled){entries.get(id).returnScroll=scroll.scrollTop;storeRect(id,{...raw(id),hidden:false});maximized=id;}
      else {maximized=null;scroll.scrollTop=entries.get(id).returnScroll||0;}
      paint();
    }
    function focus(id,enabled){
      if(enabled){if(focused===id)return;if(!entries.has(id))return;cancel();pendingScrollReturn=null;focusReturn={maximized,scroll:scroll.scrollTop,width:innerWidth,height:innerHeight};focused=id;maximized=id;storeRect(id,{...raw(id),hidden:false});}
      else if(focused===id){focused=null;maximized=focusReturn?.maximized||null;pendingScrollReturn={...focusReturn,focusWidth:innerWidth,focusHeight:innerHeight};focusReturn=null;}
      paint();
    }
    function finish(commit){
      const current=gesture;if(!current)return;gesture=null;cancelAnimationFrame(dragFrame);dragFrame=0;status.dataset.editing='false';
      const item=entries.get(current.id);if(!item)return;
      if(commit&&current.started){storeRect(current.id,{...item.draft,placed:true});persist();}
      item.draft=null;item.window.classList.remove('study-panel-moving');
      if(current.capture?.hasPointerCapture(current.pointerId))current.capture.releasePointerCapture(current.pointerId);
      status.textContent=current.started?(commit?`${item.title} layout saved.`:`${item.title} movement cancelled.`):'';
      paint();
    }
    function cancel(){finish(false);}
    function begin(id,kind,event,capture){
      if(maximized||focused||gesture||event&&event.button!==0)return;
      const start=rect(id);gesture={id,kind,start,started:false,x:event?.clientX||0,y:event?.clientY||0,scroll:scroll.scrollTop,pointerId:event?.pointerId,capture};
      if(event){capture.setPointerCapture(event.pointerId);event.preventDefault();event.stopPropagation();dragFrame=requestAnimationFrame(scrollDrag);}
      else {gesture.started=true;onInteraction();entries.get(id).draft={...start};status.dataset.editing='true';status.textContent=`${kind==='move'?'Move':'Resize'} ${entries.get(id).title}: arrow keys, Shift for one pixel, Enter to save, Escape to cancel.`;}
    }
    function change(dx,dy){
      const g=gesture;if(!g)return;
      const item=entries.get(g.id);if(!g.started){if(Math.hypot(dx,dy)<4)return;g.started=true;onInteraction();raise(g.id,false);g.start.z=rect(g.id).z;}
      const r={...g.start};
      if(g.kind==='move'){r.x+=dx;r.y+=dy;}
      else {
        if(g.kind.includes('e'))r.width+=dx;if(g.kind.includes('s'))r.height+=dy;
        if(g.kind.includes('w')){r.x+=dx;r.width-=dx;}if(g.kind.includes('n')){r.y+=dy;r.height-=dy;}
      }
      const min=Math.min(280,width());r.width=clamp(r.width,min,width());r.height=clamp(r.height,160,3000);
      if(g.kind.includes('w')&&g.kind!=='move')r.x=g.start.x+g.start.width-r.width;
      if(g.kind.includes('n'))r.y=g.start.y+g.start.height-r.height;
      r.x=clamp(r.x,0,width()-r.width);r.y=clamp(r.y,0,20000);
      item.draft=r;item.window.classList.add('study-panel-moving');paint();
    }
    function pointerChange(){const g=gesture;if(!g)return;const scale=scroll.getBoundingClientRect().width/Math.max(1,scroll.offsetWidth);change(((g.lastX??g.x)-g.x)/scale,((g.lastY??g.y)-g.y)/scale+scroll.scrollTop-g.scroll);}
    function scrollDrag(){
      const g=gesture;if(!g||g.pointerId===undefined)return;
      if(g.started){const box=scroll.getBoundingClientRect(),y=g.lastY??g.y,delta=y<box.top+24?-Math.min(18,box.top+24-y):y>box.bottom-24?Math.min(18,y-box.bottom+24):0;
        if(delta){const previous=scroll.scrollTop;scroll.scrollTop=Math.max(0,previous+delta);if(scroll.scrollTop!==previous)pointerChange();}}
      dragFrame=requestAnimationFrame(scrollDrag);
    }
    listen(window,'pointermove',event=>{if(!gesture||event.pointerId!==gesture.pointerId)return;gesture.lastX=event.clientX;gesture.lastY=event.clientY;pointerChange();});
    listen(window,'pointerup',event=>{if(event.pointerId===gesture?.pointerId)finish(true);});
    listen(window,'pointercancel',cancel);listen(window,'blur',cancel);listen(window,'pagehide',cancel);
    listen(document,'visibilitychange',()=>{if(document.hidden)cancel();});
    listen(window,'keydown',event=>{
      if(!gesture)return;
      if(event.key==='Tab'){finish(true);return;}
      if(event.key==='Escape'||event.key==='Enter'){event.preventDefault();event.stopImmediatePropagation();finish(event.key==='Enter');return;}
      if(gesture.pointerId!==undefined||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
      event.preventDefault();event.stopImmediatePropagation();const amount=event.shiftKey?1:10;
      gesture.dx=(gesture.dx||0)+(event.key==='ArrowLeft'?-amount:event.key==='ArrowRight'?amount:0);
      gesture.dy=(gesture.dy||0)+(event.key==='ArrowUp'?-amount:event.key==='ArrowDown'?amount:0);change(gesture.dx,gesture.dy);
    },{capture:true});
    listen(scroll,'scroll',()=>{if(maximized)schedule();},{passive:true});
    listen(scroll,'wheel',()=>{pendingScrollReturn=null;},{passive:true});
    listen(document,'pointerdown',event=>{if(!menu.contains(event.target))menu.open=false;},{capture:true});
    listen(menu,'keydown',event=>{if(event.key==='Escape'){menu.open=false;summary.focus();event.stopPropagation();}});
    listen(reset,'click',()=>{if(focused)return;cancel();onInteraction();saved={};maximized=null;persist();scroll.scrollTop=0;paint();status.textContent='Default layout restored.';});
    const observer=new ResizeObserver(()=>{if(gesture)cancel();schedule();});observer.observe(scroll);
    function register({id,title,element,visible,className=''}) {
      if(!validId(id)||entries.has(id))throw Error(`Duplicate or invalid panel: ${id}`);
      const win=make('section',`study-panel-window ${className}`),head=make('header','study-panel-titlebar'),body=make('div','study-panel-body');
      const label=make('span','study-panel-title',title);label.title=title;label.id=`study-panel-title-${view}-${id}-${++serial}`;win.setAttribute('aria-labelledby',label.id);win.dataset.studyPanel=id;
      const button=(text,label)=>{const b=make('button','',text);b.type='button';b.setAttribute('aria-label',label);b.title=label;return b;};
      const move=button('⠿',`Move ${title}`),resize=button('↘',`Resize ${title}`),max=button('□',`Maximize ${title}`),hide=button('−',`Hide ${title}`);
      move.title=`Drag ${title}, or press Enter and use arrow keys`;resize.title=`Resize ${title} with arrow keys; Enter saves, Escape cancels`;
      move.className='study-panel-move';head.append(move,label,resize,max,hide);win.append(head,body);if(element)body.append(element);canvas.append(win);
      const menuButton=button(title,`Show ${title}`);menuBody.append(menuButton);
      const item={window:win,body,title,move,resize,max,hide,menu:menuButton,draft:null};entries.set(id,item);
      if(visible!==undefined&&!saved[id])storeRect(id,{...defaults(id),hidden:!visible});
      listen(menuButton,'click',()=>show(id));
      listen(win,'pointerdown',()=>{if(!win.hidden)raise(id);},{capture:true});
      listen(head,'pointerdown',event=>{if(event.target.closest('button')&&event.target!==move)return;begin(id,'move',event,head);});
      listen(head,'lostpointercapture',()=>{if(gesture?.capture===head)cancel();});
      listen(move,'click',event=>{if(event.detail===0)begin(id,'move');});
      listen(resize,'click',()=>begin(id,'se'));
      listen(max,'click',()=>setMaximized(id,maximized!==id));
      listen(hide,'click',()=>{if(focused)return;cancel();if(maximized===id)maximized=null;storeRect(id,{...raw(id),hidden:true});persist();paint();summary.focus();});
      for(const edge of ['n','e','s','w','ne','se','sw','nw']){const handle=make('div',`study-panel-edge edge-${edge}`);handle.dataset.resize=edge;handle.setAttribute('aria-hidden','true');win.append(handle);listen(handle,'pointerdown',event=>begin(id,edge,event,handle));listen(handle,'lostpointercapture',()=>{if(gesture?.capture===handle)cancel();});}
      paint();return {element:win,body,dispose(){if(gesture?.id===id)cancel();if(maximized===id)maximized=null;if(focused===id){focused=null;focusReturn=null;}entries.delete(id);win.remove();menuButton.remove();schedule();}};
    }
    const api={register,show,maximize:setMaximized,focus,cancel,refresh:schedule,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},snapshot(){return {view,maximized,panels:Object.fromEntries([...entries.keys()].map(id=>[id,{...rect(id),visible:!entries.get(id).window.hidden}]))};},dispose(){if(disposed)return;cancel();disposed=true;abort.abort();observer.disconnect();cancelAnimationFrame(raf);listeners.clear();bar.remove();scroll.remove();host.classList.remove('study-panels-host');}};
    host.studyPanelLayout=api;paint();return api;
  }
  function mountReference(view) {
    if(window.studyPanelLayout)return window.studyPanelLayout;
    const workspace=document.querySelector('.study-workspace'),host=make('div','study-reference-panels');
    workspace.classList.add('study-free-panels');workspace.append(host);
    const layout=create({host,view,onInteraction(){window.dispatchEvent(new Event('study:moment-pause'));window.studyGuidedController?.pause();}});
    window.studyPanelLayout=layout;
    for(const [id,title,selector] of [['question','Question','.guided-panel'],['diagram','Diagram','.study-diagram'],['code','Reference Code','.study-code']]) {
      const element=workspace.querySelector(selector);if(element&&(id!=='question'||view==='learn'))layout.register({id,title,element});
    }
    if(view==='visualizer')for(const element of workspace.querySelectorAll('.study-inspector-panel')){
      const id=element.id.replace('inspector-',''),title=id[0].toUpperCase()+id.slice(1),oldButton=document.getElementById(`${element.id}-tab`);
      element.hidden=false;element.removeAttribute('role');element.removeAttribute('aria-labelledby');
      layout.register({id,title,element,className:id==='objects'?'study-inspector':''});
      const button=host.querySelector(`[aria-label="Show ${title}"]`);
      if(oldButton){button.id=oldButton.id;oldButton.remove();}
    }
    const oldInspector=[...workspace.children].find(el=>el.classList.contains('study-inspector'));
    // Guided renderers still write to their variables/trace anchors while those
    // projections are hidden to avoid revealing prediction answers.
    if(oldInspector){if(view==='learn')oldInspector.hidden=true;else oldInspector.remove();}
    workspace.querySelector('.study-diagram-splitter')?.remove();
    // Keep expanded controls compact when little vertical reading space remains.
    const controls=workspace.querySelector('.study-extra-controls'),compact=matchMedia('(max-height:600px),(max-width:700px)');
    const fitControls=()=>{if(controls)controls.open=!compact.matches;};fitControls();compact.addEventListener('change',fitControls);
    window.addEventListener('pagehide',()=>{compact.removeEventListener('change',fitControls);layout.dispose();delete window.studyPanelLayout;},{once:true});
    return layout;
  }
  globalThis.StudyPanelLayout={create,parse,mountReference};
})();
