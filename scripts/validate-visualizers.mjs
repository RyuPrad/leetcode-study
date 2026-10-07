import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { ROOT, collectCatalog } from './content.mjs';
const capture = process.argv.includes('--baseline');
const catalog = collectCatalog();
const selected = process.env.VISUALIZER_FILTER ? catalog.visualizers.filter(f => f.includes(process.env.VISUALIZER_FILTER)) : catalog.visualizers;
const baselineFile = path.join(ROOT, 'tests/fixtures/visualizer-baseline.json');
const baseline = !capture && fs.existsSync(baselineFile) ? JSON.parse(fs.readFileSync(baselineFile, 'utf8')) : {};
const correctionsFile = path.join(ROOT, 'tests/fixtures/visualizer-corrections.json');
const corrections = fs.existsSync(correctionsFile) ? JSON.parse(fs.readFileSync(correctionsFile, 'utf8')) : {};
const browser = await chromium.launch({ headless: true });
const results = {}, failures = [];
const pending = new Set();
const heartbeat = setInterval(()=>console.log('Still checking:',[...pending].join(', ')),30000);
let cursor = 0, done = 0;
async function inspect(page, file) {
  pending.add(file);
  const errors = [];
  const handler = error => errors.push(error.message);
  page.on('pageerror', handler);
  try {
    const sourceRoot = capture ? path.join(ROOT, '.baseline/content') : ROOT;
    await page.goto(pathToFileURL(path.join(sourceRoot, file)).href, { waitUntil: 'load', timeout: 90000 });
    const result = await page.evaluate(async () => {
      function snapshot() {
        const text = selector => {
          const source = document.querySelector(selector);
          if (!source) return '';
          const clone = source.cloneNode(true); clone.querySelectorAll('button').forEach(el => el.remove());
          return clone.textContent.replace(/\s+/g, ' ').trim();
        };
        return { visual: text('#visual-ui,#lists-ui,#svg,#lists'), input: text('#input-ui'), result: text('#final-ui'), objects: text('#object-view,#obj,.obj-view-grid'), board: text('#board'), hud: text('#hud-ui'), variables: text('#console-ui,#console'), narration: text('#narration-ui,#narration,#narr'), trace: text('#trace-ui'), active: [...document.querySelectorAll('.code-line.active,.cl.active')].map(el => el.id), nextDisabled: document.getElementById('btn-next')?.disabled, prevDisabled: document.getElementById('btn-prev')?.disabled };
      }
      const initial = snapshot();
      const next = document.getElementById('btn-next'), prev = document.getElementById('btn-prev'), reset = document.getElementById('btn-reset') || document.querySelector('.btn-reset');
      if (!next || !prev || !reset) throw new Error('Missing stepping controls');
      for (let i = 0; i < 6 && !next.disabled; i++) next.click();
      const forward = snapshot();
      if (!prev.disabled) prev.click();
      const back = snapshot();
      reset.click();
      const restarted = snapshot();
      let count = 0;
      if (window.studyLessonAdapter) {
        await window.studyLessonAdapter.seek(50000);
        count = window.studyLessonSource.index();
      } else {
        while (!next.disabled && !/finished/i.test(next.textContent) && count < 50000) { next.click(); count++; }
      }
      const final = snapshot();
      return { initial, forward, back, restarted, final, count, capped: !next.disabled && !/finished/i.test(next.textContent), redesigned: document.body.dataset.workspaceVersion === '1', layout: { scroll: document.documentElement.scrollWidth, width: innerWidth, controlsVisible: !!next.getBoundingClientRect().height } };
    });
    const hashes = Object.fromEntries(['initial', 'forward', 'back', 'restarted', 'final'].map(key => [key, createHash('sha256').update(JSON.stringify(result[key])).digest('hex')]));
    const entry = { ...hashes, steps: result.count, capped: result.capped, errors };
    results[file] = entry;
    if (!capture) {
      if (!result.redesigned) failures.push(`${file}: shared layout not mounted`);
      if (!result.layout.controlsVisible) failures.push(`${file}: step controls hidden`);
      const expected = corrections[file]?.expected || baseline[file];
      if (!expected) failures.push(`${file}: missing baseline`);
      else for (const key of Object.keys(hashes)) if (entry[key] !== expected[key]) failures.push(`${file}: ${key} differs from expected behavior`);
      if (errors.length) failures.push(`${file}: ${errors.join('; ')}`);
      if (result.capped) failures.push(`${file}: did not finish within the explicit 50000-step verification limit`);
    }
  } catch (error) { failures.push(`${file}: ${error.message}`); }
  finally { page.off('pageerror', handler); pending.delete(file); }
}
async function worker() {
  const page = await browser.newPage({ viewport: { width: 1240, height: 820 } });
  while (cursor < selected.length) {
    const file = selected[cursor++]; if(process.env.VISUALIZER_TRACE)console.log('Inspecting',file); await inspect(page, file); done++;
    if (done % 25 === 0 || done === selected.length) console.log(`${capture ? 'Baseline' : 'Validated'} ${done}/${selected.length}`);
  }
  await page.close();
}
await Promise.all(Array.from({ length: 4 }, worker));
clearInterval(heartbeat);
await browser.close();
fs.mkdirSync(path.join(ROOT, 'test-results'), { recursive: true });
if (capture && !failures.length) { fs.mkdirSync(path.dirname(baselineFile), { recursive: true }); fs.writeFileSync(baselineFile, JSON.stringify(results, null, 2)); }
fs.writeFileSync(path.join(ROOT, 'test-results/visualizers.json'), JSON.stringify({ count: selected.length, failures, results }, null, 2));
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`${selected.length} visualizers ${capture ? 'captured' : 'match their reviewed expected behavior'}.`);
