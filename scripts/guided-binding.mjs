// Binds reviewed Guided prediction rows to a captured reference trace. This is the checkpoint
// binding of the retired scripts/author-guided-b.mjs, unchanged, minus that writer's shard B
// target plans and explanation corrections. It only binds assertions and code references; it
// never invents a question or an answer. Each row is: revealed trace index, question, answer,
// distractor~feedback, distractor~feedback, gentle hint, concrete hint.
const topicConcepts={
 'Array & Hashing':['indexing','maps','loops'], 'Sliding Window':['indexing','comparison','loops'],
 'Intervals':['comparison','loops','assignment'], 'Graphs':['references','sets','queue'],
 'Advanced Graphs':['references','heap','queue'], 'Bit Manipulation':['bits','assignment','loops'],
 '1-D Dynamic Programming':['indexing','assignment','loops'], '2-D Dynamic Programming':['indexing','assignment','loops'],
 'LinkedList':['references','assignment','loops'], 'Heap':['heap','comparison','loops'],
 'Trees':['references','recursion','functions'], 'Two Pointers':['indexing','comparison','loops'],
 'Binary Search':['indexing','comparison','loops'], 'Stack':['stack','assignment','loops'],
 'Backtracking':['recursion','assignment','comparison'], 'Greedy':['comparison','assignment','loops'],
 'Math & Geometry':['indexing','assignment','loops'], 'Tries':['references','maps','loops'],
 'BST':['references','comparison','loops'], 'Queue':['queue','comparison','loops']
};
function codeHelp(trace, after, before){
 const line=trace.code.find(c=>c.line===after.line&&c.text.trim())||trace.code.find(c=>c.line===before.line&&c.text.trim())||trace.code.find(c=>c.text.trim());
 const text=line.text.trim();
 let help='A statement performs the operation on the highlighted reference line before execution moves on.';
 if(/return\b/.test(text))help='return sends a value back to the function\'s caller and finishes this call.';
 else if(/\bif\s*\(|\bwhile\s*\(/.test(text))help='The condition inside parentheses is checked as true or false; it decides whether the following block runs.';
 else if(/\bfor\s*\(/.test(text))help='A for loop repeats its body, using its condition and index update to move through the input.';
 else if(/\.push\(/.test(text))help='push adds an item at the end of an array; that end also acts as the top when the array is used as a stack.';
 else if(/\.pop\(/.test(text))help='pop removes and returns the last item of an array, which is the stack top.';
 else if(/Math\.max/.test(text))help='Math.max chooses the largest candidate; assigning it keeps the best value found so far.';
 else if(/Math\.min/.test(text))help='Math.min chooses the smallest candidate; assigning it keeps the least cost found so far.';
 else if(/\bnew Map|\.get\(|\.set\(/.test(text))help='A Map associates keys with values. get reads a key\'s value and set stores or replaces it.';
 else if(/\bnew Set|\.has\(/.test(text))help='has checks membership without adding another copy; a Set stores each distinct member once.';
 else if(/\^|>>|<<|\s&\s/.test(text))help='Bitwise operators work on binary columns: XOR keeps differing bits, AND keeps shared bits, and shifts move bit positions.';
 else if(/\[[^\]]+\]/.test(text))help='Square brackets select a position or property. Array positions start at zero; nested brackets select a row and then a column.';
 else if(/\+\+|--|[+*-]=/.test(text))help='An update changes the existing value: ++ adds one, -- subtracts one, and += adds the right-hand amount.';
 else if(/\bconst\b|\blet\b|=/.test(text))help='An assignment stores the right-hand value under the name on the left. let allows reassignment; const keeps that binding fixed.';
 // The reference solutions define their own Heap.push/pop methods. Array
 // explanations would incorrectly teach that these remove the last item.
 const heapCalls=[...text.matchAll(/\b(?:this\.)?([A-Za-z_$][\w$]*)\.(push|pop)\(/g)].filter(match=>/\b(?:min.?heap|max.?heap)\b/i.test(trace.meanings?.[match[1]]||''));
 if(heapCalls.length){
  const operation=([,name,method])=>{
   const meaning=trace.meanings[name],priority=/max.?heap/i.test(meaning)?'largest':'smallest';
   return method==='pop'?`${name}.pop removes and returns the entry with the ${priority} priority at the root, then restores heap order.`:`${name}.push inserts an item and restores heap order, keeping an entry with the ${priority} priority at the root.`;
  };
  help=heapCalls.slice().sort((a,b)=>(a[2]==='pop'?0:1)-(b[2]==='pop'?0:1)).map(operation).join(' ');
 }
 const variable=Object.keys(trace.meanings||{}).find(name=>new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`).test(text));
 const context=variable?` Here, ${variable} means ${trace.meanings[variable].replace(/`/g,'')}.`:'';
 return {codeLines:[line.line],basics:`Line ${line.line}: ${text} ${help}${context}`};
}
function assertions(step,other){
 const result=[{path:'phase',value:step.phase},{path:'line',value:step.line}];
 const changed=Object.keys(step.values).filter(key=>JSON.stringify(step.values[key])!==JSON.stringify(other.values[key]));
 // Include the whole changed logical value, never a screenshot or DOM label.
 for(const key of changed.filter(key=>Object.hasOwn(other.values,key)).slice(0,2))result.push({path:`values.${key}`,value:step.values[key]});
 return result;
}
/** One version 1 lesson from its visualizer-ui/lessons.json entry, authored rows and trace. */
export function compileLesson(spec,content,trace){
 if(content.rows.length!==3)throw Error(`${spec.number}: exactly three checkpoints required`);
 let end=0;
 const checkpoints=content.rows.map((row,index)=>{
  const [afterIndex,prompt,answer,wrong1,wrong2,hint1,hint2]=row;
  const before=trace.steps[afterIndex-1],after=trace.steps[afterIndex];
  if(!Number.isInteger(afterIndex)||!before||!after||before.index<end)throw Error(`${spec.number}: invalid checkpoint index ${afterIndex}`);end=afterIndex;
  const wrong=[wrong1,wrong2].map(value=>{const at=value.indexOf('~');if(at<1)throw Error(`${spec.number}: missing distractor-specific feedback`);return {text:value.slice(0,at),feedback:value.slice(at+1)};});
  const unshuffled=[{text:answer,feedback:`Correct. ${hint2}`},...wrong];
  const shift=(spec.number+index)%3;
  const options=unshuffled.map((option,rank)=>({...option,id:['a','b','c'][(rank+shift)%3]})).sort((a,b)=>a.id.localeCompare(b.id));
  const checkpoint={id:['decision','change','result'][index],beforeIndex:before.index,afterIndex,prompt,options,correctOptionId:['a','b','c'][shift],hints:[hint1,hint2],explanation:`${after.action} ${spec.why}`,...codeHelp(trace,after,before),before:assertions(before,after),after:assertions(after,before)};
  for(const value of [prompt,answer,...wrong.map(w=>w.text),hint1,hint2,checkpoint.basics,checkpoint.explanation])if(!value||typeof value!=='string')throw Error(`${spec.number}: incomplete content`);
  return checkpoint;
 });
 return {id:spec.id,version:1,caseId:'guided-default',title:spec.title,intro:content.intro,concepts:topicConcepts[spec.topic]||['variables','comparison','loops'],expectedInput:trace.steps[0].values,checkpoints,recap:spec.why,commonMistake:content.commonMistake};
}
