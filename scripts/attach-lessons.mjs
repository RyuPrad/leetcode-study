import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import { collectCatalog, ROOT } from './content.mjs';
const catalog=collectCatalog();
const notes=new Map(fs.readFileSync(path.join(ROOT,'visualizer-ui/lesson-notes.txt'),'utf8').trim().split(/\r?\n/).map(line=>{const split=line.indexOf('|');return [Number(line.slice(0,split)),line.slice(split+1)];}));
const excluded=/^(?:drag|startX|startY|startLeft|startTop|offset|isDragging|dragging|fl$|dh$|ds$|pinned$|examples?$|EXAMPLES$|randomPools$|trace|history|hist$|steps$|snapshots$|autoTimer$|State$|memoryLabels$|cycleNesting$|objMode$|labelMode$|layoutMode$|activeExample$)/;
const manifest=[];
for(const entry of catalog.entries.filter(e=>e.visualizerPath)){
  const file=path.join(ROOT,entry.visualizerPath);let source=fs.readFileSync(file,'utf8');
  const existingBridge=source.match(/\/\/ STUDY LESSON BRIDGE START[\s\S]*?\/\/ STUDY LESSON BRIDGE END/)?.[0];
  source=source.replace(/\s*\/\/ STUDY LESSON BRIDGE START[\s\S]*?\/\/ STUDY LESSON BRIDGE END\s*/,'\n');
  const scripts=[...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].filter(m=>m[1].trim());const script=scripts.at(-1);
  if(!script)throw new Error(`Missing algorithm script: ${file}`);
  const ast=parse(script[1]),vars=ast.program.body.filter(n=>n.type==='VariableDeclaration').flatMap(n=>n.declarations.filter(d=>d.id.type==='Identifier').map(d=>d.id.name));
  const index=['stepIndex','currentStep','idx'].find(name=>vars.includes(name));
  const collection=vars.includes('steps')?'steps':vars.includes('snapshots')?'snapshots':null;
  const history=['historyStack','history','hist'].find(name=>vars.includes(name));
  if(!notes.has(entry.number)||(!index||!collection)&&!history)throw new Error(`Missing lesson contract: ${entry.number}`);
  const meanings=Object.fromEntries([...entry.markdown.matchAll(/^\|\s*`?([^|`]+?)`?\s*\|\s*([^|]+)\s*\|/gm)].filter(m=>!/^Name$|^-+$/.test(m[1].trim())).map(m=>[m[1].trim(),m[2].trim()]));
  const classes=[...new Set([...source.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m=>m[1]).filter(name=>/(?:cell|node|pill|bar|digit|char|tile|bucket|slot|balloon|interval|room|stick|coin|frame|stair|num-box|reg$|asteroid|^car$|item$|chip$|^bit$|sim-pkg|day-box|count-box)/i.test(name)&&!/(?:^|-)(?:wrap|wrapper|row|stage|label|caption|content|group|canvas|legend|summary|container|board|value|text|id|edge|line|arrow|panel|header|title|ptr|memory|empty|grid|list|heap|chart)$/.test(name)))];
  const spec={number:entry.number,title:entry.title,topic:entry.topic,why:notes.get(entry.number),meanings,entityClasses:classes,entitySelectors:entry.number===2013?['circle']:[],mode:collection?'precomputed':'history'};
  if([51,52].includes(entry.number)&&!spec.entityClasses.includes('sq'))spec.entityClasses.push('sq');
  const selected=vars.filter(name=>!excluded.test(name)&&!['stepIndex','idx','currentStep'].includes(name));
  const renderWithState=ast.program.body.some(n=>n.type==='FunctionDeclaration'&&n.id?.name==='render'&&n.params.length>0);
  const current=entry.number===752?'currentStep()':collection?`${collection}[${index}] || {}`:'{}';
  const generatedBridge=`\n    // STUDY LESSON BRIDGE START\n    window.studyLessonSource = {\n      spec: ${JSON.stringify(spec)},\n      index: () => ${collection?index:`${history}.length`},\n      count: () => ${collection?`${collection}.length`:'null'},\n      read: () => ({${selected.join(', ')}, ...(${current})}),\n      ${collection?`readAt: (studySnapshotIndex) => ({${selected.join(', ')}, ...(${entry.number===752?'viewOf(steps[studySnapshotIndex])':`${collection}[studySnapshotIndex] || {}`})}),`:"pendingInstruction, preview,"}\n      phases: () => ${collection?`${collection}.map((s, i) => ({ index: i, phase: String([s.phase,s.execState,s.state,s.kind,s.action,s.stage,s.type].find(value=>typeof value==='string'&&value.length>0) || (s.executedLine ? 'Line '+s.executedLine : 'Ready')) }))`:'[]'},\n      ${collection?`jump: (index) => { ${index} = Math.max(0, Math.min(${collection}.length - 1, index)); render(${renderWithState?`${collection}[${index}]`:""}); },`:''}\n    };\n    // STUDY LESSON BRIDGE END\n`;
  // Keep reviewed instruction selectors, snapshot projections and pointer aliases.
  const bridge=existingBridge?'\n    '+existingBridge.replace(/spec: [^\r\n]+/,()=>`spec: ${JSON.stringify(spec)},`)+'\n':generatedBridge;
  const end=script.index+script[0].lastIndexOf('</script>');source=source.slice(0,end)+bridge+source.slice(end);
  if(!source.includes('../visualizer-ui/learning.js'))source=source.replace('<script defer src="../visualizer-ui/workspace.js"></script>','<script defer src="../visualizer-ui/workspace.js"></script>\n  <link rel="stylesheet" href="../visualizer-ui/learning.css" />\n  <script defer src="../visualizer-ui/learning.js"></script>');
  fs.writeFileSync(file,source);
  manifest.push({id:entry.id,path:entry.visualizerPath,...spec});
}
fs.writeFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),JSON.stringify(manifest,null,2));
console.log(`Attached explicit state adapters and teaching notes to ${manifest.length} lessons.`);
