
/* Real lesson and production learning/operations/Object View/Guided scripts.
   Structural DOM only: browser painting, native playback and QuickJS are CI gates. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {test}=require('node:test'),{stripTypeScriptTypes}=require('node:module');
const {fixture:dom,trace,plain,snapshot,baseline}=require('./helpers/search-range-dom.cjs');
const arg=process.argv.indexOf('--source'),root=arg<0?path.resolve(__dirname,'..'):path.resolve(process.argv[arg+1]);
const file='Graphs/is_graph_bipartite_visualizer.html',fixture=()=>dom(root,{file});
const json=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const definition=json('coding/problems.json').find(item=>item.number===785),cases=[...definition.examples,...definition.tests];
const finish=h=>{let steps=0;while(h.source.pendingInstruction()){assert.ok(steps++<3000);h.exec('nextStep()');}return h.current();};
function partitions(graph){for(let mask=0;mask<2**graph.length;mask++){if(graph.every((row,u)=>row.every(v=>((mask>>u)&1)!==((mask>>v)&1))))return true;}return false;}
function validation(){
 const source=stripTypeScriptTypes(fs.readFileSync(path.join(root,'coding/validation.ts'),'utf8'),{mode:'strip'}).replace(/^import[^;]+;\s*/gm,'').replace(/\bexport /g,'');
 const constants=stripTypeScriptTypes(fs.readFileSync(path.join(root,'shared/coding.ts'),'utf8'),{mode:'strip'}).replace(/\bexport /g,'');
 return vm.runInNewContext(constants+'\n'+source+'\nvalidateInput');
}
test('785: original note, source, coding cases, catalog and solution techniques are complete',async()=>{
 const {collectCatalog}=await import('../scripts/content.mjs'),catalog=collectCatalog(root),entry=catalog.entries.find(x=>x.number===785);
 assert.equal(entry.id,'leetcode:785');assert.equal(entry.topic,'Graphs');assert.equal(entry.visualizerPath,file);
 assert.equal(catalog.entries.filter(x=>x.number).length,255);assert.equal(catalog.entries.length,257);assert.equal(catalog.visualizers.length,255);
 assert.deepEqual(entry.solutionTechniques.map(x=>x.name),['Breadth-first search','Two-coloring','Connected components','Queue']);
 const {extraCase}=await import('../coding/cases.mjs'),{statements}=await import('../coding/statements.mjs');
 assert.equal(definition.description,statements[785]);assert.equal(definition.examples.length,3);assert.equal(definition.tests.length,12);
 definition.tests.forEach((x,i)=>assert.deepEqual(x.input,extraCase(785,i+1)));
 const h=fixture(),source=[...h.html.matchAll(/<div id="line-\d+" class="code-line">([\s\S]*?)<\/div>/g)].map(x=>x[1].replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&')).join('\n');
 assert.equal(source,definition.reference);assert.doesNotMatch(source,/\.shift\(/);assert.ok(entry.markdown.includes(definition.reference));assert.ok(entry.markdown.includes('O(V + E)'));
});
test('785: all 15 maintained cases and six presets agree with exhaustive two-partition oracle',()=>{
 const h=fixture(),solve=vm.runInNewContext(definition.reference+'\nisBipartite');
 for(const item of cases){const g=item.input[0],before=JSON.stringify(g),expected=partitions(g);assert.equal(solve(g),expected,item.name);assert.equal(JSON.stringify(g),before);assert.equal(h.load(JSON.stringify(g)),true);assert.equal(finish(h).ans,expected,item.name);if('expected'in item)assert.equal(item.expected,expected);}
 for(let preset=1;preset<=6;preset++){h.exec('loadExample('+preset+')');const g=h.current().graph;assert.equal(finish(h).ans,partitions(g),'preset '+preset);}
});
test('785: one displayed instruction performs each label, enqueue, head and component mutation',()=>{
 const h=fixture();h.exec('loadExample(5)');const discovered=new Set();let index=0;
 while(h.source.pendingInstruction()){
  const a=h.current(),instruction=plain(h.source.pendingInstruction());h.exec('nextStep()');const b=h.current(),state=a.execState;
  assert.equal(h.source.index(),++index);assert.equal(h.adapter.currentTransition().instruction.line,instruction.line);assert.deepEqual(b.graph,a.graph);
  if(!['INIT_COLOR','COLOR_START','COLOR_NEIGHBOR'].includes(state))assert.deepEqual(b.color,a.color,state);
  if(state==='COLOR_START'){const want=a.color.slice();want[a.start]=1;assert.deepEqual(b.color,want);assert.ok(!discovered.has(a.start));discovered.add(a.start);}
  if(state==='COLOR_NEIGHBOR'){assert.equal(a.color[a.neighbor],0);assert.ok(!discovered.has(a.neighbor));discovered.add(a.neighbor);const want=a.color.slice();want[a.neighbor]=-a.color[a.node];assert.deepEqual(b.color,want);assert.deepEqual(b.queue,a.queue);}
  if(state==='ENQUEUE'){assert.notEqual(a.color[a.neighbor],0);assert.deepEqual(b.queue,[...a.queue,a.neighbor]);}
  else if(!['INIT_QUEUE','CHECK_QUEUE'].includes(state))assert.deepEqual(b.queue,a.queue,state);
  if(state==='ADVANCE_HEAD'){assert.equal(b.head,a.head+1);assert.equal(b.node,a.node);assert.deepEqual(b.queue,a.queue);}
  if(Array.isArray(b.queue))assert.equal(new Set(b.queue).size,b.queue.length,'no duplicate queue entries');
 }
 assert.equal(discovered.size,4);assert.equal(h.current().ans,true);
});
test('785: disconnected components, isolates and immediate odd-cycle return are real transitions',()=>{
 const h=fixture();h.exec('loadExample(3)');const frames=trace(h,200),seeds=frames.filter(x=>x.raw.execState==='COLOR_START').map(x=>x.raw.start);
 assert.deepEqual(seeds,[0,1,3,4]);assert.equal(frames.at(-2).pendingInstruction.line,20);assert.equal(frames.at(-1).raw.ans,false);
 const last=frames.at(-1).raw;assert.equal(last.start,4);assert.equal(last.head,2);assert.deepEqual(last.queue,[4,5,6]);assert.equal(last.color[5],last.color[6]);assert.equal(h.exec('nextStep()'),false);assert.equal(h.source.index(),94);
});
test('785: Back/replay and pure detached preview restore each actual checkpoint',()=>{
 const h=fixture();h.exec('loadExample(3)');const frames=trace(h,200);
 for(let j=frames.length-1;j>=0;j--){assert.deepEqual(h.current(),frames[j].raw);assert.deepEqual(snapshot(h),frames[j].rendered);if(j)h.exec('prevStep()');}
 for(let j=1;j<frames.length;j++){h.exec('nextStep()');assert.deepEqual(h.current(),frames[j].raw);assert.deepEqual(plain(h.source.objectFrame()),frames[j].objectFrame);}
 const state=h.state(),rendered=snapshot(h),epoch=h.epoch(),renders=h.renders.length;
 for(let j=0;j<frames.length;j++){assert.deepEqual(plain(h.source.readAt(j)),frames[j].raw);const view=h.source.preview(j);view.textContent='consumer edit';const objects=h.source.objectFrame(j);objects.stack[0].variables.length=0;assert.deepEqual(plain(h.source.objectFrame(j)),frames[j].objectFrame);}
 const raw=h.source.read();raw.graph[0].push(999);raw.color[0]=99;raw.queue[0]=99;assert.equal(h.state(),state);assert.deepEqual(snapshot(h),rendered);assert.equal(h.epoch(),epoch);assert.equal(h.renders.length,renders);
 for(const j of [-1,.5,NaN,frames.length]){assert.equal(h.source.preview(j),null);assert.throws(()=>h.source.readAt(j));assert.throws(()=>h.source.objectFrame(j));}
 h.adapter.reset();assert.equal(h.source.index(),0);assert.deepEqual(h.current(),frames[0].raw);assert.equal(h.adapter.currentTransition(),null);
});
test('785: Object View keeps equal adjacency rows distinct and shows only source locals in scope',()=>{
 const h=fixture();h.exec('loadExample(5)');const allowed=new Set(['graph','n','color','start','queue','head','node','i','neighbor']);
 for(const frame of trace(h,150)){
  const r=frame.raw,vars=Object.fromEntries(frame.objectFrame.stack[0].variables.map(x=>[x.name,x.value]));assert.ok(Object.keys(vars).every(k=>allowed.has(k)));assert.equal(vars.graph.ref,'graph:input');
  const graph=frame.objectFrame.objects.find(x=>x.id==='graph:input');assert.deepEqual(graph.entries.map(x=>x.value.ref),['graph:row:0','graph:row:1','graph:row:2','graph:row:3']);
  if(!r.componentActive){assert.ok(!('queue'in vars));assert.ok(!('head'in vars));}else if(r.queue!=='pending')assert.equal(vars.queue.ref,'solution:queue:'+r.start);
  if(!r.nodeActive){assert.ok(!('node'in vars));assert.ok(!('i'in vars));}else if(r.node==='pending')assert.equal(vars.node.special,'not initialized');
  if(!r.neighborActive)assert.ok(!('neighbor'in vars));else if(r.neighbor==='pending')assert.equal(vars.neighbor.special,'not initialized');if(r.color!=='pending')assert.equal(vars.color.ref,'solution:color');
 }
 h.exec('loadExample(6)');const ids=new Set(trace(h,150).flatMap(f=>f.objectFrame.objects.filter(x=>x.id.startsWith('solution:queue:')).map(x=>x.id)));assert.deepEqual([...ids],['solution:queue:0','solution:queue:1','solution:queue:3']);
});
test('785: invalid graph input is atomic at initial and advanced Action checkpoints',async()=>{
 const invalid=['','[]','null','{}','[1]','[null]','[[0]]','[[1],[]]','[[1,1],[0]]','[[2],[0]]','[[-1],[]]','[[1.5],[0]]','[["1"],[0]]','[[true],[0]]','[[1],[0,]]','[[1],[0]','[[1],[0],null]',JSON.stringify(Array.from({length:17},()=>[]))];
 for(const index of [0,18]){
  const h=fixture();await h.adapter.seek(index);await h.walkthrough.next();h.focus();
  for(const value of invalid){const before={state:h.state(),index:h.source.index(),epoch:h.epoch(),renders:h.renders.length,alerts:h.alerts.length,stage:h.walkthrough.stage,frame:h.adapter.snapshot(),transition:h.adapter.currentTransition()};assert.equal(h.load(value),false,value);assert.equal(h.alerts.length,before.alerts+1);assert.equal(h.state(),before.state);assert.equal(h.source.index(),before.index);assert.equal(h.epoch(),before.epoch);assert.equal(h.renders.length,before.renders);assert.equal(h.walkthrough.stage,before.stage);assert.equal(h.adapter.snapshot(),before.frame);assert.equal(h.adapter.currentTransition(),before.transition);assert.equal(h.objectContainer.dataset.objectFocused,'true');}
  const epoch=h.epoch();assert.equal(h.load('[[]]'),true);assert.equal(h.epoch(),epoch+1);assert.equal(h.source.index(),0);assert.equal(h.walkthrough.stage,0);assert.equal(h.objectContainer.dataset.objectFocused,'false');assert.equal(finish(h).ans,true);
 }
});
test('785: long seek cancellation cannot leak prior graph instructions into a new run or reset',async()=>{
 const dense=Array.from({length:16},(_,u)=>Array.from({length:16},(_,v)=>v).filter(v=>(u<8)!==(v<8)));
 const h=fixture();assert.equal(h.load(JSON.stringify(dense)),true);let seek=h.adapter.seek(50000);assert.equal(h.source.index(),150);assert.equal(h.load('[[1,2],[0,2],[0,1]]'),true);await seek;assert.equal(h.source.index(),0);assert.equal(finish(h).ans,false);
 h.load(JSON.stringify(dense));seek=h.adapter.seek(50000);h.adapter.reset();await seek;assert.equal(h.source.index(),0);assert.equal(h.current().execState,'INIT_N');await h.adapter.seek(50000);assert.equal(h.current().ans,true);assert.equal(h.current().start,16);
});
test('785: Detailed Focus/Action/Result commits once and Compact advances once',async()=>{
 const h=fixture(),initial=h.current();await h.walkthrough.next();assert.equal(h.source.index(),0);assert.deepEqual(h.current(),initial);await h.walkthrough.next();assert.equal(h.source.index(),1);const committed=h.current();await h.walkthrough.next();assert.equal(h.source.index(),1);assert.deepEqual(h.current(),committed);h.walkthrough.setMode('compact');await h.walkthrough.next();assert.equal(h.source.index(),2);assert.deepEqual(h.current().color,[0,0,0,0]);
});
test('785: Guided authored decisions use strict before/after projections and independent meanings',()=>{
 const h=fixture(),lesson=json('visualizer-ui/guided-content-b.json').find(x=>x.id==='leetcode:785');h.exec('loadExample(3)');const frames=trace(h,200);assert.equal(lesson.version,1);assert.deepEqual(lesson.loader,{functionName:'loadExample',args:[3]});assert.deepEqual(lesson.expectedInput,frames[0].projected.values);
 const meanings={decision:{before:{start:4,componentActive:false,execState:'CHECK_COMPONENT'},after:{start:4,componentActive:true,execState:'COLOR_START'}},change:{before:{color:[1,1,-1,1,1,0,0],queue:[4],execState:'COLOR_NEIGHBOR'},after:{color:[1,1,-1,1,1,-1,0],queue:[4],execState:'ENQUEUE'}},result:{before:{ans:'pending',node:5,neighbor:6,execState:'RETURN_FALSE'},after:{ans:false,node:5,neighbor:6,execState:'END'}}};
 for(const cp of lesson.checkpoints)for(const side of ['before','after']){const f=frames[cp[side+'Index']];assert.equal(h.context.StudyGuided.matches(f.projected,cp[side]),true);for(const [key,value]of Object.entries(meanings[cp.id][side]))assert.deepEqual(f.raw[key],value);const wrong=structuredClone(f.projected);wrong.phase+=' wrong';assert.equal(h.context.StudyGuided.matches(wrong,cp[side]),false);}
});
test('785: baseline and every pending operation preserve source-line fidelity',async()=>{
 const h=fixture();assert.deepEqual((await baseline(h)).expected,json('tests/fixtures/visualizer-baseline.json')[file]);const rules=json('visualizer-ui/operations.json').find(x=>x.id==='leetcode:785');
 for(let preset=1;preset<=6;preset++){h.exec('loadExample('+preset+')');while(h.source.pendingInstruction()){const op=h.source.pendingInstruction();assert.equal(rules.lines[op.line].code,h.el('line-'+op.line).textContent.trim());h.exec('nextStep()');}}
});
test('785: coding validation enforces the official contract and accepts the full 100-vertex limit',()=>{
 const validate=validation();for(const item of cases)assert.equal(validate(definition,item.input),null,item.name);
 const empty=Array.from({length:100},()=>[]),path=empty.map((_,u)=>[u-1,u+1].filter(v=>v>=0&&v<100)),complete=empty.map((_,u)=>Array.from({length:100},(_,v)=>v).filter(v=>v!==u)),bipartite=empty.map((_,u)=>Array.from({length:100},(_,v)=>v).filter(v=>(u<50)!==(v<50)));
 for(const g of [empty,path,complete,bipartite])assert.equal(validate(definition,[g]),null);
 for(const g of [[],null,{},[1],[null],[[0]],[[1],[]],[[1,1],[0]],[[2],[0]],[[-1],[]],[[1.5],[0]],[['1'],[0]],[[true],[0]],[[1],[0],null],Array.from({length:101},()=>[])])assert.notEqual(validate(definition,[g]),null,JSON.stringify(g));
});
