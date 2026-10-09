/* Dependency-free integration model for rejected custom-input loads.
 * Runs each real inline lesson plus the complete learning, operations, object-state
 * and object-view scripts. The DOM models structure/events, not browser layout,
 * animation timing, or Windows/Electron embedding.
 * Run: node tests/windows-input-lifecycle.test.cjs [--source <repository>]
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const sourceAt = process.argv.indexOf('--source');
const root = sourceAt < 0 ? path.resolve(__dirname, '..') : path.resolve(process.argv[sourceAt + 1]);
const cases = {
  coin: {
    file: '1-D Dynamic Programming/coin_change_visualizer.html',
    state: '({coins,amount,steps,stepIndex,activeExample,masterTrace})',
    valid: '1,3,4 | 6',
    invalid: ['1,2', '1,,2 | 4', '0,2 | 4', '1.5 | 4', 'Infinity | 4', '9007199254740992 | 4', '1 | ', '1 | 61', '1 | -1', '1 | 1.5', '1 | Infinity', '1 | 9007199254740992', Array(13).fill(1).join(',') + ' | 60'],
  },
  permutations: {
    file: 'Backtracking/permutations_visualizer.html',
    state: '({nums,steps,stepIndex,activeExample})',
    valid: '-1,0,2',
    invalid: ['1,,2', ',1', '1,', ',', '1,1', '0,-0', '1,Infinity', '1,-Infinity', '1,NaN', '1,1e309', '1,9007199254740992', '1,-9007199254740992', '1,2.5', '1,2.0', '1,0x2', '1,2,3,4,5,6'],
  },
  combination: {
    file: 'Backtracking/combination_sum_visualizer.html',
    state: '({candidates,target,steps,stepIndex,activeExample})',
    valid: '2,3 | 6',
    invalid: ['0,2 | 7', '2,3', '2,,3 | 7', '2,2 | 7', '2 | 23', '1,2,3,4,5,6 | 22'],
  },
  tree: {
    file: 'Graphs/minimum_height_trees_visualizer.html',
    state: '({n,edges,steps,stepIndex,activeExample,positions})',
    valid: '3 | 0,1; 1,2',
    invalid: ['4 | 0,1; 1,2; 2,0', '4', '2 | 0,', '2 | 0,2', '1 | 0,0'],
  },
  merge: {
    file: 'Intervals/merge_intervals_visualizer.html',
    state: '({intervalsInput,steps,stepIndex,activeExample})',
    valid: '1,3; 2,5; 7,8',
    invalid: ['3,1', '1,Infinity', '', '[]'],
  },
  insert: {
    file: 'Intervals/insert_interval_visualizer.html',
    state: '({intervalsInput,newIntervalInput,steps,stepIndex,activeExample})',
    valid: '1,3; 6,9 | 2,5',
    invalid: ['1,3', '3,1 | 4,5', '1,3 | 4,Infinity', '1,3 | ', '1,3 | 4,5; 7,8', '4,5; 1,2 | 6,7', '1,3; 2,4 | 5,6'],
  },
  network: {
    file: 'Advanced Graphs/network_delay_time_visualizer.html',
    state: '({input,steps,stepIndex,activeExample,nodePositions,masterTrace})',
    valid: 'times=[[1,2,1],[2,3,2]]; n=3; k=1',
    invalid: ['times=[]; n=2', 'times=[[1,2,]]; n=2; k=1', 'times=[[1,2,-1]]; n=2; k=1', 'times=[]; n=2; k=0', 'times=[[1,2,9007199254740991],[2,3,1]]; n=3; k=1'],
  },
};

// Enough DOM behavior for the production lifecycle and real Object View focus.
// Layout APIs deliberately report no visible rectangles, excluding motion tests.
function fixture(key) {
  const spec = cases[key], html = fs.readFileSync(path.join(root, spec.file), 'utf8');
  const elements = new Map(), events = new Map(), alerts = [], renders = [], resets = [];
  let document, exec, timerId = 0;
  class Element {
    constructor(tag = 'div') {
      this.tagName = tag.toUpperCase(); this.children = []; this.parentNode = null;
      this.attributes = {}; this.dataset = {}; this.className = ''; this._text = ''; this._html = '';
      this.style = { setProperty(name, value) { this[name] = String(value); }, removeProperty(name) { delete this[name]; } };
      this.listeners = new Map(); this.value = ''; this.disabled = false;
      this.scrollTop = this.scrollLeft = 0; this.scrollWidth = this.clientWidth = 640; this.scrollHeight = this.clientHeight = 360;
      this.classList = {
        contains: name => this.className.split(/\s+/).includes(name),
        add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...names])].join(' '); },
        remove: (...names) => { this.className = this.className.split(/\s+/).filter(name => !names.includes(name)).join(' '); },
        toggle: (name, force) => { const on = force ?? !this.classList.contains(name); this.classList[on ? 'add' : 'remove'](name); return on; },
      };
    }
    set textContent(value) { this._text = String(value); this._html = ''; this.replaceChildren(); }
    get textContent() { return this._text + this._html.replace(/<[^>]*>/g, '') + this.children.map(child => child.textContent).join(''); }
    set innerHTML(value) { this._html = String(value); this._text = ''; this.replaceChildren(); }
    get innerHTML() { return this._html; }
    get firstChild() { return this.children[0] || null; }
    get nextSibling() { return this.parentNode?.children[this.parentNode.children.indexOf(this) + 1] || null; }
    get isConnected() { return this === document.documentElement || !!this.parentNode?.isConnected; }
    append(...children) { for (const child of children) this.appendChild(child); }
    appendChild(child) { child.remove(); child.parentNode = this; this.children.push(child); return child; }
    insertBefore(child, before) { if (!before) return this.appendChild(child); const index = this.children.indexOf(before); assert.ok(index >= 0); child.remove(); child.parentNode = this; this.children.splice(index, 0, child); return child; }
    before(child) { this.parentNode?.insertBefore(child, this); }
    after(child) { this.parentNode?.insertBefore(child, this.nextSibling); }
    replaceWith(child) { this.before(child); this.remove(); }
    replaceChildren(...children) { for (const child of this.children) child.parentNode = null; this.children = []; this.append(...children); }
    remove() { if (this.parentNode) { this.parentNode.children.splice(this.parentNode.children.indexOf(this), 1); this.parentNode = null; } }
    setAttribute(name, value) { this.attributes[name] = String(value); if (name === 'id' || name === 'class') this[name === 'class' ? 'className' : name] = String(value); }
    getAttribute(name) { return name === 'class' ? this.className : name === 'id' ? this.id || null : this.attributes[name] ?? null; }
    removeAttribute(name) { delete this.attributes[name]; if (name === 'id') this.id = ''; }
    hasAttribute(name) { return this.getAttribute(name) !== null; }
    matches(selector) {
      return selector.split(',').some(part => {
        part = part.trim();
        if (part.startsWith('.')) return this.classList.contains(part.slice(1));
        if (part.startsWith('#')) return this.id === part.slice(1);
        const attr = part.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
        if (attr) { const value = attr[1].startsWith('data-') ? this.dataset[attr[1].slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())] : this.getAttribute(attr[1]); return value !== undefined && value !== null && (attr[2] === undefined || value === attr[2]); }
        return this.tagName.toLowerCase() === part;
      });
    }
    querySelectorAll(selector) { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    closest(selector) { return this.matches(selector) ? this : this.parentNode?.closest(selector) || null; }
    contains(child) { return !!child && (child === this || this.children.some(node => node.contains(child))); }
    addEventListener(type, listener) { const list = this.listeners.get(type) || []; list.push(listener); this.listeners.set(type, list); }
    removeEventListener(type, listener) { this.listeners.set(type, (this.listeners.get(type) || []).filter(item => item !== listener)); }
    click() { if (this.disabled) return; this.onclick?.({target: this}); if (this.handler) exec(this.handler); for (const listener of this.listeners.get('click') || []) listener({target: this}); }
    focus() { document.activeElement = this; }
    getClientRects() { return []; }
    getBoundingClientRect() { return {x: 0, y: 0, left: 0, top: 0, right: 640, bottom: 360, width: 640, height: 360}; }
    cloneNode(deep) { const copy = new Element(this.tagName); copy.className = this.className; copy.id = this.id; copy._text = this._text; copy._html = this._html; copy.dataset = {...this.dataset}; copy.attributes = {...this.attributes}; if (deep) copy.append(...this.children.map(child => child.cloneNode(true))); return copy; }
  }
  const body = new Element('body'), documentElement = new Element('html');
  document = {
    body, documentElement, scrollingElement: documentElement, activeElement: null, readyState: 'loading', fullscreenElement: null,
    createElement: tag => new Element(tag), createElementNS: (_, tag) => new Element(tag), createComment: () => new Element('comment'),
    createTextNode: text => { const element = new Element('text'); element.textContent = text; return element; },
    getElementById: id => elements.get(id) || documentElement.querySelector('#' + id),
    querySelector: selector => documentElement.querySelector(selector), querySelectorAll: selector => documentElement.querySelectorAll(selector),
    addEventListener: (type, callback) => { const list = events.get(type) || []; list.push(callback); events.set(type, list); },
  };
  documentElement.append(body);
  const make = (tag, cls, parent) => { const element = new Element(tag); element.className = cls; parent.append(element); return element; };
  const workspace = make('main', 'study-workspace', body), toolbar = make('section', 'study-controls', workspace);
  make('details', 'study-extra-controls', toolbar).open = true;
  const diagram = make('section', 'study-diagram', workspace), code = make('section', 'study-code', workspace);
  make('h2', '', code);
  const inspector = make('section', 'study-inspector study-panel-body', workspace), objectContainer = make('div', '', inspector);
  objectContainer.id = 'study-object-view'; elements.set(objectContainer.id, objectContainer);
  for (const match of html.matchAll(/<([\w-]+)\b([^>]*)>/g)) {
    const id = match[2].match(/\bid="([^"]+)"/)?.[1];
    if (!id) continue;
    const element = new Element(match[1]); element.id = id;
    element.className = match[2].match(/\bclass="([^"]*)"/)?.[1] || '';
    element.value = match[2].match(/\bvalue="([^"]*)"/)?.[1] || '';
    element.handler = match[2].match(/\bonclick="([^"]*)"/)?.[1];
    elements.set(id, element);
    (id.startsWith('line-') ? code : id.startsWith('btn-') || id === 'custom-input' ? toolbar : diagram).append(element);
  }
  const objectTab = make('button', '', inspector); objectTab.id = 'inspector-objects-tab'; objectTab.setAttribute('aria-selected', 'true'); elements.set(objectTab.id, objectTab);
  const sandbox = {
    document, Element, console, URLSearchParams, location: {search: ''}, alert: message => alerts.push(message),
    innerWidth: 1280, innerHeight: 900, scrollX: 0, scrollY: 0,
    addEventListener() {}, dispatchEvent() {}, scrollTo() {},
    requestAnimationFrame: () => ++timerId, cancelAnimationFrame() {}, setTimeout, clearTimeout,
    performance: {now: () => 1000}, matchMedia: () => ({matches: true, addEventListener() {}}),
    getComputedStyle: () => ({paddingBottom: '0'}),
    ResizeObserver: class { observe() {} disconnect() {} }, MutationObserver: class { observe() {} disconnect() {} },
    CustomEvent: class { constructor(type) { this.type = type; } }, localStorage: {getItem: () => null, setItem() {}},
    StudyPanelLayout: {mountReference() {}},
  };
  const context = vm.createContext(sandbox); context.window = context; context.parent = context;
  exec = source => vm.runInContext(source, context, {timeout: 5000});
  const script = name => exec(fs.readFileSync(path.join(root, 'visualizer-ui', name), 'utf8'));
  script('object-view.js'); script('object-state.js'); script('operations.js');
  context.studyOperationRules = JSON.parse(fs.readFileSync(path.join(root, 'visualizer-ui/operations.json'), 'utf8'));
  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) exec(match[1]);
  const objectRender = context.StudyObjectView.render, objectReset = context.StudyObjectView.reset;
  context.StudyObjectView.render = (container, frame, options) => { renders.push({epoch: options.runId, index: frame.index}); return objectRender(container, frame, options); };
  context.StudyObjectView.reset = container => { resets.push(container); return objectReset(container); };
  // No slicing or replacement: exercise the complete production mount and wrappers.
  script('learning.js');
  for (const callback of events.get('DOMContentLoaded') || []) callback();
  const adapter = context.studyLessonAdapter, walkthrough = context.studyWalkthrough;
  let notifications = 0; adapter.subscribe(() => notifications++);
  return {
    exec, adapter, walkthrough, alerts, renders, resets, objectContainer, workspace,
    el: id => elements.get(id), epoch: () => renders.at(-1).epoch, notifications: () => notifications,
    state: () => exec(`JSON.stringify(${spec.state})`),
    load: raw => { elements.get('custom-input').value = raw; return exec('loadCustom()'); },
    focus() { const expand = objectContainer.querySelector('.study-object-expand'); assert.ok(expand, 'real Object View has an expandable variable'); expand.click(); assert.equal(objectContainer.dataset.objectFocused, 'true'); assert.ok(workspace.classList.contains('study-object-focus')); },
  };
}

async function checkpoint(h, index) {
  // Seed a real journal entry before returning to the initial checkpoint.
  h.exec('nextStep()'); const firstTransition = h.adapter.currentTransition();
  assert.ok(firstTransition, 'tracked Next records a real transition');
  if (index === 0) h.exec('prevStep()');
  else h.exec('nextStep(); nextStep()');
  // An uncommitted Action is reset by an accidental subscriber notification even
  // when the algorithm index is unchanged, covering advanced-checkpoint failures.
  h.walkthrough.refresh(); await h.walkthrough.next();
  assert.equal(h.walkthrough.stage, 1);
  h.focus();
  return firstTransition;
}

for (const [key, spec] of Object.entries(cases)) {
  for (const index of [0, 3]) {
    test(`${key}: rejected loads preserve the complete lifecycle at step ${index}`, async () => {
      const h = fixture(key), firstTransition = await checkpoint(h, index);
      for (const raw of spec.invalid) {
        const before = {state: h.state(), epoch: h.epoch(), resets: h.resets.length, renders: h.renders.length,
          alerts: h.alerts.length, notifications: h.notifications(), frame: h.adapter.snapshot(),
          transition: h.adapter.currentTransition(), operation: h.walkthrough.operation,
          objectChildren: [...h.objectContainer.children], focusedText: h.objectContainer.textContent};
        assert.equal(h.load(raw), false, 'rejection explicitly tells shared wrappers to stop');
        assert.equal(h.alerts.length, before.alerts + 1, 'one validation message');
        assert.equal(h.state(), before.state, 'algorithm, history, input and preset remain unchanged');
        assert.equal(h.el('custom-input').value, raw, 'keep the rejected edit available for correction');
        assert.equal(h.epoch(), before.epoch, 'do not start a new run');
        assert.equal(h.resets.length, before.resets, 'do not reset Object View');
        assert.equal(h.renders.length, before.renders, 'do not render another object snapshot');
        assert.equal(h.notifications(), before.notifications, 'do not announce a changed lesson frame');
        assert.equal(h.adapter.snapshot(), before.frame, 'preserve the current captured frame');
        assert.equal(h.adapter.currentTransition(), before.transition, 'preserve the current journal entry');
        assert.equal(h.walkthrough.operation, before.operation, 'preserve the selected walkthrough operation');
        assert.equal(h.walkthrough.stage, 1, 'preserve the uncommitted Action moment');
        assert.equal(h.objectContainer.dataset.objectFocused, 'true');
        assert.ok(h.workspace.classList.contains('study-object-focus'));
        assert.deepEqual(h.objectContainer.children, before.objectChildren, 'preserve the focused object DOM');
        assert.equal(h.objectContainer.textContent, before.focusedText);
      }
      await h.adapter.seek(1);
      assert.equal(h.adapter.currentTransition(), firstTransition, 'initial and advanced rejection preserve earlier journal entries');
      h.exec('nextStep(); prevStep()');
      assert.equal(h.exec('stepIndex'), 1, 'the old run can still step and go back');
    });

    test(`${key}: a corrected valid load resets exactly once from step ${index}`, async () => {
      const h = fixture(key), oldTransition = await checkpoint(h, index);
      assert.equal(h.load(spec.invalid[0]), false);
      const epoch = h.epoch(), resets = h.resets.length;
      assert.equal(h.load(spec.valid), true, 'success explicitly reports a committed run');
      assert.equal(h.epoch(), epoch + 1);
      assert.equal(h.resets.length, resets + 1, 'nested init/load wrappers reset only once');
      assert.equal(h.exec('stepIndex'), 0);
      assert.equal(h.exec('activeExample'), 0);
      assert.equal(h.adapter.currentTransition(), null);
      assert.equal(h.walkthrough.stage, 0, 'restart the walkthrough at Focus');
      assert.equal(h.objectContainer.dataset.objectFocused, 'false');
      assert.equal(h.workspace.classList.contains('study-object-focus'), false);
      assert.equal(h.el('btn-prev').disabled, true);
      await h.adapter.seek(1);
      assert.notEqual(h.adapter.currentTransition(), oldTransition, 'new run must not reuse the old journal');
      assert.equal(h.load(spec.valid), true, 'repeated valid load is still accepted');
      assert.equal(h.epoch(), epoch + 2);
      assert.equal(h.resets.length, resets + 2);
      h.exec('nextStep(); prevStep()');
      assert.equal(h.exec('stepIndex'), 0);
    });
  }
}
