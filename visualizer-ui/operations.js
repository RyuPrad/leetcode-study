/* Presentation of real operations. The controller commits each algorithm step once. */
(() => {
 const kinds={read:'Read',lookup:'Check',compare:'Compare',calculate:'Calculate',write:'Store',copy:'Copy',swap:'Swap',remove:'Remove',pointer:'Change reference',call:'Call',return:'Return',control:'Continue'};
 const plain=v=>v===undefined?'not set':v===null?'null':typeof v==='object'?('special'in v?v.special:'ref'in v?v.ref:JSON.stringify(v)):String(v);
 const make=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls||'';if(text!==undefined)e.textContent=text;return e;};
 function create({source,adapter,diagram,visual,onChange,getPendingInstruction,getCurrentTransition,getBeforeView}){
  const rules=window.studyOperationRules.find(r=>r.id===`leetcode:${source.spec.number}`);
  if(!rules)throw Error('Missing operation rules for this lesson.');
  const params=new URLSearchParams(location.search),embedded=parent!==window,parentOrigin=params.get('parentOrigin')||'study://app';
  let mode=params.get('walkthrough')==='compact'?'compact':'detailed';
  if(!embedded)try{mode=localStorage.getItem('study.walkthroughMode')||mode;}catch{}
  let stage=0,operation=null,committing=false,blocked=false,enabled=true,advance=()=>adapter.next(),playing=false,beforeVisual=null,replay=null;
  const card=make('section','study-operation');card.setAttribute('aria-label','Current operation');
  const head=make('div','operation-head'),badge=make('strong','operation-kind'),position=make('span','operation-position'),select=make('select');select.setAttribute('aria-label','Walkthrough detail');
  for(const value of ['detailed','compact']){const o=make('option','',value==='detailed'?'Detailed walkthrough':'Compact walkthrough');o.value=value;select.append(o);}select.value=mode;
  head.append(badge,position,select);const caption=make('p','operation-caption');caption.setAttribute('aria-live','polite');
  const code=make('code','operation-expression'),controls=make('div','operation-controls');
  const previous=make('button','','Previous moment'),next=make('button','','Next moment');previous.type=next.type='button';controls.append(previous,next);card.append(head,caption,code,controls);
  const why=make('details','operation-why');why.append(make('summary','','Why this algorithm works'),make('p','',source.spec.why));card.append(why);
  diagram.querySelector('.study-view-tools').before(card);
  function describe(transition=null){
   const frame=adapter.snapshot(),instruction=transition?.instruction||getPendingInstruction?.()||getCurrentTransition?.()?.instruction||{line:frame.location.line,phase:frame.phase};
   const raw={...source.read(),...(transition?.context||{}),execState:instruction.phase},line=instruction.line,locations=[line];
   const rule=rules.lines[line]||rules.lines[Object.keys(rules.lines)[0]];
   const op={kind:rule.kind,location:{line,column:1,endLine:line,endColumn:1},locations,focus:rule.focus+'.',action:rule.action+'.',result:'',code:rule.code,targets:[],links:[],index:transition?.fromIndex??source.index(),phase:instruction.phase};
   const objects=new Map(frame.objects.map(o=>[o.id,o]));
   const valueText=value=>value&&typeof value==='object'&&'ref'in value?(()=>{const object=objects.get(value.ref);return object?.kind==='function'?null:object?`${object.kind} [${object.entries.slice(0,5).map(e=>`${e.key}: ${plain(e.value)}`).join(', ')}${object.entries.length>5?', …':''}]`:value.ref;})():plain(value);
   const inputs=transition?Object.entries(transition.beforeInputs).filter(([name])=>rule.inputs?.includes(name)).map(([name,text])=>`${name} = ${text}`).slice(0,4):frame.stack[0].variables.filter(v=>rule.inputs?.includes(v.name)).map(v=>{const text=valueText(v.value);return text===null?null:`${v.name} = ${text}`;}).filter(Boolean).slice(0,4);
   if(inputs.length)op.focus+=' '+inputs.join('; ')+'.';
   if(source.spec.number===26&&raw.execState==='ADVANCE_LEFT'){op.focus=`Look at left = ${raw.left} and the next destination index.`;op.action='Advance left by one. The array values stay unchanged.';}
   if(source.spec.number===26&&raw.execState==='WRITE'){op.focus=`Look at source index ${raw.right} and destination index ${raw.left}.`;op.action=`Copy the value at index ${raw.right} into index ${raw.left}.`;}
   if(source.spec.number===1){
    const {i,num,need,target,nums}=raw,n=raw.numsLength??nums.length,current=raw.currentNum??nums[i];op.i=i;op.num=num;op.need=need;
    const definitions={
     INIT:['write',2,'Look at the map used to remember earlier numbers.','Create an empty map.'],
     LOOP_CHECK:['compare',4,`Look at array index ${i} and the array length ${n}.`,'Check whether there is another number to visit.'],
     READ_CURRENT:['read',5,`Look at array index ${i}, containing ${current}.`,`Read ${current} into num. The array stays unchanged.`],
     COMPUTE_NEEDED:['calculate',6,`Look at target ${target} and current number ${num}.`,`Subtract ${num} from ${target} to find the partner we need.`],
     CHECK_MAP:['lookup',8,`Look for number ${need}.`,`Check whether ${need} is already stored in the map.`],
     SET_MAP:['write',12,`Look at number ${num} at array index ${i}.`,`Store number ${num} with original index ${i}.`],
     ADVANCE_LOOP:['control',4,`We have finished array index ${i}.`,'Move the index to the next array position.'],
     RETURN_PAIR:['return',9,'Look at the two original array indices.','Return the pair to the caller.'],
     END_FOUND:['return',9,'The matching pair is ready.','The walkthrough is complete.'],
     END_NONE:['return',14,'Every input number has been checked.','Finish without a matching pair.']
    };
    const d=definitions[raw.execState];if(d){op.kind=d[0];op.focus=d[2];op.action=d[3];}
    if(raw.execState==='CHECK_MAP')op.targets=['.map-box','.formula-piece.need'];
    if(['READ_CURRENT','SET_MAP'].includes(raw.execState))op.targets=[`[data-study-key="cell:${i}"]`];
   }
   return op;
  }
  function finish(op,transition=getCurrentTransition?.()){
   const frame=adapter.snapshot(),raw=source.read();op={...op,links:[],targets:[...op.targets]};
   const changes=(transition?.changes||frame.changes).filter(c=>!['history','trace','steps','snapshots','masterTrace'].some(n=>c.name.startsWith(n)));
   const target=op.code.match(/(?:^|[;{}]\s*)(?:(?:const|let|var)\s+)?([\w$]+)(?:\[[^\]]+\]|\.[\w$]+)*\s*(?:=(?!=)|\+\+|--|\+=|-=)/)?.[1];
   const presentation=/^(?:active\w*|just\w*|highlight\w*|changed|improvedNodes|targetV|edgeIdx|queryIdx|findPath|status|lastCompareEqual|relaxed|result)(?:[.\[]|$)/;
   const ordered=changes.map((change,index)=>({change,index,priority:target&&change.name.split(/[.\[]/)[0]===target?0:presentation.test(change.name)?2:1})).sort((a,b)=>a.priority-b.priority||a.index-b.index).map(item=>item.change);
   const text=value=>{const element=document.createElement('span');element.innerHTML=value||'';return element.textContent.trim();};
   const returned=op.kind==='return'&&document.getElementById('btn-next').disabled?['ans','answer','finalAnswer','res','results','result'].map(name=>raw[name]).find(value=>value!==undefined&&value!==null&&!['pending','found','notfound','tru','fls','done','running'].includes(value)):undefined;
   op.result=transition?.resultCaption||(returned!==undefined?`Return ${plain(returned)}.`:ordered.length?ordered.slice(0,3).map(c=>`${c.name}: ${plain(c.before)} → ${plain(c.after)}`).join('; ')+'.':source.spec.mode==='precomputed'?text(transition?.action||frame.action):'This instruction finished. The displayed values are unchanged.');
   if(source.spec.number===26&&op.phase==='ADVANCE_LEFT')op.result=`left is now ${raw.left}. The array values stay unchanged.`;
   if(source.spec.number===26&&op.phase==='WRITE')op.result=`Copied ${raw.nums[raw.right]} from index ${raw.right} into index ${raw.left}. left stays at ${raw.left}.`;
   if(source.spec.number===1){
    if(op.phase==='CHECK_MAP')op.result=raw.lastCheckHit?`Found number ${op.need} at original index ${raw.hitIndex}. The map stays unchanged.`:`Not found: ${op.need} is absent. The map stays unchanged.`;
    if(op.phase==='SET_MAP'){op.result=`Stored number ${op.num} with original index ${op.i}.`;op.targets=['.map-pill.just-added'];op.links=[{from:`[data-study-key="cell:${op.i}"]`,to:'.map-pill.just-added',label:`Store ${op.num}; index ${op.i}`}];}
    if(op.phase==='READ_CURRENT')op.result=`num is now ${raw.num}. The array stays unchanged.`;
    if(op.phase==='COMPUTE_NEEDED')op.result=`${raw.target} − ${raw.num} = ${raw.need}. Look for number ${raw.need} next.`;
    if(op.phase==='ADVANCE_LOOP')op.result=`The index is now ${raw.i}.`;
    if(op.phase==='LOOP_CHECK')op.result=raw.i<raw.nums.length?'Another number is available.':'There are no more array positions.';
   }
   return op;
  }
  function clear(){visual.querySelectorAll('.operation-target').forEach(e=>e.classList.remove('operation-target'));document.querySelectorAll('.operation-code').forEach(e=>e.classList.remove('operation-code'));}
  function render(){
   replay?.remove();replay=null;visual.classList.remove('operation-hidden');
   if(operation.committed&&stage<2&&!blocked){beforeVisual ||=getBeforeView?.();if(beforeVisual){replay=beforeVisual.cloneNode(true);replay.removeAttribute('id');replay.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));replay.classList.add('operation-replay');replay.classList.remove('operation-hidden');replay.inert=true;visual.after(replay);visual.classList.add('operation-hidden');}}
   clear();document.body.classList.add('walkthrough-enabled');select.value=mode;card.dataset.kind=operation.kind;card.dataset.moment=String(stage);visual.dataset.operationKind=operation.kind;
   badge.textContent=kinds[operation.kind]||'Step';position.textContent=blocked?'Prediction first':mode==='compact'?'Current operation':`${['Focus','Action','Result'][stage]} · ${stage+1}/3`;
   caption.textContent=blocked?'Answer the prediction to watch this operation.':operation[['focus','action','result'][stage]]||operation.focus;code.textContent=operation.code;
   previous.disabled=!enabled||playing||blocked||stage===0;next.disabled=!enabled||playing||blocked||document.getElementById('btn-next').disabled&&!(operation.committed&&stage<2);controls.hidden=mode==='compact';
   if(!blocked){for(const selector of operation.targets)visual.querySelectorAll(selector).forEach(e=>e.classList.add('operation-target'));for(const line of operation.locations||[operation.location.line])(document.getElementById(`line-${line}`)||document.getElementById(`l${line}`))?.classList.add('operation-code');}
   // Two Sum previously calculated has() in its renderer before the check ran.
   if(source.spec.number===1){const raw=source.read(),check=visual.querySelectorAll('.formula-piece')[3];if(check){const known=raw.lastCheckHit;check.textContent=`seen.has(need) = ${known===null?'not checked':String(known)}`;}const label=visual.querySelector('.memory-label');if(label)label.textContent='Number → original index';if(raw.lastCheckHit===null)visual.querySelector('.map-box')?.classList.remove('hit','miss');}
   onChange?.();
   adapter.snapshot().operations=[{kind:operation.kind,location:operation.location,locations:operation.locations||[operation.location.line],focus:operation.focus,action:operation.action,result:stage===2?operation.result:''}];
  }
  function refresh(){operation=describe();stage=mode==='compact'?2:0;beforeVisual=null;if(stage===2)operation={...operation,result:operation.focus};render();}
  function restore(){const transition=getCurrentTransition?.();if(!transition){refresh();return;}operation={...finish(describe(transition),transition),committed:true};stage=2;beforeVisual=null;render();}
  function pause(){window.dispatchEvent(new CustomEvent('study:moment-pause'));}
  async function nextMoment(){if(!enabled||blocked)return false;if(mode==='compact'){const before=source.index();await advance();return source.index()!==before;}if(stage===0){stage=1;render();return true;}if(stage===1){if(!operation.committed){const before=source.index();committing=true;try{await advance();}finally{committing=false;}if(source.index()===before)return false;const transition=getCurrentTransition?.();operation={...finish(transition?describe(transition):operation,transition),committed:true};beforeVisual=getBeforeView?.();}stage=2;render();return true;}refresh();return true;}
  previous.onclick=()=>{pause();if(stage>0){stage--;render();}};
  next.onclick=()=>{pause();void nextMoment();};
  function setMode(value,notify=false){if(!['compact','detailed'].includes(value))return;pause();mode=value;if(!operation.committed&&stage===2)stage=0;render();if(notify){if(embedded)parent.postMessage({type:'study:walkthrough-mode',mode},parentOrigin);else try{localStorage.setItem('study.walkthroughMode',mode);}catch{}}}
  select.onchange=()=>setMode(select.value,true);
  adapter.subscribe(()=>{if(!committing)restore();});
  const api={get mode(){return mode;},get operation(){return operation;},get stage(){return stage;},get links(){return stage===2&&!blocked?operation.links:[];},next:nextMoment,refresh,setMode,restoreLiveView(){replay?.remove();replay=null;visual.classList.remove('operation-hidden');},setGate({canAdvance,active=true,isPlaying=false,nextStep}){blocked=!canAdvance;enabled=active;playing=isPlaying;if(nextStep)advance=nextStep;render();},cancel(){pause();refresh();}};
  window.addEventListener('message',event=>{if(embedded&&event.source===parent&&event.origin===parentOrigin&&event.data?.type==='study:walkthrough-mode')setMode(event.data.mode);});
  restore();if(embedded)parent.postMessage({type:'study:walkthrough-ready'},parentOrigin);return api;
 }
 window.StudyOperations={create};
})();
