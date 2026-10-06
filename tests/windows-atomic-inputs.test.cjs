/* Dependency-free tests of the actual HTML inline JavaScript and rendered DOM data.
 * Run: node tests/windows-atomic-inputs.test.cjs [--source <vault>] [--originals <pristine-vault>]
 * No browser automation: this model cannot verify layout, pointer interactions,
 * screen-reader behavior, fullscreen, or Windows Obsidian iframe embedding.
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
  two: 'Array & Hashing/two_sum_visualizer.html',
  rpn: 'Stack/evaluate_reverse_polish_notation_visualizer.html',
  rotated: 'Binary Search/search_in_rotated_sorted_array_visualizer.html',
};
const sourceBlobs = {
  two: '7df8858bf946b8e0fbb4bd56693a7e0d1e823891',
  rpn: 'cbe3b044a99990619572e285700bb61f12d7fd26',
  rotated: 'afd41cf8d211db754ce84e1ee9f9394a5fe080e9',
};
const stateExpressions = {
  two: '({nums,target,seen,i,num,need,resultStatus,execState,activeExample,historyStack,trace,justAddedKey,hitKey,hitIndex,res,lastCheckHit,pinned})',
  rpn: '({tokens,activeExample,steps,stepIndex,pinned})',
  rotated: '({nums,target,left,right,mid,midValue,sortedHalf,ans,execState,activeExample,historyStack,trace,lastAction,pinned})',
};
class Element {
  constructor(tag = 'div') {
    this.tagName = tag; this.style = {setProperty(name, value) { this[name] = String(value); }};
    this.attributes = {}; this.children = [];
    this.className = ''; this.value = ''; this.disabled = false; this.textContent = ''; this.html = '';
    this.listeners = {};
    this.classList = {
      add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...names])].join(' '); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter(n => !names.includes(n)).join(' '); },
      contains: name => this.className.split(/\s+/).includes(name),
    };
  }
  set value(value) { this._value = String(value); }
  get value() { return this._value; }
  set textContent(value) { this._text = String(value); this.children = []; this.html = ''; }
  get textContent() { return this._text; }
  set innerHTML(value) { this.html = String(value); this.children = []; this._text = ''; }
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
  const elements = new Map(), buttons = [];
  for (const match of html.matchAll(/<([\w-]+)\b([^>]*)>/g)) {
    const attrs = match[2];
    const id = attrs.match(/\bid="([^"]+)"/)?.[1];
    if (!id && match[1] !== 'button') continue;
    const el = new Element(match[1]);
    el.className = attrs.match(/\bclass="([^"]*)"/)?.[1] || '';
    el.value = attrs.match(/\bvalue="([^"]*)"/)?.[1] || '';
    el.handler = attrs.match(/\bonclick="([^"]*)"/)?.[1];
    if (id) elements.set(id, el);
    if (match[1] === 'button') {
      el.caption = html.slice(match.index + match[0].length).split('</button>')[0];
      buttons.push(el);
    }
  }
  const document = {
    body: new Element('body'), documentElement: new Element('html'), fullscreenElement: null,
    getElementById: id => elements.get(id) || null,
    createElement: tag => new Element(tag), addEventListener() {},
    querySelectorAll: selector => [...elements.values()].filter(el => selector.startsWith('.') && el.classList.contains(selector.slice(1))),
  };
  const alerts = [];
  const context = vm.createContext({document, console, alert: message => alerts.push(message),
    window: {innerWidth: 1280, innerHeight: 900, addEventListener() {}}});
  const exec = code => vm.runInContext(code, context, {timeout: 3000});
  if (html.includes('visualizer-ui/numeric-input.js')) {
    exec(fs.readFileSync(path.join(directory, 'visualizer-ui/numeric-input.js'), 'utf8'));
    exec('globalThis.StudyNumericInput = window.StudyNumericInput');
  }
  for (const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) exec(script[1]);
  const clickEl = el => { assert.ok(el?.handler, 'button has an inline handler'); if (!el.disabled) exec(el.handler); };
  return {key, html, exec, alerts, el: id => elements.get(id),
    click: id => clickEl(elements.get(id)), clickCaption: caption => clickEl(buttons.find(el => el.caption === caption)),
    json: expression => JSON.parse(exec(`JSON.stringify(${expression})`)),
    state: () => exec(`JSON.stringify(${stateExpressions[key]})`),
    phase: () => exec(key === 'rpn' ? 'steps[stepIndex].phase' : 'execState'),
    dom: (excludeInputs = false) => JSON.stringify([...elements].filter(([id]) => id !== 'btn-set-target' && (!excludeInputs || !['custom-input', 'target-input'].includes(id)))),
  };
}
let groups = 0, failures = 0, frames = 0, comparisons = 0, rejections = 0, oracleRuns = 0, domainCases = 0;
function test(name, run) {
  try { run(); groups++; console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}: ${error.stack}`); }
}
function done(h) { return h.el('btn-next').disabled; }
function finish(h) {
  let cap = 1000;
  while (!done(h) && cap--) { h.click('btn-next'); frames++; }
  assert.ok(done(h), 'reaches Finished within step cap');
  return h.key === 'two' ? h.json('res') : h.key === 'rpn' ? h.exec('steps[stepIndex].result') : h.exec('ans');
}
function setFields(h, raw, target) {
  h.el('custom-input').value = raw;
  if (target !== undefined) h.el('target-input').value = target;
}
function validLoad(h, raw, target) {
  const count = h.alerts.length;
  setFields(h, raw, target); h.clickCaption('Load');
  assert.equal(h.alerts.length, count, 'valid input accepted');
  assert.equal(h.exec('activeExample'), 0);
}
function compareRun(key, h, original) {
  const states = [], doms = [];
  let cap = 1000;
  do {
    assert.ok(cap--, 'bounded teaching run');
    if (original) {
      assert.equal(h.state(), original.state(), 'all algorithm state and history unchanged for valid input');
      assert.equal(h.dom(true), original.dom(true), 'all rendered teaching output unchanged for valid input');
      comparisons++;
    }
    states.push(h.state()); doms.push(h.dom()); frames++;
    if (done(h)) break;
    h.click('btn-next'); original?.click('btn-next');
  } while (true);
  assert.equal(h.el('btn-next').textContent, 'Finished!');
  h.exec('nextStep(); nextStep()');
  assert.equal(h.state(), states.at(-1)); assert.equal(h.dom(), doms.at(-1));
  for (let i = states.length - 2; i >= 0; i--) {
    h.click('btn-prev');
    assert.equal(h.state(), states[i], `Back restores algorithm state ${i}`);
    assert.equal(h.dom(), doms[i], `Back restores rendered output ${i}`); frames++;
  }
  h.exec('prevStep(); prevStep()'); assert.equal(h.state(), states[0]);
  for (let i = 1; i < states.length; i++) {
    h.click('btn-next'); assert.equal(h.state(), states[i]); assert.equal(h.dom(), doms[i]); frames++;
  }
  h.click('btn-reset'); assert.equal(h.state(), states[0]); assert.equal(h.dom(), doms[0]);
  h.click('btn-next'); h.click('btn-reset'); assert.equal(h.state(), states[0]); assert.equal(h.dom(), doms[0]);
}
function reject(h, raw, target, expected = null, caption = 'Load') {
  setFields(h, raw, target);
  const before = h.state(), dom = h.dom(), count = h.alerts.length;
  h.clickCaption(caption);
  assert.equal(h.alerts.length, count + 1, `one useful validation alert for ${JSON.stringify(raw)}, target ${target}`);
  if (expected) assert.match(h.alerts.at(-1), expected);
  assert.equal(h.state(), before, 'rejected input must not replace globals, snapshots, history, phase, result or preset');
  assert.equal(h.dom(), dom, 'rejected input must not alter output, controls, or edited fields');
  h.exec('render()'); assert.equal(h.dom(), dom, 're-render must still show the previous valid run');
  rejections++;
}
const invalid = {
  two: [
    ['2,wrong', '9'], ['100,101', 'wrong'], ['2,Infinity', '9'], ['-Infinity,2', '9'],
    ['1e309', '9'], ['2,7', 'Infinity'], ['2,7', ''], ['2,7', 'NaN'],
    ['2,,7', '9'], [',2,7', '9'], ['2,7,', '9'], ['2,7', '1e309'], ['0.5,1.5', '2'], ['9007199254740992', '2'], ['2,7', '9007199254740992'],
  ],
  rpn: [
    ['2,wrong'], [''], ['+'], ['1,+'], ['1,2'], ['2,3,+,+'], ['1,0,/', undefined, /zero/],
    ['4,2,2,-,/', undefined, /zero/], ['5,1,2,/,/', undefined, /zero/], ['1,-0,/', undefined, /zero/],
    ['1,,2,+'], ['1,2,+,'], [',1'], ['1.5'], ['Infinity'], ['9007199254740992'],
    ['9007199254740991,1,+'], ['9007199254740991,2,*'], ['2e3'], ['1,2,%,'],
  ],
  rotated: [
    ['8,9,1 | wrong', '0'], ['8,9,1', 'wrong'], ['8,9,1', ''],
    ['[1,3,1,1,1] | 3', '0', /distinct/], ['1,1 | 1', '0', /distinct/], ['3,1,2,0 | 1', '0', /distinct/],
    ['2,1,3 | 1', '0', /distinct/], ['1,3,2 | 1', '0', /distinct/],
    ['1,nope,2 | 2', '0'], ['1,,2 | 2', '0'], ['1,2, | 2', '0'],
    ['[1,"2"] | 2', '0'], ['[null,1] | 1', '0'], ['[false,1] | 1', '0'],
    ['[1,2 | 2', '0'], ['1,2 | 2 | 3', '0'], ['1,2 | ', '0'], ['', '0'], ['[] | 0', '0'],
    ['Infinity,1 | 1', '0'], ['1.5,2 | 2', '0'], ['1,2 | 1.5', '0'],
    ['1,2 | Infinity', '0'], ['9007199254740992 | 1', '0'], ['1,2 | 9007199254740992', '0'],
  ],
};
for (const key of Object.keys(files)) {
  if (originals) test(`${key}: pristine bytes match pinned GitHub blob`, () => {
    const bytes = fs.readFileSync(path.join(originals, files[key]));
    assert.equal(crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), sourceBlobs[key]);
  });
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
  const count = load(key).exec('Object.keys(examples).length');
  for (let preset = 1; preset <= count; preset++) {
    test(`${key}: preset ${preset}, every frame matches pristine, Back/Forward/Reset`, () => {
      const h = load(key); h.click('btn-ex-' + preset);
      const old = originals ? load(key, originals) : null; old?.click('btn-ex-' + preset);
      compareRun(key, h, old);
    });
    test(`${key}: custom reload of preset ${preset} preserves valid teaching sequence`, () => {
      const h = load(key); h.click('btn-ex-' + preset);
      const raw = h.el('custom-input').value, target = h.el('target-input')?.value;
      validLoad(h, raw, target);
      const old = originals ? load(key, originals) : null;
      if (old) { setFields(old, raw, target); old.clickCaption('Load'); }
      compareRun(key, h, old);
    });
  }
  test(`${key}: invalid loads in every teaching phase preserve live state, history and rendered output`, () => {
    const phases = new Set();
    for (let preset = 1; preset <= count; preset++) {
      const h = load(key); h.click('btn-ex-' + preset);
      let cap = 1000;
      do {
        assert.ok(cap--);
        const phase = h.phase();
        if (!phases.has(phase)) {
          phases.add(phase);
          for (const [raw, target, expected] of invalid[key]) reject(h, raw, target, expected);
          // Repeated rejects must leave Back, Reset and continuing the old run usable.
          const before = h.state(), dom = h.dom();
          if (!h.el('btn-prev').disabled) {
            h.click('btn-prev'); h.click('btn-next'); assert.equal(h.state(), before); assert.equal(h.dom(), dom);
          }
        }
        if (done(h)) break;
        h.click('btn-next'); frames++;
      } while (true);
      const reference = load(key); reference.click('btn-ex-' + preset); finish(reference);
      assert.equal(h.state(), reference.state(), 'old run still reaches its original result');
      h.click('btn-reset'); reference.click('btn-reset');
      assert.equal(h.state(), reference.state(), 'Reset after errors uses the original valid input');
      assert.equal(h.dom(true), reference.dom(true));
      h.click('btn-ex-' + (preset % count + 1)); assert.equal(h.exec('activeExample'), preset % count + 1);
    }
    if (key === 'two') {
      const h = load(key); validLoad(h, '1,2', '10'); finish(h);
      phases.add(h.phase()); for (const [raw, target, expected] of invalid[key]) reject(h, raw, target, expected);
    }
    console.log(`  phases: ${[...phases].join(', ')}`);
  });
}

for (const [raw, expected] of [
  ['7', 7], ['-7,3,/', -2], ['7,-3,/', -2], ['-7,-3,/', 2],
  ['2,5,-', -3], ['5,2,-', 3], ['0', 0], ['0,3,/', 0],
  ['1,2,+,4,*,3,/', 4], ['9007199254740991,1,-', 9007199254740990],
]) test(`rpn: valid custom ${raw} = ${expected}`, () => {
  const h = load('rpn'); validLoad(h, raw); assert.equal(finish(h), expected); oracleRuns++;
});
for (const [raw, message] of [
  ['1,+', /two earlier/], ['4,2,2,-,/', /zero/], ['1,2', /exactly one/], ['', /exactly one/],
]) test(`rpn: malformed expression ${JSON.stringify(raw)} is rejected before commit`, () => {
  const h = load('rpn'); h.click('btn-next'); h.click('btn-next');
  reject(h, raw, undefined, message);
});
test('rotated: the duplicate counterexample [1,3,1,1,1] is rejected before commit', () => {
  const h = load('rotated'); h.click('btn-next');
  reject(h, '[1,3,1,1,1] | 3', '0', /distinct/);
});
for (const key of Object.keys(files)) test(`${key}: correcting a rejected edit commits a fresh valid run`, () => {
  const h = load(key); h.click('btn-next'); h.click('btn-next');
  reject(h, ...invalid[key][0]);
  const [raw, target] = key === 'rpn' ? ['5,2,-'] : key === 'two' ? ['5,2', '7'] : ['8,9,1 | 9', '0'];
  validLoad(h, raw, target);
  assert.equal(h.phase(), 'INIT'); assert.equal(h.el('btn-prev').disabled, true);
  assert.deepEqual(finish(h), key === 'rpn' ? 3 : key === 'two' ? [0,1] : 1);
});
for (const [raw, target, expected] of [
  ['', '0', null], ['1', '2', null], ['1,2,4', '8', null], ['4,4', '8', [0,1]],
  ['-5,2,9', '4', [0,2]], ['0,4,0', '0', [0,2]],
]) test(`two: custom [${raw}], target ${target}`, () => {
  const h = load('two'); validLoad(h, raw, target); assert.deepEqual(finish(h), expected); oracleRuns++;
});

test('rotated: Target Set 7 searches loaded default array and returns index 3', () => {
  const h = load('rotated'); h.el('target-input').value = '7'; h.clickCaption('Set');
  assert.equal(h.alerts.length, 0); assert.equal(h.exec('target'), 7);
  assert.equal(h.el('target-input').value, '7'); assert.equal(h.el('custom-input').value, '4,5,6,7,0,1,2 | 7');
  assert.equal(finish(h), 3); oracleRuns++;
  h.click('btn-prev'); h.click('btn-next'); assert.equal(h.exec('ans'), 3);
  h.click('btn-reset'); assert.equal(h.exec('target'), 7); assert.equal(h.exec('historyStack.length'), 0);
  h.clickCaption('Load'); assert.equal(h.exec('target'), 7); assert.equal(finish(h), 3);
});
test('rotated: Set ignores uncommitted array/pipe edits; valid Load synchronizes both inputs', () => {
  const h = load('rotated');
  validLoad(h, '[8,9,1,2,3] | 9', '99'); assert.equal(h.exec('target'), 9);
  assert.equal(h.el('target-input').value, '9'); assert.equal(h.el('custom-input').value, '8,9,1,2,3 | 9');
  finish(h); setFields(h, '[100,200] | 100', '2'); h.clickCaption('Set');
  assert.deepEqual(h.json('nums'), [8,9,1,2,3]); assert.equal(h.exec('target'), 2);
  assert.equal(h.el('custom-input').value, '8,9,1,2,3 | 2'); assert.equal(finish(h), 3);
  h.click('btn-ex-1'); assert.equal(h.el('target-input').value, '0'); assert.equal(h.exec('target'), 0);
  validLoad(h, '1,2,3', '2'); assert.equal(h.el('custom-input').value, '1,2,3 | 2'); assert.equal(finish(h), 1);
});
test('rotated: invalid Set at every frame preserves current run and both edited fields', () => {
  const h = load('rotated');
  let cap = 1000;
  do {
    assert.ok(cap--);
    for (const target of ['', 'wrong', '1.5', 'Infinity', '9007199254740992']) reject(h, '[8,9,1] | 9', target, /target/i, 'Set');
    if (done(h)) break;
    h.click('btn-next'); frames++;
  } while (true);
  assert.equal(h.exec('ans'), 4);
});
test('rotated: valid Set and repeated Set restart cleanly from every phase', () => {
  const probe = load('rotated'), offsets = new Map();
  let index = 0;
  do {
    if (!offsets.has(probe.phase())) offsets.set(probe.phase(), index);
    if (done(probe)) break;
    probe.click('btn-next'); index++; assert.ok(index < 1000);
  } while (true);
  for (const offset of offsets.values()) {
    const h = load('rotated');
    for (let i = 0; i < offset; i++) h.click('btn-next');
    h.el('target-input').value = '7'; h.clickCaption('Set');
    assert.equal(h.phase(), 'INIT'); assert.equal(h.exec('historyStack.length'), 0);
    const before = h.state(), dom = h.dom(); h.clickCaption('Set');
    assert.equal(h.state(), before); assert.equal(h.dom(), dom); assert.equal(finish(h), 3);
  }
});

function* permutations(arr) {
  if (!arr.length) { yield []; return; }
  for (let i = 0; i < arr.length; i++) for (const tail of permutations(arr.filter((_, j) => j !== i))) yield [arr[i], ...tail];
}
for (let n = 1; n <= 6; n++) test(`rotated: validation matches a sorted-rotation oracle for every size-${n} permutation`, () => {
  const h = load('rotated'), sorted = Array.from({length:n}, (_, i) => i - 3);
  const rotations = new Set(sorted.map((_, offset) => JSON.stringify(sorted.slice(offset).concat(sorted.slice(0, offset)))));
  for (const arr of permutations(sorted)) {
    const accepted = h.exec(`parseInput(${JSON.stringify(JSON.stringify(arr) + ' | 0')}) !== null`);
    assert.equal(accepted, rotations.has(JSON.stringify(arr)), `rotation domain for ${JSON.stringify(arr)}`); domainCases++;
  }
});
for (let n = 1; n <= 8; n++) test(`rotated: size-${n} rotations find every present value and reject absent targets`, () => {
  const h = load('rotated'), sorted = Array.from({length:n}, (_, i) => i * 2 - 7);
  for (let offset = 0; offset < n; offset++) {
    const arr = sorted.slice(offset).concat(sorted.slice(0, offset));
    for (const target of [...arr, sorted[0] - 1, sorted.at(-1) + 1]) {
      validLoad(h, JSON.stringify(arr) + ' | ' + target, '0');
      assert.equal(finish(h), arr.indexOf(target), `[${arr}] target ${target}`); oracleRuns++;
      h.click('btn-reset'); assert.equal(h.exec('ans'), null);
    }
  }
});

console.log(`\n${groups} groups passed, ${failures} failed; ${frames} modeled rendered-frame visits; ${comparisons} pristine frame comparisons; ${rejections} atomic rejection checks; ${oracleRuns} result oracle runs; ${domainCases} rotation-domain permutations.`);
if (!originals) console.log('Pristine comparison skipped: supply --originals <pristine-vault-root>.');
console.log('Actual browser rendering and Windows Obsidian iframe behavior remain unverified.');
process.exitCode = failures ? 1 : 0;
