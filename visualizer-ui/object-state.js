/* Solution-owned projections for the reference Object View.
 * The adapters consume detached snapshots; they never execute or navigate a lesson.
 * Node identities are input/allocation identities, never the node's displayed value.
 */
(() => {
  const own=(object,key)=>object!=null&&Object.prototype.hasOwnProperty.call(object,key);
  const idKey=Symbol('reference object identity');
  const identify=(object,id)=>{if(object&&typeof object==='object')Object.defineProperty(object,idKey,{value:id});return object;};
  const placeholders=new WeakSet();
  const placeholder=text=>{const value=StudyObjectView.special(text);placeholders.add(value);return value;};
  const absent=()=>placeholder('not initialized');
  const unavailable=()=>placeholder('not recorded at this checkpoint');
  const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  function dictionaryMap(input,numeric=false){
    if(input instanceof Map)return input;
    const key=k=>numeric&&String(Number(k))===String(k)?Number(k):k;
    if(Array.isArray(input))return new Map(input.map(item=>Array.isArray(item)?[item[0],item[1]]:[item.key??item.k??item.email??item.freq,item.index??item.value??item.v??item.words??item.count??item.keys??item.id]));
    return new Map(Object.entries(input||{}).map(([k,v])=>[key(k),v]));
  }
  function nodesFromRecords(records,prefix,nextName='next'){
    const entries=Array.isArray(records)?records.map((n,i)=>[n.id??i,n]):Object.entries(records||{});
    const nodes=new Map(entries.map(([id,n])=>[String(id),identify({val:n.val??n.value,next:null},`${prefix}:${id}`)]));
    for(const [id,n]of entries){const target=n[nextName]??n.nextId;nodes.get(String(id)).next=target===null||target===undefined?null:nodes.get(String(target))??null;}
    return {nodes,get:id=>id===undefined?absent():id===null?null:nodes.get(String(id))??null};
  }
  function list(values,prefix){const records=(values||[]).map((val,id)=>({id,val,next:id+1<values.length?id+1:null}));return nodesFromRecords(records,prefix);}
  function tree(root,prefix='tree',additionalNodes=[]){
    const nodes=new Map(),bySource=new WeakMap();
    const clone=(node,path)=>{
      if(!node)return null;if(bySource.has(node))return bySource.get(node);
      const id=node._id??node.id??path;if(nodes.has(String(id)))return nodes.get(String(id));const result=identify({val:node.val},`${prefix}:${id}`);bySource.set(node,result);nodes.set(String(id),result);nodes.set(path,result);
      if(own(node,'isLeaf')){result.isLeaf=node.isLeaf;for(const name of ['topLeft','topRight','bottomLeft','bottomRight'])result[name]=clone(node[name],`${path}.${name}`);}
      else{result.left=clone(node.left,`${path}.left`);result.right=clone(node.right,`${path}.right`);}return result;
    };
    const entry=clone(root,'root');for(const node of additionalNodes)clone(node,`allocated:${node._id??node.id}`);return {root:entry,nodes,get:id=>id===undefined?absent():id===null?null:nodes.get(String(id))??unavailable(),byValue:value=>{
      const found=[...new Set(nodes.values())].filter(n=>n.val===value);return found.length===1?found[0]:value===null?null:unavailable();
    }};
  }
  function treeRecords(records,prefix='tree'){
    const entries=(records||[]).filter(record=>record.val!==null&&!record.isNull),nodes=new Map(entries.map(record=>[String(record.id),identify({val:record.val,left:null,right:null},`${prefix}:${record.id}`)]));
    for(const record of entries){const node=nodes.get(String(record.id));for(const side of ['left','right'])node[side]=record[`${side}Id`]==null?null:nodes.get(String(record[`${side}Id`]))??null;}
    const root=entries.find(record=>record.parentId===null);return {root:root?nodes.get(String(root.id)):null,nodes,get:id=>id===undefined?absent():id===null?null:nodes.get(String(id))??unavailable(),byValue:value=>{const matches=[...nodes.values()].filter(n=>n.val===value);return matches.length===1?matches[0]:value===null?null:unavailable();}};
  }
  function treeLayout(layout,prefix='tree'){
    if(!layout)return null;const ids=new WeakMap((layout.nodes||[]).filter(record=>record.node).map(record=>[record.node,record.id]));
    const rootRecord=layout.nodes?.find(record=>record.id==='n0'&&!record.isNull);
    if(!rootRecord)return tree(null,prefix);
    // Rebuild through a native-id mirror rather than modifying snapshot nodes.
    const mirror=(source,path)=>!source?null:{val:source.val,_id:ids.get(source)??path,left:mirror(source.left,`${path}.left`),right:mirror(source.right,`${path}.right`)};
    return tree(mirror(rootRecord.node,'root'),prefix);
  }
  function levelTree(values,prefix='tree',idStyle='path'){
    if(!values?.length||values[0]===null)return tree(null,prefix);
    const root={val:values[0],left:null,right:null,_id:idStyle==='n'?'n0':'root'},queue=[root];let cursor=1,allocated=1;
    for(let i=0;i<queue.length&&cursor<values.length;i++)for(const side of ['left','right']){const val=values[cursor++];if(val!==null&&val!==undefined){const node={val,left:null,right:null,_id:idStyle==='n'?`n${allocated++}`:`${queue[i]._id}.${side}`};queue[i][side]=node;queue.push(node);}}
    return tree(root,prefix);
  }
  function trie(snapshot,prefix='trie'){
    const nodes=new Map();
    const walk=(node,path)=>{if(!node)return null;const id=node.id??path,result=identify({children:{}},`${prefix}:${id}`);nodes.set(String(id),result);
      if(own(node,'word'))result.word=node.word;else result.isEnd=!!node.isEnd;
      if(Array.isArray(node.children))for(const child of node.children){const ch=child.ch??child.letter??String(child.id).split('>').at(-1);result.children[ch]=walk(child.node??child,`${path}>${ch}`);}
      else for(const [ch,child]of Object.entries(node.children||{}))result.children[ch]=walk(child,`${path}>${ch}`);return result;};
    return {root:walk(snapshot,'R'),nodes,get:id=>id===null?null:id===undefined?absent():nodes.get(String(id))??unavailable()};
  }
  const aliases={
    4:{nums1:'A',nums2:'B'},13:{map:'ROMAN_MAP'},17:{i:'depth'},19:{i:'loopI'},36:{rows:'sets.rows',cols:'sets.cols',boxes:'sets.boxes'},40:{candidates:'candSnapshot'},41:{nums:'arr'},48:{matrix:'grid'},49:{str:'currentStr',char:'currentChar',index:'currentLetterIndex'},
    57:{newInterval:'newInterval'},66:{digits:'digits'},76:{ans:'ans'},79:{board:'gridChars'},91:{n:'s.length'},92:{i:'loopI'},110:{balanced:'balancedVal'},124:{left:'leftVal',right:'rightVal'},127:{word:'currentWord',cand:'candidate',i:'mutPos'},128:{seen:'seenArr'},139:{words:'wordDict'},140:{words:'wordDict'},
    199:{node:'frame.node'},207:{next:'nextNode'},210:{next:'nextNode'},213:{i:'curIdx',next:'nextVal',x:'x'},230:{root:'rootNode'},235:{p:'pVal',q:'qVal',node:'nodeVal'},239:{deque:'deque'},261:{n:'N'},269:{w1:'pairA',w2:'pairB',j:'diffIdx',ch:'popping'},286:{rooms:'grid'},295:{median:'medianVal'},297:{res:'serEmitted',vals:'tokens'},310:{next:'nextLeaves',leaf:'peelingNode',nei:'neiNode'},323:{n:'N'},329:{dirs:'DIRS'},337:{left:'leftRet',right:'rightRet'},338:{n:'n0'},347:{freq:'freqEntries',countVal:'bucketFreq'},355:{res:'feed',userId:'a',tweetId:'b',followerId:'a',followeeId:'b',users:'feedUsers',u:'scanUser',entry:'pushedEntry'},
    399:{nei:'tryNei',w:'tryW',sub:'queryResult'},417:{r:'cur.0',c:'cur.1'},450:{key:'keyVal',min:'minVal'},460:{evict:'evict',f:'f'},502:{maxHeap:'heap'},543:{ans:'ansVal'},621:{heap:'heapData',cnt:'ran'},622:{value:'arg',k:'queueCapacity'},649:{n:'senate.length',i:'buildIdx'},678:{s:'s'},698:{k:'kCur'},701:{val:'insertVal'},703:{nums:'initialNums'},705:{size:'SIZE'},706:{size:'SIZE'},721:{root:'activeRoot',id:'activeId'},743:{times:'input.times',n:'input.n',k:'input.k'},752:{dead:'deadList',state:'currentState',digit:'spinIndex',nextState:'candidate'},767:{heap:'heapData',cnt:'popped.0',ch:'popped.1'},778:{grid:'input.grid',r:'cell.0',c:'cell.1',nr:'neighbor.0',nc:'neighbor.1'},787:{n:'problem.n',flights:'problem.flights',src:'problem.src',dst:'problem.dst',k:'problem.k'},846:{count:'countSnap'},853:{i:'ci'},895:{val:'val'},918:{i:'idx'},953:{i:'pairIdx'},973:{x:'pt.1',y:'pt.2'},997:{i:'i'},1071:{res:'res'},1094:{num:'tripsEntry.0',start:'tripsEntry.1',end:'tripsEntry.2'},1325:{node:'nodeId'},1405:{heap:'heapData',cnt:'candidate.0',ch:'candidate.1'},1448:{maxSoFar:'frame.max'},1462:{res:'results'},1489:{n:'inputN',edges:'inputEdges',i:'curEdgePos'},1584:{cost:'poppedCost',i:'popped',j:'scanJ',d:'candidateEdge.w'},1631:{heights:'input.heights',r:'cell.0',c:'cell.1',nr:'neighbor.0',nc:'neighbor.1'},1834:{idx:'idx'},1851:{q:'curQ',idx:'curIdx'},1899:{x:'currentTriplet.0',y:'currentTriplet.1',z:'currentTriplet.2'},2013:{point:'query'},2392:{rowConditions:'problem.rowConditions',colConditions:'problem.colConditions',node:'popping',v:'placingVal'},2402:{room:'assignedRoom'},2709:{primeToIndex:'primeMap'},2807:{curr:'currId',node:'nodeId'},3133:{n:'inputN',x:'inputX'}
  };
  const classProblems=new Set([146,155,208,211,225,232,295,304,355,460,622,703,705,706,895,901,981,2013]);
  const dsuProblems=new Set([261,323,684,721,1489,2709]);
  const treeProblems=new Set([94,98,100,102,104,105,110,124,144,145,199,226,230,235,297,337,427,437,450,543,572,701,1325,1448]);
  const pathGet=(raw,path)=>path.split('.').reduce((value,key)=>value==null?undefined:value[key],raw);
  function rootsFor(number,raw,spec){
    const config=contracts[number];if(!config)throw Error(`Missing Object View contract for problem ${number}.`);
    const roots={},names=new Set([...Object.keys(spec.meanings||{}).filter(name=>/^[\w$]+$/.test(name)&&(config.names.includes(name)||config.fields.includes(name))),...config.names.filter(name=>own(raw,name)||own(aliases[number]||{},name))]);
    const renamed=aliases[number]||{};
    for(const name of names){if(config.fields.includes(name)&&classProblems.has(number))continue;
      let value=own(renamed,name)?pathGet(raw,renamed[name]):raw[name];
      if(value===undefined&&!own(raw,name)&&!own(renamed,name))value=unavailable();
      else if(value===undefined)value=absent();
      else if(value==='pending')value=absent();
      roots[name]=value;
    }
    if(names.has('dirs'))roots.dirs=raw.DIRS||dirs;
    if(!own(raw,'n')&&names.has('n')){const input=raw.nums??raw.s??raw.cost??raw.piles??raw.stones??raw.stoneValue??raw.ratings;if(input!==undefined)roots.n=input.length;}
    if(!own(raw,'m')&&names.has('m')){const input=raw.word1??raw.s??raw.s1??raw.text1??raw.num1??raw.matrix??raw.grid;if(input!==undefined)roots.m=input.length;}
    if(names.has('rows')&&!own(raw,'rows'))roots.rows=(roots.board||roots.grid||roots.matrix||roots.heights)?.length??unavailable();
    if(names.has('cols')&&!own(raw,'cols'))roots.cols=(roots.board||roots.grid||roots.matrix||roots.heights)?.[0]?.length??0;
    if([10,97,115].includes(number)&&!own(raw,'n'))roots.n=(raw.p??raw.t??raw.s2).length;
    if([72,1143].includes(number)){roots.m=(raw.word1??raw.text1).length;roots.n=(raw.word2??raw.text2).length;}
    if([63,64,73,867].includes(number)){const matrix=roots.matrix||roots.grid;roots.m=matrix.length;roots.n=matrix[0]?.length??0;}
    if(number===43){roots.m=raw.num1.length;roots.n=raw.num2.length;roots.num1=raw.num1;roots.num2=raw.num2;}
    if(number===26)delete roots.k;
    if(number===54){roots.i=raw.current?.[0]??absent();roots.j=raw.current?.[1]??absent();}
    if(number===130){roots.r=raw.cur?.[0]??absent();roots.c=raw.cur?.[1]??absent();}
    if(number===309){roots.hold=raw.table[0];roots.sold=raw.table[1];roots.rest=raw.table[2];}
    if(number===304){[roots.row1,roots.col1,roots.row2,roots.col2]=raw.query??[absent(),absent(),absent(),absent()];}
    if(number===269){roots.w1=raw.words?.[raw.pairA]??absent();roots.w2=raw.words?.[raw.pairB]??absent();roots.minLen=typeof roots.w1==='string'&&typeof roots.w2==='string'?Math.min(roots.w1.length,roots.w2.length):absent();roots.nei=raw.activeEdge?.[1]??absent();}
    if(number===286){roots.r=raw.cur?.[0]??absent();roots.c=raw.cur?.[1]??absent();roots.nr=raw.justFilled?.[0]??absent();roots.nc=raw.justFilled?.[1]??absent();}
    if(number===329){
      roots.r=raw.cur?.[0]??raw.outer?.[0]??absent();roots.c=raw.cur?.[1]??raw.outer?.[1]??absent();
      if(raw.stack?.length){roots.best=raw.executedLine>=8&&typeof raw.best==='number'?raw.best:absent();
        if(raw.probe){roots.nr=raw.probe.to[0];roots.nc=raw.probe.to[1];}else for(const name of ['dr','dc','nr','nc'])delete roots[name];
      }else for(const name of ['best','dr','dc','nr','nc'])delete roots[name];
    }
    if(number===332){roots.from=raw.from??raw.tickets?.[raw.objectEdgeIndex]?.[0]??absent();roots.to=raw.to??raw.tickets?.[raw.objectEdgeIndex]?.[1]??absent();roots.dests=typeof raw.airport==='string'?raw.adj?.[raw.airport]??[]:absent();}
    if(number===502)roots.j=raw.round??absent();
    if(number===567)roots.window=raw.windowMap;
    if(number===703)roots.num=raw.op==='constructor'?raw.val:absent();
    if(number===743){roots.adj=Array.from({length:raw.input.n+1},()=>[]);for(const [from,to,weight]of raw.input.times)roots.adj[from].push([to,weight]);}
    if(number===973){roots.i=raw.i??absent();if(raw.pt){roots.x=raw.pt[1];roots.y=raw.pt[2];}}
    if(number===1046)roots.s=raw.s??absent();
    if(number===1095)roots.n=raw.arr.length;
    if(number===1584)roots.n=raw.points.length;
    if(number===2402){const meeting=raw.meetings?.[raw.meetingIdx];roots.start=meeting?.[0]??absent();roots.end=meeting?.[1]??absent();roots.freeTime=raw.freeTime??absent();roots.r=raw.r??absent();}
    if(number===49)roots.groups=new Map((raw.groups||[]).map(e=>[e.key,e.words]));
    if(number===1)roots.seen=new Map((raw.seen||[]).map(e=>[e.key,e.index]));
    if(number===36)for(const name of ['rows','cols','boxes'])roots[name]=(raw.sets?.[name]||[]).map(values=>new Set(values));
    if([51,52].includes(number)){for(const name of ['cols','diag','antiDiag'])roots[name]=new Set(raw[name]||[]);if(names.has('board'))roots.board=typeof raw.board==='string'?raw.board.split('|').map(row=>[...row]):raw.board;if(number===51)roots.res=raw.objectResults??[];}
    if(number===698)roots.used=typeof raw.used==='string'?[...raw.used].map(x=>x==='1'):raw.used;
    if(number===678&&Array.isArray(raw.s))roots.s=raw.s.join('');
    if(number===763&&Array.isArray(raw.s))roots.s=raw.s.join('');
    if(number===128)roots.seen=new Set(raw.seenArr||[]);
    if(number===127){roots.words=new Set(raw.wordList);roots.visited=new Set(raw.visited||[]);}
    if(number===139||number===140)roots.words=new Set(raw.wordDict);
    if(number===399){roots.graph=new Map(Object.entries(raw.graph||{}).map(([key,neighbors])=>[key,new Map(Object.entries(neighbors))]));roots.visited=new Set(raw.visited||[]);}
    if(number===269)roots.adj=new Map(Object.entries(raw.adj||{}).map(([key,neighbors])=>[key,new Set(neighbors)]));
    if(number===207||number===210){const edge=raw.activeEdge;if(edge){roots.pre=edge[0];roots.course=edge[1];}}
    if(number===2392&&raw.which)roots.conditions=raw.problem[`${raw.which}Conditions`];
    if(number===1094){const entry=raw.trips?.[raw.tripIdx];if(entry){roots.num=entry[0];roots.start=entry[1];roots.end=entry[2];}}
    if(number===1899){const entry=raw.triplets?.[raw.row];if(entry){roots.x=entry[0];roots.y=entry[1];roots.z=entry[2];}}
    for(const name of config.maps){if(own(roots,name)&&!(roots[name] instanceof Map)&&typeof roots[name]!=='symbol'&&!isPlaceholder(roots[name]))roots[name]=dictionaryMap(roots[name],[437,560,846,895].includes(number));}
    for(const name of config.sets){if(own(roots,name)&&!(roots[name] instanceof Set)&&!isPlaceholder(roots[name]))roots[name]=new Set(Array.isArray(roots[name])?roots[name]:[]);}
    if(number===560)roots.freq=dictionaryMap(raw.freq,true);
    if(number===846)roots.count=dictionaryMap(raw.countSnap,true);
    if(number===2392){roots.rowPos=dictionaryMap(raw.rowPos,true);roots.colPos=dictionaryMap(raw.colPos,true);}
    if(dsuProblems.has(number)){const dsu=identify({parent:raw.parent??absent()},'solution:dsu');if(number===684)dsu.rank=raw.rank??absent();if([323,1489,2709].includes(number))dsu.count=raw.dsuCount??raw.count??absent();roots.dsu=dsu;delete roots.parent;delete roots.rank;}
    if(classProblems.has(number)){
      const instance=identify({},'solution:this');
      for(const field of config.fields){if(own(raw,field))instance[field]=raw[field];}
      if(number===146)Object.assign(instance,{capacity:raw.capacity,cache:dictionaryMap(raw.cache,true)});
      if(number===460)Object.assign(instance,{capacity:raw.capacity,keyToVal:dictionaryMap(raw.state?.keyToVal,true),keyToFreq:dictionaryMap(raw.state?.keyToFreq,true),freqToKeys:new Map((raw.state?.freqToKeys||[]).map(g=>[g.freq,new Set(g.keys)])),minFreq:raw.state?.minFreq});
      if(number===355)Object.assign(instance,{time:raw.time,tweets:dictionaryMap(raw.tweets,true),following:new Map(Object.entries(raw.following||{}).map(([key,values])=>[Number(key),new Set(values)]))});
      if(number===895)Object.assign(instance,{freq:dictionaryMap(raw.freq,true),group:dictionaryMap(raw.group,true),maxFreq:raw.maxFreq});
      if(number===981)instance.store=new Map((raw.store||[]).map(e=>[e.key,e.list]));
      if(number===705||number===706)Object.assign(instance,{size:raw.SIZE,buckets:raw.buckets});
      if(number===622)Object.assign(instance,{queue:raw.queue,head:raw.head,count:raw.count,capacity:raw.capacity});
      if(number===2013)instance.counts=dictionaryMap(raw.counts);
      roots.this=instance;
    }
    for(const [name,kind]of Object.entries(config.heaps)){
      const data=name==='maxHeap'?raw.heap:name==='heap'?(raw.heap??raw.heapData):raw[name];if(data===undefined)continue;
      const wrapper=identify({[config.heapField||'data']:data},`solution:heap:${name}`);Object.defineProperty(wrapper,'__class',{value:kind});
      if(classProblems.has(number)&&config.fields.includes(name))roots.this[name]=wrapper;else roots[name]=wrapper;
    }
    if(treeProblems.has(number))projectTree(number,raw,roots);
    if([2,19,21,23,25,92,138,141,143,206,2807].includes(number))projectList(number,raw,roots);
    if([208,211,212,2707].includes(number)){
      const model=trie(raw.trie),active=[...model.nodes.entries()].filter(([id])=>findTrie(raw.trie,id)?.onPath).at(-1)?.[1];
      if(number===208||number===211){roots.this.root=model.root;roots.node=model.get(raw.nodeId);if(raw.arg!==undefined){if(raw.method==='startsWith')roots.prefix=raw.arg;else roots.word=raw.arg;roots.str=raw.arg;}if(number===211){roots.i=raw.charIndex??raw.i;roots.key=raw.key;}if(number===208){if(raw.method!=='startsWith')delete roots.prefix;else delete roots.word;}delete roots.root;}
      else{roots.root=model.root;roots.node=active??model.root;if(number===212){roots.child=model.get(raw.childId);if(raw.buildWord!==null&&raw.buildWord!==undefined)roots.word=raw.buildWord;else delete roots.word;}else if(raw.buildWord!==null&&raw.buildWord!==undefined)roots.word=raw.buildWord;else delete roots.word;}
      delete roots.children;delete roots.isEnd;
    }
    if(number===133)projectGraph(raw,roots);
    if(raw.objectLocals)for(const [name,value]of Object.entries(raw.objectLocals))roots[name]=value===undefined?absent():value;
    if(number===332&&raw.objectDestsAirport!==undefined)roots.dests=roots.adj.get(raw.objectDestsAirport)??[];
    if(number===417&&raw.objectOceanName!==undefined)roots.ocean=roots[raw.objectOceanName];
    for(const name of raw.objectOmit||[])delete roots[name];
    // Capture copies values again, so neither a reference frame nor expansion can mutate the source.
    return roots;
  }
  const isPlaceholder=value=>value&&typeof value==='object'&&placeholders.has(value);
  function findTrie(node,id){if(!node)return null;if(String(node.id)===String(id))return node;for(const child of Array.isArray(node.children)?node.children:Object.values(node.children||{})){const found=findTrie(child.node??child,id);if(found)return found;}return null;}
  function projectTree(number,raw,roots){
    let source=raw.rootNode??raw.root??raw.objectTree;
    if(source===undefined&&Array.isArray(raw.layout))source=raw.layout.find(node=>node.parentId===null)?.node;
    let model=source===undefined?levelTree(raw.treeArr??raw.inputArr??raw.rootArr??raw.arr??raw.arrRoot,'tree',[199,572,1448].includes(number)?'n':'path'):tree(source);
    if([124,337].includes(number)&&raw.nodes)model=treeRecords(raw.nodes);
    if(number===105)model=tree(raw.rootNode,'tree',raw.layout?.nodes||[]);
    if(raw.objectLayout)model=treeLayout(raw.objectLayout)||model;
    const currentKey=['currentId','nodeId','rootNowId','curId'].find(key=>own(raw,key));const current=currentKey===undefined?undefined:raw[currentKey];
    roots.root=model.root;
    if([94,102,144,145].includes(number)){roots.node=model.get(raw.nodeId);if(number===102)roots.queue=(raw.queueIds||[]).map(model.get);if(own(roots,'stack'))roots.stack=(raw.stackIds||[]).map(model.get);}
    else if(number===230){roots.node=model.get(raw.nodeId);roots.stack=(raw.stack||[]).map(item=>typeof item==='object'?model.get(item.id??item._id):model.get(item));}
    else if(number===235){roots.node=model.byValue(raw.nodeVal);roots.p=model.byValue(raw.pVal);roots.q=model.byValue(raw.qVal);}
    else if(number===98){
      if(raw.objectNodeActive)roots.node=model.get(raw.objectNodeId);
      else for(const name of ['node','low','high'])delete roots[name];
    }
    else if(number===437){if(raw.nodeActive)roots.node=model.get(raw.nodeId);else for(const name of ['node','sum','need','matches'])delete roots[name];}
    else if(number===199){const active=Object.entries(raw.status||{}).find(([,status])=>status==='current')?.[0];roots.node=own(raw,'objectNodeId')?model.get(raw.objectNodeId):active?model.get(active):raw.frame?.node===null?absent():model.byValue(raw.frame?.node);roots.queue=(raw.queueIds||[]).map(model.get);}
    else if(number===1448){roots.node=own(raw,'objectNodeId')?model.get(raw.objectNodeId):raw.pathStack?.length?model.get(raw.pathStack.at(-1).id):absent();roots.maxSoFar=raw.frame?.max??absent();}
    else if(number===100){const p=treeLayout(raw.objectLayoutP,'tree:p')||tree(raw.rootP,'tree:p'),q=treeLayout(raw.objectLayoutQ,'tree:q')||tree(raw.rootQ,'tree:q');roots.p=raw.frame?(raw.frame.pTxt==='null'?null:p.get(raw.frame.idP)):p.root;roots.q=raw.frame?(raw.frame.qTxt==='null'?null:q.get(raw.frame.idQ)):q.root;delete roots.root;}
    else if(number===572){
      const main=treeLayout(raw.objectLayoutMain,'tree:main'),sub=treeLayout(raw.objectLayoutSub,'tree:sub'),refs=raw.objectTreeRefs;
      if(!main||!sub)throw Error('Subtree Object View is missing source-owned tree identities.');
      roots.root=refs?.kind==='sub'||refs?.kind==='same'?main.get(refs.rootId):main.root;
      roots.subRoot=sub.root;
      if(refs?.kind==='same'){roots.p=main.get(refs.pId);roots.q=sub.get(refs.qId);}
      else{delete roots.p;delete roots.q;}
    }
    else if(number===297){roots.node=model.get(raw.phase==='deserialize'?raw.curBuildId:raw.curId);roots.res=raw.serEmitted??[];roots.vals=raw.tokens??[];}
    else if(own(roots,'node'))roots.node=model.get(current);
    if(number===104&&raw.stack?.length)roots.root=model.get(raw.currentId);
    if(number===226&&raw.stack?.length)roots.root=model.get(raw.currentId);
    if(number===105&&raw.rootNowId!==null)roots.root=model.nodes.has(String(raw.rootNowId))?model.get(raw.rootNowId):absent();
    if(number===105&&raw.rootNode===null)roots.root=absent();
    if(number===105&&raw.phase==='base')delete roots.root;
    if(number===105){if(raw.preWin)roots.preorder=raw.preorder.slice(raw.preWin[0],raw.preWin[1]+1);if(raw.inWin)roots.inorder=raw.inorder.slice(raw.inWin[0],raw.inWin[1]+1);}
    if(number===110||number===543){const node=model.get(raw.currentId),values=number===110?raw.heightVal:raw.depthVal;const get=side=>node&&typeof node==='object'&&own(node,side)?node[side]===null?0:(()=>{const childId=[...model.nodes.entries()].find(([,value])=>value===node[side])?.[0];return own(values,childId)?values[childId]:absent();})():absent();roots.left=get('left');roots.right=get('right');}
    if(number===427){roots.root=model.root;delete roots.same;if(raw.same!==null&&raw.same!==undefined)roots.same=raw.same;}
  }
  function projectList(number,raw,roots){
    if(number===206){const model=list(raw.values,'list');for(let i=0;i<raw.values.length;i++)model.nodes.get(String(i)).next=raw.nextMap[i]===null?null:model.get(raw.nextMap[i]);for(const name of ['head','prev','curr','next'])roots[name]=model.get(raw[`${name}Idx`]);return;}
    if(number===141){const model=nodesFromRecords(raw.nodes,'list','nextId');roots.head=model.get(raw.headId);roots.slow=raw.state==='INIT'?absent():model.get(raw.slowId);roots.fast=['INIT','INIT_SLOW'].includes(raw.state)?absent():model.get(raw.fastId);return;}
    if(number===143){const model=nodesFromRecords(raw.nodes,'list');for(const name of ['head','slow','fast','second','prev','curr','next','first','temp1','temp2'])if(own(raw,name))roots[name]=model.get(raw[name]);return;}
    if(number===19){const model=nodesFromRecords(raw.nodes,'list','nextId');roots.head=model.get(raw.nodes?.[1]?.id??null);roots.dummy=raw.dummyInitialized===false||raw.dummy===undefined?absent():model.get('dummy');roots.fast=raw.fastInitialized?model.get(raw.nodes[raw.fastIdx]?.id??null):absent();roots.slow=raw.slowInitialized?model.get(raw.nodes[raw.slowIdx]?.id??null):absent();return;}
    if(number===92){const model=nodesFromRecords(raw.nodeMap,'list');roots.head=model.get('n0');roots.dummy=raw.execState==='INIT'?absent():model.get(raw.DUMMY);roots.prev=model.get(raw.prevId);roots.curr=model.get(raw.currId);roots.next=model.get(raw.nextId);return;}
    if(number===25){const model=nodesFromRecords(raw.nodesRef,'list');for(const [id,next]of Object.entries(raw.nextOf||{}))model.nodes.get(String(id)).next=model.get(next);if(model.nodes.has('0'))model.nodes.get('0').val=0;roots.head=model.get(raw.inputVals.length?1:null);roots.dummy=raw.executedLine===null?absent():model.get(0);for(const name of ['groupPrev','groupNext','kth','prev','curr','next'])roots[name]=model.get(raw[name]);roots.temp=model.get(raw.tempId);return;}
    if(number===2807){const records=[...(raw.heap||raw.nodes||[])];if(raw.detachedNode&&!records.some(n=>n.id===raw.detachedNode.id))records.push(raw.detachedNode);const model=nodesFromRecords(records,'list');roots.head=model.get(raw.head);roots.curr=model.get(raw.currId);roots.node=model.get(raw.nodeId);delete roots.ListNode;delete roots.gcd;return;}
    if(number===2){const l1=list(raw.inputL1,'list:l1'),l2=list(raw.inputL2,'list:l2'),out=list(raw.result,'list:result'),dummy=identify({val:0,next:out.get(raw.result.length?0:null)},'list:dummy');roots.l1=l1.get(raw.i1<raw.inputL1.length?raw.i1:null);roots.l2=l2.get(raw.i2<raw.inputL2.length?raw.i2:null);roots.dummy=raw.execState==='INIT'?absent():dummy;roots.curr=raw.currInitialized?(raw.currIdx<0?dummy:out.get(raw.currIdx)):absent();return;}
    if(number===138){const original=list(raw.pairs.map(p=>p[0]),'list:original'),clones=new Map();for(let i=0;i<raw.pairs.length;i++){original.nodes.get(String(i)).random=original.get(raw.pairs[i][1]);if(raw.mapped[i])clones.set(i,identify({val:raw.pairs[i][0],next:null,random:null},`list:clone:${i}`));}for(const [i,node]of clones){node.next=raw.cloneNext[i]===null?null:clones.get(raw.cloneNext[i])??null;node.random=raw.cloneRand[i]===null?null:clones.get(raw.cloneRand[i])??null;}roots.head=original.get(raw.pairs.length?0:null);roots.curr=original.get(raw.curr);roots.map=new Map([...clones].map(([i,node])=>[original.get(i),node]));return;}
    if(number===21){
      const l1=list(raw.origL1,'list:l1'),l2=list(raw.origL2,'list:l2'),lookup=n=>n?({l1,l2}[n.owner]?.get(n.idx)??null):null,dummy=identify({val:0,next:null},'list:dummy'),chain=raw.mergedChain||[];
      dummy.next=lookup(chain[0]);for(let i=0;i<chain.length-1;i++)lookup(chain[i]).next=lookup(chain[i+1]);
      const remaining=['RETURN','END'].includes(raw.execState)?raw.objectRemaining:null;roots.list1=l1.get(remaining?.l1Idx??raw.l1Idx);roots.list2=l2.get(remaining?.l2Idx??raw.l2Idx);roots.dummy=raw.execState==='INIT'?absent():dummy;roots.tail=raw.tailOwner?({l1,l2}[raw.tailOwner]?.get(raw.tailIdx)??null):raw.execState==='INIT'||raw.execState==='INIT_TAIL'?absent():dummy;delete roots.curr;return;
    }
    if(number===23){const all=(raw.lists||[]).map((values,i)=>list(values,`list:${raw.round}:${i}`).get(values.length?0:null));roots.lists=all;roots.l1=raw.l1===null?null:list(raw.l1||[],'merge:l1').get(raw.l1?.length?0:null);roots.l2=raw.l2===null?null:list(raw.l2||[],'merge:l2').get(raw.l2?.length?0:null);const out=list(raw.curr||[],'merge:result'),dummy=identify({val:0,next:out.get(raw.curr?.length?0:null)},'merge:dummy');roots.dummy=raw.curr===null?absent():dummy;roots.curr=raw.currIndex<0?dummy:out.get(raw.currIndex);roots.merged=(raw.mergedSoFar||[]).map((values,i)=>list(values,`merged:${i}`).get(values.length?0:null));}
  }
  function projectGraph(raw,roots){
    const originals=raw.adjInput.map((_,i)=>identify({val:i+1,neighbors:[]},`graph:original:${i+1}`)),clones=new Map();raw.adjInput.forEach((neighbors,i)=>originals[i].neighbors=neighbors.map(value=>originals[value-1]));
    for(const value of raw.createdVals||[])clones.set(value,identify({val:value,neighbors:[]},`graph:clone:${value}`));
    // A newly allocated copy exists before it is inserted into visited.
    if(raw.freshVal!==null&&raw.freshVal!==undefined&&!clones.has(raw.freshVal))clones.set(raw.freshVal,identify({val:raw.freshVal,neighbors:[]},`graph:clone:${raw.freshVal}`));
    for(const [value,node]of clones)node.neighbors=(raw.cloneAdj?.[value]||[]).map(value=>clones.get(value)).filter(Boolean);
    roots.node=originals[0]??null;roots.curr=raw.currVal===null?absent():originals[raw.currVal-1];roots.copy=raw.copyVal===null?absent():clones.get(raw.copyVal)??absent();roots.nei=raw.neiVal===null?absent():originals[raw.neiVal-1];roots.visited=new Map((raw.visitedPairs||[]).map(p=>[originals[p.k-1],clones.get(p.v)]));delete roots.val;delete roots.neighbors;delete roots.dfs;
  }
  function frame(number,raw,spec){
    const roots=rootsFor(number,raw,spec);
    return StudyObjectView.capture(roots,{idOf:(object,path)=>object[idKey]||object._studyObjectId||`solution:${path}`,frameName:'Reference solution'});
  }
  // Explicit names and collection kinds from each maintained reference solution.
  const contracts={
    "437":{"names":["root","targetSum","node","sum","need","matches","freq","count"],"fields":[],"maps":["freq"],"sets":[],"heaps":{}},
    "1":{"names":["nums","target","seen","i","num","need"],"fields":[],"maps":["seen"],"sets":[],"heaps":{}},
    "2":{"names":["l1","l2","dummy","curr","carry","sum"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "3":{"names":["s","seen","left","ans","right"],"fields":[],"maps":[],"sets":["seen"],"heaps":{}},
    "4":{"names":["nums1","nums2","m","n","left","right","half","i","j","left1","right1","left2","right2"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "5":{"names":["s","start","maxLen","l","r","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "7":{"names":["x","sign","res"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "10":{"names":["s","p","m","n","dp","j","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "11":{"names":["height","left","right","ans","width","currentHeight","area"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "13":{"names":["s","map","res","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "14":{"names":["strs","i","char","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "15":{"names":["nums","a","b","res","i","left","right","sum"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "17":{"names":["digits","map","res","path","i","c"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "18":{"names":["nums","target","a","b","res","n","i","j","left","right","sum"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "19":{"names":["head","n","dummy","fast","slow","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "20":{"names":["s","stack","map","c"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "21":{"names":["list1","list2","dummy","tail"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "22":{"names":["n","res","stack","open","close"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "23":{"names":["lists","merged","i","l1","l2","dummy","curr"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "25":{"names":["head","k","dummy","groupPrev","kth","i","groupNext","prev","curr","next","temp"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "26":{"names":["nums","left","right"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "27":{"names":["nums","val","k","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "33":{"names":["nums","target","left","right","mid"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "34":{"names":["nums","target","left","right","mid","first","afterLast","ans"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "35":{"names":["nums","target","left","right","mid"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "36":{"names":["board","rows","cols","boxes","r","c","val","b"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "39":{"names":["candidates","target","res","path","start","remain","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "40":{"names":["candidates","target","a","b","res","path","start","remain","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "41":{"names":["nums","n","i","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "42":{"names":["height","left","right","leftMax","rightMax","res"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "43":{"names":["num1","num2","m","n","pos","i","j","mul","p1","p2","sum","res"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "45":{"names":["nums","jumps","curEnd","farthest","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "46":{"names":["nums","res","path","used","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "47":{"names":["nums","a","b","res","path","used","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "48":{"names":["matrix","n","i","j","temp"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "49":{"names":["strs","groups","str","count","char","index","key"],"fields":[],"maps":["groups"],"sets":[],"heaps":{}},
    "50":{"names":["x","n","res"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "51":{"names":["n","res","board","cols","diag","antiDiag","r","row","c"],"fields":[],"maps":[],"sets":["cols","diag","antiDiag"],"heaps":{}},
    "52":{"names":["n","count","cols","diag","antiDiag","r","c"],"fields":[],"maps":[],"sets":["cols","diag","antiDiag"],"heaps":{}},
    "53":{"names":["nums","curSum","maxSum","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "54":{"names":["matrix","res","top","bottom","left","right","j","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "55":{"names":["nums","goal","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "56":{"names":["intervals","a","b","res","i","last"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "57":{"names":["intervals","newInterval","res","i","n"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "62":{"names":["m","n","dp","i","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "63":{"names":["grid","m","n","dp","i","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "64":{"names":["grid","m","n","dp","i","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "66":{"names":["digits","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "67":{"names":["a","b","res","i","j","carry","sum"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "69":{"names":["x","left","right","ans","mid"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "70":{"names":["n","dp","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "71":{"names":["path","stack","parts","part"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "72":{"names":["word1","word2","m","n","dp","i","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "73":{"names":["matrix","m","n","rows","cols","i","j"],"fields":[],"maps":[],"sets":["rows","cols"],"heaps":{}},
    "74":{"names":["matrix","target","m","n","left","right","mid","val"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "75":{"names":["nums","low","mid","high"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "76":{"names":["s","t","need","c","needCount","window","have","left","resLen","resStart","right","d"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "77":{"names":["n","k","res","path","start","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "78":{"names":["nums","res","path","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "79":{"names":["board","word","rows","cols","r","c","i","temp","found"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "81":{"names":["nums","target","left","right","mid"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "84":{"names":["heights","stack","maxArea","i","h","height","width"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "88":{"names":["nums1","m","nums2","n","i","j","k"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "90":{"names":["nums","a","b","res","path","start","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "91":{"names":["s","n","dp","i","one","two"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "92":{"names":["head","left","right","dummy","prev","i","curr","next"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "94":{"names":["root","res","node"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "97":{"names":["s1","s2","s3","m","n","dp","i","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "98":{"names":["root","node","low","high"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "100":{"names":["p","q"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "102":{"names":["root","res","queue","level","size","i","node"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "104":{"names":["root"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "105":{"names":["preorder","inorder","rootVal","root","mid"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "110":{"names":["root","balanced","node","left","right"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "115":{"names":["s","t","m","n","dp","i","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "121":{"names":["prices","left","ans","right"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "122":{"names":["prices","ans","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "124":{"names":["root","ans","node","left","right"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "125":{"names":["s","left","right","char"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "127":{"names":["beginWord","endWord","wordList","words","queue","visited","level","next","word","i","c","ch","cand"],"fields":[],"maps":[],"sets":["words","visited"],"heaps":{}},
    "128":{"names":["nums","seen","ans","num","curr","length"],"fields":[],"maps":[],"sets":["seen"],"heaps":{}},
    "130":{"names":["board","rows","cols","r","c"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "131":{"names":["s","res","path","l","r","start","end"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "133":{"names":["val","neighbors","node","visited","curr","copy","nei"],"fields":["val","neighbors"],"maps":["visited"],"sets":[],"heaps":{}},
    "134":{"names":["gas","cost","total","tank","start","i","diff"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "135":{"names":["ratings","n","candies","i","a","b"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "136":{"names":["nums","res","num"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "138":{"names":["head","map","curr"],"fields":[],"maps":["map"],"sets":[],"heaps":{}},
    "139":{"names":["s","wordDict","words","n","dp","i","j"],"fields":[],"maps":[],"sets":["words"],"heaps":{}},
    "140":{"names":["s","wordDict","words","res","path","start","end","word"],"fields":[],"maps":[],"sets":["words"],"heaps":{}},
    "141":{"names":["head","slow","fast"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "143":{"names":["head","slow","fast","second","prev","curr","next","first","temp1","temp2"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "144":{"names":["root","res","node"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "145":{"names":["root","res","node"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "146":{"names":["capacity","key","value","lru"],"fields":["capacity","cache"],"maps":["cache"],"sets":[],"heaps":{}},
    "150":{"names":["tokens","stack","token","b","a"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "152":{"names":["nums","res","curMax","curMin","i","n","tmpMax"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "153":{"names":["nums","left","right","mid"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "155":{"names":["val","min"],"fields":["stack"],"maps":[],"sets":[],"heaps":{}},
    "167":{"names":["numbers","target","left","right","sum"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "168":{"names":["columnNumber","res","rem"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "169":{"names":["nums","count","ans","num"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "189":{"names":["nums","k","left","right"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "190":{"names":["n","res","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "191":{"names":["n","count"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "198":{"names":["nums","n","dp","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "199":{"names":["root","res","queue","size","i","node"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "200":{"names":["grid","rows","cols","count","r","c"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "201":{"names":["left","right","shift"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "202":{"names":["n","seen","sum","digit"],"fields":[],"maps":[],"sets":["seen"],"heaps":{}},
    "206":{"names":["head","prev","curr","next"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "207":{"names":["numCourses","prerequisites","adj","indegree","course","pre","queue","i","count","head","node","next"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "208":{"names":["word","node","ch","prefix","str"],"fields":["children","isEnd","root"],"maps":[],"sets":[],"heaps":{}},
    "209":{"names":["target","nums","left","sum","ans","right"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "210":{"names":["numCourses","prerequisites","adj","indegree","course","pre","queue","i","order","head","node","next"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "211":{"names":["word","node","ch","i","key"],"fields":["children","isEnd","root"],"maps":[],"sets":[],"heaps":{}},
    "212":{"names":["board","words","root","word","node","ch","rows","cols","res","r","c","child","dirs","dr","dc","nr","nc"],"fields":["children","word"],"maps":[],"sets":[],"heaps":{}},
    "213":{"names":["nums","n","arr","prev","curr","x","next"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "215":{"names":["nums","k","heap","num"],"fields":[],"maps":[],"sets":[],"heaps":{"heap":"MinHeap"},"heapField":"data"},
    "217":{"names":["nums","seen","num"],"fields":[],"maps":[],"sets":["seen"],"heaps":{}},
    "219":{"names":["nums","k","seen","i"],"fields":[],"maps":[],"sets":["seen"],"heaps":{}},
    "225":{"names":["x","i"],"fields":["q"],"maps":[],"sets":[],"heaps":{}},
    "226":{"names":["root"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "229":{"names":["nums","cand1","cand2","count1","count2","num","res"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "230":{"names":["root","k","stack","node"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "232":{"names":["x"],"fields":["sIn","sOut"],"maps":[],"sets":[],"heaps":{}},
    "235":{"names":["root","p","q","node"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "238":{"names":["nums","n","res","prefix","i","suffix"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "239":{"names":["nums","k","res","deque","right"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "242":{"names":["s","t","freq","base","i","n"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "252":{"names":["intervals","a","b","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "253":{"names":["intervals","starts","iv","a","b","ends","rooms","maxRooms","s","e"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "261":{"names":["n","_","i","x","a","b","ra","rb","edges","dsu"],"fields":["parent"],"maps":[],"sets":[],"heaps":{}},
    "268":{"names":["nums","res","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "269":{"names":["words","adj","indegree","w","ch","i","w1","w2","minLen","j","queue","d","res","head","nei"],"fields":[],"maps":["adj","indegree"],"sets":[],"heaps":{}},
    "271":{"names":["strs","encoded","str","s","decoded","i","j","len","start"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "279":{"names":["n","dp","i","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "286":{"names":["rooms","rows","cols","INF","queue","r","c","dirs","next","dr","dc","nr","nc"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "287":{"names":["nums","slow","fast"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "295":{"names":["num"],"fields":["small","large"],"maps":[],"sets":[],"heaps":{"small":"MaxHeap","large":"MinHeap"},"heapField":"data"},
    "297":{"names":["root","res","node","data","vals","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "300":{"names":["nums","n","dp","ans","i","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "304":{"names":["matrix","m","n","r","c","row1","col1","row2","col2"],"fields":["prefix"],"maps":[],"sets":[],"heaps":{}},
    "309":{"names":["prices","n","hold","sold","rest","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "310":{"names":["n","edges","adj","degree","a","b","leaves","i","remaining","next","leaf","nei"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "312":{"names":["nums","balloons","n","dp","len","left","right","k"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "322":{"names":["coins","amount","dp","a","coin"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "323":{"names":["n","_","i","x","a","b","ra","rb","edges","dsu"],"fields":["parent","count"],"maps":[],"sets":[],"heaps":{}},
    "329":{"names":["matrix","rows","cols","memo","dirs","ans","r","c","best","dr","dc","nr","nc"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "332":{"names":["tickets","adj","from","to","dests","res","airport","next"],"fields":[],"maps":["adj"],"sets":[],"heaps":{}},
    "337":{"names":["root","node","left","right","withRoot","withoutRoot","res"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "338":{"names":["n","dp","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "343":{"names":["n","dp","i","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "344":{"names":["s","left","right"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "347":{"names":["nums","k","freq","num","buckets","countVal","res"],"fields":[],"maps":["freq"],"sets":[],"heaps":{}},
    "355":{"names":["userId","tweetId","heap","users","u","entry","res","followerId","followeeId"],"fields":["time","tweets","following"],"maps":["tweets","following"],"sets":["users"],"heaps":{"heap":"MaxHeap"},"heapField":"data"},
    "371":{"names":["a","b","carry"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "374":{"names":["n","left","right","mid","res"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "377":{"names":["nums","target","dp","t","num"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "394":{"names":["s","stack","curStr","curNum","c","prevStr","num"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "399":{"names":["equations","values","queries","graph","a","b","w","i","src","dst","visited","nei","sub"],"fields":[],"maps":["graph"],"sets":[],"heaps":{}},
    "410":{"names":["nums","k","left","right","a","b","ans","mid","pieces","cur","num"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "416":{"names":["nums","total","a","b","target","dp","num","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "417":{"names":["heights","rows","cols","pac","atl","dirs","r","c","ocean","prev","dr","dc","res"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "424":{"names":["s","k","freq","left","maxFreq","ans","right"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "427":{"names":["grid","r","c","n","same","i","j","half"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "435":{"names":["intervals","a","b","count","prevEnd","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "450":{"names":["root","key","min"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "460":{"names":["capacity","key","value","keys","evict","f"],"fields":["capacity","keyToVal","keyToFreq","freqToKeys","minFreq"],"maps":["keyToVal","keyToFreq","freqToKeys"],"sets":[],"heaps":{}},
    "463":{"names":["grid","rows","cols","perimeter","r","c"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "473":{"names":["matchsticks","total","a","b","side","sides","i","s","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "494":{"names":["nums","target","total","a","b","subsetSum","dp","num","s"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "502":{"names":["k","w","profits","capital","projects","p","idx","a","b","maxHeap","i","j"],"fields":[],"maps":[],"sets":[],"heaps":{"maxHeap":"MaxHeap"},"heapField":"data"},
    "518":{"names":["amount","coins","n","dp","i","a"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "543":{"names":["root","ans","node","left","right"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "560":{"names":["nums","k","freq","sum","count","num"],"fields":[],"maps":["freq"],"sets":[],"heaps":{}},
    "567":{"names":["s1","s2","need","c","window","left","right","d"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "572":{"names":["root","subRoot","p","q"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "621":{"names":["tasks","n","freq","t","heap","key","time","queue","cnt"],"fields":[],"maps":[],"sets":[],"heaps":{"heap":"MaxHeap"},"heapField":"data"},
    "622":{"names":["k","value"],"fields":["queue","head","count","capacity"],"maps":[],"sets":[],"heaps":{}},
    "647":{"names":["s","count","l","r","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "649":{"names":["senate","n","radiant","dire","i","r","d"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "658":{"names":["arr","k","x","left","right"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "678":{"names":["s","low","high","ch"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "680":{"names":["s","left","right"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "682":{"names":["operations","stack","op","a","b"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "684":{"names":["n","_","i","x","a","b","ra","rb","edges","dsu"],"fields":["parent","rank"],"maps":[],"sets":[],"heaps":{}},
    "695":{"names":["grid","rows","cols","ans","r","c"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "698":{"names":["nums","k","total","a","b","target","used","start","curSum","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "701":{"names":["root","val"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "703":{"names":["k","nums","num","val"],"fields":["k","heap"],"maps":[],"sets":[],"heaps":{"heap":"MinHeap"},"heapField":"data"},
    "704":{"names":["nums","target","left","right","mid"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "705":{"names":["key","idx","k"],"fields":["buckets","hash"],"maps":[],"sets":[],"heaps":{}},
    "706":{"names":["key","value","idx","pair"],"fields":["buckets","hash"],"maps":[],"sets":[],"heaps":{}},
    "721":{"names":["n","_","i","x","a","b","accounts","dsu","emailToId","j","email","groups","id","root","res","emails"],"fields":["parent"],"maps":["emailToId","groups"],"sets":[],"heaps":{}},
    "735":{"names":["asteroids","stack","a","alive","top"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "739":{"names":["temperatures","res","stack","i","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "743":{"names":["item","h","i","p","top","last","l","r","s","times","n","k","adj","u","v","w","dist","heap","d","node","nei","ans"],"fields":["heap"],"maps":[],"sets":[],"heaps":{"heap":"MinHeap"},"heapField":"heap"},
    "746":{"names":["cost","n","dp","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "752":{"names":["deadends","target","dead","visited","queue","turns","next","state","i","d","digit","nextState"],"fields":[],"maps":[],"sets":["dead","visited"],"heaps":{}},
    "763":{"names":["s","last","i","res","start","end"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "767":{"names":["s","freq","c","heap","res","prev","cnt","ch"],"fields":[],"maps":[],"sets":[],"heaps":{"heap":"MaxHeap"},"heapField":"data"},
    "778":{"names":["item","h","i","p","top","last","l","r","s","grid","n","time","heap","dirs","t","c","dr","dc","nr","nc","nt"],"fields":["heap"],"maps":[],"sets":[],"heaps":{"heap":"MinHeap"},"heapField":"heap"},
    "787":{"names":["n","flights","src","dst","k","dist","i","tmp","u","v","w"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "846":{"names":["hand","groupSize","count","card","keys","a","b","start","need"],"fields":[],"maps":["count"],"sets":[],"heaps":{}},
    "853":{"names":["target","position","speed","cars","p","i","a","b","stack","s","time"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "860":{"names":["bills","five","ten","bill"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "867":{"names":["matrix","m","n","res","i","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "875":{"names":["piles","h","left","right","ans","mid","hours","p"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "877":{"names":["piles","n","dp","i","len","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "881":{"names":["people","limit","a","b","left","right","boats"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "895":{"names":["val","f","stack"],"fields":["freq","group","maxFreq"],"maps":["freq","group"],"sets":[],"heaps":{}},
    "901":{"names":["price","span"],"fields":["stack"],"maps":[],"sets":[],"heaps":{}},
    "912":{"names":["nums","left","mid","right","temp","i","j","k"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "918":{"names":["nums","total","curMax","maxSum","curMin","minSum","num"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "953":{"names":["words","order","rank","i","w1","w2","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "973":{"names":["points","k","heap","x","y","res","i","dist"],"fields":[],"maps":[],"sets":[],"heaps":{"heap":"MinHeap"},"heapField":"data"},
    "978":{"names":["arr","ans","inc","dec","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "981":{"names":["key","value","timestamp","arr","left","right","res","mid"],"fields":["store"],"maps":["store"],"sets":[],"heaps":{}},
    "994":{"names":["grid","rows","cols","queue","fresh","r","c","minutes","dirs","next","dr","dc","nr","nc"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "997":{"names":["n","trust","score","a","b","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1011":{"names":["weights","days","left","right","a","b","ans","mid","need","cur","w"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1046":{"names":["stones","heap","s","a","b"],"fields":[],"maps":[],"sets":[],"heaps":{"heap":"MaxHeap"},"heapField":"data"},
    "1049":{"names":["stones","total","a","b","target","dp","stone","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1071":{"names":["str1","str2","a","b","len"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1094":{"names":["trips","capacity","a","b","heap","cur","num","start","end"],"fields":[],"maps":[],"sets":[],"heaps":{"heap":"MinHeap"},"heapField":"data"},
    "1095":{"names":["target","arr","n","left","right","mid","peak","res","ascending"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1137":{"names":["n","dp","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1140":{"names":["piles","n","suffix","i","dp","m","best","x"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1143":{"names":["text1","text2","m","n","dp","i","j"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1325":{"names":["root","target"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1405":{"names":["a","b","c","heap","res","cnt","ch","cnt2","ch2"],"fields":[],"maps":[],"sets":[],"heaps":{"heap":"MaxHeap"},"heapField":"data"},
    "1406":{"names":["stoneValue","n","dp","i","take","k"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1448":{"names":["root","count","node","maxSoFar","newMax"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1462":{"names":["numCourses","prerequisites","queries","adj","a","b","reach","src","node","nei","i","u","v"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1489":{"names":["n","_","i","x","a","b","ra","rb","edges","indexed","e","skip","force","dsu","weight","mstWeight","critical","pseudo"],"fields":["parent","count"],"maps":[],"sets":[],"heaps":{}},
    "1584":{"names":["item","h","i","p","top","last","l","r","s","points","n","inMST","heap","total","count","cost","j","d"],"fields":["heap"],"maps":[],"sets":[],"heaps":{"heap":"MinHeap"},"heapField":"heap"},
    "1631":{"names":["item","h","i","p","top","last","l","r","s","heights","rows","cols","effort","heap","dirs","e","c","dr","dc","nr","nc","ne"],"fields":["heap"],"maps":[],"sets":[],"heaps":{"heap":"MinHeap"},"heapField":"heap"},
    "1768":{"names":["word1","word2","i","j","res"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1834":{"names":["tasks","indexed","t","i","a","b","heap","res","time","proc","idx"],"fields":[],"maps":[],"sets":[],"heaps":{"heap":"MinHeap"},"heapField":"data"},
    "1851":{"names":["intervals","queries","a","b","sortedQueries","q","idx","res","heap","i","l","r"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1863":{"names":["nums","ans","i","xorSoFar"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1871":{"names":["s","minJump","maxJump","n","dp","windowCount","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1899":{"names":["triplets","target","a","b","c","x","y","z"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "1929":{"names":["nums","res","i"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "2013":{"names":["point","key","x","y","res","parts","px","py","c1","c2","c3"],"fields":["counts"],"maps":["counts"],"sets":[],"heaps":{}},
    "2392":{"names":["k","rowConditions","colConditions","conditions","adj","indeg","a","b","queue","i","order","head","node","nei","rowOrder","colOrder","rowPos","colPos","v","matrix"],"fields":[],"maps":["rowPos","colPos"],"sets":[],"heaps":{}},
    "2402":{"names":["n","meetings","a","b","count","available","r","busy","start","end","room","freeTime","best"],"fields":[],"maps":[],"sets":[],"heaps":{}},
    "2707":{"names":["s","dictionary","root","word","node","ch","n","dp","i","j"],"fields":["children","isEnd"],"maps":[],"sets":[],"heaps":{}},
    "2709":{"names":["n","_","i","x","a","b","ra","rb","nums","dsu","primeToIndex","p"],"fields":["parent","count"],"maps":["primeToIndex"],"sets":[],"heaps":{}},
    "2807":{"names":["val","next","head","a","b","curr","node"],"fields":["val","next"],"maps":[],"sets":[],"heaps":{}},
    "3133":{"names":["n","x","result","remaining","bit"],"fields":[],"maps":[],"sets":[],"heaps":{}}
  };
  window.StudyObjectState={frame};
})();
