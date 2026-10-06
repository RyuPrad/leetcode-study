import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';

const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
const browser=await chromium.launch(),reports=[];
const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];
page.on('pageerror',error=>errors.push(error.message));
try{
  for(const number of [98,572]){
    await page.goto(pathToFileURL(path.join(ROOT,lessons.find(lesson=>lesson.number===number).path)).href+'?walkthrough=compact');
    await page.waitForFunction(()=>window.studyLessonAdapter);
    const cases=number===98?
      [['2,2,2','root.left'],['2,1,2','root.right'],['3,1,5,null,2,3,7','root.right.left'],['2,1,3',null],['1,null,1','root.right'],['',null]]:
      [['1,1 | 1',null],['1,1,1 | 1,1',null],['1,1,1,1,null,null,1 | 1,1',null],['1,null,1 | 1,1',null],['[] | []',null],['[] | 1',null],['1,2,3 | []',null]];
    for(const [input,violationPath] of cases){
      await page.evaluate(input=>{document.getElementById('custom-input').value=input;loadCustom();},input);
      const report=await page.evaluate(async({number,input,violationPath})=>{
        const source=studyLessonSource,adapter=studyLessonAdapter,initialIndex=source.index();
        const live=JSON.stringify(StudyObjectView.capture(source.read())),frames=[],observedRoots=new Set(),observedArguments=new Set();
        let nulls=0,helperStates=0,activeStates=0;
        const get=(frame,name)=>frame.stack.flatMap(call=>call.variables).find(variable=>variable.name===name)?.value;
        const object=(frame,value)=>frame.objects.find(object=>object.id===value?.ref);
        const field=(frame,value,name)=>object(frame,value)?.entries.find(entry=>entry.key===name)?.value;
        const shape=(frame,value)=>value===null?null:value&&typeof value==='object'&&'ref' in value?{val:field(frame,value,'val'),left:shape(frame,field(frame,value,'left')),right:shape(frame,field(frame,value,'right'))}:value;
        const nativeShape=node=>node===null?null:{val:node.val,left:nativeShape(node.left),right:nativeShape(node.right)};
        const check=(value,message)=>{if(!value)throw Error(`${number} (${input}): ${message}`);};
        const metadata=number===98?['objectNodeId','objectNodeActive']:['objectTreeRefs','objectLayoutMain','objectLayoutSub'];
        const mainLayout=number===572?window._layoutMain:null,subLayout=number===572?window._layoutSub:null;
        const layoutShape=(layout,id)=>nativeShape(layout.nodes.find(record=>record.id===id&&!record.isNull)?.node??null);
        for(let index=0;index<source.count();index++){
          const raw=source.readAt(index),frame=source.objectFrame(index),step=steps[index];frames.push(JSON.stringify(frame));
          check(JSON.stringify(frame)===JSON.stringify(source.objectFrame(index)),'repeated pure snapshot differs');
          check(source.index()===initialIndex&&JSON.stringify(StudyObjectView.capture(source.read()))===live,'historical read changed live state');
          for(const name of metadata){check(!Object.hasOwn(raw,name),`${name} changed legacy enumerable reads`);check(Object.getOwnPropertyDescriptor(step,name)?.enumerable===false,`${name} did not survive Ready/snapshot construction`);}
          for(const captured of frame.objects){check(!captured.entries.some(entry=>metadata.includes(entry.key)||['_id','_x','_y','px','py'].includes(entry.key)),'identity/layout metadata leaked into the nested objects');}
          for(const variable of frame.stack.flatMap(call=>call.variables))check(variable.value?.special!=='not recorded at this checkpoint',`missing current variable ${variable.name}`);
          if(number===98){
            check(JSON.stringify(shape(frame,get(frame,'root')))===JSON.stringify(nativeShape(raw.root)),'original root topology differs');
            const node=get(frame,'node');
            if(step.objectNodeActive){
              activeStates++;
              check(step.objectNodeId===null?node===null:node?.ref===`tree:${step.objectNodeId}`,'active valid(node) points to a different node');
              if(node===null)nulls++;else{observedArguments.add(node.ref);check(field(frame,node,'val')===raw.node,'current node value differs from executed snapshot');}
              for(const name of ['low','high'])check(typeof raw[name]==='number'&&!Number.isFinite(raw[name])?get(frame,name)?.special===String(raw[name]):get(frame,name)===raw[name],`${name} differs from the current recursive bounds`);
            }else for(const name of ['node','low','high'])check(get(frame,name)===undefined,`${name} remains outside the active helper scope`);
            if(raw.finished&&raw.ans===false&&violationPath)check(node?.ref===`tree:${violationPath}`,'duplicate-valued violation selected another node');
          }else{
            const refs=step.objectTreeRefs,root=get(frame,'root'),subRoot=get(frame,'subRoot');
            check(JSON.stringify(shape(frame,subRoot))===JSON.stringify(layoutShape(subLayout,'n0')),'subRoot topology differs');
            if(refs.kind==='idle'){
              check(JSON.stringify(shape(frame,root))===JSON.stringify(layoutShape(mainLayout,'n0')),'Ready/Done changed the input root');
            }else{
              activeStates++;
              check(refs.rootId===null?root===null:root?.ref===`tree:main:${refs.rootId}`,'active subtree argument lost source identity');
              if(root===null)nulls++;else observedRoots.add(root.ref);
              check(JSON.stringify(shape(frame,root))===JSON.stringify(layoutShape(mainLayout,refs.rootId)),'active subtree topology differs');
            }
            if(refs.kind==='same'){
              helperStates++;
              for(const [name,id,prefix,layout,label] of [['p',refs.pId,'tree:main:',mainLayout,raw.frame.pTxt],['q',refs.qId,'tree:sub:',subLayout,raw.frame.qTxt]]){
                const argument=get(frame,name);
                check(id===null?argument===null:argument?.ref===prefix+id,`isSameTree(${name}) lost the actual node identity`);
                check(JSON.stringify(shape(frame,argument))===JSON.stringify(layoutShape(layout,id)),`${name} subtree topology differs`);
                if(id===null){nulls++;check(label==='null',`${name} null contradicts the recorded instruction`);}else{observedArguments.add(argument.ref);check(field(frame,argument,'val')===label,`${name} differs from the current comparison`);}
              }
            }else for(const name of ['p','q'])check(get(frame,name)===undefined,`${name} remains after isSameTree scope exited`);
          }
        }
        for(const index of [...new Set([source.count()-1,Math.floor(source.count()/2),1,0])]){
          await adapter.seek(index);check(JSON.stringify(source.objectFrame())===frames[index],'Back/seek restored another equal-valued node');
          check(Number(document.getElementById('study-object-view').dataset.objectViewIndex)===index,'display did not follow the restored state');
        }
        if(number===98&&violationPath)check(observedArguments.size>=2,'duplicate input did not retain separate visited node identities');
        if(number===572&&input==='1,1 | 1')check(observedRoots.size===2&&helperStates>0&&nulls>0,'duplicate candidate/helper/null cases were not exercised');
        return {number,input,checkpoints:source.count(),activeStates,helperStates,nulls,distinctRoots:observedRoots.size,distinctArguments:observedArguments.size};
      },{number,input,violationPath});
      reports.push(report);
    }
  }
  assert.deepEqual(errors,[]);
  fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
  fs.writeFileSync(path.join(ROOT,'test-results/subtree-bst-object-identities.json'),JSON.stringify({passed:true,reports},null,2));
  console.log(`PASS ${reports.length} BST/subtree cases: duplicate source identities, nulls, active p/q, pure previews, backwards seek and unchanged legacy reads.`);
}finally{await browser.close();}
