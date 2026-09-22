// Serialized into the isolated VM. No host objects are captured by this function.
export function installDebugEnvironment(sites) {
  const vmGlobal=globalThis, decide=globalThis.__studyDecision, suspend=globalThis.__studyPause, exitFrame=globalThis.__studyExit;
  const NativeSet=Set, finite=Number.isFinite, string=String;
  const blocked=name=>function(){throw new Error(`Debugging unavailable: ${name} is not supported. Use synchronous JavaScript, or use Run / Submit.`);};
  const dynamicFunction=blocked('dynamic Function construction');
  Object.defineProperty(Function.prototype,'constructor',{value:dynamicFunction,writable:false,configurable:false});
  vmGlobal.Function=dynamicFunction;vmGlobal.eval=blocked('eval');vmGlobal.Proxy=blocked('Proxy');vmGlobal.Proxy.revocable=blocked('Proxy');vmGlobal.Promise=blocked('Promise');
  const ids = new WeakMap(), stack = [], readSet = new Map(), operations=[];
  const descriptors = Object.getOwnPropertyDescriptors, keys = Object.keys, array = Array.isArray;
  const stringify = JSON.stringify, mapEntries = Map.prototype.entries, setValues = Set.prototype.values;
  // Serialize only the plain snapshot data. JSON.stringify on a whole object
  // would consult an inherited toJSON hook installed by the user's program.
  function encode(input){
    if(input===null)return 'null';
    if(typeof input==='string')return stringify(input);
    if(typeof input==='number'||typeof input==='boolean')return string(input);
    if(array(input)){let text='[';for(let i=0;i<input.length;i++)text+=(i?',':'')+(input[i]===undefined?'null':encode(input[i]));return text+']';}
    let text='{',separator='';for(const key of keys(input)){if(input[key]===undefined)continue;text+=separator+stringify(key)+':'+encode(input[key]);separator=',';}return text+'}';
  }
  const apply = Reflect.apply;
  const mapGet=Map.prototype.get, mapHas=Map.prototype.has, setHas=Set.prototype.has;
  const mapSet=Map.prototype.set,mapDelete=Map.prototype.delete,setAdd=Set.prototype.add,setDelete=Set.prototype.delete,arrayPush=Array.prototype.push,arrayPop=Array.prototype.pop,arrayShift=Array.prototype.shift,arrayUnshift=Array.prototype.unshift;
  const symbols=new Map();
  let objectCounter = 0, frameCounter = 0, index = 0, enabled = false, globalEnv = [], lastSite = 0, skip = 0;
  const identify = value => { if (!ids.has(value)) ids.set(value, `object-${++objectCounter}`); return ids.get(value); };
  const safeKey = key => typeof key === 'string' ? key : typeof key === 'number' || typeof key === 'boolean' || typeof key === 'bigint' ? string(key) : typeof key === 'symbol' ? '[symbol]' : key === null ? 'null' : key === undefined ? 'undefined' : identify(key);
  const mapKey = key => {if(typeof key==='symbol'){if(!symbols.has(key))symbols.set(key,`symbol-${symbols.size+1}`);return symbols.get(key);}return `${typeof key}:${safeKey(key)}`;};
  const describe=value=>typeof value==='object'&&value!==null?identify(value):typeof value==='function'?'function':safeKey(value);
  function observe(kind,siteIndex,focus,action,result,object,key){if(!enabled||skip||operations.length>=48)return;operations.push({kind,location:sites[siteIndex],focus:focus.slice(0,400),action:action.slice(0,400),result:result.slice(0,400),targets:object?[{objectId:identify(object),...(key===undefined||key.length>1024?{}:{key})}]:[]});}
  function snapshot(siteIndex, observation) {
    const objects = [], visited = new NativeSet(); let bytes = 0, truncated = false;
    function value(input, depth = 0) {
      if (input === vmGlobal) return {special:'global object'};
      if (bytes > 220000 || objects.length >= 2000 || depth > 12) { truncated = true; return {special:'… snapshot limit'}; }
      bytes += 16;
      if (input === null || typeof input === 'boolean') return input;
      if (typeof input === 'number') return finite(input) ? input : {special:string(input)};
      if (typeof input === 'string') { bytes += Math.min(input.length,1024)*2; return input.length > 1024 ? input.slice(0,1024)+'…' : input; }
      if (typeof input === 'undefined') return {special:'undefined'};
      if (typeof input === 'bigint') return {special:string(input)+'n'};
      if (typeof input === 'symbol') return {special:'Symbol'};
      const id=identify(input); if (visited.has(id)) return {ref:id}; visited.add(id);
      const object={id,kind:'object',label:'Object',entries:[]}; objects.push(object);
      if (typeof input === 'function') { const name=descriptors(input).name?.value; object.kind='function'; object.label=typeof name==='string' ? name : 'Function'; return {ref:id}; }
      let pairs, kind='object';
      try { pairs=apply(mapEntries,input,[]); kind='map'; } catch { try { pairs=apply(setValues,input,[]); kind='set'; } catch { /* ordinary data */ } }
      if (pairs) {
        object.kind=kind; object.label=kind==='map'?'Map':'Set'; let count=0;
        for (const entry of pairs) {
          if (++count > 200 || bytes > 220000) { object.truncated=true; truncated=true; break; }
          object.entries.push({key:kind==='map'?mapKey(entry[0]):string(count-1),...(kind==='map'?{keyValue:value(entry[0],depth+1)}:{}),value:value(kind==='map'?entry[1]:entry,depth+1)});
        }
        return {ref:id};
      }
      const own=descriptors(input), names=keys(own);
      object.kind=array(input)?'array':own.val&&own.left&&own.right?'tree':own.val&&own.next?'list':own.neighbors?'graph':'object';
      object.label=object.kind==='array'?'Array':object.kind==='tree'?'Tree node':object.kind==='list'?'List node':object.kind==='graph'?'Graph node':'Object';
      if (object.kind==='array') object.size=own.length.value;
      let count=0;
      for(const name of names) {
        if(name==='length'&&object.kind==='array')continue;
        if(++count>200||bytes>220000){object.truncated=true;truncated=true;break;}
        bytes+=name.length*2;
        object.entries.push({key:name,value:'value' in own[name]?value(own[name].value,depth+1):{special:'accessor (not invoked)'}});
      }
      return {ref:id};
    }
    const variables=env=>(typeof env==='function'?env():env).map(([id,name,scope,get])=>{let result;try{result=value(get());}catch{result={special:'not initialized'};}return {id,name,scope,value:result};});
    const frames=stack.map(frame=>({id:frame.id,name:frame.name,location:sites[frame.site],variables:variables(frame.env)}));
    if(!frames.length)frames.push({id:0,name:'Global',location:sites[siteIndex],variables:variables(globalEnv)});
    const site=sites[siteIndex];
    return {index,location:site,phase:site.kind,action:observation || (site.kind==='before'?`Next: ${site.text}`:site.text),explanation:site.kind==='before'?'The highlighted statement has not executed yet. Changes show what happened since the previous checkpoint.':site.kind==='condition'?'This is the result of the condition that was just evaluated. Its expression ran once.':site.kind==='return'?'The return expression has been evaluated. Any finally block still runs before the function exits.':'The current iteration has bound its loop variables.',stack:frames,objects,reads:[...readSet.values()],changes:[],operations:operations.slice(),logs:[],truncated:truncated||operations.length>=48};
  }
  function step(siteIndex,env,observation) {
    if(stack.length){stack[stack.length-1].env=env;stack[stack.length-1].site=siteIndex;}else globalEnv=env;
    lastSite=siteIndex;
    if(!enabled)return;
    index++;
    if(skip>0){skip--;return;}
    const decision=decide(siteIndex,stack.length,index);
    if(decision===1) {
      const frame=snapshot(siteIndex,typeof observation==='function'?observation():observation);readSet.clear();operations.length=0;
      suspend(encode(frame));
    }else if(decision>1)skip=decision-1;
  }
  globalThis.__studyDebugger={
    enable(){enabled=true;},
    enter(siteIndex){const id=++frameCounter;stack.push({id,name:sites[siteIndex].name||'callback',site:siteIndex,env:[]});return id;},
    leave(id){if(stack[stack.length-1]?.id!==id)return;if(enabled&&stack.length===1){index++;const frame=snapshot(stack[0].site,`Leaving ${stack[0].name}.`);frame.phase='exit';frame.explanation='These are the last values in this call. Its return value or exception now passes to the caller.';readSet.clear();exitFrame(encode(frame));}stack.pop();},
    step,
    condition(siteIndex,result,env){observe('compare',siteIndex,'Look at the condition.','Evaluate this condition once.',`The condition is ${result?'true':'false'}.`);step(siteIndex,env,()=>`${sites[siteIndex].text} → ${result?'true':'false'}`);return result;},
    returnValue(siteIndex,result,env){step(siteIndex,env,`Return expression evaluated: ${result===null?'null':typeof result==='object'?'object':typeof result==='function'?'function':string(result).slice(0,160)}`);return result;},
    read(siteIndex,object,key){const result=object[key];if(enabled&&skip===0&&object!==null&&(typeof object==='object'||typeof object==='function')&&readSet.size<300){const objectId=identify(object),name=safeKey(key),id=`${objectId}:${name}`;if(!readSet.has(id))readSet.set(id,{objectId,key:name});observe('read',siteIndex,`Look at ${sites[siteIndex].text}.`,'Read this value without changing the source.',`The expression returned ${describe(result)}.`,object,['string','number'].includes(typeof key)?string(key):undefined);}return result;},
    invoke(siteIndex,object,key,args){
      const method=object[key],values=args();
      if(enabled&&skip===0&&(method===mapGet||method===mapHas||method===setHas)&&readSet.size<300){const objectId=identify(object),name=mapKey(values[0]);readSet.set(`${objectId}:${name}`,{objectId,key:name});}
      const result=apply(method,object,values);
      if(enabled&&skip===0){
        const item=describe(values[0]);
        if(method===mapHas||method===setHas)observe('lookup',siteIndex,`Look for ${item}.`,`Check whether ${item} is present.`,result?'Found. The collection stays unchanged.':'Not found. The collection stays unchanged.',object,method===mapHas?mapKey(values[0]):undefined);
        else if(method===mapGet)observe('read',siteIndex,`Look at key ${item}.`,'Read its stored value without changing the map.',`Read ${describe(result)}.`,object,mapKey(values[0]));
        else if(method===mapSet)observe('write',siteIndex,`Look at map key ${item}.`,`Store ${describe(values[1])} under key ${item}.`,`Key ${item} now stores ${describe(values[1])}.`,object,mapKey(values[0]));
        else if(method===setAdd)observe('write',siteIndex,`Look at set value ${item}.`,'Add this value to the set.',`The set contains ${item}.`,object);
        else if(method===mapDelete||method===setDelete)observe('remove',siteIndex,`Look for ${item}.`,'Remove this entry if it exists.',result?'The entry was removed.':'The entry was already absent.',object,method===mapDelete?mapKey(values[0]):undefined);
        else if(method===arrayPush||method===arrayUnshift)observe('write',siteIndex,'Look at the array.',method===arrayPush?'Append the supplied items at the end.':'Insert the supplied items at the front.',`The array now has ${result} items.`,object);
        else if(method===arrayPop||method===arrayShift)observe('remove',siteIndex,'Look at the array.',method===arrayPop?'Remove its last item.':'Remove its first item.',`The operation returned ${describe(result)}.`,object);
      }
      return result;
    },
    final(){return encode(snapshot(lastSite,'Execution finished.'));},
  };
}
