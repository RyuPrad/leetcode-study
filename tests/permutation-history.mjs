/* Native Chromium companion to windows-permutation-history.test.cjs.
 * Loads the real offline HTML and all shared scripts in a fresh browser context.
 * Run after: node scripts/check-operations.mjs --build
 *            node scripts/check-guided.mjs --build
 * Then:      node tests/permutation-history.mjs
 * Optional PLAYWRIGHT_MODULE (module specifier or absolute index.mjs path) and
 * CHROMIUM_EXECUTABLE allow a preinstalled browser without changing this test.
 * This does not replace Windows/Electron, installer, or saved-profile coverage.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(ROOT, 'test-results');
fs.mkdirSync(output, {recursive: true});
const report = {passed: false, platform: process.platform, browser: null, checks: [], errors: [], failedRequests: []};
const url = pathToFileURL(path.join(ROOT, 'Backtracking/permutations_visualizer.html')).href;
const presets = [[1,2,3], [0,1], [1], [1,2,3,4], [5,6], [2,4,6]];
let browser, page;
const passed = (name, detail = {}) => { report.checks.push({name, ...detail}); console.log(`PASS ${name}`); };
const factorial = n => Array.from({length: n}, (_, i) => i + 1).reduce((a, b) => a * b, 1);

async function openMenu(selector) {
  const controls = page.locator('.study-extra-controls');
  if (!await controls.evaluate(element => element.open)) await controls.locator('summary').first().click();
  const menu = page.locator(selector);
  if (!await menu.evaluate(element => element.open)) await menu.locator('summary').click();
}
async function custom(input) {
  await openMenu('.study-custom-menu');
  await page.locator('#custom-input').fill(input);
  await page.getByRole('button', {name: 'Load', exact: true}).click();
  await page.locator('.study-custom-menu summary').click();
}
async function preset(index) {
  await openMenu('.study-examples-menu');
  await page.locator(`#btn-ex-${index}`).click();
}
const seek = index => page.evaluate(index => window.studyLessonAdapter.seek(index), index);
const current = () => page.evaluate(() => ({index: studyLessonSource.index(), raw: JSON.stringify(studyLessonSource.read()), objects: JSON.stringify(studyLessonSource.objectFrame())}));
const objectView = () => page.locator('#study-object-view');
const resultCard = () => objectView().locator('.study-object-card[data-variable-id="res"]');

try {
  for (const [file, command] of [['operation-rules.js', 'check-operations'], ['guided-lessons.js', 'check-guided']]) {
    assert.ok(fs.existsSync(path.join(ROOT, 'visualizer-ui', file)), `Generate ${file} with node scripts/${command}.mjs --build`);
  }
  const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
  const {chromium} = await import(path.isAbsolute(moduleName) ? pathToFileURL(moduleName).href : moduleName);
  browser = await chromium.launch({headless: true, ...(process.env.CHROMIUM_EXECUTABLE ? {executablePath: process.env.CHROMIUM_EXECUTABLE} : {})});
  report.browser = browser.version();
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'});
  await context.setOffline(true);
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('requestfailed', request => report.failedRequests.push({url: request.url(), error: request.failure()?.errorText}));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
  await page.goto(`${url}?walkthrough=compact`);
  await page.waitForFunction(() => window.studyLessonAdapter && window.studyWalkthrough && window.studyPanelLayout);
  assert.equal(await page.evaluate(() => location.protocol), 'file:');
  assert.equal(await page.locator('body').getAttribute('data-workspace-version'), '1');
  assert.deepEqual(await page.evaluate(() => studyLessonSource.read().nums), presets[0]);
  passed('Full offline page mounts workspace, operations, Object View and learning adapters');

  await custom('-2,-1,0,1,2');
  const maximum = await page.evaluate(() => {
    const final = studyLessonSource.readAt(studyLessonSource.count() - 1);
    const records = steps.map((frame, index) => frame.phase === 'RECORD' ? index : -1).filter(index => index >= 0);
    window.__permutationHistory = {timeline: steps, ready: JSON.stringify(steps[0]), firstIndex: records[0], first: JSON.stringify(steps[records[0]]), final: JSON.stringify(steps.at(-1))};
    return {count: studyLessonSource.count(), index: studyLessonSource.index(), phase: final.phase, input: final.nums, results: final.res, trace: final.trace.length, records,
      accessors: steps.every(frame => ['res', 'trace'].every(key => typeof Object.getOwnPropertyDescriptor(frame, key)?.get === 'function'))};
  });
  assert.equal(maximum.count, 4463); assert.equal(maximum.index, 0); assert.equal(maximum.phase, 'DONE');
  assert.equal(maximum.results.length, 120); assert.equal(new Set(maximum.results.map(JSON.stringify)).size, 120);
  assert.equal(maximum.trace, 1475); assert.equal(maximum.records.length, 120); assert.equal(maximum.accessors, true);
  for (const permutation of maximum.results) assert.deepEqual([...permutation].sort((a,b) => a-b), maximum.input);
  await page.getByRole('slider', {name: 'Seek lesson step', exact: true}).evaluate(element => {
    element.value = '4462'; element.dispatchEvent(new Event('input', {bubbles: true}));
  });
  assert.equal((await current()).index, 4462);
  assert.ok(await page.locator('#btn-next').isDisabled());
  assert.equal(await page.locator('#visual-ui .res-pill').count(), 120);
  assert.equal(await page.locator('#trace-ui tbody tr').count(), 1475);
  assert.match(await page.locator('#narration-ui').innerText(), /120.*permutations/);
  passed('Maximum custom input reaches all 4463 frames, 120 unique permutations and 1475 trace rows', {frames: 4463, permutations: 120, traceRows: 1475});

  let seed = 46;
  const samples = [...new Set([0,1,2,maximum.records[0]-1,maximum.records[0],maximum.records[60],4461,4462,
    ...Array.from({length: 12}, () => { seed = (Math.imul(seed,1664525) + 1013904223) >>> 0; return seed % 4463; })])];
  const expected = await page.evaluate(indices => Object.fromEntries(indices.map(index => [index, {
    raw: JSON.stringify(studyLessonSource.readAt(index)), objects: JSON.stringify(studyLessonSource.objectFrame(index))
  }])), samples);
  for (const index of [...samples].reverse()) {
    await seek(index);
    const observation = await current();
    assert.deepEqual(observation, {index, ...expected[index]}, `random seek restores frame ${index}`);
    if (index) {
      await page.locator('#btn-prev').click();
      assert.equal((await current()).index, index - 1);
      await page.locator('#btn-next').click();
      assert.deepEqual(await current(), observation, `Back/Next restores frame ${index}`);
    }
    const detached = await page.evaluate(index => {
      const before = JSON.stringify(studyLessonSource.read());
      const raw = studyLessonSource.readAt(index);
      raw.res[0]?.push(999); raw.res.push([999]);
      if (raw.trace.length) raw.trace[0].note = 'modified detached observation';
      raw.trace.push({id: 999});
      const old = steps[0].res; old.push([999]);
      return {raw: JSON.stringify(studyLessonSource.readAt(index)), current: JSON.stringify(studyLessonSource.read()), before, ready: JSON.stringify(steps[0]), originalReady: window.__permutationHistory.ready};
    }, index);
    assert.equal(detached.raw, expected[index].raw, `detached historical read ${index}`);
    assert.equal(detached.current, detached.before); assert.equal(detached.ready, detached.originalReady);
  }
  passed('Seeded random seek, Back/Next and detached result/trace/Ready mutation remain pure', {sampledFrames: samples.length});

  await page.getByLabel('Walkthrough detail', {exact: true}).selectOption('detailed');
  for (const index of [maximum.records[0], maximum.records[60], 4462]) {
    await seek(index); const before = await current();
    const previousObjects = await page.evaluate(index => JSON.stringify(studyLessonSource.objectFrame(index - 1)), index);
    // A seek has no saved before-view DOM. Previous moment exercises the real
    // fallback preview: temporarily render the preceding frame, then restore.
    await page.getByRole('button', {name: 'Previous moment', exact: true}).click();
    assert.equal(await objectView().getAttribute('data-object-view-index'), String(index - 1));
    assert.equal(await page.locator('.operation-replay').count(), 1);
    assert.deepEqual(await current(), before, 'Action preview cannot commit or mutate history');
    assert.equal(await page.evaluate(index => JSON.stringify(studyLessonSource.objectFrame(index - 1)), index), previousObjects);
    await page.getByRole('button', {name: 'Previous moment', exact: true}).click();
    assert.deepEqual(await current(), before, 'Focus preview cannot commit or mutate history');
    await page.getByRole('button', {name: 'Next moment', exact: true}).click();
    await page.getByRole('button', {name: 'Next moment', exact: true}).click();
    assert.equal(await objectView().getAttribute('data-object-view-index'), String(index));
    assert.equal(await page.locator('.operation-replay').count(), 0);
    assert.deepEqual(await current(), before, 'replaying Result cannot execute an instruction twice');
  }
  await page.getByLabel('Walkthrough detail', {exact: true}).selectOption('compact');
  passed('Detailed Focus/Action/Result replays and real before-view fallback preserve the committed frame');

  await seek(4462);
  const beforeObjects = await current();
  const identities = await page.evaluate(indices => indices.map(index => {
    const frame = studyLessonSource.objectFrame(index), variables = frame.stack.flatMap(call => call.variables);
    const roots = Object.fromEntries(variables.filter(variable => variable.value?.ref).map(variable => [variable.name, variable.value.ref]));
    const results = frame.objects.find(object => object.id === roots.res);
    return {roots, firstRow: results?.entries[0]?.value.ref, count: results?.entries.length};
  }), [maximum.records[0],maximum.records[60],4462]);
  for (const identity of identities) {
    assert.deepEqual(identity.roots, identities[0].roots);
    assert.equal(identity.firstRow, identities[0].firstRow);
    assert.equal(identity.firstRow, 'solution:res.0');
  }
  assert.deepEqual(identities.map(identity => identity.count), [1,61,120]);
  await page.evaluate(() => studyPanelLayout.show('objects'));
  const rootToggle = () => resultCard().locator('.study-object-toggle').first();
  assert.equal(await rootToggle().getAttribute('aria-expanded'), 'true');
  await rootToggle().click(); assert.equal(await rootToggle().getAttribute('aria-expanded'), 'false');
  await rootToggle().click(); assert.equal(await rootToggle().getAttribute('aria-expanded'), 'true');
  // Expanding a value may show all entries already; otherwise exercise Show more.
  const more = resultCard().locator('.study-object-more');
  if (await more.count()) await more.first().click();
  assert.equal(await resultCard().locator('[data-object-id="solution:res"][data-entry="119"]').count(), 1);
  const firstRowToggle = () => resultCard().locator('[data-object-path][data-object-id="solution:res.0"] > .study-object-toggle');
  await firstRowToggle().click(); assert.equal(await firstRowToggle().getAttribute('aria-expanded'), 'false');
  await firstRowToggle().click(); assert.equal(await firstRowToggle().getAttribute('aria-expanded'), 'true');
  assert.deepEqual(await current(), beforeObjects, 'nested expansion does not seek');
  for (const exit of ['back', 'escape']) {
    await resultCard().getByRole('button', {name: 'Expand res', exact: true}).click();
    assert.equal(await objectView().getAttribute('data-object-focused'), 'true');
    assert.equal(await objectView().locator('.study-object-card').count(), 1);
    assert.deepEqual(await current(), beforeObjects, 'focused reading preserves the current result and identities');
    if (exit === 'back') await objectView().getByRole('button', {name: 'Back to objects', exact: true}).click();
    else await page.keyboard.press('Escape');
    assert.equal(await objectView().getAttribute('data-object-focused'), 'false');
    assert.equal(await resultCard().getByRole('button', {name: 'Expand res', exact: true}).evaluate(element => element === document.activeElement), true);
    assert.deepEqual(await current(), beforeObjects);
  }
  passed('Stable result/root identities, nested expansion, focused reading, Back/Escape and opener focus restoration');

  await page.locator('#btn-reset').click();
  assert.equal((await current()).index, 0);
  assert.deepEqual(await page.evaluate(() => studyLessonSource.read().nums), maximum.input);
  assert.equal(await page.evaluate(() => JSON.stringify(steps.at(-1))), await page.evaluate(() => window.__permutationHistory.final));
  await custom('9');
  assert.deepEqual(await page.evaluate(() => studyLessonSource.readAt(studyLessonSource.count()-1).res), [[9]]);
  const single = await current();
  await custom('1,2,3,4,5,6');
  assert.deepEqual(await current(), single, 'invalid oversized custom input preserves the complete prior run');
  assert.match(await page.locator('.study-feedback').innerText(), /at most 5/);
  assert.equal(await page.evaluate(() => {
    const saved = window.__permutationHistory;
    return JSON.stringify(saved.timeline[0]) === saved.ready && JSON.stringify(saved.timeline[saved.firstIndex]) === saved.first && JSON.stringify(saved.timeline.at(-1)) === saved.final;
  }), true, 'new runs cannot redirect old getters to different result or trace logs');
  passed('Reset, custom reload, invalid-input preservation and previous-run getter isolation');

  for (let index = 1; index <= presets.length; index++) {
    await preset(index);
    assert.equal((await current()).index, 0);
    assert.deepEqual(await page.evaluate(() => studyLessonSource.read().nums), presets[index-1]);
    const last = await page.evaluate(() => studyLessonSource.count()-1);
    await seek(last); const before = await current();
    assert.equal(await page.evaluate(() => studyLessonSource.read().res.length), factorial(presets[index-1].length));
    await page.locator('#btn-prev').click(); await page.locator('#btn-next').click();
    assert.deepEqual(await current(), before);
    await page.locator('#btn-reset').click(); assert.equal((await current()).index, 0);
    await seek(last); assert.deepEqual(await current(), before);
  }
  await custom(''); await seek(await page.evaluate(() => studyLessonSource.count()-1));
  assert.deepEqual(await page.evaluate(() => studyLessonSource.read().res), [[]]);
  await page.reload(); await page.waitForFunction(() => window.studyWalkthrough && window.studyLessonAdapter);
  assert.equal((await current()).index, 0);
  assert.deepEqual(await page.evaluate(() => studyLessonSource.read().nums), presets[0]);
  passed('All six presets finish, round-trip Back/Next, Reset and reload; empty input remains one empty permutation');

  // Verify the authored Guided before/after meanings through the native
  // adapters. Prediction UI/timer behavior is covered by tests/guided.mjs.
  const lesson = ['a', 'b'].flatMap(shard => JSON.parse(fs.readFileSync(path.join(ROOT, `visualizer-ui/guided-content-${shard}.json`), 'utf8'))).find(item => item.id === 'leetcode:46');
  assert.equal(lesson.checkpoints.length, 3);
  if (lesson.loader) await page.evaluate(loader => window[loader.functionName](...loader.args), lesson.loader);
  assert.deepEqual(await page.evaluate(() => StudyGuided.project(studyLessonAdapter.snapshot()).values), lesson.expectedInput);
  for (const checkpoint of lesson.checkpoints) for (const side of ['before', 'after']) {
    const index = checkpoint[`${side}Index`];
    await seek(index); assert.equal((await current()).index, index);
    assert.equal(await page.evaluate(assertions => StudyGuided.matches(StudyGuided.project(studyLessonAdapter.snapshot()), assertions), checkpoint[side]), true, `${checkpoint.id}: ${side} meaning`);
  }
  passed('All three authored Guided checkpoint before/after projections match the native adapters');
  assert.deepEqual(report.errors, []); assert.deepEqual(report.failedRequests, []);
  report.passed = true;
} catch (error) {
  report.failure = error.stack || String(error);
  if (page) await page.screenshot({path: path.join(output, 'permutation-history-failure.png'), fullPage: true}).catch(() => {});
  console.error(report.failure); process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  fs.writeFileSync(path.join(output, 'permutation-history.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
