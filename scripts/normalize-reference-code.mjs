import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from './content.mjs';

// Preserve authored syntax coloring while keeping JavaScript comparisons out
// of the HTML parser. This also makes reference extraction deterministic.
export function escapeReferenceText(html){
  return html.replace(/(<div[^>]*class=["'][^"']*\b(?:code-line|cl)\b[^"']*["'][^>]*>)([\s\S]*?)(<\/div>)/g,(_,open,body,close)=>{
    const parts=body.split(/(<\/?(?:span|b|i|em|strong|code)\b[^>]*>|<br\s*\/?>)/gi);
    return open+parts.map((part,index)=>index%2?part:part.replace(/</g,'&lt;').replace(/>/g,'&gt;')).join('')+close;
  });
}

if(process.argv[1]&&path.resolve(process.argv[1])===path.join(ROOT,'scripts/normalize-reference-code.mjs')){
  const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
  let changed=0;
  for(const lesson of lessons){
    const file=path.join(ROOT,lesson.path),before=fs.readFileSync(file,'utf8'),after=escapeReferenceText(before);
    if(after!==before){fs.writeFileSync(file,after);changed++;}
  }
  console.log(`Escaped JavaScript reference text in ${changed} visualizers; preserved their syntax-color spans.`);
}
