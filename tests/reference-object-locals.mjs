import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';

const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
const browser=await chromium.launch(),reports=[];
try{
  const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  for(const number of [105,110,543,332,417,1046,2402,72,115]){
    await page.goto(pathToFileURL(path.join(ROOT,lessons.find(lesson=>lesson.number===number).path)).href);
    await page.waitForFunction(()=>window.studyLessonAdapter);
    const inputs=[null,...([72,115].includes(number)?[' | abc','abc | ',' | ']:[])];
    for(const input of inputs){
      if(input!==null)await page.evaluate(input=>{document.getElementById('custom-input').value=input;loadCustom();},input);
      reports.push(await page.evaluate(({number,input})=>{
        const source=studyLessonSource,live=JSON.stringify(StudyObjectView.capture(source.read())),start=source.index();
        const get=(frame,name)=>frame.stack.flatMap(call=>call.variables).find(variable=>variable.name===name)?.value;
        const object=(frame,value)=>frame.objects.find(object=>object.id===value?.ref);
        const field=(frame,value,key)=>object(frame,value)?.entries.find(entry=>entry.key===key)?.value;
        const check=(condition,message)=>{if(!condition)throw Error(`${number}: ${message}`);};
        let active=0,returned=0;let stoneIndex=-1,stoneValue;
        for(let index=0;index<source.count();index++){
          const raw=source.readAt(index),frame=source.objectFrame(index),line=raw.executedLine;
          check(!Object.hasOwn(raw,'objectLocals')&&!Object.hasOwn(raw,'objectOmit'),'supplemental captures changed lesson reads');
          check(JSON.stringify(frame)===JSON.stringify(source.objectFrame(index)),'repeated pure object reads differ');
          for(const variable of frame.stack.flatMap(call=>call.variables))check(variable.value?.special!=='not recorded at this checkpoint',`uncaptured ${variable.name} at ${index}`);
          if(number===110||number===543){
            if(raw.stack.length){
              const node=get(frame,'node');check(raw.currentId===null?node===null:node?.ref===`tree:${raw.currentId}`,'current recursive argument has its exact identity');
              if([4,5].includes(line)){check(get(frame,'left')?.special==='not initialized'&&get(frame,'right')?.special==='not initialized','child bindings initialized before recursion returned');}
              if(line===6){check(typeof get(frame,'left')==='number'&&get(frame,'right')?.special==='not initialized','left return and pending right call are distinct');returned++;}
              if([7,8].includes(line)){check(typeof get(frame,'left')==='number'&&typeof get(frame,'right')==='number','both returned child depths must be numbers');active++;}
            }else for(const name of ['node','left','right'])check(get(frame,name)===undefined,`${name} remains after recursive scope exited`);
          }else if(number===105){
            if(['newnode','findmid','recurleft','recurright','return'].includes(raw.phase)){check(get(frame,'root')?.ref===`tree:${raw.rootNowId}`,'new detached subtree local lost allocation identity');active++;}
            if(raw.phase==='rootval')check(get(frame,'root')?.special==='not initialized','tree node allocated before its instruction');
          }else if(number===332){
            if(raw.phase==='build'&&raw.airport!==null){check(get(frame,'from')===raw.airport&&typeof get(frame,'to')==='string','ticket destructuring must retain its active pair');active++;}
            const dests=get(frame,'dests'),adj=object(frame,get(frame,'adj'));
            if(dests){const entry=adj.entries.find(entry=>entry.value?.ref===dests.ref);check(entry||object(frame,dests)?.entries.length===0,'dests must alias its actual adjacency list');returned++;}
            if(raw.phase==='enter'&&line===6)check(dests===undefined,'dests exists before its declaration');
            if(raw.phase==='shift')check(get(frame,'next')===raw.next,'shift result has wrong airport');
          }else if(number===417){
            if(raw.phase==='dfs'){
              check(get(frame,'r')===raw.cur[0]&&get(frame,'c')===raw.cur[1],'DFS coordinates differ from the active call');
              const prev=get(frame,'prev');check(typeof prev==='number'||prev?.special==='-Infinity','previous height is missing or a presentation string');
              check(get(frame,'ocean')?.ref===get(frame,raw.ocean)?.ref,'ocean parameter lost matrix alias');active++;
              if(line===11){check(Number.isInteger(get(frame,'dr'))&&Number.isInteger(get(frame,'dc')),'active direction tuple missing');returned++;}
            }else for(const name of ['prev','dr','dc','ocean'])check(get(frame,name)===undefined,`${name} remains outside DFS scope`);
          }else if(number===1046){
            if(raw.narration==='Read the next stone.'){stoneValue=raw.stones?.[++stoneIndex];check(get(frame,'s')===stoneValue,'heap-build iterator lost stone value');active++;}
            if(raw.phaseTag==='smash'||raw.phaseTag==='done')check(get(frame,'s')===undefined,'heap-build iterator remains after loop');
          }else if(number===2402){
            if(raw.meetingIdx>=0){const meeting=raw.meetings[raw.meetingIdx];check(get(frame,'start')===meeting[0]&&get(frame,'end')===meeting[1],'active meeting tuple differs');}
            if(line===11){check(typeof get(frame,'room')==='number','freed room binding missing');active++;}
            if(line===23){const room=get(frame,'room'),free=get(frame,'freeTime'),start=get(frame,'start'),end=get(frame,'end');check(typeof free==='number'&&raw.busy.some(entry=>entry[1]===room&&entry[0]===free+end-start),'delayed room lost its release time');returned++;}
            if(line===28){check(Number.isInteger(get(frame,'r'))&&get(frame,'r')>=1,'final room scan counter missing');active++;}
            if(line===30)for(const name of ['start','end','room','freeTime','r'])check(get(frame,name)===undefined,`${name} remains after loop scope`);
          }else if(number===72||number===115){
            const first=number===72?raw.word1:raw.s,second=number===72?raw.word2:raw.t;
            check(get(frame,'m')===first.length&&get(frame,'n')===second.length,'empty input length is incorrect');active++;
          }
        }
        check(JSON.stringify(StudyObjectView.capture(source.read()))===live&&source.index()===start,'pure previews changed the live lesson');
        check(active>0,'no active semantic states checked');
        return {number,input,checkpoints:source.count(),active,returned};
      },{number,input}));
    }
  }
  assert.deepEqual(errors,[]);await page.close();
  fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
  fs.writeFileSync(path.join(ROOT,'test-results/reference-object-locals.json'),JSON.stringify({passed:true,reports},null,2));
  console.log(`PASS ${reports.length} reference cases: exact recursive returns, iterator scopes, collection aliases and empty strings.`);
}finally{await browser.close();}
