/* Standalone dependency-free DOM integration harness for LeetCode 34.
 * Executes complete production learning, operations, Object View, Object State and
 * Guided scripts. This models structure/events/text, not browser layout, painting,
 * motion, pointer hit-testing, screen readers or Windows/Electron embedding.
 * Workspace anchors are synthetic: workspace.js/playback are not mounted here.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const decode = text => text.replace(/&(?:amp|lt|gt|quot|apos|nbsp|#\d+|#x[\da-f]+);/gi, entity => {
  const named = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '\"', '&apos;': "'", '&nbsp;': '\u00a0'};
  return named[entity] ?? String.fromCodePoint(entity[2].toLowerCase() === 'x' ? parseInt(entity.slice(3), 16) : parseInt(entity.slice(2), 10));
});
// Enough DOM behavior for the production lifecycle and real Object View focus.
// Layout APIs deliberately report no visible rectangles, excluding motion tests.
function fixture(root = path.resolve(__dirname, '../..'), options = {}) {
  const html = fs.readFileSync(path.join(root, options.file || 'Binary Search/find_first_and_last_position_of_element_in_sorted_array_visualizer.html'), 'utf8');
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
    get textContent() { return this._text + decode(this._html.replace(/<[^>]*>/g, '')) + this.children.map(child => child.textContent).join(''); }
    set innerHTML(value) { this._html = String(value); this._text = ''; this.replaceChildren(); }
    get innerHTML() { return this._html; }
    get childNodes() { return this.children; }
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
        if (part.startsWith('.')) return part.slice(1).split('.').every(name => this.classList.contains(name));
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
    if (/^(line-|btn-)/.test(id)) element.innerHTML = html.slice(match.index + match[0].length).split('</' + match[1] + '>')[0];
    elements.set(id, element);
    (id.startsWith('line-') ? code : id.startsWith('btn-') || id === 'custom-input' ? toolbar : diagram).append(element);
  }
  const objectTab = make('button', '', inspector); objectTab.id = 'inspector-objects-tab'; objectTab.setAttribute('aria-selected', 'true'); elements.set(objectTab.id, objectTab);
  const sandbox = {
    document, Element, console, URLSearchParams, location: {search: options.search || ''}, alert: message => alerts.push(message),
    innerWidth: 1280, innerHeight: 900, scrollX: 0, scrollY: 0,
    addEventListener() {}, dispatchEvent() {}, scrollTo() {},
    requestAnimationFrame: () => ++timerId, cancelAnimationFrame() {}, setTimeout, clearTimeout,
    performance: {now: () => 1000}, matchMedia: () => ({matches: true, addEventListener() {}}),
    getComputedStyle: () => ({paddingBottom: '0'}),
    ResizeObserver: class { observe() {} disconnect() {} }, MutationObserver: class { observe() {} disconnect() {} },
    CustomEvent: class { constructor(type) { this.type = type; } }, localStorage: {getItem: () => null, setItem() {}},
    StudyPanelLayout: {mountReference() {}},
  };
  const context = vm.createContext(sandbox); context.window = context; context.parent = context; context.crypto = crypto.webcrypto; context.structuredClone = structuredClone;
  exec = source => vm.runInContext(source, context, {timeout: 5000});
  const script = name => exec(fs.readFileSync(path.join(root, 'visualizer-ui', name), 'utf8'));
  script('numeric-input.js'); script('object-view.js'); script('object-state.js'); script('operations.js'); script('guided-core.js');
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
    exec, adapter, walkthrough, alerts, renders, resets, objectContainer, workspace, document, context, html, source: context.studyLessonSource,
    json: expression => JSON.parse(exec(`JSON.stringify(${expression})`)),
    current: () => JSON.parse(JSON.stringify(context.studyLessonSource.read())),
    script,
    el: id => elements.get(id), epoch: () => renders.at(-1).epoch, notifications: () => notifications,
    state: () => exec('JSON.stringify({raw:studyLessonSource.read(),history:typeof historyStack!=="undefined"?historyStack:null,activeExample,pinned})'),
    load: (raw, target) => { elements.get('custom-input').value = raw; if (target !== undefined) elements.get('target-input').value = String(target); return exec('loadCustom()'); },
    focus() { const expand = objectContainer.querySelector('.study-object-expand'); assert.ok(expand, 'real Object View has an expandable variable'); expand.click(); assert.equal(objectContainer.dataset.objectFocused, 'true'); assert.ok(workspace.classList.contains('study-object-focus')); },
  };
}

const plain = value => JSON.parse(JSON.stringify(value));
function trace(h, limit = 500) {
  const frames = [];
  for (let i = 0; i <= limit; i++) {
    const raw = h.current();
    frames.push({ index: h.source.index(), raw, trace: h.json('trace'), rendered: snapshot(h),
      pendingInstruction: plain(h.source.pendingInstruction()),
      frame: plain(h.adapter.snapshot()),
      projected: plain(h.context.StudyGuided.project(h.adapter.snapshot())),
      objectFrame: plain(h.source.objectFrame()) });
    if (raw.execState === 'END') return frames;
    h.exec('nextStep()');
  }
  throw Error(`Search-range lesson did not terminate within ${limit} instructions`);
}
// Mirror only the validator's text/active-line/control-state fields. The model
// deliberately makes no claim about the validator's browser layout checks.
function snapshot(h) {
  const nodeText = element => !element || element.tagName === 'BUTTON' ? '' : element._text
    + decode(element._html.replace(/<button\b[^>]*>[\s\S]*?<\/button>/gi, '').replace(/<[^>]*>/g, ''))
    + element.children.map(nodeText).join('');
  const text = selector => nodeText(h.document.querySelector(selector)).replace(/\s+/g, ' ').trim();
  return {visual: text('#visual-ui,#lists-ui,#svg,#lists'), input: text('#input-ui'), result: text('#final-ui'),
    objects: text('#object-view,#obj,.obj-view-grid'), board: text('#board'), hud: text('#hud-ui'),
    variables: text('#console-ui,#console'), narration: text('#narration-ui,#narration,#narr'), trace: text('#trace-ui'),
    active: h.document.querySelectorAll('.code-line.active,.cl.active').map(element => element.id),
    nextDisabled: h.el('btn-next').disabled, prevDisabled: h.el('btn-prev').disabled};
}
async function baseline(h) {
  const initial = snapshot(h);
  for (let i = 0; i < 6 && !h.el('btn-next').disabled; i++) h.el('btn-next').click();
  const forward = snapshot(h);
  if (!h.el('btn-prev').disabled) h.el('btn-prev').click();
  const back = snapshot(h);
  h.el('btn-reset').click();
  const restarted = snapshot(h);
  await h.adapter.seek(50000);
  const final = snapshot(h), snapshots = {initial, forward, back, restarted, final};
  const hashes = Object.fromEntries(Object.entries(snapshots).map(([key, value]) =>
    [key, crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')]));
  return {verification: 'Structural DOM model only; real browser/Windows CI verification required',
    snapshots, expected: {...hashes, steps: h.source.index(), capped: !h.el('btn-next').disabled, errors: []}};
}
module.exports = {fixture, trace, plain, snapshot, baseline};
if (require.main === module) {
  const rootIndex = process.argv.indexOf('--source');
  const root = rootIndex < 0 ? path.resolve(__dirname, '../..') : path.resolve(process.argv[rootIndex + 1]);
  const h = fixture(root);
  (async () => process.stdout.write(JSON.stringify(process.argv.includes('--baseline') ? await baseline(h) : trace(h), null, 2) + '\n'))();
}
