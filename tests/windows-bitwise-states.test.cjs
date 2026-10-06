/* Dependency-free regression tests of the actual HTML inline JavaScript and
 * modeled DOM output, not a reimplementation of the visualizer step engines.
 * Run: node tests/windows-bitwise-states.test.cjs [--source <vault>] [--originals <pristine-vault>]
 * No browser automation: actual painting, CSS layout/animation, pointer events,
 * screen readers, fullscreen and Windows Obsidian embedding remain unverified.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
function option(name, fallback) {
  const at = process.argv.indexOf(name);
  if (at < 0) return fallback;
  assert.ok(process.argv[at + 1], `${name} needs a path`);
  return path.resolve(process.argv[at + 1]);
}
const root = option('--source', path.resolve(__dirname, '..'));
const originals = option('--originals', null);
const files = {
  count: 'Bit Manipulation/number_of_1_bits_visualizer.html',
  reverse: 'Bit Manipulation/reverse_bits_visualizer.html',
};
const sourceBlobs = {
  count: '90e5065c708293c6b2530ae27caf576248e3463f',
  reverse: 'a7086d439d1fb09aa749362a710934e24a96fce1',
};
class Element {
  constructor(tag = 'div') {
    this.tagName = tag; this.style = {}; this.attributes = {}; this.children = [];
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
    const attrs = match[2], id = attrs.match(/\bid="([^"]+)"/)?.[1];
    if (!id && match[1] !== 'button') continue;
    const el = new Element(match[1]);
    el.className = attrs.match(/\bclass="([^"]*)"/)?.[1] || '';
    el.value = attrs.match(/\bvalue="([^"]*)"/)?.[1] || '';
    el.disabled = /\sdisabled(?:\s|$|=)/.test(attrs);
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
  for (const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) exec(script[1]);
  const clickEl = el => { assert.ok(el?.handler, 'button has an inline handler'); if (!el.disabled) exec(el.handler); };
  const h = {key, html, exec, alerts, el: id => elements.get(id),
    click: id => clickEl(elements.get(id)), clickCaption: caption => clickEl(buttons.find(el => el.caption === caption)),
    json: expression => JSON.parse(exec(`JSON.stringify(${expression})`)),
    state: () => exec(`JSON.stringify({input:${key === 'count' ? 'n0' : 'nInput'},activeExample,steps,stepIndex,pinned})`),
    dom: (excludeInput = false) => JSON.stringify([...elements].filter(([id]) => !excludeInput || id !== 'custom-input')),
  };
  h.current = () => h.json('steps[stepIndex]');
  h.phase = () => { const s = h.current(); return s.phase || s.state; };
  return h;
}
const bits32 = value => BigInt(value).toString(2).padStart(32, '0');
const popcount = value => [...bits32(value)].filter(b => b === '1').length;
const reverse32 = value => Number(BigInt('0b' + [...bits32(value)].reverse().join('')));
const hasClass = (el, cls) => el.className.split(/\s+/).includes(cls);
const walk = el => [el, ...el.children.flatMap(walk)];
let groups = 0, failures = 0, frames = 0, comparisons = 0, rejections = 0, oracleRuns = 0;
function test(name, run) {
  try { run(); groups++; console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}: ${error.stack}`); }
}
function validLoad(h, raw) {
  h.el('custom-input').value = raw;
  const n = h.alerts.length; h.clickCaption('Load');
  assert.equal(h.alerts.length, n, `accept ${JSON.stringify(raw)}`);
  assert.equal(h.exec('activeExample'), 0);
  assert.equal(h.exec('stepIndex'), 0);
}
function algorithmSteps(h) {
  return h.json('steps').map(s => {
    // These fields exclusively describe the repaired display hints; every
    // numeric register, phase, line, narration and trace entry must be unchanged.
    const {lowestIndex, clearedIndex, nDropped, ...algorithm} = s;
    return algorithm;
  });
}
function countRows(h) {
  return h.el('visual-ui').children[0].innerHTML.split(/<div class="bit-row [^"]*">/).slice(1).map(html => ({
    label: html.match(/<div class="bit-row-label">([^<]+)<\/div>/)[1],
    decimal: Number(html.match(/<div class="bit-decimal">= ([^<]+)<\/div>/)[1]),
    cells: [...html.matchAll(/<div class="(bit(?: [^"]*)?)">([01])<\/div>/g)].map(m => ({className:m[1], bit:m[2]})),
  }));
}
function verifyCount(h, input) {
  const s = h.current(), rows = countRows(h);
  const expectedValues = s.phase === 'CLEAR' ? [s.nBefore, s.nBefore - 1, s.n] : [s.n];
  const expectedLabels = s.phase === 'CLEAR' ? ['n (before)', 'n - 1', 'n (after)'] : ['n'];
  assert.deepEqual(rows.map(r => r.label), expectedLabels);
  assert.equal(rows.length, expectedValues.length);
  rows.forEach((r, i) => {
    assert.equal(r.cells.length, 32, 'every before/mask/after register is exactly 32 bits');
    assert.equal(r.cells.map(c => c.bit).join(''), bits32(expectedValues[i]));
    assert.equal(r.decimal, expectedValues[i]);
  });
  const highlights = (r, cls) => r.cells.flatMap((c, i) => hasClass(c, cls) ? [i] : []);
  if (s.phase === 'CLEAR') {
    const idx = bits32(s.nBefore).lastIndexOf('1');
    assert.deepEqual(highlights(rows[0], 'lowest'), [idx], 'before highlights the actual lowest 1');
    assert.equal(rows[0].cells[idx].bit, '1');
    assert.deepEqual(highlights(rows[1], 'lowest'), []);
    assert.deepEqual(highlights(rows[1], 'cleared'), []);
    assert.equal(rows[1].cells[idx].bit, '0', 'the mask clears this same column');
    assert.deepEqual(highlights(rows[2], 'cleared'), [idx], 'after marks exactly the old lowest bit');
    assert.equal(rows[2].cells[idx].bit, '0', 'the cleared cell is zero');
    assert.deepEqual(highlights(rows[2], 'lowest'), []);
    assert.equal(s.lowestIndex, idx); assert.equal(s.clearedIndex, idx);
    assert.equal(BigInt(s.nBefore) & BigInt(s.nBefore - 1), BigInt(s.n));
  } else {
    const expected = s.phase === 'CHECK' && s.n ? [bits32(s.n).lastIndexOf('1')] : [];
    assert.deepEqual(highlights(rows[0], 'lowest'), expected);
    assert.deepEqual(highlights(rows[0], 'cleared'), []);
  }
  let n = BigInt(input);
  s.trace.forEach((r, i) => {
    assert.equal(r.nBefore, Number(n));
    n -= n & -n;
    assert.equal(r.nAfter, Number(n)); assert.equal(r.step, i + 1); assert.equal(r.count, i + 1);
  });
  assert.equal(s.n, Number(n)); assert.equal(s.count, s.trace.length);
  assert.match(h.el('console-ui').innerHTML, new RegExp('0b' + bits32(s.n)));
  const hud = h.el('hud-ui').children.map(c => c.innerHTML).join('');
  if (h.exec('pinned.n')) assert.ok(hud.includes('0b' + bits32(s.n)));
}
function reverseRegisters(h) {
  return h.el('visual-ui').children.filter(el => hasClass(el, 'register')).map(reg => ({
    name: walk(reg).find(el => hasClass(el, 'register-name')).textContent,
    decimal: walk(reg).find(el => hasClass(el, 'register-dec')).textContent,
    cells: walk(reg).filter(el => hasClass(el, 'bit-cell')),
    indices: walk(reg).filter(el => hasClass(el, 'bit-index')).map(el => Number(el.textContent)),
  }));
}
function verifyReverse(h, input) {
  const s = h.current(), regs = reverseRegisters(h);
  assert.deepEqual(regs.map(r => r.name), ['n', 'res']);
  for (const [index, name] of ['n', 'res'].entries()) {
    const r = regs[index];
    assert.equal(r.cells.length, 32);
    assert.equal(r.cells.map(c => c.textContent).join(''), bits32(s[name]));
    assert.equal(r.decimal, `decimal = ${s[name]}  (unsigned)`);
    assert.deepEqual(r.indices, Array.from({length:32}, (_, i) => 31 - i));
    assert.ok(r.cells.every(c => !hasClass(c, 'dropped')), 'a live shifted register never strikes its next bit');
    const highlight = name === 'n' ? 'lowbit' : 'pushed';
    const active = name === 'n' ? s.state === 'READ_LOW' : s.state === 'PUSH_RES';
    assert.deepEqual(r.cells.flatMap((c, i) => hasClass(c, highlight) ? [i] : []), active ? [31] : []);
  }
  const i = Math.min(s.i, 32);
  const shifted = s.state === 'SHIFT_N' ? i + 1 : i;
  const pushed = ['PUSH_RES', 'SHIFT_N'].includes(s.state) ? i + 1 : i;
  const expectedN = Number(BigInt(input) >> BigInt(shifted));
  const reversedPrefix = [...bits32(input)].reverse().slice(0, pushed).join('');
  const expectedRes = reversedPrefix ? Number(BigInt('0b' + reversedPrefix)) : 0;
  assert.equal(s.n, expectedN, 'live n matches the consumed-bit count');
  assert.equal(s.res, expectedRes, 'live res matches the reversed prefix');
  if (s.state === 'SHIFT_N') {
    const oldLow = Number((BigInt(input) >> BigInt(i)) & 1n);
    assert.equal(s.lowbit, oldLow);
    const note = h.el('visual-ui').children.find(el => hasClass(el, 'transfer-note'));
    assert.ok(note.innerHTML.includes(`<b>${oldLow}</b>`));
    assert.match(note.innerHTML, /consumed/);
    assert.equal(regs[0].cells[31].textContent, String(expectedN % 2), 'rightmost cell is the unconsumed next bit');
  }
  assert.equal(s.trace.length, shifted);
  s.trace.forEach((r, j) => {
    assert.equal(r.i, j); assert.equal(r.lowbit, Number((BigInt(input) >> BigInt(j)) & 1n));
    assert.equal(r.nBefore, bits32(BigInt(input) >> BigInt(j)));
    assert.equal(r.resAfter, [...bits32(input)].reverse().slice(0, j + 1).join('').padStart(32, '0'));
  });
}
function verifyFrame(h, input) {
  if (h.key === 'count') verifyCount(h, input); else verifyReverse(h, input);
  const index = h.exec('stepIndex'), len = h.exec('steps.length');
  assert.equal(h.el('btn-prev').disabled, index === 0);
  assert.equal(h.el('btn-next').disabled, index === len - 1);
  assert.equal(h.el('btn-next').textContent, index === len - 1 ? 'Finished!' : 'Step Over');
  frames++;
}
function compareRun(h, input, pristine) {
  if (pristine) {
    assert.deepEqual(algorithmSteps(h), algorithmSteps(pristine), 'all algorithm snapshots, trace entries and narration match pristine');
    comparisons += h.exec('steps.length');
  }
  const states = [], doms = [];
  let cap = 200;
  do {
    assert.ok(cap--, 'bounded full teaching sequence');
    verifyFrame(h, input);
    states.push(h.exec('JSON.stringify({stepIndex,step:steps[stepIndex],activeExample,pinned})'));
    doms.push(h.dom());
    if (h.el('btn-next').disabled) break;
    h.click('btn-next');
  } while (true);
  const expected = h.key === 'count' ? popcount(input) : reverse32(input);
  assert.equal(h.current()[h.key === 'count' ? 'count' : 'res'], expected); oracleRuns++;
  assert.equal(states.length, h.key === 'count' ? 2 * popcount(input) + 4 : 132);
  const result = walk(h.el('visual-ui')).find(el => hasClass(el, 'result-value'));
  assert.equal(result.textContent, String(expected)); assert.ok(hasClass(result, 'done'));
  h.exec('nextStep(); nextStep()'); assert.equal(h.dom(), doms.at(-1), 'repeated Next at terminal is harmless');
  for (let i = states.length - 2; i >= 0; i--) {
    h.click('btn-prev'); verifyFrame(h, input);
    assert.equal(h.exec('JSON.stringify({stepIndex,step:steps[stepIndex],activeExample,pinned})'), states[i]);
    assert.equal(h.dom(), doms[i], `Back restores complete rendered teaching output at ${i}`);
  }
  h.exec('prevStep(); prevStep()'); assert.equal(h.dom(), doms[0]);
  for (let i = 1; i < states.length; i++) {
    h.click('btn-next'); verifyFrame(h, input); assert.equal(h.dom(), doms[i], `Forward reproduces frame ${i}`);
  }
  h.click('btn-reset'); assert.equal(h.dom(), doms[0]);
  h.click('btn-next'); h.click('btn-reset'); assert.equal(h.dom(), doms[0]);
}
function reject(h, raw) {
  h.el('custom-input').value = raw;
  const state = h.state(), dom = h.dom(), alerts = h.alerts.length;
  h.clickCaption('Load');
  assert.equal(h.alerts.length, alerts + 1, `reject ${JSON.stringify(raw)}`);
  if (h.key === 'count') assert.match(h.alerts.at(-1), /integer.*0.*4294967295/);
  assert.equal(h.state(), state, 'invalid Load preserves input, preset, all snapshots, current position and pins');
  assert.equal(h.dom(), dom, 'invalid Load preserves complete rendered output, controls and edited field');
  h.exec('render()'); assert.equal(h.dom(), dom, 'later render cannot commit the rejected input');
  rejections++;
}
const boundaries = [0, 1, 2, 65535, 65536, 65539, 2147483648, 4294967295];
const invalid = ['', ' ', 'nope', 'NaN', 'Infinity', '-Infinity', '-1', '1.5', '0.1', '1,2',
  '4294967296', '4294967297', '8589934591', '9007199254740991', '9007199254740992', '1e309'];
for (const key of Object.keys(files)) {
  if (originals) test(`${key}: pristine bytes match pinned GitHub blob`, () => {
    const bytes = fs.readFileSync(path.join(originals, files[key]));
    assert.equal(crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), sourceBlobs[key]);
  });
  test(`${key}: current shared Guided assets remain linked`, () => {
    assert.match(load(key).html, /src="\.\.\/visualizer-ui\/guided\.js"/);
  });
  const presets = load(key).json('examples');
  for (const [preset, input] of Object.entries(presets)) test(`${key}: preset ${preset} (${input}), all frames and Back/Forward/Reset`, () => {
    const h = load(key); h.click('btn-ex-' + preset);
    const old = originals ? load(key, originals) : null; old?.click('btn-ex-' + preset);
    compareRun(h, input, old);
  });
  for (const input of boundaries) test(`${key}: custom ${input}, all bit columns, trace, Back/Forward/Reset`, () => {
    const h = load(key); validLoad(h, String(input));
    const old = originals ? load(key, originals) : null;
    if (old) validLoad(old, String(input));
    compareRun(h, input, old);
  });
  for (const [preset, input] of Object.entries(presets)) test(`${key}: custom reload of preset ${preset} preserves algorithm snapshots`, () => {
    const h = load(key); h.click('btn-ex-' + preset);
    const expected = algorithmSteps(h); validLoad(h, String(input));
    assert.deepEqual(algorithmSteps(h), expected);
    verifyFrame(h, input);
  });
  test(`${key}: invalid edits in every phase are atomic; old run, Back and Reset remain usable`, () => {
    const h = load(key); h.click('btn-ex-1'); h.exec(`togglePin('${key === 'count' ? 'count' : 'lowbit'}')`);
    const phases = new Set();
    let cap = 200;
    do {
      assert.ok(cap--);
      if (!phases.has(h.phase())) {
        phases.add(h.phase());
        for (const raw of invalid) reject(h, raw);
        const dom = h.dom(), state = h.state();
        if (!h.el('btn-prev').disabled) { h.click('btn-prev'); h.click('btn-next'); }
        assert.equal(h.state(), state); assert.equal(h.dom(), dom);
      }
      if (h.el('btn-next').disabled) break;
      h.click('btn-next');
    } while (true);
    assert.equal(h.current()[key === 'count' ? 'count' : 'res'], key === 'count' ? popcount(presets[1]) : reverse32(presets[1]));
    const expectedPhases = key === 'count' ? ['INIT', 'CHECK', 'CLEAR', 'DONE'] : ['INIT', 'LOOP_CHECK', 'READ_LOW', 'PUSH_RES', 'SHIFT_N', 'LOOP_END', 'RETURN'];
    assert.deepEqual([...phases], expectedPhases);
    h.click('btn-reset'); assert.equal(h.phase(), 'INIT'); assert.equal(h.exec('activeExample'), 1);
    verifyFrame(h, presets[1]);
    reject(h, '4294967296'); validLoad(h, '0');
    assert.equal(h.current().n, 0); assert.equal(h.phase(), 'INIT');
    h.click('btn-ex-2'); assert.equal(h.exec('activeExample'), 2); verifyFrame(h, presets[2]);
  });
  test(`${key}: repeated valid Load resets a finished custom run and preserves HUD preferences`, () => {
    const h = load(key); validLoad(h, '65539'); h.exec("togglePin('n')");
    const initial = h.state(), dom = h.dom();
    for (let i = 0; i < 200 && !h.el('btn-next').disabled; i++) h.click('btn-next');
    validLoad(h, '65539'); assert.equal(h.state(), initial); assert.equal(h.dom(), dom);
    validLoad(h, '65539'); assert.equal(h.state(), initial); assert.equal(h.dom(), dom);
  });
}
test('count: explicit unsigned range help is associated with the custom field', () => {
  const h = load('count');
  assert.match(h.html, /<input[^>]+id="custom-input"[^>]+aria-describedby="input-help"/);
  assert.match(h.html, /id="input-help"[^>]*>Unsigned 32-bit integer: 0 to 4294967295\./);
});
test('count: 2^32 cannot silently replace an in-progress run with zero', () => {
  const h = load('count'); validLoad(h, '65539');
  while (h.phase() !== 'CLEAR') h.click('btn-next');
  assert.equal(h.phase(), 'CLEAR'); assert.equal(h.current().n, 65538);
  reject(h, '4294967296');
  assert.equal(h.current().n, 65538);
  assert.equal(h.exec('n0'), 65539);
});
test('count: all 32 one-bit positions use 32-bit width and the matching left-based index', () => {
  const h = load('count');
  assert.equal(h.exec('lowestSetDisplayIndex(0)'), -1);
  for (let pos = 0; pos < 32; pos++) {
    const n = 2 ** pos;
    assert.equal(h.exec(`toBits(${n}).join('')`), bits32(n));
    assert.equal(h.exec(`lowestSetDisplayIndex(${n})`), 31 - pos);
    validLoad(h, String(n)); while (h.phase() !== 'CHECK') h.click('btn-next'); verifyFrame(h, n);
    h.click('btn-next'); verifyFrame(h, n); assert.equal(h.current().n, 0);
    h.click('btn-prev'); verifyFrame(h, n); assert.equal(h.current().n, n);
  }
});
for (const [input, consumed, next] of [[1, 1, 0], [2, 0, 1]]) test(`reverse: first SHIFT_N for ${input} describes old bit ${consumed} while leaving next bit ${next} unstruck`, () => {
  const h = load('reverse'); validLoad(h, String(input));
  while (h.phase() !== 'SHIFT_N') h.click('btn-next');
  assert.equal(h.phase(), 'SHIFT_N'); assert.equal(h.current().lowbit, consumed);
  verifyFrame(h, input);
  const last = reverseRegisters(h)[0].cells[31];
  assert.equal(last.textContent, String(next)); assert.ok(!hasClass(last, 'dropped'));
  h.click('btn-prev'); verifyFrame(h, input);
  h.click('btn-next'); verifyFrame(h, input);
  h.click('btn-next'); h.click('btn-next'); assert.equal(h.phase(), 'READ_LOW');
  assert.equal(h.current().lowbit, next); verifyFrame(h, input);
});
test('count: previously supported in-range numeric forms stay accepted', () => {
  for (const [raw, input] of [[' 65536 ',65536],['0000',0],['0x10000',65536],['1e3',1000],['11.0',11]]) {
    const h = load('count'); validLoad(h, raw); assert.equal(h.current().n, input); verifyFrame(h, input);
  }
});
console.log(`\n${groups} passed groups; ${failures} failed groups; ${frames} modeled rendered-frame visits; ${comparisons} pristine algorithm-snapshot comparisons; ${rejections} atomic rejection checks; ${oracleRuns} complete answer-oracle runs.`);
if (!originals) console.log('Pristine comparison skipped: pass --originals to verify pinned source and original algorithm snapshots.');
console.log('Not browser QA: layout, CSS animation, pointer behavior, screen readers, fullscreen and Windows Obsidian embedding remain unverified.');
process.exitCode = failures ? 1 : 0;
