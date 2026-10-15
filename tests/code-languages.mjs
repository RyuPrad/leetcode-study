import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';
import{workers}from'../scripts/workers.mjs';
import {buildCodeLanguages} from '../scripts/code-maps.mjs';
import {guidedLessons} from '../scripts/check-guided.mjs';
// Every visualizer, stepped to the end, in TypeScript, Java and C: each highlight on the
// JavaScript reference must appear on exactly the mapped lines of the chosen language.
if(process.env.STUDY_SKIP_GENERATE!=='1')buildCodeLanguages();
const only=process.argv.slice(2).map(Number),lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8')).filter(l=>!only.length||only.includes(l.number));
const guided=new Map(guidedLessons().map(l=>[l.id,l.checkpoints]));
const browser=await chromium.launch({headless:true}),failures=[];let cursor=0,checked=0,steps=0;const unmapped={typescript:0,java:0,c:0};
async function worker(){const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});while(cursor<lessons.length){const lesson=lessons[cursor++],errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);try{
 await page.goto(pathToFileURL(path.join(ROOT,lesson.path)).href+'?codeLanguage=java',{timeout:90000});await page.waitForFunction(()=>window.studyWalkthrough&&window.studyCodeLanguage);
 const result=await page.evaluate(async checkpoints=>{
  const languages=['typescript','java','c'],classes=['active','operation-code','guided-code-focus'],api=window.studyCodeLanguage,a=studyLessonAdapter,s=studyLessonSource,panel=document.querySelector('.study-code');
  const original=panel.querySelector('.study-code-original'),mirror=panel.querySelector('.study-code-mirror'),rows=[...original.querySelectorAll('.code-line,.cl')].filter(el=>/^(?:line-|l)\d+$/.test(el.id));
  if(api.language!=='java'||getComputedStyle(original).display!=='none'||getComputedStyle(mirror).display!=='block')throw Error('The codeLanguage parameter does not open the Java reference.');
  const lineOf=el=>Number(el.id.match(/\d+/)[0]),missing={typescript:0,java:0,c:0};
  // Explain-the-code text names the chosen language's lines whenever the quoted lines are mapped.
  for(const language of languages){api.set(language);for(const cp of checkpoints){const view=api.basics(cp);if(api.lines(cp.codeLines).length&&!view)throw Error(`Checkpoint ${cp.id} keeps JavaScript in ${language}.`);if(view&&!view.text.startsWith(view.label))throw Error(`Checkpoint ${cp.id} has an unlabelled ${language} quote.`);}}
  async function check(){
   for(const language of languages){
    api.set(language);await null;
    for(const cls of classes){
     const lit=rows.filter(el=>el.classList.contains(cls)).map(lineOf),want=api.lines(lit),got=[...mirror.querySelectorAll('.study-mirror-line.'+cls)].map(el=>Number(el.dataset.line));
     if(JSON.stringify(want)!==JSON.stringify(got))throw Error(`${language} ${cls} at step ${s.index()}: JavaScript ${lit} should light ${want}, lit ${got}`);
     if(cls==='active'&&lit.length&&!want.length)missing[language]++;
    }
    const op=studyWalkthrough.operation,shown=document.querySelector('.operation-expression')?.textContent;
    if(op&&shown!==undefined){const lines=api.lines(op.locations||[op.location.line]);if(lines.length&&shown!==api.expression(op.locations||[op.location.line],op.code))throw Error(`${language} walkthrough code at step ${s.index()} is "${shown}"`);}
   }
  }
  let count=0;await check();
  while(!document.getElementById('btn-next').disabled&&count<(s.count()??50000)){const prior=s.index();a.next();if(s.index()===prior)throw Error('No progress');count++;await check();if(count%25===0)await new Promise(r=>setTimeout(r,0));}
  api.set('javascript');await null;
  if(getComputedStyle(original).display==='none'||getComputedStyle(mirror).display!=='none')throw Error('JavaScript does not restore the original reference.');
  return {count,missing,complete:document.getElementById('btn-next').disabled};
 },guided.get(`leetcode:${lesson.number}`)??[]);
 assert.ok(result.complete,'whole visualizer reaches completion');assert.deepEqual(errors,[]);steps+=result.count;for(const l in unmapped)unmapped[l]+=result.missing[l];checked++;
 }catch(error){failures.push({number:lesson.number,error:String(error)});console.log('FAIL',lesson.number,String(error));}finally{page.off('pageerror',onError);}if((checked+failures.length)%25===0)console.log(`Code languages ${checked+failures.length}/${lessons.length}`);}await page.close();}
try{await Promise.all(Array.from({length:workers()},worker));}finally{await browser.close();}
// Steps whose JavaScript line has no counterpart (recorded as 0 in code-maps.json) show no highlight.
const result={visualizers:checked,steps,unmappedActiveSteps:unmapped,failures};fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});fs.writeFileSync(path.join(ROOT,'test-results/code-languages.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(failures.length)process.exitCode=1;
