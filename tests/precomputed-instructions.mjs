import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {parse} from '@babel/parser';
import traverse from '@babel/traverse';
import {ROOT} from '../scripts/content.mjs';

const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8')).filter(lesson=>lesson.mode==='precomputed');
const browser=await chromium.launch();
let cursor=0,total=0;
const failures=[];
async function worker(){
  const page=await browser.newPage();
  while(cursor<lessons.length){
    const lesson=lessons[cursor++],errors=[];
    const onError=error=>errors.push(error.message);page.on('pageerror',onError);
    try{
      await page.goto(pathToFileURL(path.join(ROOT,lesson.path)).href);
      await page.waitForFunction(()=>window.studyLessonSource&&window.studyLessonAdapter);
      const result=await page.evaluate(()=>{
        const source=studyLessonSource;
        const code=[...document.querySelectorAll('.code-line')].map(element=>({line:Number(element.id.match(/\d+/)?.[0]),text:element.textContent}));
        const states=Array.from({length:source.count()},(_,index)=>source.readAt(index));
        return {code,states:states.map((state,index)=>({index,line:state.executedLine,raw:state.lines??state.codeLines??state.line??state.highlightLines??state.highlight??state.hl}))};
      });
      assert.equal(result.states[0].line,null,'the input preview must precede its first instruction');
      const starts=new Set();
      traverse.default(parse(result.code.map(line=>line.text).join('\n')),{enter(p){
        if(p.isStatement()&&!['BlockStatement','EmptyStatement','FunctionDeclaration','ClassDeclaration'].includes(p.node.type))starts.add(p.node.loc.start.line);
      }});
      const byLine=new Map(result.code.map(line=>[line.line,line.text]));
      for(const state of result.states.slice(1)){
        assert.ok(Number.isInteger(state.line)&&byLine.has(state.line),`snapshot ${state.index} has no scalar source instruction`);
        assert.ok(!/^\s*[};]+\s*$/.test(byLine.get(state.line)),`snapshot ${state.index} highlights only a closing brace`);
        const raw=(Array.isArray(state.raw)?state.raw:[state.raw]).filter(Number.isInteger);
        const executable=new Set(raw.filter(line=>starts.has(line)));
        assert.ok(executable.size<=1,`snapshot ${state.index} still groups ${[...executable].join(',')}`);
      }
      assert.deepEqual(errors,[]);total+=result.states.length;
    }catch(error){failures.push(`${lesson.number}: ${error.message}`);}
    finally{page.off('pageerror',onError);}
  }
  await page.close();
}
try{
  await Promise.all(Array.from({length:3},worker));
  const page=await browser.newPage();
  for(const id of [4,18,22,25,36,67,150,394,860,981,1834,1871]){
    await page.goto(pathToFileURL(path.join(ROOT,lessons.find(lesson=>lesson.number===id).path)).href);
    await page.waitForFunction(()=>window.studyLessonSource);
    const errors=await page.evaluate(id=>{
      const states=Array.from({length:studyLessonSource.count()},(_,i)=>studyLessonSource.readAt(i)),errors=[];
      const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
      for(let i=1;i<states.length;i++){
        const before=states[i-1],after=states[i],line=after.executedLine;
        if(id===4&&line===11&&(after.j!==null||after.left1!==null||after.right1!==null))errors.push('partition i calculation also calculated later variables');
        if(id===4&&line===13&&(after.right1!==before.right1||after.left2!==before.left2||after.right2!==before.right2))errors.push('left1 read also read later partition boundaries');
        if(id===18&&line===15&&(after.left!==before.left+1||after.right!==before.right))errors.push('left++ advanced right too');
        if(id===18&&line===16&&(after.right!==before.right-1||after.left!==before.left))errors.push('right-- advanced left too');
        if(id===22&&[10,15].includes(line)&&(after.stack.length!==before.stack.length+1||after.open!==before.open||after.close!==before.close))errors.push('parenthesis push also advanced the recursion counters');
        if(id===25&&line===14&&(after.prev!==before.prev||after.curr!==before.curr||!same(after.nextOf,before.nextOf)))errors.push('saving next also rewired a node or moved a pointer');
        if(id===25&&line===15&&(after.nextOf[after.curr]!==after.prev||after.prev!==before.prev||after.curr!==before.curr))errors.push('link reversal also advanced a pointer');
        if(id===25&&line===16&&(after.prev!==after.curr||after.curr!==before.curr||!same(after.nextOf,before.nextOf)))errors.push('prev assignment also changed curr or a link');
        if(id===25&&line===17&&(after.curr!==after.next||after.prev!==before.prev||!same(after.nextOf,before.nextOf)))errors.push('curr assignment also changed prev or a link');
        if(id===36&&line===13&&(!same(after.sets.cols,before.sets.cols)||!same(after.sets.boxes,before.sets.boxes)))errors.push('row insertion also inserted a column or box value');
        if(id===36&&line===14&&(!same(after.sets.rows,before.sets.rows)||!same(after.sets.boxes,before.sets.boxes)))errors.push('column insertion also inserted a row or box value');
        if(id===36&&line===15&&(!same(after.sets.rows,before.sets.rows)||!same(after.sets.cols,before.sets.cols)))errors.push('box insertion also inserted a row or column value');
        if(id===67&&line===11&&(after.i!==before.i-1||after.j!==before.j))errors.push('i-- also advanced j');
        if(id===67&&line===12&&(after.j!==before.j-1||after.i!==before.i))errors.push('j-- also advanced i');
        if(id===150&&line===5&&(after.stack.length!==before.stack.length-1||after.a!==before.a))errors.push('pop b also popped a');
        if(id===394&&line===9&&after.current!==before.current)errors.push('frame push cleared the current string');
        if(id===394&&line===10&&after.k!==before.k)errors.push('string reset also reset the count');
        if(id===860&&line===8&&(after.five!==before.five-1||after.ten!==before.ten))errors.push('giving $5 also received the $10 bill');
        if(id===860&&line===9&&(after.ten!==before.ten+1||after.five!==before.five))errors.push('receiving $10 also changed the $5 count');
        if(id===981&&line===19&&(after.left!==before.left||after.right!==before.right))errors.push('result assignment moved a bound');
        if(id===1834&&line===9&&(after.i!==before.i||!same(after.res,before.res)))errors.push('heap admission also advanced input or wrote an output');
        if(id===1834&&line===10&&(after.i!==before.i+1||!same(after.heap,before.heap)))errors.push('input advance also changed the heap');
        if(id===1834&&line===16&&(after.heap.length!==before.heap.length-1||after.time!==before.time||!same(after.res,before.res)))errors.push('task pop also advanced the clock or wrote an output');
        if(id===1834&&line===17&&(after.time!==before.time+after.proc||!same(after.res,before.res)))errors.push('clock advance also wrote an output');
        if(id===1834&&line===18&&(after.res.length!==before.res.length+1||after.time!==before.time))errors.push('output append also advanced the clock');
        if(id===1871&&line===3&&after.dp.some(Boolean))errors.push('array allocation also seeded dp[0]');
        if(id===1871&&line===4&&(after.dp[0]!==true||after.windowCount!==before.windowCount))errors.push('dp[0] seed also initialized the window counter');
        if(id===1871&&line===5&&(!same(after.dp,before.dp)||after.windowCount!==0))errors.push('window counter initialization changed dp');
      }
      if(id===67&&states.at(-1).res!=='100')errors.push('binary addition changed its answer');
      if(id===18&&states.at(-1).res.length!==3)errors.push('Four Sum lost a solution');
      return errors;
    },id);
    assert.deepEqual(errors,[],`${id}: genuine intermediate effects`);
  }
  await page.close();
  assert.deepEqual(failures,[]);
  console.log(`Validated scalar instructions and statement granularity in ${lessons.length} precomputed lessons (${total} snapshots), plus 12 independent transition regressions.`);
}finally{await browser.close();}
