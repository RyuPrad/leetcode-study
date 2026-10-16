/* Bounded checks of actual inline HTML JavaScript. Node VM/DOM model only;
 * browser rendering and the production lifecycle are covered by numeric-inputs.mjs
 * and windows-input-lifecycle.test.cjs respectively. Never generates n=5 permutations.
 * Run: node tests/windows-bounded-inputs.test.cjs [--source <repository>] [--originals <pristine>]
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const test = require('node:test');
function option(name, fallback) { const i = process.argv.indexOf(name); return i < 0 ? fallback : path.resolve(process.argv[i + 1]); }
const source = option('--source', path.resolve(__dirname, '..'));
const originals = option('--originals', null);
const files = {coin: '1-D Dynamic Programming/coin_change_visualizer.html', permutations: 'Backtracking/permutations_visualizer.html'};
const expressions = {coin: '({coins,amount,steps,stepIndex,activeExample,masterTrace,pinned})', permutations: '({nums,steps,stepIndex,activeExample,pinned})'};
const plain = value => JSON.parse(JSON.stringify(value, (_, v) => v === Infinity ? 'Infinity' : v));
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
class Element {
  constructor(tag = 'div') {
    this.tagName = tag; this.id = ''; this.style = {}; this.attributes = {}; this.children = [];
    this.className = ''; this.value = ''; this.disabled = false; this.textContent = ''; this.listeners = {};
    this.classList = {
      add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...names])].join(' '); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter(n => !names.includes(n)).join(' '); },
      contains: name => this.className.split(/\s+/).includes(name)
    };
  }
  set value(v) { this._value = String(v); } get value() { return this._value; }
  set textContent(v) { this._text = String(v); this.children = []; this.html = ''; } get textContent() { return this._text; }
  set innerHTML(v) { this.html = String(v); this.children = []; this._text = ''; } get innerHTML() { return this.html; }
  appendChild(child) { this.children.push(child); return child; }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  setAttribute(k, v) { this.attributes[k] = String(v); if (k === 'class') this.className = String(v); if (k === 'id') this.id = String(v); }
  getBoundingClientRect() { return {left: 0, top: 0, width: 640, height: 360}; }
  toJSON() { return {tag: this.tagName, id: this.id, style: this.style, attributes: this.attributes, children: this.children, className: this.className, value: this.value, disabled: this.disabled, text: this.textContent, html: this.html}; }
}
function custom(h, raw) { h.el('custom-input').value = raw; return h.exec('loadCustom()'); }
function watchBuilder(h) {
  h.exec('globalThis.builderCalls = 0; const unwrappedBuilder = buildSteps; buildSteps = (...args) => { builderCalls++; return unwrappedBuilder(...args); };');
}
function reject(h, raw, message) {
  h.el('custom-input').value = raw;
  const before = h.snapshot(), dom = h.dom(), alerts = h.alerts.length, calls = h.exec('builderCalls');
  assert.equal(h.exec('loadCustom()'), false);
  assert.equal(h.exec('builderCalls'), calls, 'reject before timeline builder');
  assert.equal(h.snapshot(), before, 'preserve every algorithm global and complete timeline');
  assert.equal(h.dom(), dom, 'preserve rendered teaching state and edited input');
  assert.equal(h.alerts.length, alerts + 1);
  assert.match(h.alerts.at(-1), message);
}

test('coin: 12 coins at amount 60 build exactly 1504 frames; 13 and 10000 reject before builder', () => {
  const h = load('coin'); watchBuilder(h);
  assert.equal(custom(h, Array.from({length: 12}, (_, i) => i + 1).join(',') + ' | 60'), true);
  assert.equal(h.exec('steps.length'), 1504);
  assert.equal(h.exec('steps.at(-1).ans'), 5);
  assert.equal(h.exec('builderCalls'), 1);
  h.exec('nextStep(); nextStep(); nextStep()');
  for (const size of [13, 100, 10000]) reject(h, Array(size).fill(1).join(',') + ' | 60', /at most 12/);
  assert.equal(custom(h, '2 | 3'), true);
  assert.equal(h.exec('steps.at(-1).ans'), -1);
  assert.equal(custom(h, '1 | 0'), true);
  assert.equal(h.exec('steps.at(-1).ans'), 0);
});

test('coin: direct builder rejects oversized/domain-invalid inputs before allocating or iterating', () => {
  const h = load('coin'), before = h.snapshot();
  for (const expression of ['buildSteps(Array(13).fill(1), 60)', 'buildSteps(Array(10000).fill(1), 60)', 'buildSteps([1], 61)', 'buildSteps([1], Infinity)', 'buildSteps([1], -1)', 'buildSteps([1], 1.5)', 'buildSteps([], 1)', 'buildSteps(Array(1), 1)', 'buildSteps([1, , 2], 1)', 'buildSteps([0], 1)', 'buildSteps([NaN], 1)', 'buildSteps([9007199254740992], 1)', 'buildSteps(null, 1)']) {
    assert.throws(() => h.exec(expression), /1–12 positive safe integer coins/);
    assert.equal(h.snapshot(), before);
  }
  // An oversized array must be rejected without touching its entries.
  h.exec('globalThis.oversized = Array(13); Object.defineProperty(oversized, 0, {get() { throw Error("read a coin before the length guard"); }});');
  assert.throws(() => h.exec('buildSteps(oversized, 60)'), /1–12 positive safe integer coins/);
});

test('permutations: every malformed token/domain is rejected atomically before builder', () => {
  const h = load('permutations'); watchBuilder(h); h.exec('nextStep(); nextStep(); nextStep()');
  for (const raw of ['1,,2', ',1', '1,', ',', '1, ,2', '1,Infinity', '1,-Infinity', 'NaN', '1e309', '9007199254740992', '-9007199254740992', '1.5', '2.0', '1e2', '0x2', 'true', 'null', '[]', '1,bad']) reject(h, raw, /safe integers.*no empty entries/);
  for (const raw of ['1,1', '0,-0', '+1,01']) reject(h, raw, /distinct/);
  reject(h, '1,2,3,4,5,6', /at most 5/);
  reject(h, Array(10000).fill(1).join(','), /at most 5/);
});

test('permutations: negative values, zero, safe boundaries and intentional blank input remain valid', () => {
  const h = load('permutations');
  for (const [raw, values] of [['-1,0,2', [-1,0,2]], ['-0,1', [0,1]], ['+2,-3', [2,-3]], ['9007199254740991,-9007199254740991', [9007199254740991,-9007199254740991]], ['', []], ['   ', []]]) {
    assert.equal(custom(h, raw), true);
    assert.deepEqual(h.json('nums'), values);
    const result = h.json('steps.at(-1).res');
    assert.equal(result.length, values.length === 3 ? 6 : values.length === 2 ? 2 : 1);
    assert.ok(result.every(permutation => permutation.slice().sort().join(',') === values.slice().sort().join(',')));
  }
  assert.deepEqual(h.json('steps.at(-1).res'), [[]]);
});

test('permutations: parser retains the 5-item ceiling without generating factorial history', () => {
  const h = load('permutations');
  h.exec('globalThis.initCalls = 0; init = () => { initCalls++; };');
  assert.equal(custom(h, '-2,-1,0,1,2'), true);
  assert.deepEqual(h.json('nums'), [-2,-1,0,1,2]);
  assert.equal(h.exec('initCalls'), 1);
  assert.equal(custom(h, '-2,-1,0,1,2,3'), false);
  assert.equal(h.exec('initCalls'), 1);
  assert.deepEqual(h.json('nums'), [-2,-1,0,1,2]);
});

// All full timelines, traces, lines, phases and answers from the verified base.
// Maximum preset size is 4; never expand the larger n=5 history in this suite.
const presetHashes = {
  "coin": [
    "45f65931e98e18bb6f95e7b88ec718703eb9614de19e6a85339e0522ec45e4d9",
    "7e8cbdd9a4f36d2cc4a017ace16b830af173f727c5e4ae74e2aa7dd3dd9ac10f",
    "6671dce0ea03a97237aa2ec909f2025b5b99fb3ec18c0b18d7e4562b0dbbb696",
    "edd4fb4b415c6f2af42f06e31a65f7b58de3b5b37b73808f3d07cc59bd764f9f",
    "407956eab6b8f9b71e5d00e4c157811fc751c40f7ffb8a1761a56dcf024326af"
  ],
  "permutations": [
    "aaf571a0963da41e19c40d6db558374036f9a11215c412c3fb6ac9c7ed9e6306",
    "fb44c866ed3e9570cfdafefe42e4f3c8a4faad8c8cee7cbb73a3528d8caa54be",
    "b5fb87bfa0784815de73d3545c67f48ea955a1d1dec717bfbb9fece91193e90e",
    "97f3c697a8463630b336eba5a418395a2d57fa86087c2967f08a9a19bb704c71",
    "a608a0d376c77854047c48cb140a36fd01439fc932ca63f52e911370fd511f65",
    "f91153f39791beee20faf3ac6dc941a3c29ac050db031cd8e7805bef91c4c271"
  ]
};
for (const [key, expected] of Object.entries(presetHashes)) {
  const h = load(key), prior = originals ? load(key, originals) : null;
  for (const [index, hash] of expected.entries()) test(`${key}: preset ${index + 1} keeps its exact authored timeline`, () => {
    h.exec(`loadExample(${index + 1})`); prior?.exec(`loadExample(${index + 1})`);
    const frames = h.json('steps');
    assert.equal(digest(frames), hash);
    if (prior) {
      assert.equal(h.snapshot(), prior.snapshot());
      for (const position of [0, Math.floor(frames.length / 2), frames.length - 1]) {
        h.exec(`stepIndex = ${position}; render()`); prior.exec(`stepIndex = ${position}; render()`);
        assert.equal(h.snapshot(), prior.snapshot());
        for (const id of ['visual-ui', 'trace-ui', 'console-ui', 'hud-ui', 'narration-ui', 'btn-prev', 'btn-next']) assert.equal(JSON.stringify(h.el(id)), JSON.stringify(prior.el(id)), `${id} teaching output preserved`);
      }
    }
    h.exec('init()');
    const raw = h.el('custom-input').value;
    assert.equal(custom(h, raw), true);
    assert.equal(digest(h.json('steps')), hash, 'custom reload has the identical timeline');
    h.exec('nextStep(); prevStep()'); assert.equal(h.exec('stepIndex'), 0);
    assert.equal(digest(h.json('steps')), hash, 'Back and Forward do not mutate frames');
  });
}
function load(key, directory = source) {
  const html = fs.readFileSync(path.join(directory, files[key]), 'utf8'), elements = new Map(), buttons = [];
  for (const match of html.matchAll(/<([\w-]+)\b([^>]*)>/g)) {
    const attrs = match[2], id = attrs.match(/\bid="([^"]+)"/)?.[1];
    if (!id && match[1] !== 'button') continue;
    const el = new Element(match[1]); el.id = id || '';
    el.className = attrs.match(/\bclass="([^"]*)"/)?.[1] || '';
    el.value = attrs.match(/\bvalue="([^"]*)"/)?.[1] || '';
    el.handler = attrs.match(/\bonclick="([^"]*)"/)?.[1];
    if (id) elements.set(id, el);
    if (match[1] === 'button') { el.caption = html.slice(match.index + match[0].length).split('</button>')[0]; buttons.push(el); }
  }
  const document = {
    body: new Element('body'), documentElement: new Element('html'), fullscreenElement: null,
    getElementById: id => elements.get(id) || null, addEventListener() {}, createElement: tag => new Element(tag), createTextNode: text => { const el = new Element('text'); el.textContent = text; return el; },
    querySelectorAll: sel => [...elements.values()].filter(el => sel.startsWith('.') && el.classList.contains(sel.slice(1)))
  };
  const alerts = [], context = vm.createContext({document, alert: message => alerts.push(message), console, window: {innerWidth: 1280, innerHeight: 900, addEventListener() {}}});
  const compiled = new Map();
  const exec = code => { if (!compiled.has(code)) compiled.set(code, new vm.Script(code)); return compiled.get(code).runInContext(context, {timeout: 5000}); };
  for (const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) exec(script[1]);
  const clickEl = el => { assert.ok(el?.handler, 'real inline handler exists'); if (!el.disabled) exec(el.handler); };
  return {key, html, exec, alerts, el: id => elements.get(id), json: code => plain(exec(code)),
    click: id => clickEl(elements.get(id)), clickCaption: caption => clickEl(buttons.find(el => el.caption === caption)),
    dom: () => JSON.stringify([...elements]), state: () => plain(exec(expressions[key])),
    snapshot: () => JSON.stringify(plain(exec(expressions[key])))
  };
}
