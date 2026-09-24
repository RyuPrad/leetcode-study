/* Presentation of real operations. The controller commits each algorithm step once. */
(() => {
 const kinds={read:'Read',lookup:'Check',compare:'Compare',calculate:'Calculate',write:'Store',copy:'Copy',swap:'Swap',remove:'Remove',pointer:'Change reference',call:'Call',return:'Return',control:'Continue'};
 const plain=v=>v===undefined?'not set':v===null?'null':typeof v==='object'?('special'in v?v.special:'ref'in v?v.ref:JSON.stringify(v)):String(v);
 const make=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls||'';if(text!==undefined)e.textContent=text;return e;};
 function create({source,adapter,diagram,visual,onChange}){
  const rules=window.studyOperationRules.find(r=>r.id===`leetcode:${source.spec.number}`);
  if(!rules)throw Error('Missing operation rules for this lesson.');
  const params=new URLSearchParams(location.search),embedded=parent!==window,parentOrigin=params.get('parentOrigin')||'study://app';
  let mode=params.get('walkthrough')==='compact'?'compact':'detailed';
  if(!embedded)try{mode=localStorage.getItem('study.walkthroughMode')||mode;}catch{}
  let stage=0,operation=null,lastPrepared=null,committing=false,blocked=false,enabled=true,advance=()=>adapter.next(),playing=false,beforeVisual=null,preparedVisual=null,replay=null;
  const card=make('section','study-operation');card.setAttribute('aria-label','Current operation');
  const head=make('div','operation-head'),badge=make('strong','operation-kind'),position=make('span','operation-position'),select=make('select');select.setAttribute('aria-label','Walkthrough detail');
  for(const value of ['detailed','compact']){const o=make('option','',value==='detailed'?'Detailed walkthrough':'Compact walkthrough');o.value=value;select.append(o);}select.value=mode;
  head.append(badge,position,select);const caption=make('p','operation-caption');caption.setAttribute('aria-live','polite');
  const code=make('code','operation-expression'),controls=make('div','operation-controls');
  const previous=make('button','','Previous moment'),next=make('button','','Next moment');previous.type=next.type='button';controls.append(previous,next);card.append(head,caption,code,controls);
  const why=make('details','operation-why');why.append(make('summary','','Why this algorithm works'),make('p','',source.spec.why));card.append(why);
  diagram.querySelector('.study-view-tools').before(card);
  function describe(){
   const raw=source.read(),frame=adapter.snapshot();let line=frame.location.line;
   if(source.spec.mode==='precomputed'&&source.index()+1<source.count()){const future=source.readAt(source.index()+1);line=Number(future.line||(future.lines||future.hl||future.highlight||future.highlightLines||[])[0])||line;}
   if(source.spec.mode==='history'){const phase=raw.execState||frame.phase,normalized=String(phase).replace(/_/g,' '),mapped=rules.phases?.[phase]??rules.phases?.[normalized]??rules.phases?.[frame.phase];if(Number.isInteger(Number(mapped)))line=Number(mapped);}
   const rule=rules.lines[line]||rules.lines[Object.keys(rules.lines)[0]];
   const op={kind:rule.kind,location:{line,column:1,endLine:line,endColumn:1},focus:rule.focus+'.',action:rule.action+'.',result:'',code:rule.code,targets:[],links:[],index:source.index(),phase:raw.execState||frame.phase};
   const objects=new Map(frame.objects.map(o=>[o.id,o]));
   const valueText=value=>value&&typeof value==='object'&&'ref'in value?(()=>{const object=objects.get(value.ref);return object?.kind==='function'?null:object?`${object.kind} [${object.entries.slice(0,5).map(e=>`${e.key}: ${plain(e.value)}`).join(', ')}${object.entries.length>5?', …':''}]`:value.ref;})():plain(value);
   const inputs=frame.stack[0].variables.filter(v=>rule.inputs?.includes(v.name)).map(v=>{const text=valueText(v.value);return text===null?null:`${v.name} = ${text}`;}).filter(Boolean).slice(0,4);
   if(inputs.length)op.focus+=' '+inputs.join('; ')+'.';
   if(source.spec.number===1){
    const {i,num,need,target,nums}=raw;op.i=i;op.num=num;op.need=need;
    const definitions={
     INIT:['write',2,'Look at the map used to remember earlier numbers.','Create an empty map.'],
     LOOP_CHECK:['compare',4,`Look at array index ${i} and the array length ${nums.length}.`,'Check whether there is another number to visit.'],
     READ_CURRENT:['read',5,`Look at array index ${i}, containing ${nums[i]}.`,`Read ${nums[i]} into num. The array stays unchanged.`],
     COMPUTE_NEEDED:['calculate',6,`Look at target ${target} and current number ${num}.`,`Subtract ${num} from ${target} to find the partner we need.`],
     CHECK_MAP:['lookup',8,`Look for number ${need}.`,`Check whether ${need} is already stored in the map.`],
     SET_MAP:['write',12,`Look at number ${num} at array index ${i}.`,`Store number ${num} with original index ${i}.`],
     ADVANCE_LOOP:['control',4,`We have finished array index ${i}.`,'Move the index to the next array position.'],
     RETURN_PAIR:['return',9,'Look at the two original array indices.','Return the pair to the caller.'],
     END_FOUND:['return',9,'The matching pair is ready.','The walkthrough is complete.'],
     END_NONE:['return',14,'Every input number has been checked.','Finish without a matching pair.']
    };
    const d=definitions[raw.execState];if(d){[op.kind,op.location.line,op.focus,op.action]=d;op.code=rules.lines[op.location.line]?.code||op.code;}
    if(raw.execState==='CHECK_MAP')op.targets=['.map-box','.formula-piece.need'];
    if(['READ_CURRENT','SET_MAP'].includes(raw.execState))op.targets=[`[data-study-key="cell:${i}"]`];
   }
   return op;
  }
  function finish(op){
   const frame=adapter.snapshot(),raw=source.read();op={...op,links:[],targets:[...op.targets]};
   const changes=frame.changes.filter(c=>!['history','trace','steps','snapshots','masterTrace'].some(n=>c.name.startsWith(n)));
   op.result=changes.length?changes.slice(0,3).map(c=>`${c.name}: ${plain(c.before)} → ${plain(c.after)}`).join('; ')+'.':source.spec.mode==='precomputed'?frame.action:'This instruction finished. The displayed values are unchanged.';
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
   if(operation.committed&&stage<2&&!blocked&&beforeVisual){replay=beforeVisual.cloneNode(true);replay.removeAttribute('id');replay.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));replay.classList.add('operation-replay');replay.inert=true;visual.after(replay);visual.classList.add('operation-hidden');}
   clear();document.body.classList.add('walkthrough-enabled');select.value=mode;card.dataset.kind=operation.kind;card.dataset.moment=String(stage);visual.dataset.operationKind=operation.kind;
   badge.textContent=kinds[operation.kind]||'Step';position.textContent=blocked?'Prediction first':mode==='compact'?'Current operation':`${['Focus','Action','Result'][stage]} · ${stage+1}/3`;
   caption.textContent=blocked?'Answer the prediction to watch this operation.':operation[['focus','action','result'][stage]]||operation.focus;code.textContent=operation.code;
   previous.disabled=!enabled||playing||blocked||stage===0;next.disabled=!enabled||playing||blocked||document.getElementById('btn-next').disabled&&stage!==1;controls.hidden=mode==='compact';
   if(!blocked){for(const selector of operation.targets)visual.querySelectorAll(selector).forEach(e=>e.classList.add('operation-target'));(document.getElementById(`line-${operation.location.line}`)||document.getElementById(`l${operation.location.line}`))?.classList.add('operation-code');}
   // Two Sum previously calculated has() in its renderer before the check ran.
   if(source.spec.number===1){const raw=source.read(),check=visual.querySelectorAll('.formula-piece')[3];if(check){const known=raw.lastCheckHit;check.textContent=`seen.has(need) = ${known===null?'not checked':String(known)}`;}const label=visual.querySelector('.memory-label');if(label)label.textContent='Number → original index';if(raw.lastCheckHit===null)visual.querySelector('.map-box')?.classList.remove('hit','miss');}
   onChange?.();
   adapter.snapshot().operations=[{kind:operation.kind,location:operation.location,focus:operation.focus,action:operation.action,result:stage===2?operation.result:''}];
  }
  function refresh(){operation=describe();lastPrepared=operation;stage=mode==='compact'?2:0;beforeVisual=null;if(stage===2)operation={...operation,result:operation.focus};render();preparedVisual=visual.cloneNode(true);}
  function pause(){window.dispatchEvent(new CustomEvent('study:moment-pause'));}
  async function nextMoment(){if(!enabled||blocked)return false;if(mode==='compact'){await advance();return true;}if(stage===0){stage=1;render();return true;}if(stage===1){if(!operation.committed){const before=source.index();beforeVisual=preparedVisual;committing=true;try{await advance();}finally{committing=false;}if(source.index()===before)return false;operation={...finish(operation),committed:true};lastPrepared=describe();preparedVisual=visual.cloneNode(true);}stage=2;render();return true;}refresh();return true;}
  previous.onclick=()=>{pause();if(stage>0){stage--;render();}};
  next.onclick=()=>{pause();void nextMoment();};
  function setMode(value,notify=false){if(!['compact','detailed'].includes(value))return;pause();mode=value;refresh();if(notify){if(embedded)parent.postMessage({type:'study:walkthrough-mode',mode},parentOrigin);else try{localStorage.setItem('study.walkthroughMode',mode);}catch{}}}
  select.onchange=()=>setMode(select.value,true);
  adapter.subscribe(()=>{if(committing)return;const prior=lastPrepared;if(prior&&source.index()===prior.index+1){beforeVisual=preparedVisual;operation={...finish(prior),committed:true};stage=2;lastPrepared=describe();render();preparedVisual=visual.cloneNode(true);}else refresh();});
  const api={get mode(){return mode;},get operation(){return operation;},get stage(){return stage;},get links(){return stage===2&&!blocked?operation.links:[];},next:nextMoment,refresh,setMode,restoreLiveView(){replay?.remove();replay=null;visual.classList.remove('operation-hidden');},setGate({canAdvance,active=true,isPlaying=false,nextStep}){blocked=!canAdvance;enabled=active;playing=isPlaying;if(nextStep)advance=nextStep;render();},cancel(){pause();refresh();}};
  window.addEventListener('message',event=>{if(embedded&&event.source===parent&&event.origin===parentOrigin&&event.data?.type==='study:walkthrough-mode')setMode(event.data.mode);});
  refresh();if(embedded)parent.postMessage({type:'study:walkthrough-ready'},parentOrigin);return api;
 }
 window.StudyOperations={create};
})();
