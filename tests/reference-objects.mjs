import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT,collectCatalog} from '../scripts/content.mjs';

const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
const catalog=collectCatalog();
assert.equal(lessons.length,catalog.entries.filter(entry=>entry.number).length,'every problem has a reference lesson');
const browser=await chromium.launch({headless:true});
const failures=[],missing=[],reports=[];let cursor=0;
async function worker(){
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  while(cursor<lessons.length){const lesson=lessons[cursor++],errors=[];const onError=error=>errors.push(error.message);page.on('pageerror',onError);
    try{
      await page.goto(pathToFileURL(path.join(ROOT,lesson.path)).href);await page.waitForFunction(()=>window.studyLessonAdapter);
      const result=await page.evaluate(async()=>{
        const source=studyLessonSource,adapter=studyLessonAdapter;
        if(typeof source.objectFrame!=='function')throw Error('Missing pure Object View hook');
        const state=()=>JSON.stringify(StudyObjectView.capture(source.read()));
        const initial=JSON.stringify(source.objectFrame(0)),live=state(),index=source.index();
        for(let i=0;i<3;i++)if(JSON.stringify(source.objectFrame(index))!==initial)throw Error('Repeated reads differ');
        if(state()!==live||source.index()!==index)throw Error('Reading objects changed live state');
        for(let i=0;i<8&&!document.getElementById('btn-next').disabled;i++)adapter.next();
        const forward=JSON.stringify(source.objectFrame()),target=source.index(),before=state();
        if(JSON.stringify(source.objectFrame(0))!==initial)throw Error('Initial object projection contains future state');
        if(state()!==before||source.index()!==target)throw Error('Historical objects changed live state');
        await adapter.seek(0);if(JSON.stringify(source.objectFrame())!==initial)throw Error('Initial object state is not restored');
        await adapter.seek(target);if(JSON.stringify(source.objectFrame())!==forward)throw Error('Forward object state is not restored');
        const objectFrame=source.objectFrame(),variables=objectFrame.stack.flatMap(frame=>frame.variables);
        const missingNames=new Set();
        const inspect=frame=>{for(const variable of frame.stack.flatMap(call=>call.variables))if(variable.value?.special==='not recorded at this checkpoint')missingNames.add(variable.name);};
        inspect(objectFrame);
        if(source.count()!==null&&source.readAt)for(let i=0;i<source.count();i++)inspect(source.objectFrame(i));
        const unavailable=[...missingNames];
        const forbidden=['layout','positions','trace','history','historyStack','steps','snapshots','rawMemoryView','nodeState','pinned','execState'];
        if(variables.some(v=>forbidden.includes(v.name)))throw Error('Object View contains renderer bookkeeping');
        for(const object of objectFrame.objects)if(object.entries.some(e=>/^_(?:id|x|y|depth|px|py)$/.test(e.key)))throw Error('Object View leaks node layout fields');
        return {index:target,variables:variables.length,objects:objectFrame.objects.length,unavailable};
      });
      assert.deepEqual(errors,[]);assert.ok(result.variables>0,'object roots exist');
      reports.push({number:lesson.number,...result});if(result.unavailable.length)missing.push({number:lesson.number,names:result.unavailable});
    }catch(error){failures.push({number:lesson.number,error:String(error)});console.log('FAIL objects',lesson.number,String(error));}
    finally{page.off('pageerror',onError);}
  }
  await page.close();
}
try{
  await Promise.all(Array.from({length:4},worker));
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const open=async number=>{await page.goto(pathToFileURL(path.join(ROOT,lessons.find(l=>l.number===number).path)).href);await page.waitForFunction(()=>window.studyLessonAdapter);};
  for(const number of [1,3,21,51,133,138,146,206,208,211,212,460,700,933,2707]){
    await open(number);
    const result=await page.evaluate(number=>{
      const source=studyLessonSource,adapter=studyLessonAdapter;let checked=0;
      const variable=(frame,name)=>frame.stack.flatMap(f=>f.variables).find(v=>v.name===name)?.value;
      const object=(frame,value)=>value&&typeof value==='object'&&'ref'in value?frame.objects.find(o=>o.id===value.ref):null;
      const field=(frame,raw,key)=>object(frame,raw)?.entries.find(e=>e.key===key)?.value;
      const assert=(condition,text)=>{if(!condition)throw Error(text);};
      const roots=[];
      while(checked<3000){const frame=source.objectFrame(),index=source.index(),same=JSON.stringify(frame);roots.push(same);
        const nodes=frame.objects.filter(o=>o.entries.some(e=>e.key==='val'));
        assert(new Set(nodes.map(o=>o.id)).size===nodes.length,'Node identities are unique');
        if(number===1)assert(object(frame,variable(frame,'seen'))?.kind==='map','Two Sum uses a Map');
        if(number===3)assert(object(frame,variable(frame,'seen'))?.kind==='set','Longest substring uses a Set');
        if(number===146)assert(object(frame,field(frame,variable(frame,'this'),'cache'))?.kind==='map','LRU cache uses a Map');
        if(number===460){for(const name of ['keyToVal','keyToFreq','freqToKeys'])assert(object(frame,field(frame,variable(frame,'this'),name))?.kind==='map','LFU '+name+' uses a Map');const groups=object(frame,field(frame,variable(frame,'this'),'freqToKeys'));for(const entry of groups.entries)assert(object(frame,entry.value)?.kind==='set','LFU frequency groups use Set');}
        if([208,211,212,2707].includes(number)){for(const node of frame.objects.filter(o=>o.entries.some(e=>e.key==='children'))){assert(object(frame,node.entries.find(e=>e.key==='children').value)?.kind==='object','Trie children are character dictionaries');}}
        if(number===133){const visited=object(frame,variable(frame,'visited'));assert(visited?.kind==='map','Clone Graph uses object-key Map');for(const entry of visited.entries){assert(entry.keyValue?.ref?.startsWith('graph:original:'),'Visited key references original');assert(entry.value?.ref?.startsWith('graph:clone:'),'Visited value references clone');}}
        if(number===138){const map=object(frame,variable(frame,'map'));assert(map?.kind==='map','Copy Random List uses object-key Map');for(const entry of map.entries)assert(entry.keyValue?.ref!==entry.value?.ref,'Original and clone identities differ');}
        if(source.index()!==index||JSON.stringify(source.objectFrame())!==same)throw Error('Projection mutated state');
        checked++;if(document.getElementById('btn-next').disabled)break;adapter.next();
      }
      return {checked,complete:document.getElementById('btn-next').disabled};
    },number);
    assert.ok(result.complete,`${number}: reference completes`);reports.push({number,semanticTransitions:result.checked});
  }
  await page.close();
}catch(error){failures.push({case:'semantic structures',error:String(error)});}
finally{await browser.close();}
if(missing.length)failures.push({case:'uncaptured solution variables',problems:missing});
fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'test-results/reference-objects.json'),JSON.stringify({lessons:lessons.length,checked:reports.length,failures,missing,reports},null,2));
console.log(JSON.stringify({lessons:lessons.length,failures,unrecordedLocals:missing},null,2));if(failures.length)process.exitCode=1;
