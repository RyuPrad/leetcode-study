import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {ROOT} from '../scripts/content.mjs';
import {cardFor,settle,expectedColumns,presentation,assertPresentation} from './object-view-interactions.mjs';

const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
const lesson=lessons.find(lesson=>lesson.number===21);
fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
const browser=await chromium.launch(),reports=[];
const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];
page.on('pageerror',error=>errors.push(error.message));
try{
 for(const viewport of [{width:1480,height:940},{width:1280,height:720},{width:1100,height:600},{width:1024,height:720}]){
  await page.setViewportSize(viewport);
  await page.goto(pathToFileURL(path.join(ROOT,lesson.path)).href+'?embedded=1&walkthrough=compact');
  await page.waitForFunction(()=>window.studyLessonAdapter&&document.querySelector('.study-object-card'));
  await page.evaluate(()=>{for(let index=0;index<8;index++)studyLessonAdapter.next();});
  const container=page.locator('#study-object-view'),before=await presentation(page);
  await page.locator('.study-inspector').evaluate(inspector=>inspector.scrollIntoView({block:'center'}));await settle(page);
  const toolbarHits=await container.locator('.study-object-toolbar button').evaluateAll(buttons=>buttons.map(button=>{
   const rect=button.getBoundingClientRect(),hit=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
   return {label:button.getAttribute('aria-label'),visible:rect.top>=0&&rect.bottom<=innerHeight+1,ownsPoint:button.contains(hit)};
  }));
  assert.ok(toolbarHits.length>=2);for(const hit of toolbarHits)assert.ok(hit.visible&&hit.ownsPoint,`${hit.label}: the normal Object toolbar stays readable and clickable after page scrolling`);
  const playbackStrip=await page.locator('.study-controls').evaluate(strip=>{const rect=strip.getBoundingClientRect();return {height:rect.height,top:rect.top,bottom:rect.bottom,position:getComputedStyle(strip).position};});
  const names=await container.locator('.study-object-card').evaluateAll(cards=>cards.map(card=>card.dataset.variableId));
  const headerHits=[];
  for(const name of names){
   const card=cardFor(container,name),opener=card.getByRole('button',{name:`Expand ${name}`,exact:true});
   await opener.evaluate(button=>button.scrollIntoView({block:'center',inline:'nearest'}));await settle(page);
   const hit=await opener.evaluate(button=>{
    const box=button.getBoundingClientRect(),x=box.left+box.width/2,y=box.top+box.height/2,hit=document.elementFromPoint(x,y);
    const badge=button.closest('.study-object-card').querySelector('.study-object-variable'),label=badge.getBoundingClientRect(),badgeHit=document.elementFromPoint(label.left+label.width/2,label.top+label.height/2);
    return {name:button.closest('.study-object-card').dataset.variableId,visible:box.top>=0&&box.bottom<=innerHeight+1&&box.left>=0&&box.right<=innerWidth+1,ownsPoint:button.contains(hit),coveredByCode:!!hit?.closest('.study-code'),badgeVisible:label.top>=0&&label.bottom<=innerHeight+1,badgeOwnsPoint:badge.contains(badgeHit)};
   });
   assert.ok(hit.visible&&hit.ownsPoint&&!hit.coveredByCode&&hit.badgeVisible&&hit.badgeOwnsPoint,`${name}: the variable badge and Expand control must own their fully visible pixels`);
   await opener.click();assert.equal(await container.getAttribute('data-object-focused'),'true');
   const controls=page.locator('.study-controls #btn-next');await controls.scrollIntoViewIfNeeded();
   assert.ok(await controls.isVisible(),'The real step control remains available in expanded Object View.');
   await container.locator('.study-object-back').click();await settle(page);
   await assertPresentation(page,before,'Header inspection cannot advance the algorithm.');headerHits.push(hit);
  }
  await container.scrollIntoViewIfNeeded();
  const width=await container.evaluate(element=>element.getBoundingClientRect().width),columns=await container.locator('.study-object-card-grid').first().evaluate(grid=>getComputedStyle(grid).gridTemplateColumns.split(' ').length);
  assert.equal(columns,expectedColumns(width),'Column count follows readable widths, without requiring an overlap layout.');
  reports.push({viewport,width,columns,toolbarHits,playbackStrip,headerHits});
  await container.screenshot({path:path.join(ROOT,`test-results/object-view-stacking-${viewport.width}.png`)});
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(ROOT,'test-results/object-view-stacking.json'),JSON.stringify({passed:true,reports},null,2));
 console.log('PASS every Object View header is visible and clickable, cards are unobstructed, and expanded views retain step controls in four embedded viewport sizes.');
}finally{await browser.close();}
