/* Dependency-free Path Sum III integration. Executes the real lesson and complete
 * learning/operations/Object View/Guided core scripts using the shared structural
 * DOM model. Browser painting, native playback and QuickJS remain separate gates. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {test}=require('node:test');
const {stripTypeScriptTypes}=require('node:module');
const {fixture:dom,trace,plain,snapshot,baseline}=require('./helpers/search-range-dom.cjs');
const sourceAt=process.argv.indexOf('--source'),root=sourceAt<0?path.resolve(__dirname,'..'):path.resolve(process.argv[sourceAt+1]);
const file='Trees/path_sum_iii_visualizer.html',fixture=()=>dom(root,{file});
const json=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const definition=json('coding/problems.json').find(item=>item.number===437);
const finish=h=>{let steps=0;while(h.source.pendingInstruction()){assert.ok(steps++<2000);h.exec('nextStep()');}return h.current();};
function oracle(values,target){
  if(!values.length||values[0]===null)return 0;
  const root={val:BigInt(values[0])},queue=[root];let cursor=1,result=0;
  for(let i=0;i<queue.length&&cursor<values.length;i++)for(const side of ['left','right']){const value=values[cursor++];if(value!==null&&value!==undefined){queue[i][side]={val:BigInt(value)};queue.push(queue[i][side]);}}
  for(const start of queue){const work=[[start,0n]];while(work.length){const [node,old]=work.pop(),sum=old+node.val;if(sum===BigInt(target))result++;if(node.left)work.push([node.left,sum]);if(node.right)work.push([node.right,sum]);}}
  return result;
}
const cases=[...definition.examples,...definition.tests];
function validation(){
  const src=stripTypeScriptTypes(fs.readFileSync(path.join(root,'coding/validation.ts'),'utf8'),{mode:'strip'}).replace(/^import[^;]+;\s*/gm,'').replace(/\bexport /g,'');
  const constants=stripTypeScriptTypes(fs.readFileSync(path.join(root,'shared/coding.ts'),'utf8'),{mode:'strip'}).replace(/\bexport /g,'');
  return vm.runInNewContext(constants+'\n'+src+'\nvalidateInput');
}

test('437: catalog, maintained coding cases, original reference and techniques have complete coverage',async()=>{
  const {collectCatalog}=await import('../scripts/content.mjs');const catalog=collectCatalog(root),entry=catalog.entries.find(item=>item.number===437);
  assert.equal(entry.id,'leetcode:437');assert.equal(entry.visualizerPath,file);assert.equal(entry.topic,'Trees');
  assert.deepEqual(entry.solutionTechniques.map(item=>item.name),['Depth-first search','Prefix sums','Backtracking','Frequency Map']);
  assert.equal(catalog.entries.filter(item=>item.number).length,254);assert.equal(catalog.visualizers.length,254);
  const {extraCase}=await import('../coding/cases.mjs'),{statements}=await import('../coding/statements.mjs');
  assert.equal(definition.description,statements[437]);assert.equal(definition.tests.length,12);
  definition.tests.forEach((item,index)=>assert.deepEqual(item.input,extraCase(437,index+1)));
  const h=fixture();const source=[...h.html.matchAll(/<div id="line-\d+" class="code-line">([\s\S]*?)<\/div>/g)].map(match=>match[1].replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&').replaceAll('&#x27;',"'")).join('\n');
  assert.equal(source,definition.reference);
});

test('437: all visible and additional cases match an independent BigInt start-at-every-node oracle',()=>{
  const h=fixture();
  for(const item of cases){const [tree,target]=item.input;assert.equal(h.load(JSON.stringify(tree),target),true,item.name);const final=finish(h);assert.equal(final.ans,oracle(tree,target),item.name);assert.deepEqual(final.freq,[[0,1]]);assert.equal(final.nodeActive,false);assert.deepEqual(final.pathIds,[]);}
});

test('437: exactly one source instruction changes frequencies/count and parent locals restore on return',()=>{
  const h=fixture();h.exec('loadExample(2)');let index=0;
  while(h.source.pendingInstruction()){
    const before=h.current(),instruction=plain(h.source.pendingInstruction()),calls=h.json('calls');h.exec('nextStep()');const after=h.current(),transition=plain(h.adapter.currentTransition());
    assert.equal(h.source.index(),++index);assert.equal(transition.instruction.line,instruction.line);
    const state=before.execState;
    if(!['INIT_COUNT','COUNT'].includes(state))assert.equal(after.count,before.count,state+': count unchanged');
    if(!['INIT_FREQ','SEED','INSERT','DECREMENT','DELETE'].includes(state))assert.deepEqual(after.freq,before.freq,state+': frequencies unchanged');
    if(state==='COUNT')assert.equal(after.count,before.count+before.matches);
    if(state==='LOOKUP'){assert.equal(after.matches,new Map(before.freq).get(before.need)||0);assert.deepEqual(after.freq,before.freq);}
    if(state==='INSERT'){const expected=new Map(before.freq);expected.set(before.sum,(expected.get(before.sum)||0)+1);assert.deepEqual(after.freq,[...expected]);}
    if(state==='DECREMENT'){const expected=new Map(before.freq);expected.set(before.sum,expected.get(before.sum)-1);assert.deepEqual(after.freq,[...expected]);}
    if(['RETURN_DFS','RETURN_EMPTY'].includes(state)&&calls.length>1){const parent=calls.at(-2);assert.equal(after.nodeId,parent.nodeId);assert.equal(after.sum,parent.sum);assert.equal(after.need,parent.need??'pending');assert.equal(after.matches,parent.matches??'pending');}
    for(const [,frequency]of after.freq==='pending'?[]:after.freq)assert.ok(frequency>=0);
  }
  assert.equal(h.current().ans,5);
});

test('437: Back, replay, pure previews and detached Object View restore each exact checkpoint',async()=>{
  const h=fixture();h.exec('loadExample(3)');const frames=trace(h,150);
  for(let index=frames.length-1;index>=0;index--){assert.deepEqual(h.current(),frames[index].raw);assert.deepEqual(snapshot(h),frames[index].rendered);if(index)h.exec('prevStep()');}
  for(let index=1;index<frames.length;index++){h.exec('nextStep()');assert.deepEqual(h.current(),frames[index].raw);assert.deepEqual(plain(h.source.objectFrame()),frames[index].objectFrame);}
  const state=h.state(),current=snapshot(h),epoch=h.epoch(),renders=h.renders.length;
  for(let index=0;index<frames.length;index++){const raw=plain(h.source.readAt(index));assert.deepEqual(raw,frames[index].raw);const view=h.source.preview(index);assert.ok(view);view.textContent='consumer edit';const object=h.source.objectFrame(index);object.stack[0].variables.length=0;assert.deepEqual(plain(h.source.objectFrame(index)),frames[index].objectFrame);}
  assert.equal(h.state(),state);assert.deepEqual(snapshot(h),current);assert.equal(h.epoch(),epoch);assert.equal(h.renders.length,renders);
  const detached=h.source.read();detached.treeArr[0]=999;detached.root.val=999;detached.freq[0][1]=999;assert.equal(h.state(),state);
  for(const index of [-1,.5,frames.length,NaN]){assert.equal(h.source.preview(index),null);assert.throws(()=>h.source.objectFrame(index));assert.throws(()=>h.source.readAt(index));}
  h.adapter.reset();assert.deepEqual(h.current(),frames[0].raw);assert.equal(h.source.index(),0);assert.equal(h.adapter.currentTransition(),null);
});

test('437: duplicate node identities, original nulls, numeric Map keys and local lifetimes are exact',()=>{
  const h=fixture();h.load('[0,0,0]',0);const observed=new Set();
  for(const frame of trace(h,100)){
    const vars=Object.fromEntries(frame.objectFrame.stack[0].variables.map(variable=>[variable.name,variable.value]));
    if(frame.raw.nodeActive){if(frame.raw.nodeId===null)assert.equal(vars.node,null);else{assert.equal(vars.node.ref,'tree:'+frame.raw.nodeId);observed.add(vars.node.ref);}}
    else for(const name of ['node','sum','need','matches'])assert.ok(!(name in vars),name+' is outside the recursive call');
    if(frame.raw.need==='pending'&&frame.raw.nodeActive)assert.equal(vars.need.special,'not initialized');
    const map=frame.objectFrame.objects.find(object=>object.id===vars.freq?.ref);
    if(map){assert.equal(map.kind,'map');assert.ok(map.entries.every(entry=>entry.key.startsWith('number:')));}
    for(const object of frame.objectFrame.objects)assert.ok(object.entries.every(entry=>!['_id','nodeId','returnTo','x','y'].includes(entry.key)));
  }
  assert.equal(observed.size,3);
});

test('437: invalid custom input is atomic at initial and advanced Action checkpoints',async()=>{
  const invalid=[['','0'],['1,,2','0'],['[1,]','0'],['[1,2','0'],['1,2]','0'],['[null,1]','0'],['[1,null,null,2]','0'],['[1,true]','0'],['["1"]','0'],['[1,1.5]','0'],['[1000000001]','0'],['[-1000000001]','0'],['[9007199254740991,1,null,1]','0'],[JSON.stringify(Array(64).fill(0)),'0'],[JSON.stringify(Array(128).fill(0)),'0'],['[1]',''],['[1]','1.5'],['[1]','1001'],['[1]','-1001'],['[1]','NaN'],['[1]','Infinity'],['[1]','0abc']];
  for(const index of [0,10]){const h=fixture();await h.adapter.seek(index);await h.walkthrough.next();h.focus();for(const [tree,target]of invalid){const before={state:h.state(),index:h.source.index(),epoch:h.epoch(),renders:h.renders.length,alerts:h.alerts.length,stage:h.walkthrough.stage,frame:h.adapter.snapshot(),transition:h.adapter.currentTransition()};assert.equal(h.load(tree,target),false);assert.equal(h.alerts.length,before.alerts+1);assert.equal(h.state(),before.state);assert.equal(h.source.index(),before.index);assert.equal(h.epoch(),before.epoch);assert.equal(h.renders.length,before.renders);assert.equal(h.walkthrough.stage,before.stage);assert.equal(h.adapter.snapshot(),before.frame);assert.equal(h.adapter.currentTransition(),before.transition);assert.equal(h.objectContainer.dataset.objectFocused,'true');}
    const epoch=h.epoch();assert.equal(h.load('[7]',7),true);assert.equal(h.epoch(),epoch+1);assert.equal(h.source.index(),0);assert.equal(h.walkthrough.stage,0);assert.equal(h.objectContainer.dataset.objectFocused,'false');assert.equal(finish(h).ans,1);}
});

test('437: maximum visualizer skew and reset/new-input cancellation finish without stale instructions',async()=>{
  const h=fixture(),chain=Array.from({length:125},(_,i)=>i%2?null:0);assert.equal(h.load(JSON.stringify(chain),0),true);
  const seek=h.adapter.seek(50000);assert.equal(h.source.index(),150,'seek yields after a bounded chunk');assert.equal(h.load('[7]',7),true);await seek;assert.equal(h.source.index(),0);assert.equal(h.current().targetSum,7);assert.equal(finish(h).ans,1);
  assert.equal(h.load(JSON.stringify(chain),0),true);await h.adapter.seek(50000);assert.equal(h.current().ans,2016);assert.deepEqual(h.current().freq,[[0,1]]);
});

test('437: Detailed moments commit once and Compact advances a single instruction',async()=>{
  const h=fixture(),initial=h.current();await h.walkthrough.next();assert.equal(h.source.index(),0);assert.deepEqual(h.current(),initial);await h.walkthrough.next();assert.equal(h.source.index(),1);const committed=h.current();await h.walkthrough.next();assert.equal(h.source.index(),1);assert.deepEqual(h.current(),committed);h.walkthrough.setMode('compact');await h.walkthrough.next();assert.equal(h.source.index(),2);assert.deepEqual(h.current().freq,[[0,1]]);
});

test('437: Guided fixed input, three meanings and strict before/after projections match',()=>{
  const h=fixture(),lesson=json('visualizer-ui/guided-content-b.json').find(item=>item.id==='leetcode:437');h.exec('loadExample(2)');const frames=trace(h,100);
  assert.equal(lesson.version,1);assert.deepEqual(lesson.loader,{functionName:'loadExample',args:[2]});assert.deepEqual(frames[0].projected.values,lesson.expectedInput);
  const meanings={decision:{before:{count:1,matches:2},after:{count:3,matches:2}},change:{before:{freq:[[0,3]],nodeId:'n1'},after:{freq:[[0,2]],nodeId:'n1'}},result:{before:{count:5,ans:'pending'},after:{count:5,ans:5}}};
  for(const cp of lesson.checkpoints)for(const side of ['before','after']){const frame=frames[cp[side+'Index']];assert.equal(h.context.StudyGuided.matches(frame.projected,cp[side]),true);for(const [key,value]of Object.entries(meanings[cp.id][side]))assert.deepEqual(frame.raw[key],value);const wrong=structuredClone(frame.projected);wrong.phase+=' incorrect';assert.equal(h.context.StudyGuided.matches(wrong,cp[side]),false);}
});

test('437: reference-only baseline and every pending operation retain exact source lines',async()=>{
  const h=fixture(),expected=json('tests/fixtures/visualizer-baseline.json')[file],actual=await baseline(h);assert.deepEqual(actual.expected,expected);
  const rules=json('visualizer-ui/operations.json').find(item=>item.id==='leetcode:437');h.adapter.reset();while(h.source.pendingInstruction()){const instruction=h.source.pendingInstruction();assert.equal(rules.lines[instruction.line].code,h.el('line-'+instruction.line).textContent.trim());h.exec('nextStep()');}
});

test('437: real coding validation accepts 1000-node skews and rejects unsafe bounds/unreachable input',()=>{
  const validate=validation();for(const item of cases)assert.equal(validate(definition,item.input),null,item.name);
  for(const side of ['left','right']){const values=side==='right'?Array.from({length:1999},(_,i)=>i%2?null:0):[0,...Array.from({length:1998},(_,i)=>i%2?null:0)];assert.equal(validate(definition,[values,0]),null,side);}
  for(const value of [[Array(1001).fill(0),0],[[1000000001],0],[[-1000000001],0],[[0],1001],[[0],-1001],[[null,1],0],[[1,null,null,2],0],[[9007199254740991,1,null,1],0],[[1],0.5]])assert.notEqual(validate(definition,value),null,JSON.stringify(value).slice(0,90));
});
