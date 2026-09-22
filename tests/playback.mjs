import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, collectCatalog } from '../scripts/content.mjs';

const catalog = collectCatalog();
const selected = process.env.VISUALIZER_FILTER ? catalog.visualizers.filter(file => file.includes(process.env.VISUALIZER_FILTER)) : catalog.visualizers;
const browser = await chromium.launch();
const failures = [], results = [];
let cursor = 0;

// Compare observable algorithm state, independently of playback's own UI/state.
function snapshot() {
  const text = selector => document.querySelector(selector)?.textContent.replace(/\s+/g, ' ').trim() || '';
  return {
    visual: text('#visual-ui,#lists-ui,#svg,#lists'), objects: text('#object-view,#obj,.obj-view-grid'),
    board: text('#board'), variables: text('#console-ui,#console'), hud: text('#hud-ui'),
    narration: text('#narration-ui,#narration,#narr'), trace: text('#trace-ui'), result: text('#final-ui'),
    active: [...document.querySelectorAll('.code-line.active,.cl.active')].map(el => el.id),
    nextDisabled: document.getElementById('btn-next').disabled, prevDisabled: document.getElementById('btn-prev').disabled
  };
}
const click = (page, selector) => page.locator(selector).evaluate(button => button.click());
const speed = (page, value) => page.locator('#study-speed').evaluate((select, value) => { select.value = value; select.dispatchEvent(new Event('change', { bubbles: true })); }, String(value));
const paused = async page => assert.equal(await page.locator('#study-play').getAttribute('aria-pressed'), 'false');

async function sweep() {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  try {
    while (cursor < selected.length) {
      const file = selected[cursor++]; errors.length = 0;
      try {
        await page.goto(pathToFileURL(path.join(ROOT, file)).href+'?walkthrough=compact');
        assert.equal(await page.locator('#study-play:visible').count(), 1);
        assert.equal(await page.locator('.btn-play:visible,.btn-pause:visible,#speed-input:visible').count(), 0);
        assert.equal(await page.locator('#study-speed').inputValue(), '1');
        const initial = await page.evaluate(snapshot);
        await click(page, '#btn-next'); const first = await page.evaluate(snapshot);
        await page.evaluate(() => { for (let i = 0; i < 3; i++) document.getElementById('btn-next').click(); });
        const forward = await page.evaluate(snapshot);
        await click(page, '#btn-reset');
        const steps = await page.evaluate(() => {
          const next = document.getElementById('btn-next'); let count = 0;
          while (!next.disabled && !/finished/i.test(next.textContent) && count < 2000) { next.click(); count++; }
          return count;
        });
        assert.ok(steps < 2000);
        const final = await page.evaluate(snapshot);
        await click(page, '#btn-reset');
        await click(page, '#study-play'); await page.clock.runFor(4000);
        assert.deepEqual(await page.evaluate(snapshot), forward, `${file}: timed steps match manual steps`);
        if (await page.locator('#study-play').getAttribute('aria-pressed') === 'true') await click(page, '#study-play');
        await paused(page); await page.clock.runFor(5000);
        assert.deepEqual(await page.evaluate(snapshot), forward, `${file}: pause preserves state`);
        await click(page, '#btn-reset'); await speed(page, 4); await click(page, '#study-play');
        await page.clock.runFor(steps * 250 + 250);
        assert.deepEqual(await page.evaluate(snapshot), final, `${file}: full playback matches manual result`);
        await paused(page); assert.equal(await page.locator('#study-play').getAttribute('aria-label'), 'Replay');
        await click(page, '#study-play');
        assert.deepEqual(await page.evaluate(snapshot), initial, `${file}: replay resets the current input`);
        await page.clock.runFor(250);
        assert.deepEqual(await page.evaluate(snapshot), first, `${file}: replay advances at the selected speed`);
        assert.deepEqual(errors, [], file);
        results.push({ file, steps });
      } catch (error) { failures.push(`${file}: ${error.message}`); }
      if ((results.length + failures.length) % 25 === 0) console.log(`Playback checked: ${results.length + failures.length}/${selected.length}`);
    }
  } finally { await page.close(); }
}

async function interactions() {
  const page = await browser.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
  try {
    const entry = catalog.entries.find(entry => entry.number === 1);
    const url = pathToFileURL(path.join(ROOT, entry.visualizerPath)).href+'?walkthrough=compact';
    await page.goto(url);
    const initial = await page.evaluate(snapshot);
    await click(page, '#btn-next'); const first = await page.evaluate(snapshot);
    await click(page, '#btn-next'); const second = await page.evaluate(snapshot);
    for (const rate of [0.5, 1, 2, 4]) {
      await click(page, '#btn-reset'); await speed(page, rate); await click(page, '#study-play');
      await page.clock.runFor(1000 / rate - 1); assert.deepEqual(await page.evaluate(snapshot), initial);
      await page.clock.runFor(1); assert.deepEqual(await page.evaluate(snapshot), first);
      await click(page, '#study-play'); await page.clock.runFor(10000);
      assert.deepEqual(await page.evaluate(snapshot), first);
      await click(page, '#study-play'); await page.clock.runFor(1000 / rate);
      assert.deepEqual(await page.evaluate(snapshot), second, 'Resume continues from the paused step');
    }
    // Changing speed replaces the pending timer without a skipped/doubled step.
    await click(page, '#btn-reset'); await speed(page, 1); await click(page, '#study-play');
    await page.clock.runFor(500); await speed(page, 4);
    await page.clock.runFor(249); assert.deepEqual(await page.evaluate(snapshot), initial);
    await page.clock.runFor(1); assert.deepEqual(await page.evaluate(snapshot), first);
    await page.clock.runFor(250); assert.deepEqual(await page.evaluate(snapshot), second);
    await click(page, '#btn-reset');
    for (let i = 0; i < 20; i++) await click(page, '#study-play');
    await paused(page); await page.clock.runFor(5000); assert.deepEqual(await page.evaluate(snapshot), initial);
    await click(page, '#study-play'); await page.clock.runFor(250); assert.deepEqual(await page.evaluate(snapshot), first);
    await click(page, '#btn-prev'); await paused(page); await page.clock.runFor(5000); assert.deepEqual(await page.evaluate(snapshot), initial);
    await click(page, '#study-play'); await click(page, '#btn-next'); await paused(page);
    await page.clock.runFor(5000); assert.deepEqual(await page.evaluate(snapshot), first);
    for (const selector of ['#btn-reset', '#btn-ex-2', '.study-custom-menu button[onclick="loadCustom()"]']) {
      await click(page, '#study-play'); await click(page, selector); await paused(page);
      const stopped = await page.evaluate(snapshot); await page.clock.runFor(5000);
      assert.deepEqual(await page.evaluate(snapshot), stopped, `${selector} cancels playback`);
      assert.equal(await page.locator('#study-speed').inputValue(), '4');
    }
    await click(page, '#study-play');
    await page.locator('#custom-input').evaluate(input => { input.value = 'bad input'; input.dispatchEvent(new Event('input', { bubbles: true })); });
    await paused(page); await click(page, '.study-custom-menu button[onclick="loadCustom()"]');
    assert.ok(await page.locator('.study-feedback:not([hidden])').isVisible());
    await click(page, '#study-play');
    await page.evaluate(() => window.dispatchEvent(new Event('blur'))); await paused(page);
    await page.evaluate(() => window.dispatchEvent(new Event('focus'))); await paused(page);
    await page.goto(url); assert.equal(await page.locator('#study-speed').inputValue(), '1'); await paused(page);
    assert.deepEqual(errors, []);
    console.log('PASS speeds, pause/resume, rapid toggles, manual controls, inputs and speed lifetime');
  } finally { await page.close(); }
}

async function mutatedInputs() {
  const page = await browser.newPage();
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
  const cases = [
    [27, '1, 2, 1, 3 | 1', '.result-value', /^return 2$/],
    [26, '0,0,1,1,2', '.result-value', /^k = 3\s+->\s+\[0, 1, 2\]$/],
    [88, '2,4,0,0 | 2 | 1,3 | 2', '.result-value', /^\[1, 2, 3, 4\]$/],
    [344, 'c,o,d,e', '.result-value', /^"edoc"$/],
    [40, '3,1,1,2 | 4', '#console-ui', /res = \[ \[1,1,2\], \[1,3\] \]/]
  ];
  try {
    for (const [number, input, selector, expected] of cases) {
      const file = catalog.entries.find(entry => entry.number === number).visualizerPath;
      await page.goto(pathToFileURL(path.join(ROOT, file)).href+'?walkthrough=compact');
      await page.locator('#custom-input').evaluate((field, value) => { field.value = value; }, input);
      await click(page, '.study-custom-menu button[onclick="loadCustom()"]');
      const initial = await page.evaluate(snapshot);
      const steps = await page.evaluate(() => {
        const next = document.getElementById('btn-next'); let count = 0;
        while (!next.disabled && count < 2000) { next.click(); count++; } return count;
      });
      assert.ok(steps < 2000);
      assert.match(await page.locator(selector).textContent(), expected, file);
      const final = await page.evaluate(snapshot);
      // An unsubmitted draft must not replace the loaded input on replay.
      await page.locator('#custom-input').evaluate(field => { field.value = 'unsubmitted draft'; });
      await speed(page, 4);
      for (let i = 0; i < 2; i++) {
        await click(page, '#study-play');
        assert.deepEqual(await page.evaluate(snapshot), initial, `${file}: restores the loaded custom input`);
        await page.clock.runFor(steps * 250 + 250);
        assert.deepEqual(await page.evaluate(snapshot), final, `${file}: repeat replay produces the same result`);
        await paused(page);
      }
    }
    console.log('PASS repeated replay restores custom inputs for all five visualizers that mutate their input');
  } finally { await page.close(); }
}

try {
  await Promise.all(Array.from({ length: 4 }, sweep));
  await interactions();
  await mutatedInputs();
} catch (error) { failures.push(error.stack); }
finally { await browser.close(); }
fs.mkdirSync(path.join(ROOT, 'test-results'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'test-results/playback.json'), JSON.stringify({ count: results.length, failures, results }, null, 2));
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`PASS playback, completion and replay for all ${results.length} visualizers.`);
