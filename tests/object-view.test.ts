import test from 'node:test';
import assert from 'node:assert/strict';
import '../visualizer-ui/object-view.js';
import type { ObjectFrame, ObjectNode } from '../shared/object-view';

const api=StudyObjectView;
const variable=(frame:ObjectFrame,name:string)=>api.format(frame).frames[0].scopes.flatMap(scope=>scope.variables).find(value=>value.name===name)!;
const entries=(node:ObjectNode)=>node.entries!;

test('capture preserves nested JS values, aliases, cycles and stable caller IDs without invoking accessors',()=>{
  let calls=0;
  const object:{val:number;next?:unknown;self?:unknown}={val:4};object.next=null;object.self=object;
  Object.defineProperty(object,'getter',{enumerable:true,get(){calls++;throw Error('must not invoke');}});
  Object.defineProperty(object,'identity',{value:'node-a',enumerable:false});
  Object.defineProperty(object,'toJSON',{enumerable:true,value(){calls++;throw Error('must not invoke');}});
  const roots={head:object,alias:object,text:'<script>"x"</script>',unset:undefined,big:5n};
  const frame=api.capture(roots,{idOf:input=>(input as {identity?:string}).identity});
  assert.equal(calls,0);assert.equal(frame.objects[0].id,'node-a');assert.equal(frame.objects[0].kind,'list');
  assert.deepEqual(frame.stack[0].variables[0].value,frame.stack[0].variables[1].value);
  assert.ok(!frame.objects[0].entries.some(entry=>entry.key==='identity'));
  assert.deepEqual(frame.objects[0].entries.find(entry=>entry.key==='getter')?.value,{special:'accessor (not invoked)'});
  const head=variable(frame,'head').value;
  assert.equal(entries(head).find(entry=>entry.key==='self')?.value.kind,'reference');
  assert.match(entries(head).find(entry=>entry.key==='self')?.value.text||'',/circular/);
  assert.equal(variable(frame,'alias').value.kind,'object');assert.equal(variable(frame,'alias').value.objectId,'node-a');
  assert.equal(variable(frame,'text').value.text,JSON.stringify(roots.text));assert.equal(calls,0);
});

test('Map keys preserve key types and identity, Sets and empty structures remain inspectable',()=>{
  const key={val:1},symbols=[Symbol('same'),Symbol('same')];
  const frame=api.capture({map:new Map<unknown,unknown>([[1,'number'],['1','string'],[key,'object'],[symbols[0],1],[symbols[1],2]]),set:new Set([key,null]),array:[],empty:{}});
  const map=frame.objects.find(object=>object.kind==='map')!;
  assert.equal(new Set(map.entries.map(entry=>entry.key)).size,5);
  assert.deepEqual(map.entries.slice(0,2).map(entry=>entry.keyValue),[1,'1']);
  assert.ok(map.entries[2].keyValue&&typeof map.entries[2].keyValue==='object'&&'ref' in map.entries[2].keyValue);
  assert.equal(variable(frame,'set').value.type,'set');assert.equal(entries(variable(frame,'array').value).length,0);assert.equal(entries(variable(frame,'empty').value).length,0);
});

test('display caps can expand captured entries and depth without mutating snapshots',()=>{
  const chain:{next?:unknown}={};let tail=chain;for(let index=0;index<8;index++){const child={};tail.next=child;tail=child;}
  const frame=api.capture({array:Array.from({length:55},(_,index)=>index),chain}),saved=JSON.stringify(frame);
  const model=api.format(frame),array=model.frames[0].scopes[0].variables[0].value;
  assert.equal(array.entries?.length,50);assert.equal(array.remaining,5);
  assert.equal(api.format(frame,{expanded:new Set([array.path])}).frames[0].scopes[0].variables[0].value.entries?.length,55);
  let nested=variable(frame,'chain').value;for(let index=0;index<6;index++)nested=nested.entries![0].value;
  assert.equal(nested.collapsed,true);
  let expanded=api.format(frame,{expanded:new Set([nested.path])}).frames[0].scopes[0].variables[1].value;for(let index=0;index<6;index++)expanded=expanded.entries![0].value;
  assert.equal(expanded.collapsed,false);assert.equal(JSON.stringify(frame),saved);
  const limited=api.capture({array:[1,2,3]},{maxEntries:1});assert.equal(limited.truncated,true);assert.equal(variable(limited,'array').value.truncated,true);
});

test('branded unavailable values do not reinterpret ordinary objects named special',()=>{
  const frame=api.capture({missing:api.special('not initialized'),ordinary:{special:'data'}});
  assert.equal(variable(frame,'missing').value.text,'not initialized');assert.equal(variable(frame,'ordinary').value.kind,'object');
});

test('capture avoids inherited serialization hooks, bounds strings and reports actual native collection sizes',()=>{
  let calls=0;const prototype={};Object.defineProperty(prototype,'toJSON',{get(){calls++;throw Error('must not invoke');}});
  const value=Object.assign(Object.create(prototype),{text:'abcdefgh'}),map=new Map([[1,1],[2,2],[3,3]]);
  Object.defineProperty(map,'size',{get(){calls++;throw Error('must not invoke');}});
  const frame=api.capture({value,map},{maxStringLength:4,maxEntries:1});
  assert.equal(calls,0);assert.equal(frame.truncated,true);assert.equal(frame.objects.find(object=>object.kind==='map')?.size,3);
  assert.equal(frame.objects.find(object=>object.label==='Object')?.entries[0].value,'abcd…');
  const fn=function(){};Object.defineProperty(fn,'name',{value:{toString(){calls++;throw Error('must not coerce');}}});
  api.format(api.capture({value:{fn}}));assert.equal(calls,0,'Function labels cannot coerce user data');
});

test('all call frames and scopes retain recursive local identities and scoped change highlights',()=>{
  const location={line:2,column:1,endLine:2,endColumn:1};
  const before:ObjectFrame={stack:[{id:1,name:'walk',location,variables:[{id:'n',name:'n',scope:'Local',value:1}]},{id:2,name:'walk',location,variables:[{id:'n',name:'n',scope:'Local',value:2},{id:'root',name:'root',scope:'Closure',value:{ref:'tree'}}]}],objects:[{id:'tree',kind:'tree',label:'Tree',entries:[{key:'val',value:4}]}]};
  const after=structuredClone(before);after.stack[1].variables[0].value=3;after.objects[0].entries[0].value=5;
  const model=api.format(after,{previousFrame:before});assert.deepEqual(model.frames.map(frame=>frame.id),[2,1]);
  assert.equal(model.frames[0].scopes[0].variables[0].changed,true);assert.equal(model.frames[1].scopes[0].variables[0].changed,false);
  assert.notEqual(model.frames[0].scopes[0].variables[0].value.path,model.frames[1].scopes[0].variables[0].value.path);
  assert.equal(model.frames[0].scopes[1].variables[0].value.entries![0].changed,true);
});

test('card tokens and variable accents preserve the screenshot palette and scalar types',()=>{
  const frame=api.capture({list1:null,list2:2,dummy:true,tail:'node',value:api.special('undefined'),other:3});
  const model=api.format(frame),variables=model.frames[0].scopes[0].variables;
  assert.deepEqual(variables.slice(0,4).map(value=>value.color),['#569cd6','#c586c0','#6a9955','#d7ba7d']);
  assert.deepEqual(variables.slice(0,5).map(value=>value.value.token),['null','number','boolean','string','special']);
  assert.equal(variable(frame,'other').color,variable(api.capture({other:8}),'other').color,'Other badges have a stable accent');
});

test('node alias markers use reference equality, retain property names and keep IDs out of displayed link text',()=>{
  const second={val:7,next:null},head={val:7,next:second},frame=api.capture({head,alias:head,tail:second},{idOf:(_,path)=>`opaque:${path}`});
  const saved=JSON.stringify(frame),root=variable(frame,'head').value,next=entries(root).find(entry=>entry.key==='next')!.value;
  assert.deepEqual(root.aliases,[{name:'alias',color:variable(frame,'alias').color}]);
  assert.deepEqual(next.aliases,[{name:'tail',color:'#d7ba7d'}]);
  assert.ok(!root.aliases?.some(alias=>alias.name==='tail'),'Duplicate numeric values do not imply aliases');
  assert.ok(entries(root).some(entry=>entry.key==='val'),'Actual source properties stay unchanged');
  second.next=head as never;
  const cyclic=api.capture({head,tail:second},{idOf:(_,path)=>`opaque:${path}`}),link=entries(entries(variable(cyclic,'head').value).find(entry=>entry.key==='next')!.value).find(entry=>entry.key==='next')!.value;
  assert.equal(link.kind,'reference');assert.equal(link.text,'↩ circular reference');assert.ok(!link.text.includes('opaque:'));assert.ok(link.objectId?.startsWith('opaque:'));
  assert.equal(JSON.stringify(frame),saved,'Formatting keeps detached snapshots unchanged');
});
