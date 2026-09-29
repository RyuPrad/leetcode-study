import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {ROOT} from '../scripts/content.mjs';
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
const browser=await chromium.launch({headless:true});const failures=[],screenshots=new Set([1,21,70,94,133,208,46,155,56,191,752]);let count=0,cursor=0;
async function worker(){const page=await browser.newPage({viewport:{width:1360,height:940},reducedMotion:'reduce'});while(cursor<manifest.length){const lesson=manifest[cursor++],errors=[];const onError=error=>errors.push(error.message);page.on('pageerror',onError);try{
  await page.goto(pathToFileURL(path.join(ROOT,lesson.path)).href);
  const result=await page.evaluate(async()=>{
    const source=window.studyLessonSource,adapter=window.studyLessonAdapter;
    const state=()=>{const {objects,stack}=adapter.snapshot();return JSON.stringify({objects,stack});};
    if(!adapter||!source)throw Error('Missing lesson adapter');const initial=state();
    for(let i=0;i<6&&!document.getElementById('btn-next').disabled;i++)adapter.next();
    const index=source.index(),forward=state();await adapter.seek(0);const restarted=state();await adapter.seek(index);const sought=state();
    const changes=adapter.snapshot().changes.length;
    if(source.spec.mode==='precomputed')await adapter.seek(source.count()-1);
    const complete=source.spec.mode!=='precomputed'||document.getElementById('btn-next').disabled;
    await adapter.seek(index);
    let entities=document.querySelectorAll('[data-study-key]').length;
    // Empty caches have no entries until their first put commits.
    if(!entities&&[146,460].includes(source.spec.number)){
      for(let i=0;i<100&&!document.getElementById('btn-next').disabled&&!entities;i++){adapter.next();entities=document.querySelectorAll('[data-study-key]').length;}
      await adapter.seek(index);
    }
    return {sameInitial:initial===restarted,sameForward:forward===sought,index,complete,changes,notes:document.querySelector('.study-why p')?.textContent,entities,overflow:document.documentElement.scrollWidth>innerWidth+1};
  });
  assert.ok(result.sameInitial,'seeking to the beginning restores actual state');assert.ok(result.sameForward,'seeking forward restores the same state');assert.ok(result.complete,'final seek reaches completion');assert.equal(result.notes,lesson.why);assert.equal(result.overflow,false,'workspace fits viewport');assert.ok(result.entities>0||lesson.number===2013,'diagram entities are identified');assert.deepEqual(errors,[]);
  if(screenshots.has(lesson.number)){await page.locator('.study-view-tools').getByRole('button',{name:'Fit',exact:true}).click();await page.screenshot({path:path.join(ROOT,`test-results/lesson-${lesson.number}.png`)});await page.getByRole('button',{name:'Focus diagram',exact:true}).click();assert.ok(await page.locator('.study-code').isHidden());await page.getByRole('button',{name:'Show code',exact:true}).click();}
  if([94,144,145].includes(lesson.number)){
    const expected=lesson.number===94?[1,3,2]:lesson.number===144?[1,2,3]:[3,2,1];
    const actual=await page.evaluate(()=>{const source=window.studyLessonSource;source.jump(source.count()-1);return [...document.querySelectorAll('#trace-ui tbody tr')].map(row=>row.lastElementChild.textContent.trim());});
    assert.deepEqual(actual,expected.map((_,i)=>`[${expected.slice(0,i+1).join(', ')}]`),'traversal trace contains each visit once');
  }
}catch(error){failures.push({number:lesson.number,error:String(error)});}finally{page.off('pageerror',onError);}count++;if(count%25===0)console.log(`Teaching checks ${count}/250, ${failures.length} failures`);}await page.close();}
try{await Promise.all(Array.from({length:4},worker));}finally{await browser.close();}
fs.writeFileSync(path.join(ROOT,'test-results/lessons.json'),JSON.stringify({count,failures},null,2));console.log(JSON.stringify({count,failures},null,2));if(failures.length)process.exitCode=1;
