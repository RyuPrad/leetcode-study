import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { ROOT } from '../scripts/content.mjs';

const lessons = JSON.parse(fs.readFileSync(path.join(ROOT, 'visualizer-ui/lessons.json'), 'utf8'));
const filter = process.env.STUDY_LAYOUT_PROBLEMS?.split(',').map(Number);
const selected = lessons.filter(lesson => !filter || filter.includes(lesson.number));
assert.ok(selected.length, 'The layout filter must select at least one reference page');
const viewports = [{ width: 1480, height: 940 }, { width: 1100, height: 720 }, { width: 820, height: 520 }, { width: 586, height: 300 }];
const browser = await chromium.launch();
const page = await browser.newPage({ reducedMotion: 'reduce' });
const errors = [], results = [];
page.on('pageerror', error => errors.push(error.message));
fs.mkdirSync(path.join(ROOT, 'test-results'), { recursive: true });
const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
async function reachable(locator, label) {
  await locator.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'nearest' }));
  await settle();
  const metrics = await locator.evaluate(element => {
    const r = element.getBoundingClientRect();
    // A long source line may scroll horizontally, but its visible left edge
    // and complete line height must remain reachable without another panel over it.
    let left = Math.max(0, r.left), right = Math.min(innerWidth, r.right), top = 0, bottom = innerHeight;
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      const s = getComputedStyle(parent), p = parent.getBoundingClientRect();
      if (/auto|scroll|hidden|clip/.test(s.overflowX)) { left = Math.max(left, p.left); right = Math.min(right, p.right); }
      if (/auto|scroll|hidden|clip/.test(s.overflowY)) { top = Math.max(top, p.top); bottom = Math.min(bottom, p.bottom); }
    }
    const hit = document.elementFromPoint(left + Math.min(24, (right - left) / 2), r.top + r.height / 2);
    return { top: r.top, bottom: r.bottom, availableTop: top, availableBottom: bottom, width: right - left, height: r.height, ownsPoint: element.contains(hit), covering: hit?.className };
  });
  assert.ok(metrics.height > 0 && metrics.width > 8 && metrics.top >= metrics.availableTop - 1 && metrics.bottom <= metrics.availableBottom + 1 && metrics.ownsPoint, `${label}: ${JSON.stringify(metrics)}`);
}
try {
  for (const lesson of selected) {
    await page.goto(pathToFileURL(path.join(ROOT, lesson.path)).href + '?embedded=1');
    await page.waitForFunction(() => window.studyLessonAdapter && window.studyPanelLayout && document.querySelector('.study-object-card'));
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.getByRole('button',{name:'Reset layout',exact:true}).click();
      for (const inspectorTop of [400, 280, 150, 0]) {
        await page.evaluate(top => { const inspector = document.querySelector('.study-inspector'),scroll=document.querySelector('.study-panel-scroll'); scroll.scrollTop += inspector.getBoundingClientRect().top - top; }, inspectorTop);
        await settle();
        const layout = await page.evaluate(() => {
          const a = document.querySelector('[data-study-panel=code]').getBoundingClientRect(), b = document.querySelector('.study-inspector').getBoundingClientRect();
          return { overlap: Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)), horizontalOverflow: document.documentElement.scrollWidth - innerWidth };
        });
        assert.equal(layout.overlap, 0, `#${lesson.number} ${viewport.width} inspector at ${inspectorTop}: code overlaps inspector`);
        assert.ok(layout.horizontalOverflow <= 1, `#${lesson.number} ${viewport.width}: document overflows by ${layout.horizontalOverflow}px`);
      }
      const lines = page.locator('.study-code .code-line,.study-code .cl').filter({ hasText: /\S/ });
      await reachable(lines.first(), `#${lesson.number} ${viewport.width}: first source line`);
      await reachable(lines.last(), `#${lesson.number} ${viewport.width}: last source line`);
      await page.evaluate(()=>studyPanelLayout.show('objects'));
      await reachable(page.getByRole('button',{name:'Move Objects',exact:true}), `#${lesson.number} ${viewport.width}: Objects title bar`);
      await reachable(page.locator('.study-object-font-controls button').first(), `#${lesson.number} ${viewport.width}: Object text control`);
      if ([21, 206].includes(lesson.number)) {
        await page.locator('.study-inspector').evaluate(element => element.scrollIntoView({ block: 'center' }));
        await settle();
        await page.screenshot({ path: path.join(ROOT, `test-results/reference-layout-${lesson.number}-${viewport.width}.png`) });
      }
      results.push({ number: lesson.number, viewport });
    }
    if (results.length % 120 === 0) console.log(`Checked ${results.length / viewports.length}/${selected.length} reference layouts.`);
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(ROOT, 'test-results/reference-layout.json'), JSON.stringify({ passed: true, problems: selected.length, configurations: results.length, results }, null, 2));
  console.log(`PASS ${selected.length} reference pages at ${viewports.length} sizes: disjoint default panels, reachable source endpoints, movable headers and Object controls.`);
} finally { await browser.close(); }
