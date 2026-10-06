/* Dependency-free regression tests for the actual visualizer inline JavaScript.
 * Run: node tests/windows-query-trace-completion.test.cjs
 * Optional: --source <vault-root> --originals <pristine-vault-root>
 * This small DOM model verifies generated state/markup, not real browser layout,
 * pointer interaction, accessibility, fullscreen, or Obsidian embedding.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

function option(name, fallback) {
  const at = process.argv.indexOf(name);
  return at < 0 ? fallback : path.resolve(process.argv[at + 1]);
}
const root = option('--source', path.resolve(__dirname, '..'));
const originals = option('--originals', null);
const files = {
  lru: 'LinkedList/lru_cache_visualizer.html',
  trie: 'Tries/implement_trie_prefix_tree_visualizer.html',
  dictionary: 'Tries/design_add_and_search_words_data_structure_visualizer.html',
  median: 'Heap/find_median_from_data_stream_visualizer.html',
};
const sourceBlobs = {
  lru: 'b712b778d04651bff6fab97fd83e4dfab8223c70',
  trie: 'b0ffc423afe4b81725693c35f2a0e16d6c4de8d2',
  dictionary: 'bf86f0c64c6a8b43b70d9f948b8808483f0f8836',
  median: '23d9be4303099b79d61c9a478b720502401b7091',
};

class Element {
  constructor(tag = 'div') {
    this.tagName = tag; this.style = {}; this.attributes = {};
    this.children = []; this.className = ''; this.value = '';
    this.disabled = false; this.textContent = ''; this.html = '';
    this.listeners = {};
    this.classList = {
      add: (...names) => {
        this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...names])].join(' ');
      },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter(n => !names.includes(n)).join(' '); },
      contains: name => this.className.split(/\s+/).includes(name),
    };
  }
  set innerHTML(value) { this.html = value; this.children = []; this.textContent = ''; }
  get innerHTML() { return this.html; }
  appendChild(child) { this.children.push(child); return child; }
  addEventListener(name, listener) { this.listeners[name] = listener; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getBoundingClientRect() { return {left: 0, top: 0, width: 640, height: 360}; }
  toJSON() {
    return {tag: this.tagName, html: this.html, text: this.textContent, children: this.children,
      attributes: this.attributes, className: this.className, style: this.style, disabled: this.disabled, value: this.value};
  }
}

function load(key, directory = root) {
  const html = fs.readFileSync(path.join(directory, files[key]), 'utf8');
  const elements = new Map();
  for (const match of html.matchAll(/<([\w-]+)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
    const el = new Element(match[1]);
    el.className = match[0].match(/\bclass="([^"]*)"/)?.[1] || '';
    el.value = match[0].match(/\bvalue="([^"]*)"/)?.[1] || '';
    el.handler = match[0].match(/\bonclick="([^"]*)"/)?.[1];
    elements.set(match[2], el);
  }
  const document = {
    body: new Element('body'), documentElement: new Element('html'), fullscreenElement: null,
    getElementById: id => elements.get(id) || null,
    createElement: tag => new Element(tag), createElementNS: (_, tag) => new Element(tag),
    addEventListener() {},
    querySelectorAll: selector => [...elements.values()].filter(el => selector.startsWith('.') && el.classList.contains(selector.slice(1))),
  };
  const alerts = [];
  const context = vm.createContext({document, console, alert: message => alerts.push(message),
    window: {innerWidth: 1280, innerHeight: 900, addEventListener() {}}});
  const exec = code => vm.runInContext(code, context, {timeout: 3000});
  for (const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) exec(script[1]);
  return {exec, alerts, elements, el: id => elements.get(id),
    click: id => { const el = elements.get(id); assert.ok(el.handler, `${id} has an inline handler`); if (!el.disabled) exec(el.handler); },
    json: expression => JSON.parse(exec(`JSON.stringify(${expression})`)),
    dom: () => JSON.stringify([...elements]),
  };
}

let groups = 0, failed = 0, renderedFrames = 0, checkedOperations = 0, differentialRuns = 0;
function test(name, run) {
  try { run(); groups++; console.log(`PASS ${name}`); }
  catch (error) { failed++; console.error(`FAIL ${name}: ${error.message}`); }
}
function terminal(key, frame) {
  if (key === 'lru') return frame.method === 'get' ? frame.ans !== 'pending'
    : frame.method === 'put' ? frame.lines.includes(20) : frame.method === 'new' && frame.lines.includes(4);
  if (key === 'median') return frame.method === 'findMedian' ? frame.result === 'hit'
    : frame.method === 'addNum' && /^addNum\(.*\) done\./.test(frame.narration);
  return frame.ans !== 'pending' || (['insert', 'addWord'].includes(frame.method) && frame.lines.includes(19));
}
function stripTags(text) { return text.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim(); }
function renderedRows(h) {
  const body = h.el('trace-ui').innerHTML.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] || '';
  return [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(match =>
    [...match[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(cell => stripTags(cell[1])));
}
function traceCells(key, row, index) {
  if (key === 'lru') return [index + 1, row.op, row.key, row.value, row.ret, row.cache].map(String);
  if (key === 'median') return [index + 1, row.op, row.num, row.smallSize, row.largeSize, row.median].map(String);
  if (key === 'dictionary') return [index + 1, row.op, '"' + row.word + '"', row.result].map(String);
  return [index + 1, row.op.split('(')[0], '"' + row.word + '"', row.result].map(String);
}
function verifyOracle(key, operations, trace) {
  assert.equal(trace.length, operations.length, 'one operation-level row per operation');
  let cache = new Map(), capacity = 0;
  const words = new Set(), numbers = [];
  operations.forEach((op, i) => {
    const row = trace[i];
    if (key === 'lru') {
      let ret = 'void';
      if (op.method === 'new') { capacity = op.capacity; cache = new Map(); ret = '-'; }
      if (op.method === 'put') {
        if (cache.has(op.key)) cache.delete(op.key);
        else if (cache.size === capacity) cache.delete(cache.keys().next().value);
        cache.set(op.key, op.value);
      }
      if (op.method === 'get') {
        ret = cache.has(op.key) ? String(cache.get(op.key)) : '-1';
        if (cache.has(op.key)) { const value = cache.get(op.key); cache.delete(op.key); cache.set(op.key, value); }
      }
      assert.equal(row.ret, ret);
      assert.equal(row.cache, '{' + [...cache].map(([key, value]) => `${key}:${value}`).join(', ') + '}');
    } else if (key === 'median') {
      if (op.method === 'addNum') numbers.push(op.num);
      const sorted = numbers.slice().sort((a, b) => a - b), half = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
      assert.equal(row.median, Number.isInteger(median) ? String(median) : median.toFixed(1));
      assert.equal(row.smallSize + row.largeSize, numbers.length);
      assert.ok(Math.abs(row.smallSize - row.largeSize) <= 1);
    } else {
      if (op.method === 'insert' || op.method === 'addWord') { words.add(op.arg); assert.equal(row.result, 'void'); }
      else {
        const expected = key === 'dictionary'
          ? [...words].some(word => word.length === op.arg.length && [...op.arg].every((ch, j) => ch === '.' || ch === word[j]))
          : op.method === 'startsWith' ? op.arg === '' || [...words].some(word => word.startsWith(op.arg)) : words.has(op.arg);
        assert.equal(row.result, String(expected), `${op.method}(${op.arg})`);
      }
    }
  });
  checkedOperations += operations.length;
}
function compareOriginal(key, h, loadCode) {
  if (!originals) return;
  const old = load(key, originals); old.exec(loadCode);
  const before = old.json('steps'), after = h.json('steps');
  assert.equal(after.length, before.length, 'same teaching steps');
  after.forEach((frame, i) => {
    const {traceLen, ...state} = frame, {traceLen: oldTraceLen, ...oldState} = before[i];
    assert.deepEqual(state, oldState, 'algorithm, narration and all non-trace snapshot fields unchanged');
    const affected = key === 'median' ? frame.method === 'findMedian' && terminal(key, frame)
      : key === 'dictionary' && frame.method === 'search' && terminal(key, frame);
    assert.equal(traceLen, oldTraceLen + Number(affected), `only completed query/put snapshots gain a row at ${i}`);
  });
  assert.deepEqual(h.json('masterTrace'), old.json('masterTrace'), 'operation results unchanged');
  differentialRuns++;
}

function exercise(key, h) {
  const frames = h.json('steps'), operations = h.json('ops'), trace = h.json('masterTrace');
  verifyOracle(key, operations, trace);
  const states = [];
  let completed = 0;
  for (let i = 0; i < frames.length; i++) {
    if (i) h.click('btn-next');
    assert.equal(h.exec('stepIndex'), i);
    const frame = frames[i];
    if (terminal(key, frame)) completed++;
    assert.equal(frame.traceLen, completed, `trace prefix at frame ${i}, ${frame.method}`);
    const visible = h.json('currentStep()');
    assert.deepEqual(renderedRows(h), trace.slice(0, visible.traceLen).map((row, index) => traceCells(key, row, index)), 'render exactly the completed prefix');
    if (key === 'dictionary' && visible.method === 'search') {
      const card = h.el('visual-ui').children.find(el => el.classList.contains('result-card'));
      const value = card.children[1];
      assert.equal(value.textContent, visible.ans === 'pending' ? 'pending' : String(visible.ans), 'whole-search card waits for the terminal answer');
      assert.equal(value.classList.contains('true'), visible.ans === true);
      assert.equal(value.classList.contains('false'), visible.ans === false);
    }
    assert.equal(h.el('btn-prev').disabled, i === 0);
    assert.equal(h.el('btn-next').disabled, i === frames.length - 1);
    states.push(h.dom()); renderedFrames++;
  }
  assert.equal(completed, operations.length);
  assert.equal(h.json('currentStep()').traceLen, operations.length, 'last row is visible at Finished');
  assert.equal(h.el('btn-next').textContent, 'Finished!');
  const final = h.dom(); h.exec('nextStep(); nextStep()'); assert.equal(h.dom(), final, 'extra Next calls do nothing');
  for (let i = frames.length - 2; i >= 0; i--) {
    h.click('btn-prev'); assert.equal(h.dom(), states[i], `Back restores full rendered state ${i}`); renderedFrames++;
  }
  const start = h.dom(); h.exec('prevStep(); prevStep()'); assert.equal(h.dom(), start);
  for (let i = 1; i < frames.length; i++) {
    h.click('btn-next'); assert.equal(h.dom(), states[i], `Forward restores full rendered state ${i}`); renderedFrames++;
  }
  h.click('btn-reset');
  assert.equal(h.dom(), states[0], 'Reset restores initial state and clears the visible trace');
  assert.deepEqual(h.json('steps'), frames, 'Reset deterministically rebuilds snapshots');
  assert.deepEqual(h.json('masterTrace'), trace);
  if (frames.length > 2) { h.click('btn-next'); h.click('btn-reset'); assert.equal(h.dom(), states[0], 'mid-run Reset is exact'); }
  assert.equal(h.alerts.length, 0);
}

for (const key of Object.keys(files)) {
  test(`${key}: Windows shared assets and lesson bridge are preserved`, () => {
    const html = fs.readFileSync(path.join(root, files[key]), 'utf8');
    assert.match(html, /visualizer-ui\/object-state\.js/);
    assert.match(html, /visualizer-ui\/panel-layout\.js/);
    assert.match(html, /objectFrame:/);
    if (originals) {
      const before = fs.readFileSync(path.join(originals, files[key]), 'utf8');
      const assets = value => [...value.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="[^"]*visualizer-ui\/[^>]+>/g)].map(m => m[0]);
      const bridge = value => value.match(/\/\/ STUDY LESSON BRIDGE START[\s\S]*?\/\/ STUDY LESSON BRIDGE END/)[0];
      assert.deepEqual(assets(html), assets(before));
      assert.equal(bridge(html), bridge(before));
    }
  });
  if (originals) test(`${key}: pristine Git blob matches pinned Windows 560c7403 source`, () => {
    const bytes = fs.readFileSync(path.join(originals, files[key]));
    const sha = crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
    assert.equal(sha, sourceBlobs[key]);
  });
  const count = load(key).exec('Object.keys(examples).length');
  for (let i = 1; i <= count; i++) test(`${key}: preset ${i}, every frame, Back/Forward/Reset, complete final trace`, () => {
    const h = load(key); h.click('btn-ex-' + i);
    compareOriginal(key, h, `loadExample(${i})`); exercise(key, h);
  });
}

const cases = {
  lru: [
    'new 2; get 9', 'new 2; put 1 10; get 1', 'new 2; put 1 10',
    'new 2; put 1 10; put 1 20', 'new 1; put 1 10; put 2 20',
    'new 2; put 1 10; put 2 20; get 1; put 3 30; get 2; get 1; get 3',
    'new 1; put 1 -1; get 1; get 2; get 1',
  ],
  trie: [
    'insert apple, search apple', 'insert apple, search app', 'insert apple, search ax',
    'insert apple, startsWith app', 'insert apple, startsWith ax',
    'search x', 'startsWith x', 'startsWith ""', 'search ""',
    'insert "", search "", startsWith ""', 'insert app, search app, search app',
  ],
  dictionary: [
    'addWord aa, addWord b, search .', 'addWord a, search a', 'addWord a, search b',
    'addWord aa, search a', 'addWord a, search ..', 'addWord aa, addWord bb, search .z',
    'search .', 'search ""', 'addWord a, search ""',
    'addWord ab, addWord cd, search .., search .., search ...',
  ],
  median: [
    'add 4; median', 'add 1; add 2; median', 'add 1; add 2; add 3; median',
    'add 3; add 2; add 1; median', 'add -4; add -1; median; median',
    'add 0; add 0; median; add 0; median',
  ],
};
for (const [key, inputs] of Object.entries(cases)) for (const raw of inputs) test(`${key}: custom ${raw}`, () => {
  const h = load(key); h.el('custom-input').value = raw; h.exec('loadCustom()');
  compareOriginal(key, h, `document.getElementById('custom-input').value = ${JSON.stringify(raw)}; loadCustom()`);
  exercise(key, h);
});

test('dictionary: a failed wildcard branch remains pending until later b branch succeeds', () => {
  const h = load('dictionary');
  h.el('custom-input').value = 'addWord aa, addWord b, search .'; h.exec('loadCustom()');
  const frames = h.json('steps'), failure = frames.findIndex(frame => frame.method === 'search' && frame.result === 'false');
  assert.ok(failure >= 0, 'regression includes a failed first branch');
  h.exec(`stepIndex = ${failure}; render()`);
  assert.equal(h.json('currentStep()').ans, 'pending');
  assert.equal(h.el('visual-ui').children.at(-1).children[1].textContent, 'pending');
  h.exec('while (stepIndex < steps.length - 1) nextStep()');
  assert.equal(h.el('visual-ui').children.at(-1).children[1].textContent, 'true');
  assert.equal(h.json('currentStep()').traceLen, 3);
});
test('median: lower-heavy, upper-heavy and even return branches are all exercised', () => {
  const sides = new Set();
  for (const raw of cases.median) {
    const h = load('median'); h.el('custom-input').value = raw; h.exec('loadCustom()');
    for (const frame of h.json('steps')) if (frame.result === 'hit') sides.add(frame.medianSide);
  }
  assert.deepEqual([...sides].sort(), ['both', 'large', 'small']);
});

console.log(`RESULT: ${groups} passed, ${failed} failed; ${checkedOperations} operation checks, ${renderedFrames} rendered frame visits, ${differentialRuns} pristine snapshot comparisons.`);
console.log('NOT VERIFIED: real browser painting, pointer interactions, responsive layout, screen readers, fullscreen, or Windows Obsidian embedding.');
if (failed) process.exitCode = 1;
