// Compile explicit per-line rules from the reference JavaScript AST, never diagram colors.
// Inputs are produced by capture-guided-traces.mjs; the output is checked in and validated at build time.
import fs from 'node:fs';
import {parse} from '@babel/parser';
const lessons=JSON.parse(fs.readFileSync('visualizer-ui/lessons.json','utf8'));
const labels={read:['Read the selected value','Read without changing the source'],lookup:['Look at the collection and the requested key','Check membership without adding an entry'],compare:['Look at the values being compared','Evaluate the condition'],calculate:['Look at the inputs to this calculation','Calculate the expression'],write:['Look at the destination','Store the new value'],copy:['Look at the source and destination','Copy the value; keep the source'],swap:['Look at the two positions','Exchange the selected values'],remove:['Look at the item being removed','Remove the selected entry'],pointer:['Look at the node and its reference','Update the reference'],call:['Look at the function and its arguments','Run this call'],return:['Look at the function result','Return this value to the caller'],control:['Look at the highlighted instruction','Continue this part of the algorithm']};
const output=lessons.map(spec=>{
 const trace=JSON.parse(fs.readFileSync(`.test-data/guided-authoring/${spec.number}.json`,'utf8'));
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
 const phases=Object.fromEntries(trace.steps.map(s=>[s.phase,s.line]));
 // The WRITE phase for Remove Duplicates includes both left++ and the array copy.
 // Feature the copy itself in the operation trace so the in-place write is visible.
 if(spec.number===26)phases.WRITE=7;
 return {id:spec.id,mode:spec.mode,lines,phases};
});
fs.writeFileSync('visualizer-ui/operations.json',JSON.stringify(output,null,2)+'\n');
console.log(`Compiled operation rules for ${output.length} lessons.`);
