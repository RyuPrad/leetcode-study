import fs from 'node:fs';
import path from 'node:path';
import { collectCatalog, ROOT } from './content.mjs';
export function checkLessons(){
  const catalog=collectCatalog(),manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
  if(manifest.length!==catalog.visualizers.length||new Set(manifest.map(p=>p.id)).size!==manifest.length)throw new Error('Lesson coverage is incomplete or duplicated.');
  for(const entry of catalog.entries.filter(p=>p.visualizerPath)){
    const lesson=manifest.find(p=>p.id===entry.id),source=fs.readFileSync(path.join(ROOT,entry.visualizerPath),'utf8');
    if(!lesson||lesson.path!==entry.visualizerPath||lesson.why.length<40||!Object.keys(lesson.meanings).length||!lesson.entityClasses.length||!source.includes('window.studyLessonSource =')||!source.includes('../visualizer-ui/learning.js'))throw new Error(`Missing teaching metadata: ${entry.id}`);
  }
  return manifest.length;
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.join(ROOT,'scripts/check-lessons.mjs'))console.log(`Validated state adapters and teaching metadata for ${checkLessons()} lessons.`);
