import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';
import {expectedColumns,checkTextSize,checkFocusRestore,presentation,assertPresentation} from './object-view-interactions.mjs';

const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
const directory=path.join(ROOT,'test-results');fs.mkdirSync(directory,{recursive:true});
const browser=await chromium.launch(),reports=[];
const page=await browser.newPage({viewport:{width:1600,height:1200},reducedMotion:'reduce'}),errors=[];
page.on('pageerror',error=>errors.push(error.message));
try{
  for(const [number,label,steps] of [[21,'linked-list',8],[26,'array',7],[48,'matrix',10],[230,'tree',8],[146,'map',12],[703,'heap',8],[141,'cycle',3]]){
    await page.goto(pathToFileURL(path.join(ROOT,lessons.find(lesson=>lesson.number===number).path)).href);
    await page.waitForFunction(()=>window.studyLessonAdapter&&document.querySelector('.study-object-card'));
    await page.evaluate(steps=>{for(let index=0;index<steps&&!document.getElementById('btn-next').disabled;index++)studyLessonAdapter.next();},steps);
    const inspector=page.locator('.study-inspector');
    await inspector.scrollIntoViewIfNeeded();
    const evidence=await page.locator('#study-object-view').evaluate(container=>{
      const cards=[...container.querySelectorAll('.study-object-card')],grid=container.querySelector('.study-object-card-grid');
      const colors=selector=>{const element=container.querySelector(selector);return element?getComputedStyle(element).color:null;},ids=studyLessonAdapter.objectSnapshot().objects.map(object=>object.id);
      const inspector=container.closest('.study-inspector').getBoundingClientRect(),panel=container.closest('.study-inspector-panel').getBoundingClientRect(),cardHits=[];
      for(const card of cards){const rect=card.getBoundingClientRect(),left=Math.max(0,rect.left,inspector.left,panel.left),right=Math.min(innerWidth,rect.right,inspector.right,panel.right),top=Math.max(0,rect.top,inspector.top,panel.top),bottom=Math.min(innerHeight,rect.bottom,inspector.bottom,panel.bottom);
        if(right-left<8||bottom-top<8)continue;const hit=document.elementFromPoint((left+right)/2,top+Math.min(30,(bottom-top)/2));cardHits.push({name:card.dataset.variableId,ownsPoint:card.contains(hit),coveredByCode:!!hit?.closest('.study-code')});
      }
      return {index:Number(container.dataset.objectViewIndex),width:container.getBoundingClientRect().width,columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,cardHits,cards:cards.map(card=>{
        const badge=card.querySelector('.study-object-variable'),body=card.querySelector('.study-object-body'),a=badge.getBoundingClientRect(),b=body.getBoundingClientRect();
        return {name:card.dataset.variableId,badge:badge.textContent.trim(),badgeAbove:a.bottom<=b.top+1,fontSize:getComputedStyle(body).fontSize,fontFamily:getComputedStyle(body).fontFamily,background:getComputedStyle(card).backgroundColor,visibleIds:ids.filter(id=>body.innerText.includes(id)).length};
      }),headings:container.querySelectorAll('.study-object-frame>h3,.study-object-scope>h4').length,colors:{key:colors('.study-object-key'),number:colors('.study-object-scalar.number'),null:colors('.study-object-scalar.null')},aliases:[...container.querySelectorAll('.study-object-alias')].map(alias=>alias.dataset.alias)};
    });
    assert.ok(evidence.cards.length>0);assert.equal(evidence.columns,expectedColumns(evidence.width));
    assert.ok(evidence.cardHits.length>0);for(const hit of evidence.cardHits)assert.ok(hit.ownsPoint&&!hit.coveredByCode,`${number}: ${hit.name} is covered by sticky code`);
    assert.equal(evidence.headings,0);for(const card of evidence.cards){assert.ok(card.badgeAbove,card.name);assert.equal(card.fontSize,'16px');assert.match(card.fontFamily,/Consolas/);assert.notEqual(card.background,'rgba(0, 0, 0, 0)');assert.equal(card.visibleIds,0);assert.ok(card.badge.endsWith(' ='));}
    const channels=color=>color.match(/\d+/g).slice(0,3).map(Number);
    if(evidence.colors.key){const [r,g,b]=channels(evidence.colors.key);assert.ok(g>r&&b>r,'object keys are cyan');}
    if(evidence.colors.number){const [r,g,b]=channels(evidence.colors.number);assert.ok(g>r&&g>b,'numbers are green');}
    if(evidence.colors.null){const [r,g,b]=channels(evidence.colors.null);assert.ok(r>g&&b>g,'null is purple');}
    if(number===21){assert.ok(evidence.aliases.includes('tail'),'actual tail pointer alias is visible');assert.ok(await inspector.locator('[data-entry="val"]').count()>0,'linked nodes retain their real val property');assert.equal(await inspector.locator('[data-entry="value"]').count(),0);}
    if(number===141)assert.match(await inspector.innerText(),/circular reference/,'cyclic next pointer is bounded and labeled');
    const beforeInspect=await presentation(page);
    const firstName=evidence.cards[0].name;
    await checkTextSize(page,page.locator('#study-object-view'));
    await checkFocusRestore(page,page.locator('#study-object-view'),firstName);
    await assertPresentation(page,beforeInspect,'Reference Expand/font/Back/Escape preserves the current real instruction.');
    const stem=`object-view-cards-${String(number).padStart(3,'0')}-${label}`;
    await inspector.screenshot({path:path.join(directory,`${stem}.png`)});
    await page.screenshot({path:path.join(directory,`${stem}-page.png`),fullPage:true});
    const detail=number===703?inspector.locator('[data-variable-id="this"] [data-entry="data"]').first():number===141?inspector.locator('.study-object-reference').filter({hasText:/circular reference/}).first():number===48?inspector.locator('[data-variable-id="matrix"] [data-entry="2"]').last():null;
    if(detail){await detail.scrollIntoViewIfNeeded();await inspector.screenshot({path:path.join(directory,`${stem}-detail.png`)});}
    reports.push({number,label,...evidence,screenshot:`${stem}.png`,...(detail?{detailScreenshot:`${stem}-detail.png`}:{})});
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(directory,'object-view-visual.json'),JSON.stringify({passed:true,reports},null,2));
  console.log(`PASS ${reports.length} representative Object View card layouts and screenshots.`);
}catch(error){
  await page.screenshot({path:path.join(directory,'object-view-visual-failure.png')});
  console.error(await page.evaluate(()=>({url:location.href,viewport:{width:innerWidth,height:innerHeight},rects:Object.fromEntries(['.study-workspace','.study-inspector','.study-inspector-panel','#study-object-view','.study-object-card','.study-object-body'].map(selector=>{const element=document.querySelector(selector),rect=element?.getBoundingClientRect();return [selector,rect?{x:rect.x,y:rect.y,width:rect.width,height:rect.height}:null];}))})));
  throw error;
}finally{await browser.close();}
