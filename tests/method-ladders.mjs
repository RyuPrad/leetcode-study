// The full LeetCode index and solution-method ladders in a real browser: the library's scope,
// method filter and easiest-to-hardest order, an index-only problem's Overview and LeetCode link,
// climbing a ladder from the Ladders tab, and the Method ladders view.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import {chromium} from 'playwright';
import {ROOT, collectCatalog} from '../scripts/content.mjs';
import {PROBLEM_COUNT} from '../scripts/library-size.mjs';

const catalog = collectCatalog();
assert.ok(catalog.index && catalog.methods, 'The catalog includes the LeetCode index and method ladders');
const all = [...catalog.entries.filter(e => e.number), ...catalog.index];
const byId = new Map(all.map(e => [e.id, e]));
fs.mkdirSync(path.join(ROOT, '.test-data'), {recursive: true}); fs.mkdirSync(path.join(ROOT, 'test-results'), {recursive: true});
const fixture = fs.mkdtempSync(path.join(ROOT, '.test-data/method-ladders-'));
fs.writeFileSync(path.join(fixture, 'catalog.json'), JSON.stringify(catalog));
fs.writeFileSync(path.join(fixture, 'index.html'), '<div id="root"></div><script type="module" src="./harness.tsx"></script>');
// A stand-in for the desktop bridge that keeps progress in memory and records outside links.
fs.writeFileSync(path.join(fixture, 'harness.tsx'), `
import {createRoot} from 'react-dom/client';
const catalog = await (await fetch('./catalog.json')).json();
const listeners = {data: [], timer: []};
let data = {version: 4, progress: {}, sessions: [], drafts: {}, submissions: [], guided: {}};
const timer = {problemId: null, sessionId: null, durationMs: 0, running: false, reason: 'inactive'};
window.fixture = {external: [], selected: []};
// Visualizer frames load from study://content, which only the desktop app serves.
Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {get: () => ({postMessage() {}})});
window.study = {
  bootstrap: async () => ({catalog, data, notice: null, version: 'test'}),
  setProgress: async (id, patch) => { data = {...data, progress: {...data.progress, [id]: {status: 'not-started', bookmarked: false, needsReview: false, ...data.progress[id], ...patch, updatedAt: new Date().toISOString()}}}; return data; },
  selectProblem: async id => { window.fixture.selected.push(id); return {...timer, problemId: id}; },
  activity() {}, openExternal: async url => { window.fixture.external.push(url); },
  onData: f => { listeners.data.push(f); return () => {}; }, onTimer: f => { listeners.timer.push(f); return () => {}; },
  onPlaybackPause: () => () => {}, onError: () => () => {}, onNativeProgress: () => () => {},
  nativeAvailability: async () => ({java: false, c: false})
};
const {default: App} = await import('/src/App.tsx');
await import('/src/styles.css');
createRoot(document.getElementById('root')).render(<App/>);
`);
const server = await createServer({configFile: false, root: ROOT, plugins: [react()], server: {host: '127.0.0.1', port: 0, watch: null}, logLevel: 'error'});
await server.listen();
const base = `${server.resolvedUrls.local[0]}.test-data/${path.basename(fixture)}/index.html`;
const browser = await chromium.launch({headless: true}), page = await browser.newPage({viewport: {width: 1440, height: 900}}), errors = [];
page.on('pageerror', e => errors.push(e.message));
const shots = process.env.LADDER_SCREENSHOTS;
const shot = async name => { if (shots) await page.screenshot({path: path.join(shots, `${name}.png`)}); };
const titles = () => page.locator('.problem-link > span:first-child').allTextContents();
const report = {};
try {
  await page.goto(base);
  await page.locator('.problem-table').waitFor();
  assert.equal(await page.locator('.problem-table tbody tr').count(), PROBLEM_COUNT, 'The library opens on the study kits');
  report.scope = `the library opens on the ${PROBLEM_COUNT} study kits`;

  await page.getByRole('button', {name: /^All LeetCode \d+$/}).first().click();
  await page.getByRole('heading', {name: 'All LeetCode problems'}).waitFor();
  assert.equal(await page.locator('.filter-row > span').textContent(), `${all.length} problems`);
  assert.equal(await page.locator('.problem-table tbody tr').count(), 500, 'Long lists render one page at a time');
  await page.getByRole('button', {name: /^Show 500 more/}).click();
  assert.equal(await page.locator('.problem-table tbody tr').count(), 1000);
  await shot('all-leetcode');
  report.all = `All LeetCode lists ${all.length} problems, 500 rows at a time`;

  // The method filter shows one ladder in its stored easiest-to-hardest order.
  const method = catalog.methods.find(m => m.key === 'sliding-window-variable') ?? catalog.methods[0];
  await page.getByRole('combobox', {name: 'Filter by method'}).selectOption(method.key);
  await page.getByRole('heading', {name: `${method.name} ladder`}).waitFor();
  assert.equal(await page.getByRole('combobox', {name: 'Sort problems'}).inputValue(), 'ladder');
  const expected = method.ladder.slice(0, 500).map(id => byId.get(id).title);
  assert.deepEqual(await titles(), expected, 'Rows follow the ladder');
  const levels = method.ladder.map(id => byId.get(id).difficulty);
  assert.deepEqual(levels, [...levels].sort((a, b) => ['Easy', 'Medium', 'Hard'].indexOf(a) - ['Easy', 'Medium', 'Hard'].indexOf(b)), 'Easy, then Medium, then Hard');
  await shot('method-filter');
  report.filter = `the ${method.name} filter lists its ${method.ladder.length} problems from easiest to hardest`;

  // An index-only problem: Overview, Ladders and History, with a LeetCode link and no local judge.
  const indexEntry = byId.get(method.ladder.find(id => byId.get(id).indexOnly && !byId.get(id).premium));
  await page.getByRole('button', {name: `Open ${indexEntry.title}`, exact: true}).click();
  await page.getByRole('heading', {name: indexEntry.title, exact: true}).waitFor();
  const tabs = await page.getByRole('tab').allTextContents();
  assert.deepEqual(tabs.map(t => t.replace(/\d+$/, '')), ['Overview', 'Ladders', 'History']);
  assert.equal(await page.getByRole('tab', {name: 'Overview'}).getAttribute('aria-selected'), 'true');
  await page.getByRole('button', {name: 'Open on LeetCode'}).click();
  await page.waitForFunction(url => window.fixture.external.includes(url), `https://leetcode.com/problems/${indexEntry.slug}/`);
  await page.getByRole('combobox', {name: 'Problem progress'}).selectOption('completed');
  await page.waitForFunction(() => document.querySelector('.progress-select').value === 'completed');
  assert.ok(await page.evaluate(id => window.fixture.selected.includes(id), indexEntry.id), 'Study time is tracked for index problems');
  await shot('index-overview');
  report.overview = 'an index-only problem opens on its Overview, links to LeetCode and tracks progress';

  // Climb the ladder: Harder opens the next problem and stays on the Ladders tab.
  await page.getByRole('tab', {name: 'Ladders'}).click();
  const section = page.getByRole('region', {name: `${method.name} ladder`});
  const position = method.ladder.indexOf(indexEntry.id);
  assert.equal(await section.locator('.ladder-step strong').textContent(), String(position + 1));
  assert.equal(await section.locator('li.current .ladder-title').textContent(), `${indexEntry.number}. ${indexEntry.title}`);
  await shot('ladders-tab');
  const harder = byId.get(method.ladder[position + 1]);
  await section.getByRole('button', {name: /^Harder:/}).click();
  await page.getByRole('heading', {name: harder.title, exact: true}).waitFor();
  assert.equal(await page.getByRole('tab', {name: 'Ladders'}).getAttribute('aria-selected'), 'true');
  await page.getByRole('region', {name: `${method.name} ladder`}).getByRole('button', {name: /^Easier:/}).click();
  await page.getByRole('heading', {name: indexEntry.title, exact: true}).waitFor();
  report.climb = 'Harder and Easier step along the ladder and keep the Ladders tab';

  // Study kits keep their tabs and gain Ladders.
  const kit = catalog.entries.find(e => e.number === 1);
  await page.getByRole('button', {name: 'Back to library'}).click();
  await page.getByRole('searchbox', {name: 'Search problems'}).fill('two sum');
  await page.getByRole('button', {name: 'Open Two Sum', exact: true}).click();
  await page.getByRole('heading', {name: 'Two Sum', exact: true}).waitFor();
  assert.deepEqual((await page.getByRole('tab').allTextContents()).map(t => t.replace(/\d+$/, '')), ['Learn', 'Visualizer', 'Code', 'Type', 'Notes', 'Ladders', 'History']);
  await page.getByRole('tab', {name: 'Ladders'}).click();
  assert.equal(await page.locator('.ladder').count(), kit.methods.length);
  report.kit = 'study kits keep every tab and add Ladders';

  // The Method ladders view opens a ladder in the library.
  await page.getByRole('button', {name: /^Method ladders/}).click();
  await page.getByRole('heading', {name: 'Method ladders', level: 1}).waitFor();
  assert.equal(await page.locator('.method-card').count(), catalog.methods.length);
  await shot('methods-view');
  const card = page.locator('.method-card', {has: page.getByRole('heading', {name: method.name, exact: true})});
  await card.getByRole('button', {name: 'View ladder'}).click();
  await page.getByRole('heading', {name: `${method.name} ladder`}).waitFor();
  report.methods = `the Method ladders view lists all ${catalog.methods.length} methods and opens each ladder`;

  // Bookmarks span every LeetCode problem.
  await page.getByRole('button', {name: `Bookmark ${indexEntry.title}`}).click();
  await page.getByRole('button', {name: /^Bookmarks/}).click();
  assert.deepEqual(await titles(), [indexEntry.title]);
  report.bookmarks = 'bookmarks include index-only problems';
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(ROOT, 'test-results/method-ladders.json'), JSON.stringify({passed: true, ...report}, null, 2));
  for (const line of Object.values(report)) console.log(`PASS ${line}`);
} finally { await browser.close(); await server.close(); fs.rmSync(fixture, {recursive: true, force: true}); }
