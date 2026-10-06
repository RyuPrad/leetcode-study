import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ObjectFocus, ObjectFrame, ObjectNode, ObjectVariable } from '../../shared/object-view';
import '../../visualizer-ui/object-view.js';
import '../../visualizer-ui/object-view.css';

interface FocusedObject extends ObjectFocus { name:string; frameName:string; scope:string; }
interface ScrollPosition { element:HTMLElement; top:number; left:number; }

export default function ObjectView({frame,previousFrame,selectedFrameId,onSelectFrame,onFocusChange,active=true,textSize=16,onTextSizeChange}:{frame:ObjectFrame;previousFrame?:ObjectFrame;selectedFrameId?:number;onSelectFrame?:(id:number)=>void;onFocusChange?:(focus:ObjectFocus|null)=>void;active?:boolean;textSize?:number;onTextSizeChange?:(size:number)=>void}) {
  const [collapsed,setCollapsed]=useState(new Set<string>()),[expanded,setExpanded]=useState(new Set<string>()),[target,setTarget]=useState<string|null>(null);
  const [focused,setFocused]=useState<FocusedObject|null>(null);
  const container=useRef<HTMLDivElement>(null);
  const back=useRef<HTMLButtonElement>(null),focusCallback=useRef(onFocusChange);
  const returnPosition=useRef<{opener:HTMLElement;rootKey:string;ancestors:ScrollPosition[];bodies:Map<string,{top:number;left:number}>;restoreFocus?:boolean}|null>(null);
  const restoring=useRef(false),entering=useRef(false);
  focusCallback.current=onFocusChange;
  const model=StudyObjectView.format(frame,{collapsed,expanded,previousFrame});
  const focusedCall=model.frames.find(call=>call.id===focused?.frameId);
  const focusedScope=focusedCall?.scopes.find(scope=>scope.variables.some(variable=>variable.id===focused?.variableId));
  const focusedVariable=focusedScope?.variables.find(variable=>variable.id===focused?.variableId);
  function closeFocus(restoreFocus=true) {
    if(!focused)return;
    if(returnPosition.current)returnPosition.current.restoreFocus=restoreFocus;
    restoring.current=true;setFocused(null);focusCallback.current?.(null);
  }
  useEffect(()=>()=>focusCallback.current?.(null),[]);
  useEffect(()=>{if(!active&&focused)closeFocus(false);},[active,focused]);
  useEffect(()=>{
    if(!focused||!active)return;
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeFocus();}};
    window.addEventListener('keydown',escape,true);return()=>window.removeEventListener('keydown',escape,true);
  },[focused,active]);
  useLayoutEffect(()=>{
    const host=container.current,pane=host?.closest<HTMLElement>('.study-panel-body,.debug-visual-pane');if(focused||!active||!host||!pane)return;
    const frameHost=host.closest<HTMLElement>('.viz-frame'),tabs=frameHost?.querySelector<HTMLElement>('.study-object-view-tabs'),toolbar=host.querySelector<HTMLElement>('.study-object-toolbar');
    const vertical=(element:Element,properties:string[])=>{const style=getComputedStyle(element);return properties.reduce((total,property)=>total+(parseFloat(style.getPropertyValue(property))||0),0);};
    const outerHeight=(element:HTMLElement|null|undefined)=>element?element.getBoundingClientRect().height+vertical(element,['margin-top','margin-bottom']):0;
    const measure=()=>{
      if(tabs)frameHost?.style.setProperty('--study-object-tabs-height',`${Math.ceil(tabs.getBoundingClientRect().height)}px`);
      const available=pane.clientHeight-vertical(pane,['padding-top','padding-bottom'])-outerHeight(tabs)-outerHeight(toolbar);
      for(const card of host.querySelectorAll<HTMLElement>('.study-object-card')){
        const frame=card.closest('.study-object-frame'),header=card.querySelector<HTMLElement>('.study-object-card-header');
        const padding=vertical(card,['padding-top','padding-bottom','border-top-width','border-bottom-width'])+(frame?vertical(frame,['padding-top','padding-bottom','border-top-width','border-bottom-width']):0);
        card.style.setProperty('--study-object-normal-body-height',`${Math.max(0,Math.floor(available-outerHeight(header)-padding))}px`);
      }
    };
    // Establish the normal reading viewport before restoring its saved scroll offset.
    measure();const observer=new ResizeObserver(measure);observer.observe(pane);if(tabs)observer.observe(tabs);if(toolbar)observer.observe(toolbar);
    for(const header of host.querySelectorAll('.study-object-card-header'))observer.observe(header);
    window.addEventListener('resize',measure);return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
  },[focused,active,frame,textSize]);
  useLayoutEffect(()=>{
    if(focused||!restoring.current||!container.current)return;
    restoring.current=false;const saved=returnPosition.current;returnPosition.current=null;if(!saved)return;
    const host=container.current;
    let task=0,frames=0,stable=0,lastLayout='',disposed=false;
    const restore=()=>{
      task=0;if(disposed||host.dataset.objectFocused==='true')return;
      const bodies=[...host.querySelectorAll<HTMLElement>('.study-object-body')];
      const layout=bodies.map(body=>`${body.clientWidth}:${body.clientHeight}`).join('|');
      stable=layout===lastLayout?stable+1:0;lastLayout=layout;let represented=true;
      for(const body of bodies){
        const position=saved.bodies.get(body.closest<HTMLElement>('[data-object-root-key]')!.dataset.objectRootKey!);
        if(position){body.scrollTop=position.top;body.scrollLeft=position.left;if(Math.abs(body.scrollTop-position.top)>1||Math.abs(body.scrollLeft-position.left)>1)represented=false;}
      }
      for(const position of saved.ancestors){position.element.scrollTop=position.top;position.element.scrollLeft=position.left;}
      if(stable>=2&&represented){observer.disconnect();return;}
      if(++frames<12)task=requestAnimationFrame(restore);
    };
    const observer=new ResizeObserver(()=>{frames=0;if(!task&&!disposed)task=requestAnimationFrame(restore);});
    for(const body of host.querySelectorAll('.study-object-body'))observer.observe(body);
    restore();
    if(saved.restoreFocus!==false){
      const card=[...container.current.querySelectorAll<HTMLElement>('[data-object-root-key]')].find(element=>element.dataset.objectRootKey===saved.rootKey);
      const opener=saved.opener.isConnected?saved.opener:card?.querySelector<HTMLElement>('.study-object-expand')||container.current.querySelector<HTMLElement>('.study-object-font-controls button');
      opener?.focus({preventScroll:true});
    }
    const stop=()=>{disposed=true;observer.disconnect();cancelAnimationFrame(task);};
    host.addEventListener('wheel',stop,{once:true,passive:true});
    return()=>{stop();host.removeEventListener('wheel',stop);};
  },[focused]);
  useLayoutEffect(()=>{
    if(!focused||!container.current)return;
    const host=container.current,pane=host.closest<HTMLElement>('.study-panel-body,.debug-visual-pane');
    const measure=()=>{
      const body=host.querySelector<HTMLElement>('.study-object-body')||host.querySelector<HTMLElement>('.study-object-out-of-scope');
      if(!body)return;
      const paneStyle=pane?getComputedStyle(pane):null,card=body.closest('.study-object-card'),cardStyle=card?getComputedStyle(card):null;
      const bottom=pane?pane.getBoundingClientRect().bottom-parseFloat(paneStyle!.paddingBottom)-parseFloat(paneStyle!.borderBottomWidth):innerHeight;
      const inset=cardStyle?parseFloat(cardStyle.paddingBottom)+parseFloat(cardStyle.borderBottomWidth):0;
      const height=Math.max(0,Math.floor(Math.min(innerHeight,bottom)-body.getBoundingClientRect().top-inset));
      host.style.setProperty('--study-object-focus-height',`${height}px`);
    };
    if(entering.current){
      entering.current=false;if(pane)pane.scrollTop=0;host.scrollTop=0;
      measure();const body=host.querySelector<HTMLElement>('.study-object-body'),position=returnPosition.current?.bodies.get(`${focused.frameId}:${focused.variableId}`);
      if(body&&position){body.scrollTop=position.top;body.scrollLeft=position.left;}
    }else measure();
    const observer=new ResizeObserver(measure);if(pane)observer.observe(pane);
    for(const element of host.querySelectorAll('.study-object-toolbar,.study-object-focus-context,.study-object-card-header'))observer.observe(element);
    window.addEventListener('resize',measure);return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
  },[focused,frame,textSize]);
  useEffect(()=>{
    if(!target)return;
    [...container.current?.querySelectorAll<HTMLElement>('[data-object-path]')||[]].find(element=>element.dataset.objectPath===target)?.scrollIntoView({block:'nearest',inline:'nearest'});
    setTarget(null);
  },[target,expanded]);
  function toggle(node:ObjectNode) {
    setCollapsed(values=>{const next=new Set(values);if(node.collapsed)next.delete(node.path);else next.add(node.path);return next;});
    if(node.collapsed)setExpanded(values=>new Set([...values,node.path]));
  }
  function reveal(path:string) {
    const parts=path.split('/'),ancestors=parts.map((_,index)=>parts.slice(0,index+1).join('/'));
    setCollapsed(values=>new Set([...values].filter(value=>!ancestors.includes(value))));
    setExpanded(values=>new Set([...values,...ancestors]));setTarget(path);
  }
  function focusRoot(call:{id:number;name:string},scope:string,variable:ObjectVariable,opener:HTMLElement) {
    const ancestors:ScrollPosition[]=[],bodies=new Map<string,{top:number;left:number}>();
    for(let element:HTMLElement|null=container.current;element;element=element.parentElement)ancestors.push({element,top:element.scrollTop,left:element.scrollLeft});
    if(document.scrollingElement&&!ancestors.some(position=>position.element===document.scrollingElement))ancestors.push({element:document.scrollingElement as HTMLElement,top:document.scrollingElement.scrollTop,left:document.scrollingElement.scrollLeft});
    for(const body of container.current!.querySelectorAll<HTMLElement>('.study-object-body'))bodies.set(body.closest<HTMLElement>('[data-object-root-key]')!.dataset.objectRootKey!,{top:body.scrollTop,left:body.scrollLeft});
    returnPosition.current={opener,rootKey:`${call.id}:${variable.id}`,ancestors,bodies};
    const next={frameId:call.id,variableId:variable.id,name:variable.name,frameName:call.name,scope};entering.current=true;setFocused(next);onSelectFrame?.(call.id);focusCallback.current?.({frameId:call.id,variableId:variable.id});
    requestAnimationFrame(()=>back.current?.focus({preventScroll:true}));
  }
  function draw(node:ObjectNode):React.ReactNode {
    if(node.kind==='scalar')return <span className={`study-object-scalar ${node.token}`} title={node.objectId}>{node.text}</span>;
    if(node.kind==='reference')return <button className="study-object-reference" title={node.objectId} aria-label={`Inspect ${node.text}: ${node.objectId}`} onClick={()=>reveal(node.target!)}>{node.text}</button>;
    const open=node.type==='array'?'[':node.type==='map'?'Map {':node.type==='set'?'Set {':'{',close=node.type==='array'?']':'}';
    return <span className="study-object-value" data-object-path={node.path} data-object-id={node.objectId}>
      <button className="study-object-toggle" aria-expanded={!node.collapsed} aria-label={`${node.collapsed?'Expand':'Collapse'} ${node.objectId}`} title={`${node.label} · ${node.objectId}${node.size===undefined?'':` · ${node.size} items`}`} onClick={()=>toggle(node)}>{node.collapsed?'▸':'▾'} {open}</button>{node.aliases!.map(alias=><span key={alias.name}> <span className="study-object-alias" data-alias={alias.name} style={{'--study-object-accent':alias.color} as React.CSSProperties} title={`${alias.name} references ${node.objectId}`}>← {alias.name}</span></span>)}
      {node.collapsed?<span className="study-object-omitted"> … </span>:<span className="study-object-entries">
        {node.entries!.map((entry,index)=><span key={`${entry.key}:${index}`} className={`study-object-entry${entry.changed?' changed':entry.read?' read':''}`} data-object-id={node.objectId} data-entry={entry.key}>
          {`\n${'  '.repeat(node.depth!+1)}`}{node.type==='array'?<span className="study-object-index">{`/* [${entry.key}] */ `}</span>:node.type==='set'?null:<>{entry.keyValue?draw(entry.keyValue):<span className="study-object-key">{/^[A-Za-z_$][\w$]*$/.test(entry.key)||/^\d+$/.test(entry.key)?entry.key:JSON.stringify(entry.key)}</span>}{node.type==='map'?' => ':': '}</>}{draw(entry.value)},
        </span>)}
        {!!node.remaining&&<button className="study-object-more" onClick={()=>setExpanded(values=>new Set([...values,node.path]))}>{`\n${'  '.repeat(node.depth!+1)}Show ${node.remaining} more entries`}</button>}
        {node.truncated&&<span className="study-object-omitted">{`\n${'  '.repeat(node.depth!+1)}… additional entries omitted from snapshot`}</span>}
      </span>}
      <span className="study-object-close">{`${node.collapsed?'':`\n${'  '.repeat(node.depth!)}`}${close}`}</span>
    </span>;
  }
  function card(call:{id:number;name:string},scope:string,variable:ObjectVariable) {
    return <section key={`${call.id}:${variable.id}`} className={`study-object-root study-object-card${variable.changed?' changed':''}`} style={{'--study-object-accent':variable.color} as React.CSSProperties} data-frame-id={call.id} data-variable-id={variable.id} data-object-root-key={`${call.id}:${variable.id}`}>
      <div className="study-object-card-header"><div className="study-object-variable">{variable.name} =</div>{!focused&&<button className="study-object-expand" aria-label={`Expand ${variable.name}`} onClick={event=>focusRoot(call,scope,variable,event.currentTarget)}>Expand</button>}</div>
      <div className="study-object-body" role="region" aria-label={`${variable.name} value`} tabIndex={0} onKeyDown={event=>{if(['ArrowLeft','ArrowRight'].includes(event.key))event.stopPropagation();}}>{draw(variable.value)}</div>
    </section>;
  }
  return <div ref={container} className="study-object-view" data-object-view-mode="code" data-object-view-index={frame.index} data-object-focused={!!focused} style={{'--study-object-font-size':`${textSize}px`} as React.CSSProperties}>
    <div className="study-object-toolbar">{focused&&<button className="study-object-back" ref={back} onClick={()=>closeFocus()}>Back to objects</button>}<div className="study-object-font-controls"><button aria-label="Decrease Object View text size" disabled={textSize<=14} onClick={()=>onTextSizeChange?.(Math.max(14,textSize-2))}>A−</button><output className="study-object-font-size" aria-label="Object View text size">{textSize}px</output><button aria-label="Increase Object View text size" disabled={textSize>=24} onClick={()=>onTextSizeChange?.(Math.min(24,textSize+2))}>A+</button></div></div>
    {focused?<><div className="study-object-focus-context">{focusedCall?.name||focused.frameName} · call {focused.frameId}{focusedCall?` · line ${focusedCall.location.line}`:''} · {focusedScope?.name||focused.scope}</div>{focusedVariable&&focusedCall?card(focusedCall,focusedScope!.name,focusedVariable):<div className="study-object-out-of-scope" role="status">{focused.name} is not in scope at this checkpoint.</div>}</>:model.frames.map(call=><section key={call.id} className={`study-object-frame${selectedFrameId===call.id?' selected':''}`} data-frame-id={call.id} data-stack-frame={call.id}>
      <h3><button onClick={()=>onSelectFrame?.(call.id)}>{call.name} · call {call.id} · line {call.location.line}</button></h3>
      {call.scopes.map(scope=><section className="study-object-scope" key={scope.name}><h4>{scope.name}</h4><div className="study-object-card-grid">{scope.variables.map(variable=>card(call,scope.name,variable))}</div></section>)}
    </section>)}
    {!focused&&model.truncated&&<p className="study-object-omitted">Some values were omitted from this snapshot.</p>}
  </div>;
}
