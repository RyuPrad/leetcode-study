/** Node-only regression checks for the Windows lesson and its real shared playback controller.
 * The small DOM below validates state, handlers, and snapshot contracts, not browser painting,
 * panel layout, animation geometry, accessibility trees, or Electron behavior.
 * Run: node tests/windows-concatenation.test.mjs
 * Optional exact source comparison: WINDOWS_BASELINE_ROOT=/path/to/v0.7.0 node tests/windows-concatenation.test.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const relative = 'Array & Hashing/concatenation_of_array_visualizer.html';
const html = fs.readFileSync(path.join(root, relative), 'utf8');
const scriptOf = text => text.match(/<script>([\s\S]*?)<\/script>/)?.[1];
const script = scriptOf(html);
const shared = name => fs.readFileSync(path.join(root, 'visualizer-ui', name), 'utf8');
const workspace = shared('workspace.js');
const playback = workspace.slice(workspace.indexOf('function attachPlayback('), workspace.indexOf('function mount('));
const decode = value => String(value).replace(/<[^>]*>/g, '').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const plain = value => JSON.parse(JSON.stringify(value));
class Element {
  constructor(tag, doc) {
    this.tagName = tag.toUpperCase(); this.doc = doc; this.id = ''; this.className = '';
    this.children = []; this.attrs = {}; this.listeners = {}; this.style = {}; this.dataset = {};
    this.value = ''; this.disabled = false; this._html = ''; this._text = '';
    this.offsetWidth = 325; this.offsetHeight = 400;
    this.classList = {
      contains: name => this.className.split(/\s+/).includes(name),
      add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...names])].join(' '); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter(name => !names.includes(name)).join(' '); }
    };
  }
  appendChild(child) { child.parentNode = this; this.children.push(child); return child; }
  insertBefore(child, before) { child.parentNode = this; const i = this.children.indexOf(before); this.children.splice(i < 0 ? this.children.length : i, 0, child); return child; }
  after(child) { const parent = this.parentNode; child.parentNode = parent; parent.children.splice(parent.children.indexOf(this) + 1, 0, child); }
  replaceChildren(...children) { this._html = ''; this._text = ''; this.children = []; children.forEach(child => this.appendChild(child)); }
  get childNodes() { return this.children; }
  get attributes() { return Object.entries(this.attrs).map(([name, value]) => ({name, value})); }
  set innerHTML(value) {
    this.children = []; this._text = ''; this._html = String(value);
    for (const match of this._html.matchAll(/<(button|select)\b([^>]*)>/g)) {
      const child = new Element(match[1], this.doc);
      for (const attr of match[2].matchAll(/([\w-]+)="([^"]*)"/g)) child.setAttribute(attr[1], attr[2]);
      if (match[1] === 'select') child.value = '1';
      this.appendChild(child);
    }
  }
  get innerHTML() { return this._html; }
  set textContent(value) { this.children = []; this._html = ''; this._text = String(value); }
  get textContent() { return this._text + decode(this._html) + this.children.map(child => child.textContent).join(''); }
  setAttribute(name, value) { this.attrs[name] = String(value); if (['id', 'class', 'value'].includes(name)) this[name === 'class' ? 'className' : name] = String(value); }
  getAttribute(name) { return this.attrs[name] ?? null; }
  removeAttribute(name) { delete this.attrs[name]; }
  addEventListener(name, callback) { (this.listeners[name] ??= []).push(callback); }
  emit(name, event = {}) { for (const callback of this.listeners[name] ?? []) callback({target: this, ...event}); }
  click() { if (!this.disabled) { this.onclick?.(); this.emit('click'); } }
  focus() { this.doc.activeElement = this; }
  querySelector(selector) { return walk(this).slice(1).find(child => matches(child, selector)) ?? null; }
  cloneNode(deep = false) {
    const copy = new Element(this.tagName, this.doc);
    for (const key of ['id', 'className', 'value', 'disabled', '_html', '_text']) copy[key] = this[key];
    copy.attrs = {...this.attrs}; copy.style = {...this.style}; copy.dataset = {...this.dataset};
    if (deep) this.children.forEach(child => copy.appendChild(child.cloneNode(true)));
    return copy;
  }
  getBoundingClientRect() { return {left: 0, top: 0, width: 1000, height: 500}; }
}
const walk = node => [node, ...node.children.flatMap(walk)];
const matches = (element, selector) => selector.split(',').some(part => part[0] === '#' ? element.id === part.slice(1) : part[0] === '.' ? element.classList.contains(part.slice(1)) : element.tagName.toLowerCase() === part);
function boot(sourceHtml = html) {
  const document = {listeners: {}, hidden: false, fullscreenElement: null};
  document.body = new Element('body', document); document.documentElement = new Element('html', document); document.activeElement = document.body;
  document.createElement = tag => new Element(tag, document);
  document.getElementById = id => walk(document.body).find(element => element.id === id) ?? null;
  document.querySelectorAll = selector => walk(document.body).filter(element => matches(element, selector));
  document.querySelector = selector => document.querySelectorAll(selector)[0] ?? null;
  document.addEventListener = (name, callback) => (document.listeners[name] ??= []).push(callback);
  document.emit = name => { for (const callback of document.listeners[name] ?? []) callback(); };
  for (const match of sourceHtml.slice(0, sourceHtml.indexOf('<script>')).matchAll(/<([\w-]+)\b([^>]*\bid="[^"]+"[^>]*)>/g)) {
    const element = new Element(match[1], document);
    for (const attr of match[2].matchAll(/([\w-]+)="([^"]*)"/g)) element.setAttribute(attr[1], attr[2]);
    document.body.appendChild(element);
  }
  let timerId = 0; const timers = new Map(), alerts = [], windowListeners = {};
  const context = vm.createContext({document, Element, console, innerWidth: 1280, innerHeight: 900,
    alert: message => alerts.push(String(message)),
    setTimeout: (callback, delay) => { timers.set(++timerId, {callback, delay}); return timerId; },
    clearTimeout: id => timers.delete(id),
    MutationObserver: class {observe() {} disconnect() {}},
    addEventListener: (name, callback) => (windowListeners[name] ??= []).push(callback)
  });
  context.window = context; context.parent = context;
  const evaluate = code => vm.runInContext(code, context);
  evaluate(shared('numeric-input.js')); evaluate(shared('object-view.js')); evaluate(shared('object-state.js'));
  evaluate(scriptOf(sourceHtml));
  const el = id => document.getElementById(id);
  return {evaluate, document, context, timers, alerts, el,
    state: () => plain(evaluate('({nums,res,i,value,firstIndex,secondIndex,resultStatus,execState,historyStack,trace,justWroteFirst,justWroteSecond,activeExample})')),
    objects: index => plain(evaluate(`studyLessonSource.objectFrame(${index ?? 'undefined'})`)),
    input: input => { el('custom-input').value = input; return evaluate('loadCustom()'); },
    emitWindow: name => { for (const callback of windowListeners[name] ?? []) callback(); },
    attachPlayback() {
      const toolbar = document.createElement('section'), steps = document.createElement('div');
      document.body.appendChild(toolbar); toolbar.appendChild(steps);
      for (const id of ['btn-prev', 'btn-next', 'btn-reset']) steps.appendChild(el(id));
      el('btn-next').onclick = () => evaluate('nextStep()'); el('btn-prev').onclick = () => evaluate('prevStep()'); el('btn-reset').onclick = () => evaluate('init()');
      context.toolbar = toolbar; context.steps = steps;
      evaluate(playback + "\nattachPlayback(toolbar, steps, 'study://app');");
    },
    async tick() { const pending = [...timers.values()]; timers.clear(); for (const timer of pending) await timer.callback(); assert.ok(timers.size <= 1); }
  };
}
let groups = 0, frames = 0, pristineComparisons = 0;
async function test(name, work) { await work(); groups++; console.log('PASS', name); }
const inlineAssets = text => [...text.matchAll(/<(?:link|script)\b[^>]*(?:href|src)="([^"]+)"[^>]*>/g)].map(match => match[1]);
await test('only shared playback, timeline and bridge are used', () => {
  assert.ok(script); assert.ok(!/stepCursor|togglePlayback|setPlaybackSpeed|copy-motion-layer/.test(html));
  assert.equal(inlineAssets(html).length, 14);
  assert.ok(inlineAssets(html).every(asset => asset.startsWith('../visualizer-ui/')));
  assert.match(script, /index: \(\) => historyStack.length/);
  assert.match(script, /return StudyObjectState.frame\(1929, raw, source.spec\)/);
  assert.ok(!/pulseGold|pulseGreen|pulseBlue|transition: all/.test(html));
});
await test('six examples, empty input and safe-integer extremes preserve every frame and object checkpoint', () => {
  const cases = [[1,2,1], [1,3,2,1], [5], [9,8,7,6], [0,-1,4], [2,2,2,2], [], [Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER]];
  for (const nums of cases) {
    const app = boot(); assert.equal(app.input(nums.join(',')), true);
    const states = [], objects = [];
    for (;;) {
      const state = app.state(); states.push(state); objects.push(app.objects()); frames++;
      assert.deepEqual(state.nums, nums);
      assert.equal(app.evaluate('studyLessonSource.index()'), states.length - 1);
      const cells = app.document.querySelectorAll('.cell');
      assert.equal(cells.length, nums.length * 3); assert.equal(new Set(cells.map(cell => cell.id)).size, cells.length);
      for (let i = 0; i < nums.length; i++) assert.equal(app.el(`nums-cell-${i}`).textContent, String(nums[i]));
      if (state.execState === 'READ_VALUE') {
        assert.equal(state.value, undefined); assert.ok(!app.el('narration-ui').textContent.includes('undefined'));
        assert.match(app.el('narration-ui').textContent, new RegExp(`Read nums\\[${state.i}\\] next`));
        assert.ok(app.el('narration-ui').textContent.includes(String(nums[state.i])));
        assert.equal(app.evaluate('pendingInstruction().line'), 4);
      }
      if (state.execState === 'END') break;
      app.evaluate('nextStep()'); assert.ok(states.length < 1000);
    }
    assert.deepEqual(app.state().res, [...nums, ...nums]); assert.equal(app.state().trace.length, nums.length * 2);
    const final = app.state(); app.evaluate('nextStep()'); assert.deepEqual(app.state(), final);
    for (let index = states.length - 1; index >= 0; index--) assert.deepEqual(app.objects(index), objects[index]);
    assert.throws(() => app.objects(-1), /not recorded/); assert.throws(() => app.objects(states.length), /not recorded/);
    for (let index = states.length - 2; index >= 0; index--) { app.evaluate('prevStep()'); assert.deepEqual(app.state(), states[index]); assert.deepEqual(app.objects(), objects[index]); frames++; }
    for (let index = 1; index < states.length; index++) { app.evaluate('nextStep()'); assert.deepEqual(app.state(), states[index]); assert.deepEqual(app.objects(), objects[index]); frames++; }
  }
});
await test('history preview returns a detached diagram without changing live state, lines or source index', () => {
  const app = boot(); app.evaluate('nextStep();nextStep();nextStep();nextStep();nextStep()');
  const before = app.state(), object = app.objects(), lines = app.document.querySelectorAll('.code-line').map(line => [line.id, line.className]);
  for (let index = 0; index <= before.historyStack.length; index++) {
    const clone = app.evaluate(`studyLessonSource.preview(${index})`);
    assert.ok(clone); assert.notEqual(clone, app.el('visual-ui'));
    assert.deepEqual(app.state(), before); assert.deepEqual(app.objects(), object);
    assert.deepEqual(app.document.querySelectorAll('.code-line').map(line => [line.id, line.className]), lines);
  }
});
await test('bad input remains atomic and retains history/object checkpoints', () => {
  const app = boot(); app.evaluate('nextStep();nextStep();nextStep();nextStep()');
  const state = app.state(), object = app.objects();
  for (const text of ['1,,2', ',', 'NaN', 'Infinity', '1.5', '9007199254740992', '1,nope,3']) {
    assert.equal(app.input(text), false); assert.deepEqual(app.state(), state); assert.deepEqual(app.objects(), object);
  }
  assert.equal(app.alerts.length, 7);
});
await test('pin controls retain keyboard focus, accessible pressed state and algorithm state', () => {
  const app = boot(); app.evaluate('nextStep();nextStep();nextStep()');
  const before = app.state(); const old = app.el('pin-value'); old.focus();
  assert.equal(old.getAttribute('aria-pressed'), 'false');
  app.evaluate("togglePin('value')");
  const active = app.el('pin-value'); assert.notEqual(active, old); assert.equal(app.document.activeElement, active);
  assert.equal(active.getAttribute('aria-pressed'), 'true'); assert.equal(active.getAttribute('aria-label'), 'Pin value to HUD');
  assert.deepEqual(app.state(), before); app.evaluate("togglePin('value')"); assert.equal(app.el('pin-value').getAttribute('aria-pressed'), 'false');
  app.document.body.focus(); app.evaluate("togglePin('n')"); assert.equal(app.document.activeElement, app.document.body);
});
await test('real shared controller supports timed stepping, all speeds, pause, completion and replay', async () => {
  for (const rate of [0.5, 1, 2, 4]) {
    const app = boot(), manual = boot(); app.attachPlayback();
    app.el('study-speed').value = String(rate); app.el('study-speed').emit('change'); app.el('study-play').click();
    assert.equal(app.timers.size, 1); assert.equal([...app.timers.values()][0].delay, 1000 / rate);
    for (let i = 0; i < 4; i++) { await app.tick(); manual.evaluate('nextStep()'); assert.deepEqual(app.state(), manual.state()); }
    app.el('study-play').click(); assert.equal(app.timers.size, 0); await app.tick(); assert.deepEqual(app.state(), manual.state());
    app.el('study-play').click(); for (let count = 0; app.timers.size && count < 100; count++) await app.tick();
    assert.equal(app.state().execState, 'END'); assert.equal(app.el('study-play').getAttribute('aria-label'), 'Replay');
    assert.deepEqual(app.state().res, [1,2,1,1,2,1]);
    app.el('study-play').click(); assert.equal(app.state().historyStack.length, 0); await app.tick(); assert.equal(app.state().historyStack.length, 1);
  }
});
await test('shared controller rapid toggles, speed change, visibility and page lifecycle leave no stray clock', async () => {
  const app = boot(); app.attachPlayback();
  for (let i = 0; i < 20; i++) app.el('study-play').click(); assert.equal(app.timers.size, 0);
  app.el('study-play').click(); app.el('study-speed').value = '4'; app.el('study-speed').emit('change'); assert.equal(app.timers.size, 1);
  assert.equal([...app.timers.values()][0].delay, 250); await app.tick(); assert.equal(app.state().historyStack.length, 1);
  app.document.hidden = true; app.document.emit('visibilitychange'); assert.equal(app.timers.size, 0);
  app.document.hidden = false; app.el('study-play').click(); app.emitWindow('blur'); assert.equal(app.timers.size, 0);
  app.el('study-play').click(); app.emitWindow('pagehide'); assert.equal(app.timers.size, 0);
});
if (process.env.WINDOWS_BASELINE_ROOT) await test('exact v0.7 bridge/assets and all algorithm/object frames remain unchanged', () => {
  const original = fs.readFileSync(path.join(process.env.WINDOWS_BASELINE_ROOT, relative), 'utf8');
  const oldScript = scriptOf(original);
  assert.deepEqual(inlineAssets(html), inlineAssets(original));
  const bridge = text => text.slice(text.indexOf('// STUDY LESSON BRIDGE START'), text.indexOf('// STUDY LESSON BRIDGE END'));
  assert.equal(bridge(script), bridge(oldScript));
  const algorithm = text => text.slice(text.indexOf('    function init()'), text.indexOf('    function highlightLines('));
  assert.equal(algorithm(script), algorithm(oldScript));
  assert.equal(script.slice(script.indexOf('function pendingInstruction()'), script.indexOf('    nums = [...examples[1].nums]')), oldScript.slice(oldScript.indexOf('function pendingInstruction()'), oldScript.indexOf('    nums = [...examples[1].nums]')));
  for (let preset = 1; preset <= 6; preset++) {
    const app = boot(), base = boot(original); app.evaluate(`loadExample(${preset})`); base.evaluate(`loadExample(${preset})`);
    for (;;) {
      assert.deepEqual(app.state(), base.state()); assert.deepEqual(app.objects(), base.objects()); pristineComparisons++;
      for (const id of ['visual-ui', 'trace-ui', 'hud-ui']) assert.equal(app.el(id).textContent, base.el(id).textContent);
      if (app.state().execState !== 'READ_VALUE') assert.equal(app.el('narration-ui').textContent, base.el('narration-ui').textContent);
      if (app.state().execState === 'END') break;
      app.evaluate('nextStep()'); base.evaluate('nextStep()');
    }
  }
});
console.log(`PASS ${groups} groups; ${frames} frame/object checks; ${pristineComparisons} pristine frame comparisons. Browser and Windows UI not exercised.`);
