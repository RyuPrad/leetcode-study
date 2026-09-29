// Compile explicit per-line rules from the reference JavaScript AST, never diagram colors.
// Read the current reference markup; no authored preset or rendered diagram
// can override an instruction location.
import fs from 'node:fs';
import {parse} from '@babel/parser';
import {escapeReferenceText} from './normalize-reference-code.mjs';
const lessons=JSON.parse(fs.readFileSync('visualizer-ui/lessons.json','utf8'));
const labels={read:['Read the selected value','Read without changing the source'],lookup:['Look at the collection and the requested key','Check membership without adding an entry'],compare:['Look at the values being compared','Evaluate the condition'],calculate:['Look at the inputs to this calculation','Calculate the expression'],write:['Look at the destination','Store the new value'],copy:['Look at the source and destination','Copy the value; keep the source'],swap:['Look at the two positions','Exchange the selected values'],remove:['Look at the item being removed','Remove the selected entry'],pointer:['Look at the node and its reference','Update the reference'],call:['Look at the function and its arguments','Run this call'],return:['Look at the function result','Return this value to the caller'],control:['Look at the highlighted instruction','Continue this part of the algorithm']};
const output=lessons.map(spec=>{
 const html=escapeReferenceText(fs.readFileSync(spec.path,'utf8'));
 const decode=text=>text.replace(/&(?:lt|gt|amp|quot|apos|nbsp|#\d+|#x[\da-f]+);/gi,entity=>{
  const names={'&lt;':'<','&gt;':'>','&amp;':'&','&quot;':'"','&apos;':"'",'&nbsp;':' '};
  if(names[entity])return names[entity];
  return String.fromCodePoint(entity[2].toLowerCase()==='x'?parseInt(entity.slice(3,-1),16):parseInt(entity.slice(2,-1),10));
 });
 const code=[...html.matchAll(/<div([^>]*class=["'][^"']*\b(?:code-line|cl)\b[^"']*["'][^>]*)>([\s\S]*?)<\/div>/g)].map((match,index)=>({line:Number(match[1].match(/\bid=["'](?:line-|l)?(\d+)/)?.[1])||index+1,text:decode(match[2].replace(/<[^>]*>/g,''))}));
 if(!code.length)throw Error(`Missing reference code: ${spec.number}`);
 const trace={code};
 const source=trace.code.map(c=>c.text).join('\n'),ast=parse(source,{sourceType:'script',allowReturnOutsideFunction:true});
 const candidates=new Map();
 function add(n,kind,priority){const line=trace.code[n.loc.start.line-1]?.line;if(!line)return;const old=candidates.get(line);if(!old||priority>old.priority){const names=new Set();function namesIn(node){if(!node||typeof node!=='object')return;if(node.type==='Identifier')names.add(node.name);for(const [key,v]of Object.entries(node))if(!['loc','start','end','extra','body','consequent','alternate'].includes(key)){if(Array.isArray(v))v.forEach(namesIn);else if(v&&typeof v==='object')namesIn(v);}}namesIn(n);candidates.set(line,{kind,priority,text:source.slice(n.start,n.end).split('\n')[0].slice(0,170),inputs:[...names]});}}
 function walk(n){if(!n||typeof n!=='object')return;
  if(n.type==='ReturnStatement')add(n,'return',9);
  else if(['IfStatement','WhileStatement','DoWhileStatement','ForStatement'].includes(n.type))add(n,'compare',8);
  else if(['ForOfStatement','ForInStatement'].includes(n.type))add(n,'read',8);
  else if(n.type==='AssignmentExpression'||n.type==='UpdateExpression'){
   const left=n.left||n.argument;let kind=left.type==='ArrayPattern'?'swap':left.type==='MemberExpression'&&!left.computed&&['next','left','right','parent'].includes(left.property.name)?'pointer':n.right?.type==='MemberExpression'?'copy':'write';add(n,kind,7);
  }else if(n.type==='VariableDeclaration')add(n,'calculate',2);
  else if(n.type==='CallExpression'){
   const c=n.callee;const method=c.type==='MemberExpression'&&!c.computed?c.property.name:'';
   const kind=['has','includes'].includes(method)?'lookup':method==='get'?'read':['set','add','push','unshift'].includes(method)?'write':['delete','pop','shift','clear'].includes(method)?'remove':method==='swap'?'swap':'call';add(n,kind,method?10:3);
  }else if(n.type==='MemberExpression')add(n,'read',1);
  for(const [key,value]of Object.entries(n))if(!['loc','start','end','extra'].includes(key)){if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);}
 }
 walk(ast.program);
 const lines=Object.fromEntries(trace.code.filter(c=>c.text.trim()).map(c=>{const rule=candidates.get(c.line)||{kind:'control',text:c.text.trim(),inputs:[]};const [focus,action]=labels[rule.kind];return[c.line,{kind:rule.kind,code:c.text.trim(),focus,action,inputs:rule.inputs}];}));
 // Phase names describe diagram states. They cannot identify the instruction
 // that ran: branches and recursive calls can reuse the same phase.
 // The source's captured executedLine / pendingInstruction owns that location.
 return {id:spec.id,mode:spec.mode,lines,phases:{}};
});
fs.writeFileSync('visualizer-ui/operations.json',JSON.stringify(output,null,2)+'\n');
console.log(`Compiled per-line operation descriptions for ${output.length} lessons; instruction locations come from their sources.`);
