/* Run: node tests/windows-tree-identity-roundtrip.test.cjs [--source <vault>] [--originals <pristine-vault>]
 * Executes the actual HTML scripts and inline handlers in a dependency-free DOM model.
 * This does not verify browser painting, pointer events, or Windows Obsidian embedding.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
function option(name, fallback) { const i = process.argv.indexOf(name); return i < 0 ? fallback : path.resolve(process.argv[i + 1]); }
const source = option('--source', path.resolve(__dirname, '..'));
const originals = option('--originals', null);
const files = { bst: 'Trees/validate_binary_search_tree_visualizer.html', codec: 'Trees/serialize_and_deserialize_binary_tree_visualizer.html' };
const blobs = { bst: '3eceec148de4603dbc273a4ec05336ff88071f06', codec: 'a707bfe56693827597dcbe15a2a1fe925b8bde9f' };
const plain = value => JSON.parse(JSON.stringify(value));
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
  getBoundingClientRect() { return { left: 0, top: 0, width: 640, height: 360 }; }
  toJSON() { return {tag: this.tagName, id: this.id, style: this.style, attributes: this.attributes, children: this.children, className: this.className, value: this.value, disabled: this.disabled, text: this.textContent, html: this.html}; }
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
    getElementById: id => elements.get(id) || null, addEventListener() {},
    createElement: tag => new Element(tag), createElementNS: (ns, tag) => new Element(tag),
    querySelectorAll: sel => [...elements.values()].filter(el => sel.startsWith('.') && el.classList.contains(sel.slice(1)))
  };
  const alerts = [], context = vm.createContext({document, alert: message => alerts.push(message), console, window: {innerWidth: 1280, innerHeight: 900, addEventListener() {}}});
  const exec = code => vm.runInContext(code, context, {timeout: 5000});
  for (const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) exec(script[1]);
  const clickEl = el => { assert.ok(el?.handler, 'real inline handler exists'); if (!el.disabled) exec(el.handler); };
  return {key, html, exec, alerts, el: id => elements.get(id), json: code => plain(exec(code)),
    click: id => clickEl(elements.get(id)), clickCaption: caption => clickEl(buttons.find(el => el.caption === caption)),
    dom: () => JSON.stringify([...elements].filter(([id]) => id !== 'custom-input')),
    state: () => exec('JSON.stringify({treeArr,steps,stepIndex,activeExample,pinned})'),
    seek: i => exec(`stepIndex = ${i}; render();`)
  };
}
const descendants = el => [el, ...el.children.flatMap(descendants)];
function treeNodes(h, mode) {
  const all = descendants(h.el('visual-ui'));
  if (h.key === 'bst') return all.filter(el => el.classList.contains('tnode'));
  return descendants(all.find(el => el.attributes['data-tree'] === mode)).filter(el => el.classList.contains('tree-node'));
}
function buildIndependent(values) {
  if (!values.length || values[0] === null) return null;
  const root = {val: values[0], id: 'root', left: null, right: null}, queue = [root]; let i = 1;
  for (let q = 0; q < queue.length && i < values.length; q++) for (const side of ['left', 'right']) {
    if (i >= values.length) break;
    if (values[i] !== null) { const node = {val: values[i], id: `${queue[q].id}.${side}`, left: null, right: null}; queue[q][side] = node; queue.push(node); } i++;
  }
  return root;
}
function nodesOf(root) { return root ? [root, ...nodesOf(root.left), ...nodesOf(root.right)] : []; }
function treeShape(root) { return root ? [root.val, treeShape(root.left), treeShape(root.right)] : null; }
function levelOrder(root) {
  if (!root) return []; const out = [], q = [root];
  for (let i = 0; i < q.length; i++) { const n = q[i]; out.push(n ? n.val : null); if (n) q.push(n.left, n.right); }
  while (out.at(-1) === null) out.pop(); return out;
}
function preorder(root) { return root ? [String(root.val), ...preorder(root.left), ...preorder(root.right)] : ['null']; }
function bstOracle(root) {
  const checks = [], fmt = n => n === Infinity ? '+Inf' : n === -Infinity ? '-Inf' : String(n);
  function visit(n, lo, hi) {
    if (!n) return true;
    const ok = n.val > lo && n.val < hi;
    checks.push({node: n.val, nodeId: n.id, low: fmt(lo), high: fmt(hi), ok});
    return ok && visit(n.left, lo, n.val) && visit(n.right, n.val, hi);
  }
  return {answer: visit(root, -Infinity, Infinity), checks};
}
function validLoad(h, values, raw = values.map(v => v === null ? 'null' : String(v)).join(',')) {
  const count = h.alerts.length; h.el('custom-input').value = raw; h.clickCaption('Load'); assert.equal(h.alerts.length, count, `accepted ${raw}`); assert.equal(h.exec('stepIndex'), 0);
}
let groups = 0, failures = 0, frameChecks = 0, oracleRuns = 0, pristineComparisons = 0, rejections = 0;
function test(name, run) { try { run(); groups++; console.log(`PASS ${name}`); } catch (err) { failures++; console.error(`FAIL ${name}: ${err.stack}`); } }
function checkBst(h, values, renderEvery = true) {
  const root = buildIndependent(values), oracle = bstOracle(root), nodes = nodesOf(root), byId = new Map(nodes.map(n => [n.id, n]));
  const bounds = new Map();
  (function visit(n, low, high) { if (!n) return; bounds.set(n.id, {low, high}); visit(n.left, low, n.val); visit(n.right, n.val, high); })(root, -Infinity, Infinity);
  const frames = h.exec('steps'); oracleRuns++;
  assert.equal(frames.at(-1).ans, oracle.answer); assert.deepEqual(plain(frames.at(-1).trace), oracle.checks);
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i]; frameChecks++;
    assert.equal(f.node, f.nodeId === null ? null : byId.get(f.nodeId).val);
    if (f.nodeId !== null) { assert.equal(f.low, bounds.get(f.nodeId).low); assert.equal(f.high, bounds.get(f.nodeId).high); }
    assert.equal(new Set(f.validSet).size, f.validSet.length);
    for (const id of f.validSet) assert.ok(oracle.checks.some(c => c.nodeId === id && c.ok));
    if (f.path.length) { assert.equal(f.path[0], root.id); assert.equal(f.path.at(-1), f.nodeId); }
    for (let j = 1; j < f.path.length; j++) { const p = byId.get(f.path[j - 1]); assert.ok(p.left?.id === f.path[j] || p.right?.id === f.path[j]); }
    if (f.badNode !== null) { assert.equal(f.badNode, f.nodeId); assert.equal(f.trace.at(-1).ok, false); }
    assert.equal(f.ans, f.finished ? oracle.answer : 'pending');
    if (!renderEvery) continue;
    h.seek(i); const rendered = treeNodes(h);
    assert.equal(rendered.length, nodes.length); assert.equal(new Set(rendered.map(n => n.id)).size, nodes.length);
    assert.deepEqual(rendered.filter(n => n.classList.contains('invalid')).map(n => n.attributes['data-node-id']), f.badNode === null ? [] : [f.badNode]);
    assert.deepEqual(rendered.filter(n => n.classList.contains('current')).map(n => n.attributes['data-node-id']), f.nodeId !== null && !f.finished && f.badNode === null ? [f.nodeId] : []);
    const tags = rendered.flatMap(n => n.children.filter(c => c.classList.contains('bounds-tag')).map(c => ({id: n.attributes['data-node-id'], text: c.textContent})));
    assert.equal(tags.length, f.nodeId === null ? 0 : 1);
    if (tags.length) { assert.equal(tags[0].id, f.nodeId); assert.equal(tags[0].text, h.exec('fmtBound(steps[stepIndex].low) + " < " + steps[stepIndex].node + " < " + fmtBound(steps[stepIndex].high)')); }
    const edges = descendants(h.el('visual-ui')).filter(el => el.classList.contains('path')).map(el => [el.attributes['data-from-id'], el.attributes['data-to-id']]);
    assert.deepEqual(edges.sort(), plain(f.path.slice(1).map((id, j) => [f.path[j], id])).sort());
  }
}
function checkCodec(h, values, renderEvery = true) {
  const original = h.exec('rootNode'), rebuilt = h.exec('rebuiltRoot'), reference = buildIndependent(values), frames = h.exec('steps'), final = frames.at(-1);
  oracleRuns++; assert.deepEqual(treeShape(original), treeShape(reference)); assert.deepEqual(treeShape(rebuilt), treeShape(reference));
  assert.deepEqual(plain(final.rebuiltLevelOrder), levelOrder(reference)); assert.equal(final.data, preorder(reference).join(',')); assert.equal(final.i, preorder(reference).length); assert.equal(final.roundTripVerified, true);
  const originalNodes = nodesOf(original), freshNodes = nodesOf(rebuilt);
  assert.equal(new Set(freshNodes.map(n => n._id)).size, freshNodes.length);
  assert.ok(freshNodes.every(n => !originalNodes.includes(n)), 'every rebuilt object is fresh');
  assert.equal(final.i, 2 * freshNodes.length + 1);
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i]; frameChecks++;
    assert.equal(f.rebuiltLevelOrder === null, i < frames.length - 1, 'pending is distinct from an empty completed array');
    if (f.phase === 'deserialize') {
      assert.ok(f.i >= 0 && f.i <= final.i); assert.deepEqual(plain(f.builtIds), plain((f.rebuiltNodes || []).map(n => n._id)));
      for (const n of f.rebuiltNodes || []) for (const child of [n.left, n.right]) if (child !== null) assert.ok(f.builtIds.includes(child));
      if (i && frames[i - 1].phase === 'deserialize') assert.ok(f.i >= frames[i - 1].i && f.i - frames[i - 1].i <= 1);
    }
    if (!renderEvery) continue;
    h.seek(i); const origEls = treeNodes(h, 'original'), rebuiltEls = treeNodes(h, 'rebuilt');
    assert.equal(origEls.length, originalNodes.length); assert.equal(rebuiltEls.length, f.builtIds.length);
    assert.equal(new Set([...origEls, ...rebuiltEls].map(n => n.id)).size, origEls.length + rebuiltEls.length, 'tree diagrams do not share DOM IDs');
    for (const n of rebuiltEls) {
      const snapshot = f.rebuiltNodes.find(s => String(s._id) === n.attributes['data-node-id']); assert.equal(n.textContent, String(snapshot.val));
      assert.equal(n.classList.contains('current-build'), snapshot._id === f.curBuildId);
    }
    const wrap = descendants(h.el('visual-ui')).find(el => el.attributes['data-tree'] === 'rebuilt');
    const edges = descendants(wrap).filter(el => el.tagName === 'line').map(el => [Number(el.attributes['data-from-id']), Number(el.attributes['data-to-id'])]);
    const expectedEdges = (f.rebuiltNodes || []).flatMap(n => [n.left, n.right].filter(c => c !== null).map(c => [n._id, c]));
    assert.deepEqual(edges.sort(), plain(expectedEdges).sort(), 'only actual attached child links are drawn');
    assert.match(h.el('console-ui').innerHTML, i < frames.length - 1 ? /rebuilt = \[\.\.\.\]/ : new RegExp('rebuilt = \\[' + levelOrder(reference).map(v => v === null ? 'null' : String(v).replace(/[+.*]/g, '\\$&')).join(', ') + '\\]'));
  }
}
const bstCases = [[], [null], [0], [2, 1, 3], [2, 2, 2], [2, 1, 2], [2, 2, 3], [5, 1, 4, null, null, 3, 6], [5, 4, 6, null, null, 3, 7], [10, 5, 15, null, null, 6, 20], [8, 4, 12, 2, 6, 10, 14, null, null, 4], [0, -2, 2, -3, -1, 1, 3], [1, null, 2, null, 3], [3, 2, null, 1], [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER], [0, -1e100, 1e100], [1.5, 1.25, 1.75], [1, null, null, null, null]];
const codecCases = [...bstCases, [1, 2, 3, null, null, 4, 5], [1, null, 2, 3], [0, 0, 0, null, 0, 0], [1e-100, -1e-100, 1e100], [1, 2, 3, 4, 5, null, 6]];
for (const values of bstCases) test(`BST oracle / identity / bounds ${JSON.stringify(values)}`, () => { const h = load('bst'); validLoad(h, values); checkBst(h, values); });
for (const values of codecCases) test(`fresh round-trip / rendered links ${JSON.stringify(values)}`, () => { const h = load('codec'); validLoad(h, values); checkCodec(h, values); });

test('duplicate example flags only the first violating node and correct path', () => {
  const h = load('bst'); h.click('btn-ex-4'); h.seek(h.exec('steps.length - 1'));
  const byId = new Map(treeNodes(h).map(n => [n.attributes['data-node-id'], n]));
  assert.ok(byId.get('root').classList.contains('valid')); assert.ok(byId.get('root.left').classList.contains('invalid'));
  assert.equal(byId.get('root.right').className, 'tnode'); assert.deepEqual(h.json('steps[stepIndex].path'), ['root', 'root.left']);
  assert.deepEqual(h.json('steps[stepIndex].trace.map(r => r.nodeId)'), ['root', 'root.left']);
});
test('decoder works without original nodes, assigns fresh IDs, and isolates calls', () => {
  const h = load('codec'); h.exec('rootNode = null; idToNode = {}; layout = null;');
  const a = h.exec('deserializeData("2,2,null,null,2,null,null")'), b = h.exec('deserializeData("2,2,null,null,2,null,null")');
  assert.equal(a.consumed, 7); assert.deepEqual(treeShape(a.root), [2, [2, null, null], [2, null, null]]);
  assert.ok(nodesOf(a.root).every(n => !nodesOf(b.root).includes(n))); a.root.left.val = -99; assert.equal(b.root.left.val, 2);
  assert.deepEqual(nodesOf(b.root).map(n => n._id), [0, 1, 2]);
});
test('decoder rejects truncated, trailing, empty, nonnumeric and nonfinite serialized tokens', () => {
  const h = load('codec');
  const bad = ['', ' ', ',', 'null,null', '1', '1,null', '1,null,null,2', '1,null,null,null', '1,,null', 'NaN,null,null', 'Infinity,null,null', '1e309,null,null', 'foo,null,null', '1x,null,null', 'null,', '1,null,null,', '1,undefined,null', '0x10,null,null', '01,null,null', '[1],null,null', '1,<img>,null'];
  for (const data of bad) { assert.throws(() => h.exec(`deserializeData(${JSON.stringify(data)})`), undefined, data); rejections++; }
  for (const input of ['null', 'undefined', '123', '{}', '[]']) { assert.throws(() => h.exec(`deserializeData(${input})`)); rejections++; }
  for (const data of ['null', '-2,null,null', '1.25,null,null', '1e+100,null,null', '-1e-100,null,null']) assert.equal(h.exec(`deserializeData(${JSON.stringify(data)}).consumed`), data.split(',').length);
});
test('structural verification detects wrong value and wrong child structure', () => {
  const h = load('codec');
  assert.equal(h.exec('sameTree(buildTree([1,2]), buildTree([1,null,2]))'), false);
  assert.equal(h.exec('sameTree(buildTree([1,2]), buildTree([1,3]))'), false);
  assert.equal(h.exec('sameTree(buildTree([1,2]), buildTree([1,2]))'), true);
  h.exec(`const realDecode = deserializeData; deserializeData = (data, callback) => { const result = realDecode(data, callback); result.root.val = 999; result.nodes[0].val = 999; return result; }; init();`);
  assert.equal(h.exec('steps[steps.length - 1].roundTripVerified'), false);
  assert.equal(h.exec('steps[steps.length - 1].rebuiltLevelOrder[0]'), 999, 'output comes from the actual decoded tree');
  h.seek(h.exec('steps.length - 1')); assert.match(h.el('narration-ui').innerHTML, /verification failed/);
  assert.equal(treeNodes(h, 'rebuilt').find(n => n.attributes['data-node-id'] === '0').textContent, '999');
  assert.equal(treeNodes(h, 'original').find(n => n.attributes['data-node-id'] === '0').textContent, '1');
});
test('snapshots preserve allocation and child attachment timing', () => {
  const h = load('codec'); const snapshots = [];
  h.exec('this.events = []; deserializeData("1,2,null,null,3,null,null", event => events.push(event));');
  const events = h.exec('events');
  for (const f of events) snapshots.push(JSON.stringify(f));
  const childCreated = events.find(f => f.lines[0] === 17 && f.curBuildId === 1);
  assert.equal(childCreated.rebuiltNodes[0].left, null, 'parent assignment waits for recursive return');
  const afterLeft = events.find(f => f.lines[0] === 20 && f.curBuildId === 0);
  assert.equal(afterLeft.rebuiltNodes[0].left, 1); assert.equal(afterLeft.rebuiltNodes[0].right, null);
  const returned = events.find(f => f.lines[0] === 21 && f.curBuildId === 0);
  assert.equal(returned.rebuiltNodes[0].right, 2); assert.deepEqual(plain(events.map(f => JSON.stringify(f))), snapshots);
  assert.notEqual(childCreated.rebuiltNodes[0], returned.rebuiltNodes[0]);
});
for (const key of Object.keys(files)) test(`${key}: orphan rejection is atomic at initial, middle and final frames`, () => {
  const h = load(key), invalid = ['1,null,null,2', 'null,1', '[1,null,null,2]', '[null,1]', '1,2,3,null,null,null,null,4', 'null,null,4', 'Infinity', '-Infinity', 'NaN', '1,wat,2'];
  for (const i of [0, 3, h.exec('steps.length - 1')]) {
    h.seek(i); h.exec('togglePin("node")'); const beforeState = h.state(), beforeDom = h.dom();
    const rootBefore = h.exec(key === 'bst' ? 'root' : 'rootNode'), stepsBefore = h.exec('steps');
    for (const raw of invalid) {
      const count = h.alerts.length; h.el('custom-input').value = raw; h.clickCaption('Load');
      assert.equal(h.alerts.length, count + 1, raw); assert.equal(h.state(), beforeState, raw); assert.equal(h.dom(), beforeDom, raw);
      assert.equal(h.exec(key === 'bst' ? 'root' : 'rootNode'), rootBefore); assert.equal(h.exec('steps'), stepsBefore); rejections++;
    }
  }
  for (const expr of ['[1,null,null,2]', '[null,1]', '[1,Infinity]', '[NaN]', '[undefined]', 'null', '{}']) { assert.throws(() => h.exec(`buildTree(${expr})`)); rejections++; }
  validLoad(h, [4, 2, 6]); assert.equal(h.exec('activeExample'), 0); h.click('btn-reset'); assert.equal(h.exec('stepIndex'), 0);
});
for (const key of Object.keys(files)) test(`${key}: exact Back, render seek, reset, repeated finish and example changes`, () => {
  const h = load(key); validLoad(h, key === 'bst' ? [2, 2, 2] : [1, null, 2, 3]);
  const snapshots = [], states = [], n = h.exec('steps.length');
  for (let i = 0; i < n; i++) { assert.equal(h.exec('stepIndex'), i); snapshots.push(h.dom()); states.push(h.state()); if (i + 1 < n) h.click('btn-next'); }
  assert.equal(h.el('btn-next').textContent, 'Finished!'); h.exec('nextStep(); nextStep();'); assert.equal(h.dom(), snapshots.at(-1));
  for (let i = n - 2; i >= 0; i--) { h.click('btn-prev'); assert.equal(h.dom(), snapshots[i]); assert.equal(h.state(), states[i]); frameChecks++; }
  h.exec('prevStep();'); assert.equal(h.dom(), snapshots[0]);
  for (let i = n - 1; i >= 0; i--) { h.seek(i); assert.equal(h.dom(), snapshots[i]); assert.equal(h.state(), states[i]); frameChecks++; }
  h.click('btn-reset'); assert.equal(h.dom(), snapshots[0]); assert.equal(h.state(), states[0]);
  for (const ex of [2, 1, 4, 1]) { h.click(`btn-ex-${ex}`); assert.equal(h.exec('stepIndex'), 0); assert.equal(h.exec('activeExample'), ex); }
});

test('generated trees: independent BST and round-trip oracles', () => {
  const bst = load('bst'), codec = load('codec'); let seed = 297;
  const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
  function generate(n) { if (!n) return null; const left = Math.floor(rand() * n); return {val: Math.floor(rand() * 9) - 4, left: generate(left), right: generate(n - 1 - left)}; }
  for (let i = 0; i < 160; i++) {
    const values = levelOrder(generate(Math.floor(rand() * 25)));
    validLoad(bst, values); checkBst(bst, values, false); validLoad(codec, values); checkCodec(codec, values, false);
  }
  const complete = Array.from({length: 127}, (_, i) => i % 7 - 3), chain = [];
  for (let i = 0; i < 80; i++) { if (i) chain.push(null); chain.push(i - 40); }
  for (const values of [complete, chain]) { validLoad(bst, values); checkBst(bst, values, false); validLoad(codec, values); checkCodec(codec, values, false); }
});
for (const key of Object.keys(files)) test(`${key}: offline hooks and unchanged teaching code`, () => {
  const h = load(key);
  assert.ok(!/<(?:script|link|img)\b[^>]*(?:src|href)=["'](?:https?:)?\/\//i.test(h.html));
  for (const id of ['btn-prev', 'btn-next', 'btn-reset', 'btn-fullscreen', 'visual-ui', 'narration-ui', 'trace-ui', 'console-ui', 'hud-ui']) assert.ok(h.el(id));
  if (originals) {
    const bytes = fs.readFileSync(path.join(originals, files[key]));
    const hash = crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'); assert.equal(hash, blobs[key], 'pristine GitHub blob verified');
    const original = load(key, originals);
    assert.deepEqual([...h.html.matchAll(/<div id="line-\d+"[^\n]+/g)].map(m => m[0]), [...original.html.matchAll(/<div id="line-\d+"[^\n]+/g)].map(m => m[0]));
  }
});
if (originals) for (const key of Object.keys(files)) test(`${key}: pristine algorithm outputs, narration and frame counts`, () => {
  for (const values of key === 'bst' ? bstCases : codecCases) {
    const h = load(key), original = load(key, originals); validLoad(h, values); validLoad(original, values);
    const current = h.exec('steps'), old = original.exec('steps'); assert.equal(current.length, old.length);
    const idMap = new Map(nodesOf(h.exec(key === 'bst' ? 'root' : 'rootNode')).map(n => [n._id, n.val]));
    for (let i = 0; i < current.length; i++) {
      const a = plain(current[i]), b = plain(old[i]);
      if (key === 'bst') {
        delete a.nodeId; for (const row of a.trace) delete row.nodeId;
        a.path = a.path.map(id => idMap.get(id)); a.validSet = a.validSet.map(id => idMap.get(id)); if (a.badNode !== null) a.badNode = idMap.get(a.badNode);
      } else {
        delete a.rebuiltNodes; delete a.roundTripVerified;
        if (a.rebuiltLevelOrder === null) a.rebuiltLevelOrder = [];
        a.builtIds.sort((x, y) => x - y); b.builtIds.sort((x, y) => x - y);
        a.note = b.note; // Decoder initialization/verification wording is intentionally more precise.
      }
      assert.deepEqual(a, b, `${JSON.stringify(values)} frame ${i}`); pristineComparisons++;
      h.seek(i); original.seek(i);
      for (const id of ['console-ui', 'hud-ui', 'trace-ui']) {
        if (key === 'codec' && i === current.length - 1 && !levelOrder(buildIndependent(values)).length && id === 'console-ui') continue;
        assert.equal(JSON.stringify(h.el(id)), JSON.stringify(original.el(id)), `${id} ${JSON.stringify(values)} frame ${i}`);
      }
    }
  }
});
if (originals) test('pristine reproductions: duplicate highlighting, orphan acceptance, fake decode and empty output', () => {
  const bst = load('bst', originals); bst.click('btn-ex-4'); bst.seek(bst.exec('steps.length - 1'));
  assert.equal(descendants(bst.el('visual-ui')).filter(n => n.classList.contains('invalid')).length, 3);
  for (const key of Object.keys(files)) {
    const h = load(key, originals); validLoad(h, [1, null, null, 2]);
    assert.deepEqual(levelOrder(h.exec(key === 'bst' ? 'root' : 'rootNode')), [1]);
  }
  const codec = load('codec', originals);
  codec.exec('const BaseNode = TreeNode; this.allocations = []; TreeNode = class extends BaseNode { constructor(...args) { super(...args); allocations.push(this); } }; init();');
  assert.equal(codec.exec('allocations.length'), 5, 'the original builds only five input nodes and no fresh decoded nodes');
  codec.click('btn-ex-2'); codec.seek(codec.exec('steps.length - 1'));
  assert.deepEqual(codec.json('steps[stepIndex].rebuiltLevelOrder'), []); assert.match(codec.el('console-ui').innerHTML, /rebuilt = \[\.\.\.\]/);
});

function enableObjectView(h) {
  h.exec(fs.readFileSync(path.join(source, 'visualizer-ui/object-view.js'), 'utf8'));
  h.exec(fs.readFileSync(path.join(source, 'visualizer-ui/object-state.js'), 'utf8'));
  h.exec('globalThis.StudyObjectState = window.StudyObjectState;');
}
test('codec: real shared Object View captures partial fresh trees at arbitrary history checkpoints', () => {
  const h = load('codec'); enableObjectView(h);
  for (const values of [[1,2,3,null,null,4,5],[7,7,7],[],[0,null,-1]]) {
    validLoad(h, values);
    const frames = h.json('steps'), unchanged = h.state();
    for (let i = frames.length - 1; i >= 0; i--) {
      const frame = h.json(`window.studyLessonSource.objectFrame(${i})`);
      const vars = Object.fromEntries(frame.stack[0].variables.map(v => [v.name, v.value]));
      const state = frames[i], trees = frame.objects.filter(o => o.kind === 'tree');
      if (state.phase === 'deserialize') {
        const records = new Map((state.rebuiltNodes || []).map(n => [`tree:rebuilt:${n._id}`, n]));
        assert.equal(vars.root, records.size ? vars.root : null);
        if (records.size) assert.equal(vars.root.ref, `tree:rebuilt:${state.rebuiltNodes[0]._id}`);
        assert.deepEqual(vars.node, state.curBuildId === null ? null : {ref:`tree:rebuilt:${state.curBuildId}`});
        for (const object of trees) {
          assert.ok(records.has(object.id), 'no source-tree or future allocation leaks into the decode frame');
          const record = records.get(object.id), fields = Object.fromEntries(object.entries.map(e => [e.key,e.value]));
          assert.deepEqual(fields, {val:record.val,left:record.left === null ? null : {ref:`tree:rebuilt:${record.left}`},right:record.right === null ? null : {ref:`tree:rebuilt:${record.right}`}});
        }
      } else {
        assert.equal(trees.length, nodesOf(buildIndependent(values)).length);
        assert.ok(trees.every(o => !o.id.startsWith('tree:rebuilt:')));
        assert.equal(h.exec(`Object.hasOwn(window.studyLessonSource.readAt(${i}), 'objectLocals')`), false);
      }
      assert.equal(h.state(), unchanged, 'Object View does not navigate or mutate the lesson');
      assert.deepEqual(h.json(`window.studyLessonSource.objectFrame(${i})`), frame, 'checkpoint identities stay deterministic');
    }
  }
});
test('bst: diagram and Object View retain source-owned path aliases through pure reads, Back and seek', () => {
  const cases = [...bstCases, [3,1,5,null,2,3,7], [1,null,1]];
  const metadata = ['objectNodeId', 'objectNodeActive'];
  for (const values of cases) {
    const h = load('bst'); enableObjectView(h); validLoad(h, values);
    const input = buildIndependent(values), oracle = bstOracle(input);
    const frames = [], before = h.state(), beforeDom = h.dom();
    for (let i = 0; i < h.exec('steps.length'); i++) {
      const frame = h.json(`window.studyLessonSource.objectFrame(${i})`);
      const step = h.exec(`steps[${i}]`), vars = Object.fromEntries(frame.stack[0].variables.map(v => [v.name, v.value]));
      const field = (ref, name) => frame.objects.find(o => o.id === ref?.ref)?.entries.find(e => e.key === name)?.value;
      const shape = ref => ref === null ? null : [field(ref, 'val'), shape(field(ref, 'left')), shape(field(ref, 'right'))];
      assert.deepEqual(shape(vars.root), treeShape(input));
      for (const name of metadata) {
        assert.equal(h.exec(`Object.hasOwn(window.studyLessonSource.readAt(${i}), '${name}')`), false);
        assert.equal(Object.getOwnPropertyDescriptor(step, name).enumerable, false);
      }
      for (const object of frame.objects) assert.ok(!object.entries.some(e => [...metadata, '_id', 'px', 'py'].includes(e.key)));
      for (const value of Object.values(vars)) assert.notEqual(value?.special, 'not recorded at this checkpoint');
      if (step.objectNodeActive) {
        assert.deepEqual(vars.node, step.objectNodeId === null ? null : {ref: `tree:${step.objectNodeId}`});
        assert.equal(step.nodeId, step.objectNodeId, 'diagram and inspector use the same source-owned identity');
        if (step.objectNodeId !== null) {
          const alias = step.objectNodeId.split('.').slice(1).reduce((ref, side) => field(ref, side), vars.root);
          assert.deepEqual(vars.node, alias, 'current node aliases its original position, even with equal values');
          assert.equal(field(vars.node, 'val'), step.node);
        }
        for (const name of ['low', 'high']) assert.deepEqual(vars[name], Number.isFinite(step[name]) ? step[name] : {special: String(step[name])});
      } else for (const name of ['node', 'low', 'high']) assert.equal(vars[name], undefined);
      if (step.finished && step.ans === false) assert.equal(vars.node.ref, `tree:${oracle.checks.at(-1).nodeId}`);
      assert.deepEqual(h.json(`window.studyLessonSource.objectFrame(${i})`), frame);
      assert.equal(h.state(), before, 'historical Object View reads never navigate or mutate the lesson');
      assert.equal(h.dom(), beforeDom);
      frames.push(frame);
    }
    h.seek(frames.length - 1);
    for (let i = frames.length - 1; i >= 0; i--) {
      assert.deepEqual(h.json('window.studyLessonSource.objectFrame()'), frames[i]);
      const step = h.exec('steps[stepIndex]');
      assert.deepEqual(treeNodes(h).filter(n => n.classList.contains('invalid')).map(n => n.attributes['data-node-id']), step.badNode === null ? [] : [step.badNode]);
      if (i) h.click('btn-prev');
    }
    for (const i of new Set([frames.length - 1, Math.floor(frames.length / 2), 1, 0])) {
      h.seek(i); assert.deepEqual(h.json('window.studyLessonSource.objectFrame()'), frames[i]);
    }
  }
});
test('tree: current single-instruction metadata is complete after the merge', () => {
  for (const key of Object.keys(files)) {
    const h = load(key);
    for (const id of h.json('Object.keys(examples)')) {
      h.click('btn-ex-'+id);
      const frames = h.json('steps'); assert.equal(frames[0].executedLine,null);
      let previousLine = null;
      for (const frame of frames) {
        const lines = Array.isArray(frame.lines) ? frame.lines : Array.isArray(frame.line) ? frame.line : [frame.line];
        assert.ok(lines.length <= 1, 'never group executable lines');
        const statements = key === 'bst' ? [1,2,3,4,5,8] : [2,4,5,6,7,9,10,13,14,16,17,18,19,20,21,23];
        const expected = lines.length ? statements.includes(lines[0]) ? lines[0] : previousLine : null;
        assert.equal(frame.executedLine, expected);
        if (frame.executedLine !== null) previousLine = frame.executedLine;
      }
    }
  }
});

console.log(`RESULT: ${groups} passed, ${failures} failed; ${oracleRuns} independent tree-oracle runs, ${frameChecks} frame checks, ${pristineComparisons} pristine-frame comparisons, ${rejections} rejection checks.`);
console.log('NOT VERIFIED: actual browser pixels, native pointer/timing behavior, responsive layout, screen readers, fullscreen and Windows Obsidian iframe embedding.');
process.exitCode = failures ? 1 : 0;
