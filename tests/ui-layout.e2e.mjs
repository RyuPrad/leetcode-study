import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import { ROOT } from '../scripts/content.mjs';

fs.mkdirSync(path.join(ROOT, '.test-data'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'test-results'), { recursive: true });
const profile = fs.mkdtempSync(path.join(ROOT, '.test-data/ui-layout-'));
const env = { ...process.env, STUDY_DATA_DIR: profile, STUDY_HEADLESS: '0' };
delete env.ELECTRON_RUN_AS_NODE; delete env.STUDY_DEV_URL;
const app = await electron.launch({ ...(env.STUDY_TEST_EXE ? { executablePath: env.STUDY_TEST_EXE, args: [] } : { args: [ROOT] }), env });
const page = await app.firstWindow(); page.setDefaultTimeout(6000);
const errors = [], failures = [], results = [];
page.on('pageerror', error => errors.push(error.message));
const cases = ['minimum', 'default', 'maximized'].flatMap(name => [1, 1.25, 1.5, 1.75].map(zoom => ({ name, zoom })))
  .filter(item => !env.STUDY_UI_FILTER || `${item.name}@${Math.round(item.zoom * 100)}` === env.STUDY_UI_FILTER);
assert.ok(cases.length, 'The UI filter must select a real window/zoom configuration');
const settle = host => host.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
let label = '', screen = '', complete = false;
async function reachable(locator, name) {
  await locator.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'nearest' })); await settle(page);
  const value = await locator.evaluate(element => {
    const r = element.getBoundingClientRect(); let left = 0, top = 0, right = innerWidth, bottom = innerHeight;
    for (let p = element.parentElement; p; p = p.parentElement) {
      const s = getComputedStyle(p), b = p.getBoundingClientRect();
      if (/auto|scroll|hidden|clip/.test(s.overflowX)) { left = Math.max(left, b.left); right = Math.min(right, b.right); }
      if (/auto|scroll|hidden|clip/.test(s.overflowY)) { top = Math.max(top, b.top); bottom = Math.min(bottom, b.bottom); }
      if (p.matches(':modal')) break; // Top-layer dialogs escape their DOM ancestors' clipping.
    }
    return { width: r.width, height: r.height, left: r.left, right: r.right, top: r.top, bottom: r.bottom, clip: { left, right, top, bottom }, owns: [.2, .5, .8].every(x => element.contains(document.elementFromPoint(r.left + r.width * x, r.top + r.height / 2))) };
  });
  assert.ok(value.width > 0 && value.height > 0 && value.left >= value.clip.left - 1 && value.right <= value.clip.right + 1 && value.top >= value.clip.top - 1 && value.bottom <= value.clip.bottom + 1 && value.owns, `${name}: ${JSON.stringify(value)}`);
}
async function click(locator, name) { await reachable(locator, name); await locator.click(); }
async function audit(name, action) {
  screen = name;
  try { await action(); results.push({ geometry: label, screen: name, passed: true }); }
  catch (error) {
    const screenshot = `ui-layout-${label}-${name.replace(/[^a-z0-9]+/gi, '-')}-failure.png`;
    await capture(screenshot).catch(() => {});
    failures.push({ geometry: label, screen: name, error: error.message, screenshot });
    console.log(`FAIL ${label} ${name}: ${error.message.split('\n')[0]}`);
    await page.keyboard.press('Escape');
  }
}
async function capture(name) {
  const png = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].webContents.capturePage()).toPNG().toString('base64'));
  fs.writeFileSync(path.join(ROOT, 'test-results', name), Buffer.from(png, 'base64'));
}
async function shellFits() {
  const overflow = await page.locator('.app,.app-body,.main-content').evaluateAll(elements => elements.map(el => ({ name: el.className, excess: el.scrollWidth - el.clientWidth })));
  overflow.push(await page.evaluate(() => ({ name: 'document', excess: document.scrollingElement.scrollWidth - innerWidth })));
  assert.ok(overflow.every(item => item.excess <= 1), `App panels must fit without hidden horizontal scrolling: ${JSON.stringify(overflow)}`);
}
const navigation = new Set(['Problem library', 'Bookmarks', 'Review queue', 'Practice history', 'Reference guides']);
const button = name => navigation.has(name) ? page.getByTitle(name, { exact: true }) : page.getByRole('button', { name, exact: true });
async function library() { await button('Problem library').click(); await page.locator('.library-panel').waitFor(); }
async function open(number) {
  await library(); await page.getByRole('searchbox', { name: 'Search problems' }).fill(String(number));
  const title = (await page.evaluate(() => window.study.bootstrap())).catalog.entries.find(entry => entry.number === number).title;
  await click(button(`Open ${title}`), `Open #${number}`);
}
async function tab(name) { await click(page.getByRole('tab', { name, exact: true }), `${name} tab`); }
async function controls(root) {
  const items = root.locator('button:visible,select:visible,input:visible');
  for (let i = 0; i < await items.count(); i++) await reachable(items.nth(i), (await items.nth(i).getAttribute('aria-label')) || (await items.nth(i).textContent()) || 'input');
}
try {
  await page.locator('.problem-table').waitFor();
  assert.equal(await app.evaluate(({ app }) => app.getPath('userData')), profile);
  assert.equal(await app.evaluate(({ app }) => app.getVersion()), env.STUDY_EXPECT_VERSION || JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'))).version);
  await app.evaluate(({ session }) => session.defaultSession.enableNetworkEmulation({ offline: true }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const definitions = JSON.parse(fs.readFileSync(path.join(ROOT, 'coding/problems.json'), 'utf8'));
  const source = definitions.find(problem => problem.number === 1).reference;
  await page.evaluate(async source => {
    const timer = await window.study.selectProblem('leetcode:1');
    await window.study.editSession(timer.sessionId, { durationMs: 450000, outcome: 'needs-review', reflection: 'Long reflection to exercise wrapping and independent scrolling. '.repeat(35) });
    await window.study.selectProblem(null);
    await window.study.setProgress('leetcode:1', { bookmarked: true, needsReview: true, status: 'in-progress' });
    await window.study.saveDraft('leetcode:1', source, '');
    await window.study.recordSubmission('leetcode:1', source, { verdict: 'Accepted', passed: 1, total: 1, durationMs: 25, cases: [{ name: 'Layout fixture', input: [[2, 7], 9], actual: [0, 1], expected: [0, 1], verdict: 'Accepted', logs: [], durationMs: 25 }] });
  }, source);
  for (const item of cases) {
    label = `${item.name}-${Math.round(item.zoom * 100)}`; console.log(`UI audit ${label}`);
    await app.evaluate(({ BrowserWindow }, item) => {
      const win = BrowserWindow.getAllWindows()[0]; win.restore();
      win.setSize(...(item.name === 'minimum' ? [1024, 720] : [1480, 940]));
      if (item.name === 'maximized') win.maximize();
      win.webContents.setZoomFactor(item.zoom); win.show(); win.focus();
    }, item); await settle(page);
    item.actual = await app.evaluate(({ BrowserWindow }) => { const win = BrowserWindow.getAllWindows()[0]; return { bounds: win.getBounds(), contentSize: win.getContentSize(), zoom: win.webContents.getZoomFactor(), maximized: win.isMaximized() }; });
    assert.ok(Math.abs(item.actual.zoom - item.zoom) < 1e-8);
    if (item.name === 'maximized') assert.ok(item.actual.maximized, 'The native window really is maximized');
    await audit('Library and sidebar', async () => {
      await library();
      await shellFits();
      const expand = button('Expand sidebar'); if (await expand.count()) await expand.click();
      await shellFits();
      await capture(`ui-layout-${label}-library-top.png`);
      await controls(page.locator('.main-nav')); await reachable(button('Settings and backup'), 'Settings');
      await reachable(page.locator('.topic-nav button').last(), 'Last topic');
      await controls(page.locator('.library-tools')); await controls(page.locator('.filter-row'));
      await page.getByRole('searchbox', { name: 'Search problems' }).fill('no-such-problem-UI');
      await click(button('Clear filters'), 'Clear empty search');
      await click(button('Bookmarks'), 'Bookmarks'); await reachable(page.locator('.problem-link').first(), 'Bookmarked problem');
      await click(button('Review queue'), 'Review queue'); await reachable(page.locator('.problem-link').first(), 'Review problem');
      await capture(`ui-layout-${label}-library.png`);
    });
    await audit('Notes and history', async () => {
      await open(206); await tab('Notes'); await page.locator('.markdown').waitFor();
      await shellFits();
      await reachable(page.locator('.markdown h2').last(), 'Last note section');
      await click(button('Practice history'), 'History navigation');
      await click(button('Edit session').last(), 'Edit session');
      await reachable(page.getByLabel('Reflection', { exact: true }), 'Reflection'); await controls(page.locator('dialog'));
      await page.keyboard.press('Escape'); await page.locator('dialog').waitFor({ state: 'detached' });
      await click(button('Reference guides'), 'Reference guides'); await click(page.locator('.reference-card').last(), 'Reference guide');
      await reachable(page.locator('.markdown h2').last(), 'Last reference section');
    });
    await audit('Settings and errors', async () => {
      await click(button('Settings and backup'), 'Settings'); await controls(page.locator('dialog'));
      const invalid = path.join(profile, 'invalid-backup.json'); fs.writeFileSync(invalid, '{"version":999}');
      await app.evaluate(({ dialog }, filename) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [filename] }); }, invalid);
      await click(button('Restore backup'), 'Restore'); await page.locator('dialog .error-text').waitFor();
      await reachable(page.locator('dialog .error-text'), 'Backup error');
      await click(button('Close dialog'), 'Close settings');
      const dismiss = button('Dismiss message'); if (await dismiss.count()) await click(dismiss, 'Dismiss error banner');
    });
    await audit('Visualizer and Objects', async () => {
      await open(206);
      const sidebarToggle = button('Expand sidebar');
      if (await sidebarToggle.count()) {
        await sidebarToggle.click(); await shellFits();
        await controls(page.locator('.workspace-tabbar'));
        await button('Collapse sidebar').click();
      }
      const frame = await page.locator('.visualizer-container:not(.guided-container) iframe').elementHandle().then(el => el.contentFrame());
      await frame.waitForFunction(() => window.studyLessonAdapter?.objectSnapshot);
      const code = frame.locator('.study-code');
      for (const line of [code.locator('.code-line').first(), code.locator('.code-line').last()]) await reachable(line, 'Reference code line');
      await frame.evaluate(()=>studyPanelLayout.show('code'));
      const initialIndex=await frame.evaluate(()=>studyLessonSource.index());
      await frame.getByRole('button',{name:'Resize Reference Code',exact:true}).click();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
      assert.equal(await frame.evaluate(()=>studyLessonSource.index()),initialIndex,'Keyboard resizing never steps');
      await frame.getByRole('button',{name:'Reset layout',exact:true}).click();
      await frame.evaluate(()=>studyPanelLayout.show('objects'));
      for (const top of [280, 150, 0]) {
        const overlap = await frame.evaluate(top => {
          const inspector = document.querySelector('.study-inspector'),scroll=document.querySelector('.study-panel-scroll'); scroll.scrollTop+=inspector.getBoundingClientRect().top-top;
          const a = document.querySelector('[data-study-panel=code]').getBoundingClientRect(), b = inspector.getBoundingClientRect();
          return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        }, top); assert.equal(overlap, 0, 'Source and inspector rectangles must stay disjoint');
      }
      await click(frame.getByRole('button', { name: 'Expand head', exact: true }), 'Expand head');
      await reachable(frame.locator('#btn-next'), 'Expanded step');
      await page.keyboard.press('Escape'); await frame.waitForFunction(() => document.querySelector('#study-object-view').dataset.objectFocused==='false');
      await tab('Notes'); await tab('Visualizer');
      await frame.evaluate(()=>studyPanelLayout.show('objects'));await reachable(frame.getByRole('button',{name:'Move Objects',exact:true}), 'Restored Objects panel');
      await capture(`ui-layout-${label}-reference.png`);
    });
    await audit('Learn panes', async () => {
      await open(21); await tab('Learn');
      const frame = await page.locator('.guided-container iframe').elementHandle().then(el => el.contentFrame());
      await frame.locator('.guided-controls').waitFor();
      await click(frame.getByRole('button', { name: 'Next prediction', exact: true }), 'Next prediction');
      await frame.locator('.guided-choice').first().waitFor();
      await controls(frame.locator('.guided-controls'));
      await reachable(frame.locator('.guided-choice').last(), 'Guided answer');
      await reachable(frame.locator('.study-code .code-line,.study-code .cl').last(), 'Guided last source line');
      const panes = await frame.locator('.guided-panel,.study-diagram,.study-code').evaluateAll(items => items.map(el => ({ height: el.clientHeight, width: el.clientWidth })));
      assert.ok(panes.every(p => p.height >= 100 && p.width >= 90), `Guided panes retain useful reading space: ${JSON.stringify(panes)}`);
      await capture(`ui-layout-${label}-learn.png`);
    });
    await audit('Code and debugger', async () => {
      await open(1); await tab('Code'); await page.getByRole('textbox', { name: 'JavaScript solution', exact: true }).waitFor();
      await controls(page.locator('.code-toolbar')); await controls(page.locator('.code-panel-tabs'));
      await click(button('Reset code'), 'Reset code'); await controls(page.locator('dialog')); await click(button('Cancel'), 'Cancel reset');
      await click(page.getByRole('tab', { name: /Submissions/ }), 'Submissions');
      await click(page.locator('.submission-list button').first(), 'Saved submission'); await controls(page.locator('.submission-preview')); await click(button('Close submission'), 'Close submission');
      await click(button('Debug'), 'Debug'); await page.waitForFunction(() => document.querySelector('.debug-status.paused,.debug-result'));
      await controls(page.locator('.debug-timeline'));
      const more = button('More controls'); if (await more.isVisible()) await more.click();
      await controls(page.locator('.debug-controls')); await controls(page.locator('.debug-toolbar'));
      if (await more.isVisible()) await more.click();
      await capture(`ui-layout-${label}-debug.png`);
      const immediate = button('Close debugger and return to code');
      if (await immediate.isVisible()) await immediate.click(); else await page.locator('.debug-toolbar').getByRole('button', { name: /Stop \/ edit|Back to code/ }).click();
      await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'JavaScript solution');
      const editor = await page.locator('.code-editor').boundingBox(); assert.ok(editor.height >= 85, `Editor retains readable space: ${editor.height}`);
    });
  }
  assert.deepEqual(errors, [], 'No renderer errors');
  complete = true;
} finally {
  fs.writeFileSync(path.join(ROOT, 'test-results/ui-layout-desktop.json'), JSON.stringify({ passed: complete && failures.length === 0 && errors.length === 0, complete, executable: env.STUDY_TEST_EXE || 'development', profile, cases, results, failures, errors }, null, 2));
  await app.close();
}
assert.deepEqual(failures, [], 'Every audited screen must pass');
console.log(`PASS ${results.length} desktop screen/zoom checks.`);
