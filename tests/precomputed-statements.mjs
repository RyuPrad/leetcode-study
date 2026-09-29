import assert from'node:assert/strict';import fs from'node:fs';import path from'node:path';import{pathToFileURL}from'node:url';import{chromium}from'playwright';import{ROOT}from'../scripts/content.mjs';const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json')));const ids=[5,91,139,213,279,300,322,377,416,647,1406,230,297];
const browser=await chromium.launch(),page=await browser.newPage();let frames=0,oracles=0;const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{for(const id of ids){await page.goto(pathToFileURL(path.join(ROOT,lessons.find(l=>l.number===id).path)).href);await page.waitForFunction(()=>window.studyLessonAdapter);
 const result=await page.evaluate(id=>{const source=studyLessonSource,states=Array.from({length:source.count()},(_,i)=>source.readAt(i)),failures=[];const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);const dpWrites={91:[5,6,10,11],139:[5,9],279:[3,6],300:[7],322:[3,6],377:[3,6],416:[5,6,9],1406:[6,9]};
 if(id===416){const setup=states.slice(0,6),expectedTotal=states[0].nums.reduce((a,b)=>a+b,0);if(setup[0].total!==null||setup[0].target!==null||setup[0].isOdd!==null||setup[0].dp.length)failures.push('setup leaks computed values before execution');if(setup[1].executedLine!==2||setup[1].total!==expectedTotal||setup[1].target!==null||setup[1].isOdd!==null||setup[1].dp.length)failures.push('sum assignment also initializes future state');if(setup[2].executedLine!==3||setup[2].isOdd!==false||setup[2].target!==null||setup[2].dp.length)failures.push('parity guard performs future target/allocation work');if(setup[3].executedLine!==4||setup[3].target!==expectedTotal/2||setup[3].dp.length)failures.push('target assignment performs future allocation');if(setup[4].executedLine!==5||setup[4].dp.length!==expectedTotal/2+1||setup[4].dp.some(Boolean))failures.push('allocation prematurely sets the base case');if(setup[5].executedLine!==6||setup[5].dp[0]!==true||setup[5].dp.slice(1).some(Boolean))failures.push('base case writes outside sum zero');}
 if(states[0].executedLine!==null||states[0].lines.length)failures.push('Initial state is not ready');
 for(let i=1;i<states.length;i++){const before=states[i-1],after=states[i],line=after.executedLine;
  if(!Number.isInteger(line)||after.lines.length!==1||after.lines[0]!==line)failures.push('Grouped or missing commit at '+i);
  if(dpWrites[id]&& !same(before.dp,after.dp)&& !dpWrites[id].includes(line))failures.push('DP changed on line '+line);
  if(id===213&&after.pass===before.pass){if(before.prev!==null&&after.prev!==null&&before.prev!==after.prev&&line!==8&&line!==5)failures.push('prev changed outside its assignment');if(before.curr!==null&&after.curr!==null&&before.curr!==after.curr&&line!==9&&line!==5)failures.push('curr changed outside its assignment');}
  if(id===647&&before.count!==after.count&&line!==5)failures.push('count changed outside count++');
  if(id===5&&(before.start!==after.start||before.maxLen!==after.maxLen)&&line!==6)failures.push('Longest span changed outside its assignment');
  if(id===230&&after.stack.length===before.stack.length+1&&line!==6)failures.push('Traversal stack changed before stack.push');
 }
 for(let i=1;i<states.length;i++)studyLessonAdapter.next();
 if(id===297&&!same(source.read().rebuiltLevelOrder,source.read().treeArr))failures.push('Tree round trip failed');
 return{failures,count:states.length};},id);
 assert.deepEqual(result.failures,[],`${id}: true intermediate statement states`);frames+=result.count;
 if(id<2000&&![230,297].includes(id)){
 const outcome=await page.evaluate(id=>{
  const cases=[],failures=[];const arrs=[[1],[1,2],[2,1,3],[3,1,4,2],[1,1,1,1],[0,0,0],[1,5,11,5]];let build,expected,actual;
  if([5,647].includes(id)){for(const str of ['', 'a','abba','abc','babad','aaaa','abac']){const f=buildSteps(str),last=f.at(-1);let longest=0,count=0;for(let i=0;i<str.length;i++)for(let j=i+1;j<=str.length;j++){let s=str.slice(i,j);if(s===[...s].reverse().join('')){longest=Math.max(longest,s.length);count++;}}cases.push([id===5?last.maxLen:last.count,id===5?longest:count]);}}
  if(id===91){for(const str of ['1','12','226','06','2101','11106','100']){let dp=Array(str.length+1).fill(0);dp[0]=1;for(let i=1;i<=str.length;i++){if(str[i-1]!=='0')dp[i]+=dp[i-1];if(i>1&&Number(str.slice(i-2,i))>=10&&Number(str.slice(i-2,i))<=26)dp[i]+=dp[i-2];}const last=buildSteps(str).at(-1);cases.push([last.isZero?0:last.dp[str.length],dp[str.length]]);}}
  if(id===139){for(const str of ['', 'leetcode','catsandog','applepenapple','aaaa']){const words=['leet','code','cats','dog','sand','and','cat','apple','pen','a','aaa'];let reachable=Array(str.length+1).fill(false);reachable[0]=true;for(let i=1;i<=str.length;i++)for(let j=0;j<i;j++)if(reachable[j]&&words.includes(str.slice(j,i)))reachable[i]=true;cases.push([buildSteps(str,words).at(-1).dp[str.length],reachable[str.length]]);}}
  if(id===213){for(const a of arrs){let best=0;for(let mask=0;mask<(1<<a.length);mask++){let valid=true,total=0;for(let i=0;i<a.length;i++)if(mask>>i&1){if(a.length>1&&(mask>>((i+1)%a.length)&1))valid=false;total+=a[i];}if(valid)best=Math.max(best,total);}cases.push([buildSteps(a).at(-1).finalAns,best]);}}
  if(id===279){for(let n=0;n<=20;n++){const d=Array(n+1).fill(Infinity);d[0]=0;for(let i=1;i<=n;i++)for(let j=1;j*j<=i;j++)d[i]=Math.min(d[i],d[i-j*j]+1);cases.push([buildSteps(n).built.at(-1).ans,d[n]]);}}
  if(id===300){for(const a of arrs){let best=0;for(let mask=0;mask<(1<<a.length);mask++){let values=a.filter((_,i)=>mask>>i&1);if(values.every((v,i)=>!i||v>values[i-1]))best=Math.max(best,values.length);}cases.push([buildSteps(a).at(-1).finalAns,best]);}}
  if(id===322){for(let n=0;n<=15;n++){let d=Array(n+1).fill(Infinity);d[0]=0;for(let i=1;i<=n;i++)for(let c of[2,3])if(c<=i)d[i]=Math.min(d[i],d[i-c]+1);cases.push([buildSteps([2,3],n).built.at(-1).ans,d[n]===Infinity?-1:d[n]]);}}
  if(id===377){for(let n=0;n<=12;n++){let d=Array(n+1).fill(0);d[0]=1;for(let i=1;i<=n;i++)for(let c of[1,2,3])if(c<=i)d[i]+=d[i-c];cases.push([buildSteps([1,2,3],n).built.at(-1).ans,d[n]]);}}
  if(id===416){for(const a of arrs){const total=a.reduce((x,y)=>x+y,0);let found=false;for(let mask=0;mask<(1<<a.length);mask++){let sum=a.reduce((s,v,i)=>s+(mask>>i&1?v:0),0);if(sum*2===total)found=true;}cases.push([buildSteps(a).at(-1).ans,found]);}}
  if(id===1406){for(const a of [...arrs,[-1,-2,-3],[1,2,3,-9],[1,-1,2,-2]]){const solve=i=>i>=a.length?0:Math.max(...[1,2,3].filter(k=>i+k<=a.length).map(k=>a.slice(i,i+k).reduce((s,v)=>s+v,0)-solve(i+k)));const margin=solve(0);cases.push([buildSteps(a).at(-1).ans,margin>0?'Alice':margin<0?'Bob':'Tie']);}}
  for(const[actual,expected]of cases)if(actual!==expected)failures.push({actual,expected});return{count:cases.length,failures};
 },id);
 assert.deepEqual(outcome.failures,[],`${id}: independent mathematical oracle`);oracles+=outcome.count;
 }
 }
 assert.deepEqual(errors,[]);console.log(`Validated ${ids.length} precomputed visualizers, ${frames} statement snapshots and ${oracles} independent final-answer cases.`);
}finally{await browser.close();}
