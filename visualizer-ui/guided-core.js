/* Shared, data-only helpers used by the guided controller and its trace checks. */
(() => {
  const glossary={
    variables:['Variables','A variable is a name for a value. Watch its value change as each instruction runs.'],
    indexing:['Array positions','JavaScript arrays start at index 0. nums[i] means the value in position i, not the number i itself.'],
    assignment:['Assignment','The = operator stores the value on the right in the name or position on the left. It replaces the previous value.'],
    comparison:['Comparisons','A comparison such as < or === produces true or false. An if statement uses that result to choose what runs next.'],
    loops:['Loops','A loop repeats instructions. Its condition decides whether to continue; an update such as i++ increases i by one.'],
    functions:['Functions','Arguments supply values to a function. return sends a result to its caller and ends that call.'],
    references:['References','Objects and arrays are accessed through references. Two names can point to the same object; changing it through one name affects both.'],
    maps:['Maps','A Map stores a value under a key. set records a pair, get reads it, and has checks whether the key exists.'],
    sets:['Sets','A Set keeps each distinct value once. has checks membership; add and delete change the collection.'],
    recursion:['Recursive calls','A recursive function calls itself on a smaller task. Each call keeps its own local variables until it returns.'],
    stack:['Stacks','A stack removes the most recently added item first. push adds to the top and pop removes from it.'],
    queue:['Queues','A queue processes items in arrival order: add at the back and remove from the front.'],
    heap:['Heaps','A heap keeps the smallest or largest priority at its root. Removing that root rearranges the remaining items to restore this rule.'],
    bits:['Bits','Bit operations work on binary digits. & keeps shared 1 bits, | combines 1 bits, ^ finds differing bits, and shifts move digits.']
  };
  function project(frame){
    const objects=new Map(frame.objects.map(o=>[o.id,o]));
    function unpack(value,depth=0,seen=new Set()){
      if(!value||typeof value!=='object'||!('ref'in value))return value;
      if(seen.has(value.ref)||depth>=2)return value;
      const obj=objects.get(value.ref);if(!obj)return value;seen.add(value.ref);
      return {kind:obj.kind,...(obj.size===undefined?{}:{size:obj.size}),entries:obj.entries.slice(0,12).map(e=>[e.key,unpack(e.value,depth+1,new Set(seen))])};
    }
    return {index:frame.index,phase:frame.phase,line:frame.location.line,action:frame.action,values:Object.fromEntries(frame.stack[0].variables.filter(v=>!['masterTrace','trace','history','steps','snapshots'].includes(v.name)).map(v=>[v.name,unpack(v.value)]))};
  }
  function readPath(value,path){return path.replace(/\[(\d+)\]/g,'.$1').split('.').reduce((item,key)=>item!=null&&Object.hasOwn(item,key)?item[key]:undefined,value);}
  function matches(state,assertions){return assertions.every(({path,value})=>JSON.stringify(readPath(state,path))===JSON.stringify(value));}
  const resolved=answer=>!!(answer?.correct||answer?.revealed);
  function limit(lesson,progress){return lesson.checkpoints.find(cp=>!resolved(progress.answers[cp.id]))?.beforeIndex??lesson.checkpoints.at(-1).afterIndex;}
  function fresh(lesson,old){return {lessonVersion:lesson.version,caseId:lesson.caseId,runId:crypto.randomUUID(),cursor:0,answers:{},...(old?.completedAt?{previousCompletion:{lessonVersion:old.lessonVersion,completedAt:old.completedAt}}:old?.previousCompletion?{previousCompletion:old.previousCompletion}:{})};}
  function restore(lesson,old){
    if(!old||old.lessonVersion!==lesson.version||old.caseId!==lesson.caseId)return fresh(lesson,old);
    const progress=structuredClone(old);progress.cursor=Math.min(Math.max(0,progress.cursor),limit(lesson,progress));return progress;
  }
  globalThis.StudyGuided={glossary,project,readPath,matches,resolved,limit,fresh,restore};
})();
