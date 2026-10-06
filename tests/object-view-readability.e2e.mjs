import { _electron as electron } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT } from '../scripts/content.mjs';
import { cardFor, settle, expectedColumns, presentation, assertPresentation, checkIndependentScroll, checkFocusRestore } from './object-view-interactions.mjs';

fs.mkdirSync(path.join(ROOT, '.test-data'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'test-results'), { recursive: true });
const profile = fs.mkdtempSync(path.join(ROOT, '.test-data/object-view-readability-'));
const expectedVersion = process.env.STUDY_EXPECT_VERSION || JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
const env = { ...process.env, STUDY_DATA_DIR: profile, STUDY_HEADLESS: '0' };
delete env.ELECTRON_RUN_AS_NODE; delete env.STUDY_DEV_URL;
if (process.env.STUDY_TEST_EXE) env.PATH = `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`;
const app = await electron.launch({ ...(process.env.STUDY_TEST_EXE ? { executablePath: process.env.STUDY_TEST_EXE, args: [] } : { args: [ROOT] }), env, timeout: 30000 });
const page = await app.firstWindow(); page.setDefaultTimeout(20000);
const errors = [], results = [];
page.on('pageerror', error => errors.push(error.message));
const filter = process.env.STUDY_READABILITY_FILTER;
const surface = process.env.STUDY_READABILITY_SURFACE || 'both';
assert.ok(['both','reference','code'].includes(surface), 'The surface filter selects reference, code or both.');
const cases = [
  { name: 'minimum', width: 1024, height: 720, zoom: 1.75 },
  ...[1, 1.25, 1.5].map(zoom => ({ name: 'minimum', width: 1024, height: 720, zoom })),
  ...[1, 1.25, 1.5, 1.75].map(zoom => ({ name: 'default', width: 1480, height: 940, zoom })),
].filter(item => !filter || `${item.name}@${Math.round(item.zoom * 100)}` === filter);
assert.ok(cases.length, 'The readability filter selects a real native geometry.');
async function geometry(item) {
  await app.evaluate(({ BrowserWindow }, item) => {
    const window = BrowserWindow.getAllWindows()[0];
    window.restore(); window.setContentSize(item.width, item.height); window.webContents.setZoomFactor(item.zoom); window.show(); window.focus();
  }, item);
  await page.waitForFunction(() => document.hasFocus());
  await settle(page);
  const actual = await app.evaluate(({ BrowserWindow }) => ({ contentSize: BrowserWindow.getAllWindows()[0].getContentSize(), zoom: BrowserWindow.getAllWindows()[0].webContents.getZoomFactor() }));
  assert.ok(actual.contentSize.every((size,index) => Math.abs(size - [item.width,item.height][index]) <= 1), 'The native content size matches the tested window within one device-pixel rounding unit.');
  assert.ok(Math.abs(actual.zoom - item.zoom) < 1e-8, 'The native zoom matches the tested factor within floating-point rounding.');
  Object.assign(item, { actualContentSize: actual.contentSize, actualZoom: actual.zoom });
}
async function visibleControls(host, container, { scroll = true } = {}) {
  const controls = container.getByRole('button', { name: 'Increase Object View text size', exact: true });
  if (scroll) await controls.scrollIntoViewIfNeeded();
  assert.ok(await controls.evaluate(button => {
    const box = button.getBoundingClientRect(), hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return box.top >= 0 && box.bottom <= innerHeight + 1 && button.contains(hit);
  }), 'The text-size control owns visible pixels at the real zoom.');
  const before = await presentation(host);
  await controls.click(); assert.equal(await container.locator('.study-object-body').first().evaluate(body => getComputedStyle(body).fontSize), '18px');
  await container.getByRole('button', { name: 'Decrease Object View text size', exact: true }).click();
  await assertPresentation(host, before, 'Native text changes preserve the suspended instruction.');
  // Free windows can sit outside the scrolled canvas; their fixed recovery
  // controls must remain available regardless of the active object card.
  for (const control of [host.locator('.study-panels-menu summary'), host.getByRole('button', { name: 'Reset layout', exact: true })]) {
    assert.ok(await control.evaluate(button => {
      const box = button.getBoundingClientRect();
      return box.top >= 0 && box.bottom <= innerHeight + 1 && button.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2));
    }), 'Panel recovery controls stay visible and unobstructed while Object cards scroll.');
  }
}
async function inspect(host, item, name, last, neighbor, frameId) {
  const container = host.locator('.study-object-view').filter({ visible: true }).first();
  const card = cardFor(container, name, frameId);
  await card.scrollIntoViewIfNeeded();
  const opener = card.getByRole('button', { name: `Expand ${name}`, exact: true });
  await opener.scrollIntoViewIfNeeded();
  assert.ok(await opener.isVisible());
  const metrics = await container.evaluate(container => ({ width: container.getBoundingClientRect().width, columns: getComputedStyle(container.querySelector('.study-object-card-grid')).gridTemplateColumns.split(' ').length, font: getComputedStyle(container.querySelector('.study-object-body')).fontSize }));
  assert.equal(metrics.columns, expectedColumns(metrics.width)); assert.equal(metrics.font, '16px');
  await visibleControls(host, container);
  const scroll = await checkIndependentScroll(page, host, container, name, last, { neighborName: neighbor, frameId });
  await visibleControls(host, container);
  await checkFocusRestore(host, container, name, { frameId });
  await opener.click(); await settle(host);
  const focus = await card.locator('.study-object-body').evaluate(body => {
    const region = body.getBoundingClientRect(), frame = body.closest('.study-object-view').getBoundingClientRect();
    let top = 0, bottom = innerHeight;
    for (let ancestor = body.parentElement; ancestor; ancestor = ancestor.parentElement) if (['auto','scroll','hidden','clip'].includes(getComputedStyle(ancestor).overflowY)) { const box = ancestor.getBoundingClientRect(); top = Math.max(top, box.top); bottom = Math.min(bottom, box.bottom); }
    const style = getComputedStyle(body);
    return { height: body.clientHeight, visibleHeight: Math.min(region.bottom, bottom) - Math.max(region.top, top), padding: parseFloat(style.paddingTop) + parseFloat(style.paddingBottom), lineHeight: parseFloat(style.lineHeight), width: body.clientWidth, focusedWidth: frame.width, fullyVisible: region.top >= top - 1 && region.bottom <= bottom + 1, ownsViewport: [.1,.5,.9].every(portion => body.contains(document.elementFromPoint(region.left + region.width / 2, region.top + region.height * portion))) };
  });
  const minimumLines = item.name === 'default' && item.zoom === 1 ? 12 : 8;
  assert.ok(focus.fullyVisible && focus.ownsViewport && focus.visibleHeight - focus.padding >= focus.lineHeight * minimumLines - 1, `Expanded Object View must show ${minimumLines} complete lines in its real available viewport: ${JSON.stringify(focus)}`);
  const mode = await container.getAttribute('data-object-view-mode');
  const focusScreenshot = `object-view-readability-${mode}-focus-${item.name}-${Math.round(item.zoom * 100)}.png`;
  await page.screenshot({ path: path.join(ROOT,'test-results',focusScreenshot) });
  await container.locator('.study-object-back').scrollIntoViewIfNeeded(); await container.locator('.study-object-back').click();
  return { ...item, ...metrics, scroll, focus, focusScreenshot };
}
async function open(number) {
  if (await page.getByRole('button', { name: 'Back to library', exact: true }).count()) await page.getByRole('button', { name: 'Back to library', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search problems' }).fill(String(number));
  const title = (await page.evaluate(() => window.study.bootstrap())).catalog.entries.find(entry => entry.number === number).title;
  await page.getByRole('button', { name: `Open ${title}`, exact: true }).click();
}
try {
  await page.locator('.problem-table').waitFor(); await page.emulateMedia({ reducedMotion: 'reduce' });
  await app.evaluate(({ session }) => session.defaultSession.enableNetworkEmulation({ offline: true }));
  assert.equal(await app.evaluate(({ app }) => app.getVersion()), expectedVersion);
  assert.equal(await app.evaluate(({ app }) => app.getPath('userData')), profile);
  if (process.env.STUDY_TEST_EXE) assert.ok(await app.evaluate(({ app }) => app.isPackaged));
  if (surface !== 'code') {
  await open(26); await page.getByRole('tab', { name: 'Visualizer', exact: true }).click();
  const frame = await page.locator('.visualizer-container:not(.guided-container) iframe').elementHandle().then(element => element.contentFrame());
  await frame.waitForFunction(() => window.studyLessonAdapter?.objectSnapshot);
  await frame.evaluate(() => { document.getElementById('custom-input').value = Array.from({ length: 80 }, (_, index) => index).join(','); loadCustom(); for (let i = 0; i < 6; i++) studyLessonAdapter.next(); });
  await cardFor(frame.locator('#study-object-view'), 'nums').getByRole('button', { name: /Show 30 more entries/ }).click();
  for (const item of cases) {
    console.log(`Native reference Objects: ${item.name}@${Math.round(item.zoom * 100)}`);
    await geometry(item); const evidence = await inspect(frame, item, 'nums', '[data-entry="79"]', 'right');
    const before = await presentation(frame);
    await cardFor(frame.locator('#study-object-view'), 'nums').getByRole('button', { name: 'Expand nums', exact: true }).click();
    await frame.locator('.study-controls #btn-next').scrollIntoViewIfNeeded(); assert.ok(await frame.locator('.study-controls #btn-next').isVisible());
    await frame.locator('.study-object-back').click(); await assertPresentation(frame, before, 'Inspecting the focused reference does not execute Next.');
    results.push({ surface: 'reference', ...evidence });
  }
  }
  // Exercise real user-code snapshots and the debugger host, without opening Diagrams.
  if (surface !== 'reference') {
  const source = `function twoSum(nums,target) {
  const values=Array.from({length:160},(_,i)=>i);
  const rows=Array.from({length:10},(_,r)=>Array.from({length:16},(_,c)=>r*16+c));
  const scalar=target;
  const holder={values,rows};
  return [0,1];
}`;
  await page.evaluate(source => window.study.saveDraft('leetcode:1', source, '[]'), source);
  await open(1); await page.getByRole('tab', { name: 'Code', exact: true }).click();
  await page.getByRole('textbox', { name: 'JavaScript solution', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Debug', exact: true }).click(); await page.waitForFunction(() => document.querySelector('.debug-status.paused'));
  const codeObjects = page.locator('#debug-objects-panel .study-object-view');
  for (let step = 0; step < 10 && !await cardFor(codeObjects,'holder').locator('[data-entry="values"]').count(); step++) {
    const more = page.getByRole('button', { name: 'More controls', exact: true });
    if (await more.isVisible() && await more.getAttribute('aria-expanded') === 'false') await more.click();
    const before = await page.locator('.debug-timeline>span').innerText();
    await page.locator('.debug-controls').getByRole('button', { name: 'Step Over', exact: true }).click();
    await page.waitForFunction(before => document.querySelector('.debug-status.paused') && document.querySelector('.debug-timeline>span').textContent !== before, before);
  }
  assert.ok(await cardFor(codeObjects,'holder').locator('[data-entry="values"]').count(), 'The own-code fixture reaches initialized values, rows, scalar and holder before returning.');
  assert.ok(await cardFor(codeObjects,'rows').locator('[data-entry="9"]').count());
  const normalMore = page.getByRole('button', { name: 'More controls', exact: true });
  if (await normalMore.isVisible() && await normalMore.getAttribute('aria-expanded') === 'true') await normalMore.click();
  assert.ok(await page.locator('[data-study-panel=objects]').isVisible());
  await cardFor(codeObjects, 'values').getByRole('button', { name: /Show 110 more entries/ }).click();
  for (const item of cases) {
    console.log(`Native Code Objects: ${item.name}@${Math.round(item.zoom * 100)}`);
    await geometry(item); const evidence = await inspect(page, item, 'values', '[data-entry="159"]', 'rows');
    const before = await presentation(page);
    await cardFor(codeObjects, 'values').getByRole('button', { name: 'Expand values', exact: true }).click();
    assert.ok(await page.locator('.debug-source').isHidden());
    assert.ok(await page.locator('.debug-timeline').isVisible(), 'Focused Objects keeps recorded history available.');
    const more = page.getByRole('button', { name: 'More controls', exact: true });
    if (await more.isVisible()) {
      assert.ok(await page.getByRole('button', { name: 'Close debugger and return to code', exact: true }).isVisible());
      await more.click();
      assert.ok(await page.locator('#debug-object-secondary-controls .debug-toolbar').isVisible());
      assert.ok(await page.locator('#debug-object-secondary-controls .debug-controls').isVisible());
      assert.ok(await page.locator('#debug-object-secondary-controls .debug-moments').isVisible());
      for (const control of [page.locator('#debug-object-secondary-controls').getByRole('button', { name: 'Step Over', exact: true }), page.locator('#debug-object-secondary-controls').getByRole('combobox', { name: 'Walkthrough detail', exact: true })]) {
        await control.scrollIntoViewIfNeeded();
        assert.ok(await control.evaluate(control => {
          const box = control.getBoundingClientRect();
          return box.top >= 0 && box.bottom <= innerHeight + 1 && control.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2));
        }), 'Original step and walkthrough controls remain reachable inside the compact popover.');
      }
      await more.click();
    } else {
      assert.ok(await page.locator('.debug-toolbar').isVisible()); assert.ok(await page.locator('.debug-controls').isVisible());
    }
    await codeObjects.locator('.study-object-back').click(); await assertPresentation(page, before, 'Large Code Object View preserves its actual suspended checkpoint.');
    assert.ok(await page.locator('.debug-source').isVisible());
    const screenshot = `object-view-readability-code-${item.name}-${Math.round(item.zoom * 100)}.png`;
    await page.screenshot({ path: path.join(ROOT, 'test-results', screenshot) }); results.push({ surface: 'code', ...evidence, screenshot });
  }
  }
  assert.equal(errors.length, 0, `Renderer errors: ${errors.length}`);
  const appAsarSha256 = process.env.STUDY_TEST_EXE ? createHash('sha256').update(fs.readFileSync(path.join(path.dirname(process.env.STUDY_TEST_EXE), 'resources/app.asar'))).digest('hex') : undefined;
  const report = { passed: true, version: expectedVersion, profile, packaged: !!process.env.STUDY_TEST_EXE, offline: true, ...(appAsarSha256 ? { appAsarSha256 } : {}), filter: filter || null, surface, results };
  fs.writeFileSync(path.join(ROOT, 'test-results', `object-view-readability-${filter || surface !== 'both' ? 'selected' : process.env.STUDY_TEST_EXE ? 'packaged' : 'desktop'}.json`), JSON.stringify(report, null, 2));
  console.log(`PASS ${results.length} native Object View size and zoom cases.`);
} catch (error) {
  await page.screenshot({ path: path.join(ROOT, 'test-results/object-view-readability-failure.png') }).catch(() => {});
  const diagnostics = [];
  for (const frame of page.frames()) {
    try { diagnostics.push(await frame.evaluate(() => {
      const selectors = ['.topbar','.problem-heading','.workspace-tabbar','.debug-toolbar','.debug-controls','.debug-timeline','.debug-moments','.debug-visual-pane','.study-controls','.study-timeline','.study-operation','.study-inspector','.study-object-toolbar','.study-object-card-header','.study-object-body'];
      return { url: location.href, viewport: { width: innerWidth, height: innerHeight }, rects: Object.fromEntries(selectors.map(selector => {
        const element = document.querySelector(selector); if (!element) return [selector,null];
        const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
        return [selector,{x:rect.x,y:rect.y,width:rect.width,height:rect.height,visible:style.display!=='none',scrollHeight:element.scrollHeight,clientHeight:element.clientHeight,lineHeight:style.lineHeight,overflowY:style.overflowY}];
      })) };
    })); } catch { /* A discarded frame has no active viewport to diagnose. */ }
  }
  fs.writeFileSync(path.join(ROOT,'test-results/object-view-readability-diagnostic.json'),JSON.stringify({ error: String(error), filter: filter || null, diagnostics },null,2));
  console.error(JSON.stringify(diagnostics,null,2));
  throw error;
} finally { await app.close(); }
