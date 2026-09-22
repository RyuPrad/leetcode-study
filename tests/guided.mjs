import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';
const metadata=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
const content=['a','b'].flatMap(shard=>fs.existsSync(path.join(ROOT,`visualizer-ui/guided-content-${shard}.json`))?JSON.parse(fs.readFileSync(path.join(ROOT,`visualizer-ui/guided-content-${shard}.json`),'utf8')):[]);
const lessons=content.filter(l=>!process.argv[2]||process.argv.slice(2).includes(l.id.split(':')[1]));
if(!process.argv[2])assert.equal(lessons.length,250);
const browser=await chromium.launch({headless:true});let cursor=0,count=0,checkpoints=0;const failures=[];
fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
async function worker(){const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});page.setDefaultTimeout(15000);
  while(cursor<lessons.length){const lesson=lessons[cursor++],meta=metadata.find(l=>l.id===lesson.id),errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
    try{
      await page.goto(pathToFileURL(path.join(ROOT,meta.path)).href+'?guided=1&walkthrough=compact');
      await page.waitForFunction(()=>window.studyGuidedController?.progress&&!window.studyGuidedController.busy);
      assert.equal(await page.evaluate(()=>window.studyGuidedController.error),'');
      assert.ok(await page.locator('.study-code').isVisible(),'reference solution stays visible');
      assert.ok(await page.locator('.study-inspector').isHidden(),'future trace caches cannot leak through the inspector');
      for(const cp of lesson.checkpoints){
        await page.evaluate(async()=>{await window.studyLessonAdapter.seek(100000);});
        assert.equal(await page.evaluate(()=>window.studyLessonSource.index()),cp.beforeIndex,'future seek stops before unanswered prediction');
        assert.equal(await page.locator('.guided-question').innerText(),cp.prompt);
        assert.equal(await page.evaluate(cp=>window.StudyGuided.matches(window.StudyGuided.project(window.studyLessonAdapter.snapshot()),cp.before),cp),true);
        for(const line of cp.codeLines)assert.ok(await page.locator(`#line-${line},#l${line}`).count(),`${lesson.id} code line ${line} exists`);
        await page.evaluate(()=>window.studyLessonAdapter.next());assert.equal(await page.evaluate(()=>window.studyLessonSource.index()),cp.beforeIndex,'adapter cannot bypass question');
        const wrong=cp.options.find(o=>o.id!==cp.correctOptionId);
        await page.locator(`.guided-choice[data-option-id="${wrong.id}"]`).click();assert.equal(await page.evaluate(()=>window.studyLessonSource.index()),cp.beforeIndex);
        assert.equal(await page.locator('.guided-feedback').innerText(),wrong.feedback);
        await page.getByRole('button',{name:'Hint',exact:true}).click();await page.getByRole('button',{name:'Another hint',exact:true}).click();assert.equal(await page.locator('.guided-hint').count(),2);
        for(const target of cp.targets||[]){
          const item=page.locator(target.selector).first();
          assert.ok(await item.isVisible(),`${lesson.id} target is visible: ${target.selector}`);
          assert.equal(await item.getAttribute('aria-label'),target.label);
          if(target.optionId!==cp.correctOptionId){
            await item.press('Enter');
            assert.equal(await page.evaluate(id=>window.studyGuidedController.progress.answers[id].choiceId,cp.id),target.optionId,'diagram keyboard selection records the matching answer');
            assert.equal(await page.evaluate(()=>window.studyLessonSource.index()),cp.beforeIndex,'wrong diagram answer does not reveal the next state');
          }
        }
        if(cp===lesson.checkpoints[1])await page.getByRole('button',{name:'Show me',exact:true}).click();
        else {const direct=cp.targets?.find(t=>t.optionId===cp.correctOptionId);if(direct)await page.locator(direct.selector).first().click();else await page.locator(`.guided-choice[data-option-id="${cp.correctOptionId}"]`).click();await page.getByRole('button',{name:'Watch the change',exact:true}).click();}
        await page.waitForFunction(index=>!window.studyGuidedController.busy&&window.studyLessonSource.index()===index,cp.afterIndex);
        assert.equal(await page.evaluate(()=>window.studyGuidedController.error),'');
        assert.equal(await page.evaluate(cp=>window.StudyGuided.matches(window.StudyGuided.project(window.studyLessonAdapter.snapshot()),cp.after),cp),true);
        assert.equal(await page.locator('.guided-explanation').innerText(),cp.explanation);
        if([1,70,143,235,752].includes(meta.number)&&cp===lesson.checkpoints[0])await page.screenshot({path:path.join(ROOT,`test-results/guided-${meta.number}.png`)});
        await page.getByRole('button',{name:'Continue',exact:true}).click();checkpoints++;
      }
      assert.ok(await page.getByRole('heading',{name:'Lesson explored',exact:true}).isVisible());
      const completed=await page.evaluate(()=>window.studyGuidedController.progress);assert.ok(completed.completedAt);
      await page.evaluate(()=>window.studyLessonAdapter.seek(0));assert.deepEqual((await page.evaluate(()=>window.studyGuidedController.progress)).answers,completed.answers);
      await page.getByRole('button',{name:'Restart lesson',exact:true}).click();await page.waitForFunction(()=>!window.studyGuidedController.busy);
      const restarted=await page.evaluate(()=>window.studyGuidedController.progress);assert.deepEqual(restarted.answers,{});assert.equal(restarted.previousCompletion.completedAt,completed.completedAt);assert.notEqual(restarted.runId,completed.runId);
      assert.equal(await page.evaluate(()=>window.studyGuidedController.error),'');assert.deepEqual(errors,[]);
    }catch(error){failures.push({id:lesson.id,error:String(error)});console.log('FAIL',lesson.id,String(error));await page.screenshot({path:path.join(ROOT,`test-results/guided-failure-${meta.number}.png`)}).catch(()=>{});}
    finally{page.off('pageerror',onError);}count++;if(count%25===0)console.log(`Guided lessons ${count}/${lessons.length}; ${checkpoints} checkpoints; ${failures.length} failures`);
  }await page.close();
}
try{await Promise.all(Array.from({length:4},worker));}finally{await browser.close();}
const result={lessons:count,checkpoints,failures};fs.writeFileSync(path.join(ROOT,process.argv[2]?'test-results/guided-selected.json':'test-results/guided.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(failures.length)process.exitCode=1;
