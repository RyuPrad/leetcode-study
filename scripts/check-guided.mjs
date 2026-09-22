import fs from 'node:fs';
import path from 'node:path';
import {collectCatalog,ROOT} from './content.mjs';
import '../visualizer-ui/guided-core.js';

export function guidedLessons(root=ROOT){return ['a','b'].flatMap(shard=>JSON.parse(fs.readFileSync(path.join(root,`visualizer-ui/guided-content-${shard}.json`),'utf8'))).sort((a,b)=>Number(a.id.split(':')[1])-Number(b.id.split(':')[1]));}
export function checkGuided(root=ROOT){
  const lessons=guidedLessons(root),catalog=collectCatalog(root),entries=catalog.entries.filter(e=>e.visualizerPath);
  if(lessons.length!==250||entries.length!==lessons.length||new Set(lessons.map(l=>l.id)).size!==lessons.length)throw Error('Guided lessons must cover all 250 visualizers exactly once.');
  for(const lesson of lessons){
    const fail=reason=>{throw Error(`${lesson.id}: ${reason}`);},entry=entries.find(e=>e.id===lesson.id);
    if(!entry||!Number.isSafeInteger(lesson.version)||lesson.version<1||lesson.version>1000000||lesson.caseId!=='guided-default'||!lesson.expectedInput||lesson.checkpoints.length!==3)fail('Invalid lesson contract.');
    for(const key of ['intro','recap','commonMistake'])if(typeof lesson[key]!=='string'||lesson[key].length<20)fail(`Missing ${key}.`);
    if(!lesson.concepts.length||lesson.concepts.some(key=>!globalThis.StudyGuided.glossary[key]))fail('Unknown beginner concept.');
    if(lesson.loader&&(!/^load(?:Example|Ex)$/.test(lesson.loader.functionName)||!Array.isArray(lesson.loader.args)))fail('Invalid fixed example loader.');
    const html=fs.readFileSync(path.join(root,entry.visualizerPath),'utf8');if(!html.includes('../visualizer-ui/guided.js'))fail('Missing controller attachment.');
    let end=0;const ids=new Set();
    for(const cp of lesson.checkpoints){
      if(ids.has(cp.id)||!cp.id||!Number.isInteger(cp.beforeIndex)||!Number.isInteger(cp.afterIndex)||cp.beforeIndex<end||cp.afterIndex<=cp.beforeIndex)fail('Unordered or invalid checkpoints.');ids.add(cp.id);end=cp.afterIndex;
      for(const key of ['prompt','explanation','basics'])if(typeof cp[key]!=='string'||cp[key].length<15)fail(`${cp.id}: missing ${key}.`);
      if(cp.options.length!==3||new Set(cp.options.map(o=>o.id)).size!==3||new Set(cp.options.map(o=>o.text)).size!==3||!cp.options.some(o=>o.id===cp.correctOptionId)||cp.options.some(o=>!o.text||!o.feedback))fail(`${cp.id}: invalid choices.`);
      if(cp.hints.length!==2||cp.hints.some(h=>typeof h!=='string'||h.trim().length<4)||new Set(cp.hints).size!==2)fail(`${cp.id}: missing progressive hints.`);
      if(!cp.codeLines.length||cp.codeLines.some(n=>!Number.isInteger(n)||n<1))fail(`${cp.id}: invalid code lines.`);
      for(const side of ['before','after'])if(!Array.isArray(cp[side])||!cp[side].length||cp[side].some(a=>typeof a.path!=='string'||!a.path||!Object.hasOwn(a,'value')))fail(`${cp.id}: missing ${side} assertions.`);
      if(cp.targets?.some(t=>!t.selector||!t.label||!cp.options.some(o=>o.id===t.optionId)))fail(`${cp.id}: invalid diagram answer.`);
    }
  }
  return lessons;
}
export function buildGuided(root=ROOT){
  const lessons=checkGuided(root);fs.mkdirSync(path.join(root,'dist/content'),{recursive:true});
  fs.writeFileSync(path.join(root,'dist/content/guided-lessons.json'),JSON.stringify(lessons));
  fs.writeFileSync(path.join(root,'visualizer-ui/guided-lessons.js'),`/* Generated from authored guided content. */\nwindow.studyGuidedLessons = ${JSON.stringify(lessons)};\n`);
  return lessons.length;
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.join(ROOT,'scripts/check-guided.mjs'))console.log(`Validated ${process.argv.includes('--build')?buildGuided():checkGuided().length} guided lessons and 750 checkpoints.`);
