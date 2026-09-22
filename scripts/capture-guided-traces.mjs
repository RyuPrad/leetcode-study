import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT} from './content.mjs';
const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8')).filter(l=>!process.argv[2]||process.argv.slice(2).includes(String(l.number)));
const out=path.join(ROOT,'.test-data/guided-authoring');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});let cursor=0;
async function worker(){const page=await browser.newPage({reducedMotion:'reduce'});while(cursor<lessons.length){const lesson=lessons[cursor++];
  await page.goto(pathToFileURL(path.join(ROOT,lesson.path)).href);
  if(lesson.number===235)await page.evaluate(()=>window.loadExample(2));
  const trace=await page.evaluate(()=>{
    document.getElementById('study-motion')?.click();
    const source=window.studyLessonSource,adapter=window.studyLessonAdapter,steps=[];
    const code=[...document.querySelectorAll('.code-line,.cl')].map((el,i)=>({line:Number(el.id.match(/\d+/)?.[0])||i+1,text:el.textContent}));
    const sample=()=>{
      const frame=adapter.snapshot(),objects=new Map(frame.objects.map(o=>[o.id,o]));
      function unpack(value,depth=0,seen=new Set()){
        if(!value||typeof value!=='object'||!('ref'in value))return value;
        if(seen.has(value.ref)||depth>=2)return value;const obj=objects.get(value.ref);if(!obj)return value;seen.add(value.ref);
        return {kind:obj.kind,size:obj.size,entries:obj.entries.slice(0,12).map(e=>[e.key,unpack(e.value,depth+1,new Set(seen))])};
      }
      const values=Object.fromEntries(frame.stack[0].variables.filter(v=>!['masterTrace','trace','history','steps','snapshots'].includes(v.name)).map(v=>[v.name,unpack(v.value)]));
      return {index:source.index(),phase:frame.phase,line:frame.location.line,action:frame.action,values,targets:[...document.querySelectorAll('[data-study-key]')].slice(0,40).map(el=>({key:el.dataset.studyKey,text:el.textContent?.trim().slice(0,100)}))};
    };
    steps.push(sample());let count=0;
    while(!document.getElementById('btn-next').disabled&&count++<2000){const before=source.index();adapter.next();if(source.index()===before)break;steps.push(sample());}
    return {code,steps,finished:document.getElementById('btn-next').disabled};
  });
  fs.writeFileSync(path.join(out,`${lesson.number}.json`),JSON.stringify({...lesson,...trace}));
  console.log(`${lesson.number}: ${trace.steps.length} states${trace.finished?'':' (not terminal)'}`);
}await page.close();}
try{await Promise.all(Array.from({length:4},worker));}finally{await browser.close();}
