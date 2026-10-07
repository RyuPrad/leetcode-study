import { _electron as electron } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import { ROOT } from '../scripts/content.mjs';

const expectedVersion=process.env.STUDY_EXPECT_VERSION||JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8')).version;
fs.mkdirSync(path.join(ROOT,'.test-data'),{recursive:true});fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
const profile = fs.mkdtempSync(path.join(ROOT, '.test-data/object-view-desktop-'));
const env = { ...process.env, STUDY_DATA_DIR: profile, STUDY_HEADLESS: '1' };
delete env.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({
  ...(process.env.STUDY_TEST_EXE ? { executablePath: process.env.STUDY_TEST_EXE, args: [] } : { args: [ROOT] }),
  env, timeout: 30000,
});
const page = await app.firstWindow();
page.setDefaultTimeout(20000);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const checked = [], assets = [];
try {
  await page.locator('.problem-table').waitFor();
  await page.emulateMedia({reducedMotion:'reduce'});
  await app.evaluate(({ session }) => session.defaultSession.enableNetworkEmulation({ offline: true }));
  const bootstrap=await page.evaluate(()=>window.study.bootstrap());
  assert.equal(bootstrap.version,expectedVersion);
  assert.equal(await app.evaluate(({app})=>app.getVersion()),expectedVersion);
  if(process.env.STUDY_TEST_EXE)assert.equal(await app.evaluate(({app})=>app.isPackaged),true);
  const entries = bootstrap.catalog.entries.filter(entry => entry.number);
  assert.equal(entries.length, 252);
  assert.equal(entries.filter(entry => entry.visualizerPath).length, 252);
  const first = entries.find(entry => entry.number === 1);
  await page.getByRole('searchbox', { name: 'Search problems' }).fill('1');
  await page.getByRole('button', { name: `Open ${first.title}`, exact: true }).click();
  const initialIframe = await page.locator(`iframe[title=${JSON.stringify(`${first.title} visualizer`)}]`).elementHandle();
  const assetFrame = await initialIframe.contentFrame();
  await assetFrame.waitForFunction(() => window.studyLessonAdapter?.objectSnapshot && document.querySelector('.study-object-card'));
  await assetFrame.waitForLoadState('load');
  for (const entry of entries) {
    // Give offline navigation headroom on busy Windows runners; retain full load readiness.
    await assetFrame.goto(`study://content/${entry.visualizerPath.split('/').map(encodeURIComponent).join('/')}?embedded=1&parentOrigin=${encodeURIComponent('study://app')}`, { waitUntil: 'load', timeout: 90000 });
    await assetFrame.waitForFunction(() => window.studyLessonAdapter?.objectSnapshot && document.querySelector('.study-object-card'));
    const evidence = await assetFrame.evaluate(() => {
      if (!window.StudyObjectView || !window.StudyObjectState) throw Error('Shared Object View scripts are missing from the offline payload');
      for (const name of ['object-view.js', 'object-state.js']) if (!document.querySelector(`script[src$="/${name}"]`)) throw Error('Missing shared script: ' + name);
      if (!document.querySelector('link[href$="/object-view.css"]')) throw Error('Missing Object View stylesheet');
      const container = document.getElementById('study-object-view'), body = container.querySelector('.study-object-body');
      if (getComputedStyle(body).fontSize !== '16px') throw Error('Object View card stylesheet did not load');
      if (container.querySelector('.study-object-frame>h3,.study-object-scope>h4')) throw Error('Reference view displays a pseudo-call header');
      return { number: studyLessonSource.spec.number, cards: container.querySelectorAll('.study-object-card').length };
    });
    assert.equal(evidence.number, entry.number);assets.push(evidence);
    if(assets.length%50===0)console.log(`Offline Object View assets: ${assets.length}/${entries.length}`);
  }
  assert.equal(assets.length, 252);
  console.log('Checked offline Object View scripts and card stylesheet for all 252 packaged lessons.');
  await page.getByRole('button', { name: 'Back to library', exact: true }).click();
  for (const number of [1, 21, 48, 98, 104, 141, 143, 206, 226, 133, 208, 230, 572, 146, 703, 700, 933]) {
    console.log(`Checking desktop Objects: ${number}`);
    const entry = entries.find(item => item.number === number);
    await page.getByRole('searchbox', { name: 'Search problems' }).fill(String(number));
    await page.getByRole('button', { name: `Open ${entry.title}`, exact: true }).click();
    await page.getByRole('tab', { name: 'Visualizer', exact: true }).click();
    const iframe = await page.locator(`iframe[title=${JSON.stringify(`${entry.title} visualizer`)}]`).elementHandle();
    const frame = await iframe.contentFrame();
    await frame.waitForFunction(() => window.studyLessonAdapter?.objectSnapshot && document.querySelector('#study-object-view[data-object-view-index]'));
    assert.ok(await frame.locator('[data-study-panel=objects]').isVisible());
    const evidence = await frame.evaluate(async () => {
      const source = window.studyLessonSource, adapter = window.studyLessonAdapter, walkthrough = window.studyWalkthrough;
      const initial = JSON.stringify(adapter.objectSnapshot());
      const initialIndex = source.index();
      adapter.objectSnapshot(); adapter.objectSnapshot();
      if (source.index() !== initialIndex || JSON.stringify(adapter.objectSnapshot()) !== initial) throw Error('Inspecting objects changed the initial state');
      for (let i = 0; i < 6 && !document.getElementById('btn-next').disabled; i++) adapter.next();
      const index = source.index(), forward = JSON.stringify(adapter.objectSnapshot());
      if (!index) throw Error('Object View did not advance');
      if (adapter.objectSnapshot().stack.some(call => call.location.line !== walkthrough.operation.location.line)) throw Error('Object View labels the wrong source instruction');
      document.querySelector('.operation-controls button').click();
      const momentIndex = Number(document.querySelector('[data-object-view-index]').dataset.objectViewIndex);
      if (momentIndex !== index - 1 || source.index() !== index) throw Error('Action review must show before-state without executing');
      await walkthrough.next();
      if (source.index() !== index || Number(document.querySelector('[data-object-view-index]').dataset.objectViewIndex) !== index) throw Error('Result review changed the algorithm or displayed the wrong snapshot');
      await adapter.seek(0);
      if (JSON.stringify(adapter.objectSnapshot()) !== initial) throw Error('Object View did not restore the initial state');
      await adapter.seek(index);
      if (JSON.stringify(adapter.objectSnapshot()) !== forward) throw Error('Object View did not restore the recorded state');
      const container=document.getElementById('study-object-view'),grid=container.querySelector('.study-object-card-grid'),width=container.getBoundingClientRect().width;
      const columns=getComputedStyle(grid).gridTemplateColumns.split(' ').length;
      if(columns!==(width>=1200?3:width>=800?2:1))throw Error('Object View card columns do not follow the inspector width');
      const cards=[...container.querySelectorAll('.study-object-card')],ids=adapter.objectSnapshot().objects.map(object=>object.id);
      for(const card of cards){const badge=card.querySelector('.study-object-variable'),body=card.querySelector('.study-object-body');
        if(badge.getBoundingClientRect().bottom>body.getBoundingClientRect().top+1)throw Error('Variable badge is not above the nested body');
        if(getComputedStyle(body).fontSize!=='16px'||!getComputedStyle(body).fontFamily.includes('Consolas'))throw Error('Object View body font differs from the card design');
        if(ids.some(id=>body.innerText.includes(id)))throw Error('Internal object IDs occupy visible card text');
      }
      let nullArguments=0;
      if([98,104,226,572].includes(source.spec.number)){
        const live=JSON.stringify(adapter.objectSnapshot()),liveIndex=source.index();
        for(let i=0;i<source.count();i++){
          const raw=source.readAt(i),objectFrame=source.objectFrame(i),variables=objectFrame.stack.flatMap(call=>call.variables);
          if(variables.some(variable=>variable.value?.special==='not recorded at this checkpoint'))throw Error('Packaged recursive call lost an actual pointer');
          if([104,226].includes(source.spec.number)&&raw.stack.length){
            const root=variables.find(variable=>variable.name==='root')?.value;
            if(raw.currentId===null){if(root!==null)throw Error('A recursive null root became the original tree root');nullArguments++;}
            else if(root?.ref!==`tree:${raw.currentId}`)throw Error('Recursive root does not reference its actual node');
          }
        }
        if(source.index()!==liveIndex||JSON.stringify(adapter.objectSnapshot())!==live)throw Error('Historical recursive Object View executed the algorithm');
        if([104,226].includes(source.spec.number)&&!nullArguments)throw Error('No recursive null arguments tested');
      }
      return { number: source.spec.number, index, momentIndex, variables: adapter.objectSnapshot().stack.flatMap(item => item.variables).length, cards:cards.length, width, columns, nullArguments };
    });
    assert.ok(evidence.variables > 0);
    checked.push(evidence);
    if (number === 21) {
      await app.evaluate(({BrowserWindow})=>{const window=BrowserWindow.getAllWindows()[0];window.show();window.focus();});
      await page.locator('.visualizer-container').evaluate(container=>{container.scrollTop=container.scrollHeight;});
      await frame.locator('.study-inspector').evaluate(inspector=>inspector.scrollIntoView({block:'center'}));
      await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const normalChrome=await frame.locator('#study-object-view').evaluate(container=>{
        const rect=element=>{const box=element.getBoundingClientRect();return {top:box.top,bottom:box.bottom,left:box.left,right:box.right,width:box.width,height:box.height};};
        const strip=document.querySelector('.study-controls');
        return {playbackStrip:{...rect(strip),position:getComputedStyle(strip).position},toolbar:rect(container.querySelector('.study-object-toolbar')),toolbarHits:[...container.querySelectorAll('.study-object-toolbar button')].map(button=>{
          const box=button.getBoundingClientRect(),hit=document.elementFromPoint(box.left+box.width/2,box.top+box.height/2);
          return {label:button.getAttribute('aria-label'),visible:box.top>=0&&box.bottom<=innerHeight+1,ownsPoint:button.contains(hit),hit:hit?{tag:hit.tagName,classes:hit.className}:null};
        })};
      });
      const cardHits=await frame.locator('#study-object-view').evaluate(container=>{
        const inspector=container.closest('.study-inspector').getBoundingClientRect(),panel=container.closest('.study-inspector-panel').getBoundingClientRect(),toolbar=container.querySelector('.study-object-toolbar').getBoundingClientRect(),hits=[];
        const bounds=rect=>({top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right,width:rect.width,height:rect.height});
        for(const card of container.querySelectorAll('.study-object-card')){
          const body=card.querySelector('.study-object-body'),rect=body.getBoundingClientRect(),left=Math.max(0,rect.left,inspector.left,panel.left),right=Math.min(innerWidth,rect.right,inspector.right,panel.right),top=Math.max(0,rect.top,inspector.top,panel.top,toolbar.bottom),bottom=Math.min(innerHeight,rect.bottom,inspector.bottom,panel.bottom);
          if(right-left<8||bottom-top<8)continue;const x=(left+right)/2,y=(top+bottom)/2,hit=document.elementFromPoint(x,y);
          const clips=[];for(let ancestor=body.parentElement;ancestor;ancestor=ancestor.parentElement)if(['auto','scroll','hidden','clip'].includes(getComputedStyle(ancestor).overflowY))clips.push({tag:ancestor.tagName,classes:ancestor.className,rect:bounds(ancestor.getBoundingClientRect()),scrollTop:ancestor.scrollTop});
          hits.push({name:card.dataset.variableId,ownsPoint:body.contains(hit),coveredByCode:!!hit?.closest('.study-code'),x,y,hit:hit?{tag:hit.tagName,classes:hit.className,text:hit.textContent.trim().slice(0,80)}:null,body:bounds(rect),card:bounds(card.getBoundingClientRect()),inspector:bounds(inspector),panel:bounds(panel),toolbar:bounds(toolbar),viewport:{width:innerWidth,height:innerHeight,scrollY},clips});
        }
        return hits;
      });
      if(!cardHits.length||cardHits.some(hit=>!hit.ownsPoint||hit.coveredByCode)||normalChrome.toolbarHits.some(hit=>!hit.visible||!hit.ownsPoint)){
        const state=await app.evaluate(({BrowserWindow})=>{const window=BrowserWindow.getAllWindows()[0];return {focused:window.isFocused(),visible:window.isVisible(),minimized:window.isMinimized(),bounds:window.getBounds(),contentBounds:window.getContentBounds()};});
        const iframeBox=await page.locator(`iframe[title=${JSON.stringify(`${entry.title} visualizer`)}]`).boundingBox();
        fs.writeFileSync(path.join(ROOT,'test-results/object-view-body-hit-diagnostic.json'),JSON.stringify({number,normalChrome,cardHits,state,iframeBox},null,2));
        const image=await app.evaluate(async({BrowserWindow})=>(await BrowserWindow.getAllWindows()[0].webContents.capturePage(undefined,{stayHidden:true,stayAwake:true})).toPNG().toString('base64'));
        fs.writeFileSync(path.join(ROOT,'test-results/object-view-body-hit-diagnostic.png'),Buffer.from(image,'base64'));
      }
      assert.ok(normalChrome.toolbarHits.length>=2,'Both Object text-size controls are present');for(const hit of normalChrome.toolbarHits)assert.ok(hit.visible&&hit.ownsPoint,`${hit.label}: the normal Object toolbar must own visible pixels after page scrolling: ${JSON.stringify(normalChrome)}`);
      assert.ok(cardHits.length>0,'packaged reference cards occupy accessible visible pixels');for(const hit of cardHits)assert.ok(hit.ownsPoint&&!hit.coveredByCode,`${hit.name}: actual packaged Objects body must own visible pixels: ${JSON.stringify(hit)}`);
      evidence.cardHits=cardHits;evidence.normalChrome=normalChrome;
      const headerHits=[];
      for(const name of await frame.locator('#study-object-view .study-object-card').evaluateAll(cards=>cards.map(card=>card.dataset.variableId))){
        const card=frame.locator(`#study-object-view .study-object-card[data-variable-id=${JSON.stringify(name)}]`),opener=card.getByRole('button',{name:`Expand ${name}`,exact:true});
        await opener.evaluate(button=>button.scrollIntoView({block:'center',inline:'nearest'}));await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        const hit=await opener.evaluate(button=>{
          const badge=button.closest('.study-object-card').querySelector('.study-object-variable');
          const visibleHit=element=>{const box=element.getBoundingClientRect();return box.top>=0&&box.bottom<=innerHeight+1&&box.left>=0&&box.right<=innerWidth+1&&element.contains(document.elementFromPoint(box.left+box.width/2,box.top+box.height/2));};
          return {name:button.closest('.study-object-card').dataset.variableId,expand:visibleHit(button),badge:visibleHit(badge)};
        });
        assert.ok(hit.expand&&hit.badge,`${name}: the real variable badge and Expand control must be fully visible and own pixels`);headerHits.push(hit);
      }
      evidence.headerHits=headerHits;
      const box=await frame.locator('.study-inspector').boundingBox();
      assert.ok(box&&box.width>0&&box.height>0,'packaged Object View inspector occupies a visible rectangle');
      const capture=await app.evaluate(async({BrowserWindow})=>{
        const image=await BrowserWindow.getAllWindows()[0].webContents.capturePage(undefined,{stayHidden:true,stayAwake:true});
        if(image.isEmpty())throw Error('Packaged Object View screenshot is empty');
        return image.toPNG().toString('base64');
      });
      fs.writeFileSync(path.join(ROOT, `test-results/object-view-cards-021-${process.env.STUDY_TEST_EXE ? 'packaged' : 'desktop'}.png`),Buffer.from(capture,'base64'));
      await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].hide());
    }
    await page.getByRole('tab', { name: 'Learn', exact: true }).click();
    const guidedElement = await page.locator('.guided-container iframe').elementHandle();
    const guided = await guidedElement.contentFrame();
    await guided.waitForFunction(() => window.studyGuidedController && !window.studyGuidedController.busy);
    assert.ok(await guided.locator('.study-inspector').isHidden(), 'guided Learn retains its prediction layout');
    assert.equal(await guided.evaluate(() => window.studyGuidedController.error), '');
    await page.getByRole('button', { name: 'Back to library', exact: true }).click();
  }
  assert.deepEqual(errors, []);
  const appAsarSha256=process.env.STUDY_TEST_EXE?createHash('sha256').update(fs.readFileSync(path.join(path.dirname(process.env.STUDY_TEST_EXE),'resources/app.asar'))).digest('hex'):undefined;
  const report = { passed: true, version:expectedVersion, offline: true, packaged: !!process.env.STUDY_TEST_EXE, ...(appAsarSha256?{appAsarSha256}:{}), assetLessons:assets.length, assets, checked, errors };
  fs.writeFileSync(path.join(ROOT, `test-results/object-view-${process.env.STUDY_TEST_EXE ? 'packaged' : 'desktop'}.json`), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({...report,assets:undefined}, null, 2));
} finally {
  await app.close();
}
