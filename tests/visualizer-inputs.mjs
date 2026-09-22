import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, collectCatalog } from '../scripts/content.mjs';
const catalog = collectCatalog();
const samples = new Set(catalog.topics.map(topic => catalog.visualizers.find(file => file.startsWith(`${topic}/`))).filter(Boolean));
for (const id of [1, 23, 49, 141, 143, 206, 997]) samples.add(catalog.entries.find(e => e.number === id).visualizerPath);
const browser = await chromium.launch();
const cases = [];
try {
  for (const file of samples) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.join(ROOT, file)).href);
    const result = await page.evaluate(() => {
      function finish() {
        const next = document.getElementById('btn-next'); let steps = 0;
        while (!next.disabled && !/finished/i.test(next.textContent) && steps < 2000) { next.click(); steps++; }
        if (steps === 2000) throw new Error('Example did not finish');
      }
      const buttons = [...document.querySelectorAll('.study-input-popover button')].filter(b => /^load(?:Example|Ex)\(/.test(b.getAttribute('onclick') || ''));
      for (const button of buttons) { button.click(); finish(); }
      buttons[0]?.click();
      const custom = document.querySelector('.study-custom-menu button[onclick="loadCustom()"]');
      if (custom) { custom.click(); finish(); }
      const options = [...document.querySelectorAll('.study-input-popover button[id*="toggle"],#labBtn,#layoutBtn,#objBtn')];
      options.forEach(button => button.click());
      return { presets: buttons.length, custom: !!custom, options: options.length, feedback: document.querySelector('.study-feedback:not([hidden])')?.textContent || '' };
    });
    assert.deepEqual(errors, [], file); assert.equal(result.feedback, '', `${file}: default custom input should be valid`);
    cases.push({ file, ...result }); await page.close();
  }
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.join(ROOT, catalog.entries.find(e => e.number === 1).visualizerPath)).href);
  await page.locator('summary').filter({ hasText: 'Custom input' }).click();
  await page.locator('#custom-input').fill('not an array');
  await page.getByRole('button', { name: 'Load', exact: true }).click();
  await page.locator('.study-feedback:not([hidden])').waitFor();
  await page.locator('#custom-input').fill('3,2,4'); await page.locator('#target-input').fill('6');
  await page.getByRole('button', { name: 'Load', exact: true }).click();
  await page.locator('summary').filter({ hasText: 'Custom input' }).click();
  const returned = await page.evaluate(() => { const next = document.getElementById('btn-next'); for (let i = 0; i < 100 && !next.disabled; i++) next.click(); return document.querySelector('.result-value')?.textContent; });
  assert.match(returned, /1\s*,\s*2/);
  await page.locator('#btn-fullscreen').click();
  await page.waitForFunction(() => !!document.fullscreenElement);
  await page.evaluate(() => document.exitFullscreen());
  for (const [number, expected] of [[997, /2/], [23, /1,\s*1,\s*2,\s*3,\s*4,\s*4,\s*5,\s*6/]]) {
    await page.goto(pathToFileURL(path.join(ROOT, catalog.entries.find(e => e.number === number).visualizerPath)).href);
    const output = await page.evaluate(() => { const next = document.getElementById('btn-next'); for (let i = 0; i < 2000 && !next.disabled && !/finished/i.test(next.textContent); i++) next.click(); return document.querySelector('.result-value')?.textContent || document.querySelector('#narration-ui').textContent; });
    assert.match(output, expected);
  }
  fs.mkdirSync(path.join(ROOT, 'test-results'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'test-results/inputs.json'), JSON.stringify({ passed: true, cases }, null, 2));
  console.log(`PASS ${cases.length} representative visualizers, ${cases.reduce((n, c) => n + c.presets, 0)} presets, ${cases.filter(c => c.custom).length} custom-input parsers, legacy display controls, invalid-input feedback, fullscreen and corrected results.`);
} finally { await browser.close(); }
