/* Run: node tests/windows-sliding-window-states.test.cjs [--source <vault>] [--originals <pristine-vault>]
 * Executes the real inline scripts and button handlers in a dependency-free Node VM/DOM model.
 * Browser painting, pointer input, accessibility, and Windows Obsidian embedding are not verified.
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
const files = {
  longest: 'Sliding Window/longest_substring_without_repeating_characters_visualizer.html',
  permutation: 'Sliding Window/permutation_in_string_visualizer.html',
  maximum: 'Sliding Window/sliding_window_maximum_visualizer.html'
};
const blobs = {longest: '0a6108bb1579f261c6578f2e6b090ace3c3b6664', permutation: '5073b33dd7ae6c552112aa374b5b20fc36dd0ba5', maximum: '7ac52562dcd1f393a5ab05209f74b7b3b203861d'};
const expressions = {
  longest: '({s,seen,left,right,ans,execState,trace,justAdded,justLeft,lastHadRepeat,improved,historyStack,activeExample,pinned})',
  permutation: '({s1,s2,need,windowMap,left,right,ans,execState,trace,leavingIndex,lastMatch,historyStack,activeExample,pinned})',
  maximum: '({nums,k,stepIndex,activeExample,pinned,frame:steps[stepIndex]})'
};
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
  getBoundingClientRect() { return {left: 0, top: 0, width: 640, height: 360}; }
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
    getElementById: id => elements.get(id) || null, addEventListener() {}, createElement: tag => new Element(tag),
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
    snapshot: () => JSON.stringify(exec(expressions[key]))
  };
}
const descendants = el => [el, ...el.children.flatMap(descendants)];
const byClass = (el, name) => descendants(el).filter(n => n.classList.contains(name));
const strip = s => s.replace(/<[^>]+>/g, '').replace(/&mdash;/g, '—');
const display = s => s === ' ' ? '␣' : s;
const esc = ch => ch === ' ' ? "' '" : ch;
function frequency(s) { const map = {}; for (const c of s) map[c] = (map[c] || 0) + 1; return map; }
function equalMaps(a, b) { return JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort()); }
function longestOracle(s) {
  let best = 0;
  for (let i = 0; i < s.length; i++) for (let j = i + 1; j <= s.length; j++) if (new Set(s.slice(i, j)).size === j - i) best = Math.max(best, j - i);
  return best;
}
function permutationOracle(s1, s2) {
  const sorted = [...s1].sort().join('');
  for (let i = 0; i + s1.length <= s2.length; i++) if ([...s2.slice(i, i + s1.length)].sort().join('') === sorted) return true;
  return false;
}
function maximumOracle(nums, k) { return nums.slice(k - 1).map((_, i) => Math.max(...nums.slice(i, i + k))); }
let groups = 0, failures = 0, frameChecks = 0, oracleRuns = 0, pristineComparisons = 0, reverseChecks = 0;
const phases = Object.fromEntries(Object.keys(files).map(key => [key, new Set()]));
function test(name, run) { try { run(); groups++; console.log(`PASS ${name}`); } catch (err) { failures++; console.error(`FAIL ${name}: ${err.stack}`); } }
function checkLongest(h, st, caption, root) {
  const {s,seen,left,right,execState: phase,ans} = st;
  const repeat = seen.includes(s[right]);
  const expectedSeen = [...new Set(s.slice(phase === 'ADVANCE_LEFT' ? left + 1 : left, ['UPDATE_ANS','ADVANCE','RETURN','END'].includes(phase) ? Math.min(right + 1, s.length) : right))];
  assert.deepEqual(seen, expectedSeen, `set agrees with algorithm phase ${phase}`);
  const boxes = byClass(root, 'set-box'), pills = byClass(boxes[0], 'set-pill');
  assert.deepEqual(pills.map(p => p.textContent), seen.map(display));
  const tiles = byClass(root, 'tile');
  assert.deepEqual(tiles.map(t => t.textContent), s.split('').map(display));
  assert.equal(tiles.filter(t => t.classList.contains('duplicate')).length, phase === 'WHILE_CHECK' && repeat ? 1 : 0);
  assert.equal(boxes[0].classList.contains('hit'), phase === 'WHILE_CHECK' && repeat);
  assert.deepEqual(pills.filter(t => t.classList.contains('hit')).map(p => p.textContent), phase === 'WHILE_CHECK' && repeat ? [display(s[right])] : []);
  if (phase === 'WHILE_CHECK') {
    assert.equal(caption, `seen.has('${esc(s[right])}') is ${repeat}. ${repeat ? 'The new character already sits in the window, so we must shrink from the left.' : 'No repeat - the window can include this character.'}`);
    assert.equal(byClass(root, 'window-band')[0].classList.contains('shrinking'), repeat);
  }
  if (phase === 'SHRINK') {
    assert.ok(repeat); assert.ok(seen.includes(s[left]));
    assert.equal(caption, `Remove the old left character '${esc(s[left])}' from the set.`);
    assert.equal(boxes.length, 2); assert.deepEqual(byClass(boxes[1], 'set-pill').map(p => p.textContent), [display(s[left])]);
    assert.deepEqual(tiles.flatMap((t, i) => t.classList.contains('leaving') ? [i] : []), [left]);
  }
  if (phase === 'ADVANCE_LEFT') {
    assert.equal(caption, `Now move the window edge right with left++ to ${left + 1}.`);
    assert.equal(boxes.length, 2);
    assert.deepEqual(byClass(boxes[1], 'set-pill').map(p => p.textContent), [display(st.justLeft)]);
    assert.ok(!seen.includes(st.justLeft), 'the deleted character is no longer in the set');
  }
  if (phase === 'UPDATE_ANS') {
    const len = right - left + 1;
    assert.equal(caption, `Window "${s.slice(left, right + 1).replace(/ /g, '␣')}" has length ${len}. Next, set ans = Math.max(${ans}, ${len}) = ${Math.max(ans, len)}.`);
  }
  assert.equal(byClass(root, 'result-value')[0].textContent, String(ans));
}
function checkPermutation(h, st, caption, root) {
  const {s1,s2,need,windowMap,left,right,execState: phase} = st, size = Math.max(0, right - left + 1);
  const sub = s2.slice(left, right + 1), equal = size === s1.length && equalMaps(windowMap, need);
  const end = ['ADD_RIGHT','ADD_RIGHT_COUNT'].includes(phase) ? right : right + 1;
  const expectedMap = frequency(s2.slice(['DELETE_ZERO_COUNT','ADVANCE_LEFT'].includes(phase) ? left + 1 : left, Math.max(left, end)));
  if (phase === 'DELETE_ZERO_COUNT' && !expectedMap[s2[st.leavingIndex]]) expectedMap[s2[st.leavingIndex]] = 0;
  assert.deepEqual(windowMap, expectedMap, `map agrees with algorithm phase ${phase}`);
  if (!['INIT','GUARD','INIT_NEED','BUILD_NEED'].includes(phase) && !(s1.length > s2.length)) assert.deepEqual(need, frequency(s1));
  const cards = byClass(root, 'map-card');
  for (const [card, map] of [[cards[0], need], [cards[1], windowMap]]) assert.deepEqual(byClass(card, 'set-pill').map(p => p.textContent), Object.keys(map).filter(k => map[k] > 0).map(k => `${k}: ${map[k]}`));
  const checked = ['MATCH_CHECK','RETURN_TRUE','END_TRUE'].includes(phase);
  assert.ok(cards.every(c => c.classList.contains('equal') === (checked && equal)));
  const cells = byClass(root, 'cell'), matchIndices = cells.flatMap((c, i) => c.classList.contains('match') ? [i] : []);
  assert.deepEqual(matchIndices, checked && equal ? Array.from({length: size}, (_, i) => left + i) : []);
  const leave = phase === 'SHRINK' ? left : ['REMOVE_LEFT_COUNT','DELETE_ZERO_COUNT','ADVANCE_LEFT','MATCH_CHECK'].includes(phase) ? st.leavingIndex : null;
  assert.deepEqual(cells.flatMap((c, i) => c.classList.contains('leaving') ? [i] : []), leave === null ? [] : [leave]);
  if (phase === 'ADD_RIGHT') {
    const count = windowMap[s2[right]] || 0;
    assert.equal(caption, `Read s2[${right}] = '${s2[right]}' as the character to add to the window.`);
  }
  if (phase === 'ADD_RIGHT_COUNT') assert.equal(caption, `Next, add '${s2[right]}' to window: its count will change from ${windowMap[s2[right]] || 0} to ${(windowMap[s2[right]] || 0) + 1}.`);
  if (phase === 'SHRINK') assert.equal(caption, `Read the character leaving the oversized window: s2[${left}] = '${s2[left]}'.`);
  if (phase === 'DELETE_ZERO_COUNT') assert.equal(caption, windowMap[s2[st.leavingIndex]] === 0
    ? 'The leaving character count is 0, so remove its key from window next.'
    : 'The leaving character still has a positive count, so keep its key in window.');
  if (phase === 'MATCH_CHECK') {
    const expected = equal ? `Window is full and window === need! Substring "${sub}" is a permutation of s1.` : size === s1.length ? `Window "${sub}" is full size but its frequencies do not equal need. Keep sliding.` : `Window size ${size} is not yet |s1| = ${s1.length}; not a candidate. Keep sliding.`;
    assert.equal(caption, expected);
    for (const [card, own, other] of [[cards[0],need,windowMap],[cards[1],windowMap,need]]) for (const [i,key] of Object.keys(own).entries()) {
      const pill = byClass(card, 'set-pill')[i];
      assert.equal(pill.classList.contains('ok'), size === s1.length && own[key] === other[key]);
      assert.equal(pill.classList.contains('bad'), size === s1.length && own[key] !== other[key]);
    }
  }
  assert.equal(byClass(root, 'result-value')[0].textContent, String(st.ans));
}
function checkMaximum(h, st, caption, root) {
  const {nums,k,frame: f} = st;
  assert.equal(new Set(f.deque).size, f.deque.length);
  for (let i = 1; i < f.deque.length; i++) { assert.ok(f.deque[i - 1] < f.deque[i]); assert.ok(nums[f.deque[i - 1]] >= nums[f.deque[i]], 'nonincreasing allows equality'); }
  const zone = byClass(root, 'deque-zone')[0], html = zone.innerHTML;
  const rendered = [...html.matchAll(/<div class="(deque-item[^\"]*)"><span class="dq-val">([^<]*)<\/span><span class="dq-idx">i=(\d+)<\/span><\/div>/g)].map(m => ({classes:m[1].split(' '),value:Number(m[2]),index:Number(m[3])}));
  const renderIndices = f.popping !== null && !f.deque.includes(f.popping) ? [...f.deque, f.popping] : f.deque;
  assert.deepEqual(rendered.map(t => t.index), renderIndices, 'one rendered tile per snapshot index, in the original order');
  assert.equal(new Set(rendered.map(t => t.index)).size, rendered.length, 'no duplicate rendered indices');
  assert.deepEqual(rendered.map(t => t.value), renderIndices.map(i => nums[i]));
  assert.deepEqual(rendered.filter(t => t.classes.includes('popping')).map(t => t.index), f.popping === null ? [] : [f.popping]);
  assert.match(html, /values nonincreasing front to back/); assert.doesNotMatch(caption, /strictly decreasing|stays decreasing|still decreasing/);
  if (f.phase === 'POP') {
    assert.ok(!f.deque.includes(f.popping)); assert.ok(nums[f.popping] < nums[f.right]);
    assert.equal(caption, `Remove index ${f.popping} from the back.`);
  }
  if (f.phase === 'RECORD') {
    assert.equal(nums[f.deque[0]], Math.max(...nums.slice(f.right - k + 1, f.right + 1)));
    assert.deepEqual(f.res, maximumOracle(nums.slice(0, f.right + 1), k));
  }
  if (f.phase === 'EVICT') { assert.ok(!f.deque.includes(f.evicting)); assert.ok(f.evicting <= f.right - k); }
}
function checkFrame(h) {
  const before = h.snapshot(); h.exec('render()'); assert.equal(h.snapshot(), before, 'render never changes algorithm state');
  const st = h.state(), phase = h.key === 'maximum' ? st.frame.phase : st.execState;
  const expectedLines = h.key === 'maximum' ? st.frame.line : h.exec('pendingInstruction()') ? [h.exec('pendingInstruction().line')] : [];
  assert.deepEqual(h.json('Array.from(document.querySelectorAll(".code-line")).filter(el => el.classList.contains("active")).map(el => Number(el.id.slice(5)))'), expectedLines);
  if (h.key === 'maximum') assert.equal(st.frame.executedLine, expectedLines.length ? expectedLines[0] : null);
  phases[h.key].add(phase); frameChecks++;
  const caption = strip(h.el('narration-ui').innerHTML), root = h.el('visual-ui');
  assert.doesNotMatch(caption, /undefined|null|NaN/);
  if (h.key === 'longest') checkLongest(h, st, caption, root);
  else if (h.key === 'permutation') checkPermutation(h, st, caption, root);
  else checkMaximum(h, st, caption, root);
}
function loadCustom(h, input) {
  const raw = h.key === 'longest' ? input : h.key === 'permutation' ? input.join(' | ') : input.nums.join(',') + ' | ' + input.k;
  const n = h.alerts.length; h.el('custom-input').value = raw; h.clickCaption('Load'); assert.equal(h.alerts.length, n, `accepted ${raw}`);
}
function checkAnswer(h) {
  const st = h.state(); oracleRuns++;
  if (h.key === 'longest') assert.equal(st.ans, longestOracle(st.s));
  else if (h.key === 'permutation') assert.equal(st.ans, permutationOracle(st.s1, st.s2));
  else assert.deepEqual(st.frame.ans, maximumOracle(st.nums, st.k));
}
function exercise(h, reverse = true, pristine = null) {
  const initial = h.snapshot(), initialDom = h.dom(), frames = [], doms = [];
  if (pristine && h.key === 'maximum') assert.deepEqual(h.json('steps'), pristine.json('steps'), 'entire precomputed algorithm snapshot list is unchanged');
  for (let n = 0; n < 2000; n++) {
    checkFrame(h); frames.push(h.snapshot()); doms.push(h.dom());
    if (pristine) { assert.equal(h.snapshot(), pristine.snapshot(), 'pristine algorithm state equality'); pristineComparisons++; }
    if (h.el('btn-next').disabled) break;
    h.click('btn-next'); if (pristine) pristine.click('btn-next');
    assert.ok(n < 1999, 'terminates');
  }
  checkAnswer(h);
  const terminal = h.snapshot(), terminalDom = h.dom(); h.exec('nextStep()'); assert.equal(h.snapshot(), terminal); assert.equal(h.dom(), terminalDom);
  if (reverse) {
    for (let i = frames.length - 2; i >= 0; i--) {
      h.click('btn-prev'); checkFrame(h); reverseChecks++;
      assert.equal(h.snapshot(), frames[i], 'back restores all state'); assert.equal(h.dom(), doms[i], 'back restores exact rendered DOM');
      h.click('btn-next'); checkFrame(h); reverseChecks++;
      assert.equal(h.snapshot(), frames[i + 1], 'forward replay restores all state'); assert.equal(h.dom(), doms[i + 1]);
      h.click('btn-prev');
    }
    assert.equal(h.snapshot(), initial); assert.equal(h.dom(), initialDom);
    h.exec('prevStep()'); assert.equal(h.snapshot(), initial);
    for (let i = 1; i < frames.length; i++) h.click('btn-next');
    assert.equal(h.snapshot(), terminal); assert.equal(h.dom(), terminalDom);
  }
  h.click('btn-reset'); assert.equal(h.snapshot(), initial); assert.equal(h.dom(), initialDom);
}
function advanceUntil(h, predicate) {
  for (let n = 0; n < 2000; n++) {
    if (predicate(h.state())) return;
    assert.equal(h.el('btn-next').disabled, false, 'target phase must be reachable');
    h.click('btn-next');
  }
  assert.fail('target phase not reached');
}
const regressions = [
  ['longest', 'repeat appears before the previous check flag updates', 'abba', st => st.execState === 'WHILE_CHECK' && st.right === 2 && st.left === 0],
  ['longest', 'repeat disappears immediately after deletion', 'aa', st => st.execState === 'WHILE_CHECK' && st.right === 1 && st.left === 1],
  ['longest', 'pending shrink names the current left character', 'aa', st => st.execState === 'SHRINK'],
  ['longest', 'pending answer update uses the current length and best', 'abc', st => st.execState === 'UPDATE_ANS'],
  ['permutation', 'matching maps and narration agree before execution', ['ab','ba'], st => st.execState === 'MATCH_CHECK' && st.right === 1],
  ['permutation', 'pending shrink uses current left and next left', ['ab','cba'], st => st.execState === 'SHRINK'],
  ['permutation', 'pending add starts an absent count at zero', ['a','a'], st => st.execState === 'ADD_RIGHT'],
  ['maximum', 'POP styles its existing snapshot tile exactly once', {nums:[1,3,2],k:2}, st => st.frame.phase === 'POP'],
  ['maximum', 'equal values remain and are described as nonincreasing', {nums:[2,2,2],k:2}, st => st.frame.phase === 'PUSH' && st.frame.right === 1]
];
for (const [key, name, input, predicate] of regressions) test(`${key}: regression ${name}`, () => {
  const h = load(key); loadCustom(h, input); advanceUntil(h, predicate); checkFrame(h);
});
const custom = {
  longest: ['', 'a', 'aa', 'abba', 'abcad', 'abcaacb', 'tmmzuxt', 'aaaaab', 'dvdf', 'a b a', '  ', 'abababab', 'abcdefghijklmnopqrstuvwxyz'],
  permutation: [['ab','ba'],['aab','caaab'],['abb','bbba'],['aab','ab'],['abc','ccccbbbbaaaa'],['aa','aaaa'],['aaa','aa'],['ab',''],['ab','eidboaoo'],['abc','bca'],['aabb','zzbaba'],['abc','abcabc']],
  maximum: [{nums:[1],k:1},{nums:[2,2,2,2],k:2},{nums:[3,3,1,3],k:3},{nums:[1,2,3,4,5],k:3},{nums:[5,4,3,2,1],k:3},{nums:[5,1,5,1,5],k:2},{nums:[-5,-5,-2,-3,-2],k:3},{nums:[1,1,2,2,1],k:1},{nums:[2,1,2,3],k:4},{nums:[0,0,0],k:3}]
};
for (const key of Object.keys(files)) {
  const probe = load(key);
  for (const id of probe.json('Object.keys(examples)')) test(`${key}: preset ${id}, forward/back/reset`, () => {
    const h = load(key), p = originals ? load(key, originals) : null; h.click('btn-ex-' + id); if (p) p.click('btn-ex-' + id); exercise(h, true, p);
  });
  custom[key].forEach((input, i) => test(`${key}: custom ${i + 1}, forward/back/reset`, () => {
    const h = load(key), p = originals ? load(key, originals) : null; loadCustom(h, input); if (p) loadCustom(p, input); exercise(h, true, p);
  }));
  test(`${key}: reset mid-run and switch examples while a prior run is active`, () => {
    const h = load(key); h.click('btn-ex-1'); const initial = h.snapshot(), initialDom = h.dom();
    for (let i = 0; i < 7 && !h.el('btn-next').disabled; i++) h.click('btn-next');
    h.click('btn-reset'); assert.equal(h.snapshot(), initial); assert.equal(h.dom(), initialDom);
    h.click('btn-next'); h.click('btn-next'); h.click('btn-ex-2');
    const fresh = load(key); fresh.click('btn-ex-2'); assert.equal(h.snapshot(), fresh.snapshot()); assert.equal(h.dom(), fresh.dom());
    exercise(h, true);
  });
  test(`${key}: current Windows resources and original handlers preserved`, () => {
    assert.match(probe.html, /src="\.\.\/visualizer-ui\/guided\.js"/);
    for (const id of ['btn-prev','btn-next','btn-reset']) assert.ok(probe.el(id).handler);
    if (originals) {
      const raw = fs.readFileSync(path.join(originals, files[key]));
      assert.equal(crypto.createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex'), blobs[key], 'pristine blob matches verified upstream main');
      const scriptsRemoved = html => html.replace(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi, '');
      assert.equal(scriptsRemoved(probe.html), scriptsRemoved(raw.toString()), 'CSS/HTML and embed structure unchanged');
    }
  });
}
function strings(alphabet, max) {
  const out = ['']; let layer = [''];
  for (let i = 1; i <= max; i++) { layer = layer.flatMap(s => alphabet.map(c => s + c)); out.push(...layer); }
  return out;
}
test('longest: exhaustive abc strings through length 5, every frame and independent answer', () => {
  const h = load('longest'); for (const s of strings(['a','b','c'], 5)) { loadCustom(h, s); exercise(h, false); }
});
test('permutation: exhaustive nonempty binary s1 through length 3 and s2 through length 5', () => {
  const h = load('permutation'); for (const s1 of strings(['a','b'],3).slice(1)) for (const s2 of strings(['a','b'],5)) { loadCustom(h,[s1,s2]); exercise(h,false); }
});
test('maximum: exhaustive ternary arrays through length 4 with every legal k', () => {
  const h = load('maximum'); for (const word of strings(['0','1','2'],4).slice(1)) for (let k = 1; k <= word.length; k++) { loadCustom(h,{nums:word.split('').map(v=>Number(v)-1),k}); exercise(h,false); }
});
test('all reachable phases covered in all three visualizers', () => {
  assert.deepEqual([...phases.longest].sort(), ['INIT','INIT_LEFT','INIT_ANS','LOOP_CHECK','WHILE_CHECK','SHRINK','ADVANCE_LEFT','ADD_SET','UPDATE_ANS','ADVANCE','RETURN','END'].sort());
  assert.deepEqual([...phases.permutation].sort(), ['INIT','GUARD','INIT_NEED','BUILD_NEED','INIT_WINDOW','INIT_LEFT','LOOP_CHECK','ADD_RIGHT','ADD_RIGHT_COUNT','SIZE_CHECK','SHRINK','REMOVE_LEFT_COUNT','DELETE_ZERO_COUNT','ADVANCE_LEFT','MATCH_CHECK','RETURN_TRUE','RETURN_FALSE','END_TRUE','END_FALSE'].sort());
  assert.deepEqual([...phases.maximum].sort(), ['READY','INIT_RESULT','INIT_DEQUE','ENTER','CHECK_BACK','POP','PUSH','CHECK_FRONT','EVICT','CHECK_FULL','RECORD','WARMUP','END'].sort());
});
console.log(JSON.stringify({groups,failures,oracleRuns,frameChecks,reverseChecks,pristineComparisons,scope:'Node VM/DOM model; browser and Windows Obsidian not verified'}));
if (failures) process.exitCode = 1;
