import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT,collectCatalog} from '../scripts/content.mjs';

const catalog=collectCatalog(),browser=await chromium.launch(),results=[];
const page=await browser.newPage({viewport:{width:1360,height:940},reducedMotion:'reduce'}),errors=[];
page.on('pageerror',error=>errors.push(error.message));
try{
  for(const number of [100,124,337,199,1448]){
    const file=catalog.entries.find(entry=>entry.number===number).visualizerPath;
    await page.goto(pathToFileURL(path.join(ROOT,file)).href+'?walkthrough=compact');await page.waitForFunction(()=>window.studyLessonAdapter);
    const inputs=number===100?['[1,1,1,1,null,null,1] | [1,1,1,1,null,null,1]','[1,1,1] | [1,1,1]','[1,1,null] | [1,null,1]','[] | []']:['1,1,1,1,null,null,1','1,1,1','1,null,1,1',''];
    for(const input of inputs){
      await page.evaluate(input=>{window.testTreeError='';const original=window.alert;window.alert=message=>window.testTreeError=message;document.getElementById('custom-input').value=input;loadCustom();window.alert=original;},input);
      assert.equal(await page.evaluate(()=>window.testTreeError),'',`${number}: ${input}`);
      const result=await page.evaluate(async number=>{
        const source=studyLessonSource,serialize=value=>JSON.stringify(value),initialRaw=serialize(source.read()),beforeIndex=source.index();
        const getVariable=(frame,name)=>frame.stack.flatMap(call=>call.variables).find(variable=>variable.name===name)?.value;
        const getObject=(frame,value)=>frame.objects.find(object=>object.id===value?.ref);
        const field=(frame,value,key)=>getObject(frame,value)?.entries.find(entry=>entry.key===key)?.value;
        const shape=(frame,value)=>value===null?null:typeof value==='object'&&value?.ref?{val:field(frame,value,'val'),left:shape(frame,field(frame,value,'left')),right:shape(frame,field(frame,value,'right'))}:value;
        const sourceShape=node=>node===null?null:{val:node.val,left:sourceShape(node.left),right:sourceShape(node.right)};
        const nativeRoot=number===100?source.read().rootP:number===124||number===337?source.read().root:window._layout.nodes.find(record=>record.id==='n0')?.node??null;
        const expectedTree=sourceShape(nativeRoot),observed=new Set(),frames=[];let nullPointers=0;
        for(let index=0;index<source.count();index++){
          const raw=source.readAt(index),frame=source.objectFrame(index);frames.push(serialize(frame));
          if(serialize(source.read())!==initialRaw||source.index()!==beforeIndex)throw Error('Historical Object View executed the live algorithm');
          if(own(raw,'objectNodeId')||own(raw,'objectLocals'))throw Error('Supplemental identity metadata changed the legacy enumerable snapshot');
          for(const object of frame.objects)if(object.entries.some(entry=>['_id','objectNodeId','objectLocals','x','y','px','py'].includes(entry.key)))throw Error('Source identity or layout fields leaked into the object');
          if(number===100){
            for(const [name,idKey,textKey] of [['p','idP','pTxt'],['q','idQ','qTxt']]){
              const value=getVariable(frame,name),runtime=raw.frame;
              if(runtime){if(runtime[textKey]==='null'){if(value!==null)throw Error('A null layout placeholder became an object');nullPointers++;}else{const expected='tree:'+name+':'+runtime[idKey];if(value?.ref!==expected)throw Error('Same Tree current '+name+' has the wrong source identity');observed.add(expected);}}
              else if(serialize(shape(frame,value))!==serialize(sourceShape(name==='p'?raw.rootP:raw.rootQ)))throw Error('Same Tree root topology differs from its original tree');
            }
          }else{
            const root=getVariable(frame,'root');if(serialize(shape(frame,root))!==serialize(expectedTree))throw Error('Object View changed the original child topology');
            const value=getVariable(frame,'node');const id=number===199||number===1448?steps[index].objectNodeId:raw.nodeId;
            if(id===null&&raw.phase==='base'||id===null&&number===1448){if(value!==null)throw Error(number+':'+index+' A real null recursive argument became a display placeholder');nullPointers++;}
            else if(id!==undefined&&id!==null){if(value?.ref!=='tree:'+id)throw Error(number+':'+index+' Current node reference was inferred from its duplicate value: '+JSON.stringify(value)+' expected tree:'+id);observed.add(value.ref);}
            if(number===199){const queue=getObject(frame,getVariable(frame,'queue'));if(serialize(queue?.entries.map(entry=>entry.value.ref)||[])!==serialize(raw.queueIds.map(id=>'tree:'+id)))throw Error('BFS queue lost actual node identities');}
            if(number===1448&&steps[index].objectLocals){const locals=steps[index].objectLocals;for(const name of ['maxSoFar','newMax']){const expected=locals[name],actual=getVariable(frame,name);if(expected===undefined){if(actual&&actual.special==='not recorded at this checkpoint')throw Error('An uninitialized local is ambiguous');}else if(expected===-Infinity){if(actual?.special!=='-Infinity')throw Error('The DFS parameter became a formatted string');}else if(actual!==expected)throw Error('The current call parameter or computed maximum is incorrect');}}
          }
        }
        for(const index of [...new Set([0,1,Math.floor(source.count()/2),source.count()-1])]){await studyLessonAdapter.seek(index);if(serialize(source.objectFrame())!==frames[index])throw Error('Seeking restored another node with the same value');}
        return {states:source.count(),distinctCurrentNodes:observed.size,nullPointers};
        function own(object,key){return Object.prototype.hasOwnProperty.call(object,key);}
      },number);
      if(input.includes('1,1,1'))assert.ok(result.distinctCurrentNodes>=3,'Repeated values retain separate source identities');
      results.push({number,input,...result});
    }
  }
  assert.deepEqual(errors,[]);fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});fs.writeFileSync(path.join(ROOT,'test-results/tree-object-identities.json'),JSON.stringify({passed:true,results},null,2));console.log(`PASS ${results.length} duplicate-valued/sparse/empty trees, stable current nodes, original nulls, queue aliases, pure previews and DFS locals.`);
}finally{await browser.close();}
