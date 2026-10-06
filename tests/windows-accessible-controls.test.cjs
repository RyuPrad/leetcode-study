// Run: node tests/windows-accessible-controls.test.cjs [--originals /path/to/pinned/source]
// Dependency-free DOM/VM regression harness. Browser layout and real assistive technology QA are separate.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const base = path.resolve(__dirname, '..');
const crypto = require('node:crypto');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const baseline = require('./fixtures/windows-safety-controls-baselines.json').files;
const originalArg = process.argv.indexOf('--originals');
if (originalArg >= 0 && !process.argv[originalArg + 1]) throw new Error('--originals requires a source directory');
const originals = originalArg >= 0 ? path.resolve(process.argv[originalArg + 1]) : null;

const files = [
  'Bit Manipulation/add_binary_visualizer.html',
  'Graphs/number_of_islands_visualizer.html',
  'Trees/maximum_depth_of_binary_tree_visualizer.html',
];
let assertions = 0;
function check(value, message) { assertions++; assert.ok(value, message); }
function equal(a, b, message) { assertions++; assert.equal(a, b, message); }
function emitter(obj = {}) {
  obj.listeners = {};
  obj.addEventListener = (name, fn) => (obj.listeners[name] ||= []).push(fn);
  obj.dispatch = (name, event = {}) => obj.listeners[name]?.forEach(fn => fn(event));
  return obj;
}
function createHarness(html) {
  const nodes = new Set();
  const ids = new Map();
  const alerts = [];
  let document;
  const window = emitter({ innerWidth: 1280, innerHeight: 900, location: { href: 'file:///visualizer.html' }, open() { return {}; } });
  class Element {
    constructor(tagName) {
      this.tagName = tagName.toUpperCase(); this.attributes = {}; this.style = {};
      this.children = []; this._html = ''; this.htmlWrites = 0; this.className = ''; this.value = '';
      this.classList = { add: (...v) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...v])].join(' '); },
        remove: (...v) => { this.className = this.className.split(/\s+/).filter(x => !v.includes(x)).join(' '); },
        contains: v => this.className.split(/\s+/).includes(v) };
      emitter(this); nodes.add(this);
    }
    set id(v) { this.attributes.id = v; ids.set(v, this); }
    get id() { return this.attributes.id || ''; }
    setAttribute(name, value) { value = String(value); this.attributes[name] = value; if (name === 'id') this.id = value; if (name === 'class') this.className = value; if (name === 'value') this.value = value; }
    getAttribute(name) { return this.attributes[name] ?? null; }
    hasAttribute(name) { return name in this.attributes; }
    appendChild(child) { this.children.push(child); child.parentNode = this; return child; }
    detach() { for (const child of this.children) child.detach(); if (this.id && ids.get(this.id) === this) ids.delete(this.id); nodes.delete(this); if (document?.activeElement === this) document.activeElement = document.body; }
    set innerHTML(value) { this._html = String(value); this.htmlWrites++; for (const child of this.children) child.detach(); this.children = []; parseTags(this._html, this); }
    get innerHTML() { return this._html; }
    focus(options) { document.activeElement = this; this.focusOptions = options; }
    get offsetWidth() { return this.getBoundingClientRect().width; }
    get offsetHeight() { return this.getBoundingClientRect().height; }
    getBoundingClientRect() {
      const width = Math.min(this.modelWidth || 380, parseFloat(this.style.maxWidth) || Infinity);
      const height = Math.min(this.modelHeight || 480, parseFloat(this.style.maxHeight) || Infinity);
      const left = this.style.left && this.style.left !== 'auto' ? parseFloat(this.style.left) : window.innerWidth - width - (parseFloat(this.style.right) || 20);
      const top = parseFloat(this.style.top) || 20;
      return { left, top, width, height, right: left + width, bottom: top + height };
    }
  }
  function parseTags(source, parent) {
    const tags = /<([a-z][\w:-]*)\b([^>]*)>/gi;
    for (let m; (m = tags.exec(source));) {
      if (!/\bid\s*=/.test(m[2])) continue;
      const el = new Element(m[1]);
      const attr = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
      for (let a; (a = attr.exec(m[2]));) el.setAttribute(a[1], a[2] ?? a[3]);
      parent.appendChild(el);
    }
  }
  document = emitter({ fullscreenElement: null });
  document.body = new Element('body'); document.documentElement = new Element('html'); document.activeElement = document.body;
  document.getElementById = id => ids.get(id) || null;
  document.createElement = tag => new Element(tag);
  document.createElementNS = (_ns, tag) => new Element(tag);
  document.querySelectorAll = sel => [...nodes].filter(el => sel.startsWith('.') ? el.classList.contains(sel.slice(1)) : false);
  parseTags(html.split('<script>')[0], document.body);
  const observers = [];
  class ResizeObserver { constructor(fn) { this.fn = fn; observers.push(this); } observe(el) { this.element = el; } }
  const context = vm.createContext({ document, window, ResizeObserver, alert: text => alerts.push(text), console });
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInContext(script, context, { timeout: 5000 });
  return { context, document, window, alerts, observers, run: source => vm.runInContext(source, context, { timeout: 5000 }) };
}
for (const file of files) {
  const html = fs.readFileSync(path.join(base, file), 'utf8');
  const old = originals ? createHarness(fs.readFileSync(path.join(originals, file), 'utf8')) : null;
  const app = createHarness(html);
  const examples = JSON.parse(app.run('JSON.stringify(Object.keys(examples))'));
  let stepsChecked = 0;
  for (const id of examples) {
    app.run(`loadExample(${id})`);
    equal(hash(app.run('JSON.stringify(steps)')), baseline[file].presets[id], `${file} example ${id}: Windows snapshots unchanged`);
    if (old) { old.run(`loadExample(${id})`); equal(app.run('JSON.stringify(steps)'), old.run('JSON.stringify(steps)'), `${file} example ${id}: live pristine comparison`); }
    equal(app.document.getElementById('btn-ex-' + id).getAttribute('aria-pressed'), 'true', 'active example announced');
    equal(app.document.querySelectorAll('.btn-ex').filter(el => el.getAttribute('aria-pressed') === 'true').length, 1, 'one selected example');
    const n = app.run('steps.length');
    for (let index = 1; index < n; index++) app.run('nextStep()');
    stepsChecked += n;
    equal(app.run('stepIndex'), n - 1, 'forward reaches final step');
    equal(app.document.getElementById('btn-next').disabled, true, 'end boundary disables next');
    app.run('nextStep()'); equal(app.run('stepIndex'), n - 1, 'extra next is harmless');
    app.run('prevStep()'); equal(app.run('stepIndex'), Math.max(0, n - 2), 'step back works');
    app.run('init(); prevStep()'); equal(app.run('stepIndex'), 0, 'reset and first-step boundary');
  }
  const inputs = file.includes('add_binary') ? ['0 | 0', '111111 | 1', '101 | 11101'] : file.includes('islands') ? ['0', '1', '1,0; 0,1'] : ['[]', '3,9,20,null,null,15,7', '1,null,2,null,3'];
  for (const input of inputs) {
    app.document.getElementById('custom-input').value = input;
    app.run('loadCustom()');
    equal(hash(app.run('JSON.stringify(steps)')), baseline[file].custom[input], `${file}: custom ${input} Windows snapshots unchanged`);
    if (old) {
      old.document.getElementById('custom-input').value = input; old.run('loadCustom()');
      equal(app.run('JSON.stringify(steps)'), old.run('JSON.stringify(steps)'), `${file}: custom ${input} live pristine comparison`);
    }
  }
  app.document.getElementById('custom-input').value = 'invalid';
  const previousState = app.run('JSON.stringify(steps)'); app.run('loadCustom()');
  check(app.alerts.length > 0, 'invalid custom input rejected'); equal(app.run('JSON.stringify(steps)'), previousState, 'invalid load preserves current algorithm');
  const pins = JSON.parse(app.run('JSON.stringify(Object.keys(pinned))'));
  for (const key of pins) {
    const button = app.document.getElementById('pin-' + key); button.focus();
    check(button.getAttribute('aria-label').includes('in HUD'), 'pin names its variable and HUD purpose');
    const narration = app.document.getElementById('narration-ui');
    const writesBefore = narration.htmlWrites;
    for (let i = 0; i < 12; i++) {
      app.run(`togglePin(${JSON.stringify(key)})`);
      equal(app.document.activeElement.id, 'pin-' + key, 'focus retained after pin rerender');
      equal(app.document.activeElement.getAttribute('aria-pressed'), String(app.run(`pinned[${JSON.stringify(key)}]`)), 'pin state exposed');
      equal(app.document.activeElement.focusOptions.preventScroll, true, 'focus restoration preserves scroll');
    }
    equal(narration.htmlWrites, writesBefore, 'pin does not reannounce unchanged narration');
  }
  const input = app.document.getElementById('custom-input');
  equal(input.getAttribute('aria-describedby'), 'custom-input-help', 'input help linked');
  check(/<label[^>]*for="custom-input"/.test(html), 'visible input label');
  const narration = app.document.getElementById('narration-ui');
  equal(narration.getAttribute('aria-live'), 'polite', 'polite step narration'); equal(narration.getAttribute('aria-atomic'), 'true', 'atomic step narration');
  check(/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(html) && /animation: none !important/.test(html), 'reduced-motion CSS');
  equal(hash(html.match(/    \/\/ STUDY LESSON BRIDGE START[\s\S]*?    \/\/ STUDY LESSON BRIDGE END/)[0]), baseline[file].bridgeSha256, 'lesson bridge preserved');
  equal(JSON.stringify([...html.matchAll(/(?:src|href)="(\.\.\/visualizer-ui\/[^"]+)"/g)].map(m=>m[1])), JSON.stringify(baseline[file].sharedAssets), 'shared assets preserved');
  check(/<div class="custom-input-group">\s*<label[^>]*for="custom-input"[\s\S]*?<div class="custom-row">[\s\S]*?<input[^>]*id="custom-input"[\s\S]*?<\/div>\s*<p[^>]*id="custom-input-help"[\s\S]*?<\/p>\s*<\/div>/.test(html), 'input label, input, and help move as one shared workspace row');
  check(!/clampControlsToViewport|controlsDock/.test(html), 'legacy docking controller does not compete with shared panels');
  app.document.fullscreenElement = {}; app.document.dispatch('fullscreenchange');
  equal(app.document.getElementById('btn-fullscreen').getAttribute('aria-pressed'), 'true', 'fullscreen state announced');
  app.document.fullscreenElement = null; app.document.dispatch('fullscreenchange');
  equal(app.document.getElementById('btn-fullscreen').getAttribute('aria-pressed'), 'false', 'fullscreen exit announced');
  console.log(`PASS ${file}: ${examples.length} examples, ${stepsChecked} rendered snapshots, 3 custom cases, focus/accessibility and shared-workspace compatibility checks.`);
}
console.log(`PASS ${assertions} assertions. Real CSS/layout, pointer input and screen-reader behavior require browser QA.`);
