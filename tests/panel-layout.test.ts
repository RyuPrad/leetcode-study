import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const context=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../visualizer-ui/panel-layout.js',import.meta.url),'utf8'),context);
const parse=(value:unknown)=>JSON.parse(JSON.stringify(context.StudyPanelLayout.parse(value)));
test('Panel preferences reject malformed records and preserve valid geometry',()=>{
 for(const raw of [null,'invalid','null','[]','{}','{"version":2,"panels":{}}','{"version":1,"panels":[]}'])assert.deepEqual(parse(raw),{});
 const code={x:40,y:20,width:450,height:350,workspaceWidth:1200,z:4,hidden:false,placed:true};
 assert.deepEqual(parse(JSON.stringify({version:1,panels:{code,objects:{...code,width:'450'},diagram:{...code,height:-1}}})),{code});
 const bounded=parse(JSON.stringify({version:1,panels:{code:{...code,y:1e9,z:1e9,x:-20}}})).code;
 assert.equal(bounded.y,20000);assert.equal(bounded.z,1000);assert.equal(bounded.x,0);
});
