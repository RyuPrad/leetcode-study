import fs from 'node:fs';
import { authored } from './author-guided-a.mjs';
const catalogue=JSON.parse(fs.readFileSync('visualizer-ui/lessons.json','utf8')).slice(0,125);
function syntax(code) {
  if(/\bheap\.pop\(/.test(code))return 'This min-heap pop removes the smallest value at the root, then restores the heap ordering. It is a custom heap operation.';
  if(/\bheap\.push\(/.test(code))return 'This min-heap push inserts a value and restores heap ordering so the smallest value stays at the root.';
  if(/\breturn\b/.test(code))return 'return sends this function\'s answer back to its caller.';
  if(/\.push\(/.test(code))return 'push appends one item to the end of an array; the existing items keep their order.';
  if(/\.pop\(/.test(code))return 'pop removes and returns the last array item. On a stack, this is the most recently pushed item.';
  if(/\.has\(/.test(code))return 'has asks whether a Set or Map already contains the supplied key and returns true or false.';
  if(/\.set\(|\.add\(/.test(code))return 'This collection update remembers a value for later steps; it does not restart the loop.';
  if(/\bif\b|===|!==|<=|>=/.test(code))return 'A comparison produces true or false; an if condition selects the matching branch.';
  if(/\bfor\b|\bwhile\b/.test(code))return 'The loop repeats its body while the condition remains true.';
  if(/\.next|\.left|\.right/.test(code))return 'A node property holds a reference to another node; changing that link changes the connections.';
  if(/\[/.test(code))return 'Square brackets access an array position; the first position is index 0. An assignment writes into the selected position.';
  if(/=/.test(code))return 'The right side of an assignment is evaluated first, and its result is stored in the name on the left.';
  return 'A function call performs the named operation with the values supplied inside its parentheses.';
}
// These are single visible objects or positions in the question's before-state.
// Deliberately omit answer choices for ranges, groups, null, and detached nodes.
const diagramAnswers = {
  21: {
    decision: [['node:0','List 1','Choose the head with value 1 in list 1'],['node:3','List 2','Choose the head with value 1 in list 2']],
    change: [['node:3','The 1 from list 2','Choose value 1 at the head of list 2'],['node:1','The 2 from list 1','Choose value 2 at the head of list 1']]
  },
  27: {change: [['cell:1','1','Choose array index 1 as the next write position'],['cell:0','0','Choose array index 0 as the next write position'],['cell:3','3','Choose array index 3 as the next write position']]},
  33: {result: [['cell:4','4','Choose index 4, containing the target value 0'],['cell:0','0','Choose index 0, containing value 4']]},
  35: {result: [['cell:2','2','Choose index 2, containing the target value 5'],['cell:3','3','Choose index 3, containing value 6']]},
  92: {decision: [['node:2','The first node of the selected section','Choose node 2, the first node in the reversal section'],['node:0','The dummy node','Choose the dummy node'],['node:5','The last node of the whole list','Choose node 5, the last node in the list']]},
  134: {
    change: [['cell:1','To station 1 with a fresh tank count','Choose station index 1 in the gas row'],['cell:0','Back to station 0 with the negative tank','Choose station index 0 in the gas row'],['cell:4','Directly to the final station without checking','Choose station index 4, the final station, in the gas row']],
    result: [['cell:3','3','Choose starting station index 3 in the gas row'],['cell:0','0','Choose starting station index 0 in the gas row']]
  },
  138: {
    change: [['node:5','To the mapped clone of node 7','Choose the copied node with value 7'],['node:0','To the original node 7','Choose the original node with value 7'],['node:7','To the next cloned node regardless of the original link','Choose the next copied node, with value 11']],
    result: [['node:5','The mapped copy of the original head','Choose the copied head with value 7'],['node:0','The original head','Choose the original head with value 7'],['node:9','The last copied node','Choose the last copied node, with value 1']]
  },
  211: {decision: [['trie-node:3','The d node at the end of bad','Choose the d node at the end of the path bad'],['trie-node:0','The root','Choose the trie root']]},
  235: {result: [['tnode:1','Node 2','Choose tree node 2'],['tnode:3','Node 6','Choose tree node 6'],['tnode:2','Node 4','Choose tree node 4']]}
};
const result=catalogue.filter(l=>authored.has(l.number)).map(spec=>{
  const content=authored.get(spec.number),trace=JSON.parse(fs.readFileSync(`.test-data/guided-authoring/${spec.number}.json`,'utf8'));
  const checkpoints=content.questions.map(([index,prompt,correct,wrong1,wrong2,reason],i)=>{
    const before=trace.steps[index-1],after=trace.steps[index];if(!before||!after)throw Error(`Missing ${spec.number}:${index}`);
    const position=(spec.number+i)%3,choices=[wrong1,wrong2];choices.splice(position,0,correct);
    const line=Number(trace.mode==='history'?before.line:after.line)||Number(after.line)||Number(before.line)||trace.code.find(l=>l.text.trim())?.line||1;
    const code=trace.code.find(l=>l.line===line)?.text.trim()||trace.code.find(l=>l.text.trim())?.text.trim()||'the highlighted operation';
    return {id:['decision','change','result'][i],beforeIndex:index-1,afterIndex:index,prompt,
      options:choices.map((text,j)=>({id:['a','b','c'][j],text,feedback:j===position?`Correct. ${reason}`:`Check your choice, "${text}", against this rule: ${spec.why}`})),correctOptionId:['a','b','c'][position],
      hints:[spec.why,reason],explanation:`${correct}. ${reason}`,basics:`Reference line ${line}: ${code} ${syntax(code)}`,codeLines:[line],
      before:[{path:'phase',value:before.phase},{path:'line',value:before.line},{path:'values',value:before.values}],
      after:[{path:'phase',value:after.phase},{path:'line',value:after.line},{path:'values',value:after.values}]};
  });
  for(let i=1;i<checkpoints.length;i++)if(checkpoints[i].beforeIndex<checkpoints[i-1].afterIndex)throw Error(`Overlapping ${spec.number}`);
  const out={id:spec.id,version:1,caseId:'guided-default',title:spec.title,intro:content.intro,concepts:content.concepts,expectedInput:trace.steps[0].values,checkpoints,recap:spec.why,commonMistake:content.mistake};
  if(spec.number===235)out.loader={functionName:'loadExample',args:[2]};
  if(spec.number===1){const cp=checkpoints[0];cp.targets=[{selector:'[data-study-key="cell:1"]',optionId:cp.correctOptionId,label:'Choose the value 7 at index 1'},{selector:'[data-study-key="cell:0"]',optionId:cp.options.find(o=>o.text==='2').id,label:'Choose the value 2 at index 0'}];}
  if(spec.number===143){const cp=checkpoints[1];cp.targets=[{selector:'[data-study-key="node:4"]',optionId:cp.correctOptionId,label:'Choose node 4'},{selector:'[data-study-key="node:1"]',optionId:cp.options.find(o=>o.text==='Node 2').id,label:'Choose node 2'},{selector:'[data-study-key="node:5"]',optionId:cp.options.find(o=>o.text==='Node 3').id,label:'Choose node 3'}];}
  for(const [id,answers] of Object.entries(diagramAnswers[spec.number]||{})){
    const cp=checkpoints.find(cp=>cp.id===id);
    cp.targets=answers.map(([key,answer,label])=>{
      const option=cp.options.find(o=>o.text===answer);
      if(!option||!trace.steps[cp.beforeIndex].targets.some(t=>t.key===key))throw Error(`Invalid diagram answer ${spec.number}:${id}:${key}`);
      return {selector:`[data-study-key="${key}"]`,optionId:option.id,label};
    });
    if(!cp.targets.some(t=>t.optionId===cp.correctOptionId))throw Error(`No correct visible target for ${spec.number}:${id}`);
  }
  return out;
});
fs.writeFileSync('visualizer-ui/guided-content-a.json',JSON.stringify(result,null,2)+'\n');
console.log(`Authored ${result.length} lessons, ${result.reduce((n,l)=>n+l.checkpoints.length,0)} checkpoints.`);
