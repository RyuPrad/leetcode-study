import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';
const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
const browser=await chromium.launch(),page=await browser.newPage();let cases=0;
try{
 for(const number of [64,72,115,309,1143]){
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.join(ROOT,lessons.find(l=>l.number===number).path)).href);
  const result=await page.evaluate(number=>{
   const states=Array.from({length:studyLessonSource.count()},(_,i)=>studyLessonSource.readAt(i)),failures=[];
   if(states[0].executedLine!==null)failures.push('Readiness executes a statement');
   const setup=number===309?[2,3,4,5,6]:[2,3];
   if(JSON.stringify(states.slice(1,setup.length+1).map(s=>s.executedLine))!==JSON.stringify(setup))failures.push('Wrong setup order');
   if(number!==309&&states[1].dp.length!==0)failures.push('Table exists before allocation');
   if(number===309){if(states[3].table[0].length===0||states[3].table[1].length!==0||states[4].table[2].length!==0)failures.push('Arrays initialized together');}
   if(number===115){for(let i=1;i<states.length;i++){const a=states[i-1],b=states[i];if(b.executedLine===7&&b.i!==null&&b.dp[b.i][b.j]!==b.dp[b.i-1][b.j])failures.push('Inherited value missing on line7');if(b.executedLine===8&&b.i!==null&&b.matched&&b.dp[b.i][b.j]!==b.dp[b.i-1][b.j]+b.dp[b.i-1][b.j-1])failures.push('Diagonal addition missing on line8');}}
   const answers=[];
   const strings=['','a','b','aa','ab','aba'];
   const lcs=(a,b)=>!a.length||!b.length?0:a[0]===b[0]?1+lcs(a.slice(1),b.slice(1)):Math.max(lcs(a.slice(1),b),lcs(a,b.slice(1)));
   const edits=(a,b)=>!a.length?b.length:!b.length?a.length:a[0]===b[0]?edits(a.slice(1),b.slice(1)):1+Math.min(edits(a.slice(1),b),edits(a,b.slice(1)),edits(a.slice(1),b.slice(1)));
   const subsequences=(a,b)=>!b.length?1:!a.length?0:subsequences(a.slice(1),b)+(a[0]===b[0]?subsequences(a.slice(1),b.slice(1)):0);
   if([72,115,1143].includes(number))for(const a of strings)for(const b of strings){
    if(number===72){word1=a;word2=b;}else if(number===115){s=a;t=b;}else{text1=a;text2=b;}buildSteps();
    answers.push([steps.at(-1).answer,number===72?edits(a,b):number===115?subsequences(a,b):lcs(a,b)]);
   }
   if(number===64)for(const g of [[[1]],[[1,2],[3,4]],[[0,0],[0,0]],[[1,9,1],[1,1,1]],[[5,2,1]]]){grid=g;buildSteps();const solve=(i,j)=>i>=g.length||j>=g[0].length?Infinity:i===g.length-1&&j===g[0].length-1?g[i][j]:g[i][j]+Math.min(solve(i+1,j),solve(i,j+1));answers.push([steps.at(-1).ans,solve(0,0)]);}
   if(number===309)for(const a of [[],[1],[1,2,3,0,2],[5,4,3],[1,2],[3,1,4,2,5]]){prices=a;buildSteps();const solve=(i,holding,cooldown)=>i===a.length?holding?-Infinity:0:Math.max(solve(i+1,holding,false),holding?a[i]+solve(i+1,false,true):cooldown?-Infinity:-a[i]+solve(i+1,true,false));answers.push([steps.at(-1).ans,solve(0,false,false)]);}
   return{failures,answers};
  },number);
  assert.deepEqual(errors,[]);assert.deepEqual(result.failures,[],`${number}: distinct source statements`);
  for(const [actual,expected]of result.answers)assert.equal(actual,expected,`${number}: independent recurrence`);
  cases+=result.answers.length;page.removeAllListeners('pageerror');
 }
 console.log(`PASS 5 DP setup sequences and ${cases} independent recurrence cases`);
}finally{await browser.close();}
