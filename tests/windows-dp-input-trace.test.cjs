/* Run: node tests/windows-dp-input-trace.test.cjs [--source <vault>] [--originals <pristine-vault>]
 * Executes actual inline JavaScript and HTML button handlers in Node VM.
 * The DOM stub records raw innerHTML; it does NOT parse HTML/entities. Exact escaped-markup
 * assertions verify each user-text boundary without claiming browser/HTML-parser coverage.
 * Browser painting, native input, accessibility and Windows Obsidian remain unverified.
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
  lcs: '2-D Dynamic Programming/longest_common_subsequence_visualizer.html',
  coin: '1-D Dynamic Programming/coin_change_visualizer.html'
};
const blobs = {lcs:'02af13f7e590b9f0e5149b70e126055f76ce8487',coin:'b0219129bcbe15bbf9e50315e6e4223b6c563e29'};
const expressions = {
  lcs: '({text1,text2,stepIndex,activeExample,pinned,frame:steps[stepIndex]})',
  coin: '({coins,amount,stepIndex,activeExample,pinned,masterTrace,frame:steps[stepIndex]})'
};
// Preserve Infinity sentinels in snapshots, rather than JSON's usual conversion to null.
const plain = value => JSON.parse(JSON.stringify(value, (_, v) => v === Infinity ? 'Infinity' : v));
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
    snapshot: () => JSON.stringify(plain(exec(expressions[key])))
  };
}
const descendants = el => [el, ...el.children.flatMap(descendants)];
const byClass = (el, name) => descendants(el).filter(n => n.classList.contains(name));
// Independent encoder for expected raw markup. Quotes stay literal in text-node positions.
const escapeText = value => String(value).replace(/[&<>]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]));
function lcsOracle(a, b) {
  // Enumerate subsequences of the shorter input, instead of reproducing the DP recurrence.
  if (a.length > b.length) [a, b] = [b, a];
  let best = 0;
  for (let mask = 0; mask < 2 ** a.length; mask++) {
    let next = 0, size = 0, matches = true;
    for (let i = 0; i < a.length; i++) if (mask & (1 << i)) {
      size++; next = b.indexOf(a[i], next);
      if (next < 0) { matches = false; break; }
      next++;
    }
    if (matches) best = Math.max(best, size);
  }
  return best;
}
function coinOracle(coins, amount) {
  const queue = [[0, 0]], seen = new Set([0]);
  for (let i = 0; i < queue.length; i++) {
    const [sum, count] = queue[i];
    if (sum === amount) return count;
    for (const coin of coins) {
      const next = sum + coin;
      if (next <= amount && !seen.has(next)) { seen.add(next); queue.push([next, count + 1]); }
    }
  }
  return -1;
}
let groups = 0, failures = 0, frameChecks = 0, oracleRuns = 0, pristineComparisons = 0, reverseChecks = 0, rejectionChecks = 0;
const coinPhases = new Set(), lcsPhases = new Set();
function test(name, run) { try { run(); groups++; console.log(`PASS ${name}`); } catch (err) { failures++; console.error(`FAIL ${name}: ${err.stack}`); } }
function checkLcs(h, st) {
  const {text1:a,text2:b,frame:f} = st, root = h.el('visual-ui');
  lcsPhases.add(f.answer !== null ? 'return' : f.i === null ? 'init' : f.trace.length === (f.i - 1) * b.length + f.j ? 'write' : 'compare');
  const chips = byClass(root, 'str-chip');
  for (const [index, text, hi] of [[0,a,f.i === null ? -1 : f.i - 1],[1,b,f.j === null ? -1 : f.j - 1]]) {
    const chars = text.length === 0 ? '<span style="color:#666">(empty)</span>' : text.split('').map((ch,i) => i === hi ? `<span class="hi">${escapeText(ch)}</span>` : escapeText(ch)).join('');
    assert.equal(chips[index].innerHTML, `<span class="lbl">text${index + 1}</span> = "<span class="ch">${chars}</span>"`, 'chip markup has only intended highlight spans and literal escaped input');
    assert.equal((chips[index].innerHTML.match(/class="hi"/g) || []).length, hi < 0 ? 0 : 1);
  }
  const consoleHtml = h.el('console-ui').innerHTML;
  assert.ok(consoleHtml.includes(`text1 = "<span class="str">${escapeText(a)}</span>";`));
  assert.ok(consoleHtml.includes(`text2 = "<span class="str">${escapeText(b)}</span>";`));
  if (f.i !== null && f.j !== null) {
    const ca = escapeText(a[f.i - 1]), cb = escapeText(b[f.j - 1]);
    assert.ok(consoleHtml.includes(`text1[${f.i - 1}]='<span class="str">${ca}</span>'  vs  text2[${f.j - 1}]='<span class="str">${cb}</span>'`));
    if (f.narration.startsWith('Compare')) assert.ok(h.el('narration-ui').innerHTML.startsWith(`Compare <b>text1[${f.i - 1}] = '${ca}'</b> with <b>text2[${f.j - 1}] = '${cb}'</b>. `));
  }
  assert.equal(h.el('narration-ui').innerHTML, f.narration);
  const traceHtml = h.el('trace-ui').innerHTML;
  const rows = [...traceHtml.matchAll(/<tr class="([^"]*)">([\s\S]*?)<\/tr>/g)];
  assert.equal(rows.length, f.trace.length);
  for (const [index, row] of f.trace.entries()) {
    const markup = rows[index][2].replace(/\s*\n\s*/g, '');
    assert.equal(rows[index][1], row.match ? 'match-trace' : index === f.trace.length - 1 ? 'active-trace' : '');
    assert.equal(markup, `<td>${row.i}</td><td>${row.j}</td><td><span class="str">'${escapeText(row.a)}'</span></td><td><span class="str">'${escapeText(row.b)}'</span></td><td><span class="kw">${row.match}</span></td><td><span class="nm">${row.value}</span></td><td>${row.from}</td>`);
    assert.equal(row.a, a[row.i - 1]); assert.equal(row.b, b[row.j - 1]);
    assert.equal(row.match, row.a === row.b); assert.equal(row.value, f.dp[row.i][row.j]);
  }
  const table = byClass(root, 'dp-table')[0];
  if (f.dpInitialized === false) { assert.equal(table, undefined); assert.deepEqual(f.dp, []); return; }
  assert.deepEqual(table.children[0].children.slice(2).map(n => n.textContent), b.split(''));
  assert.deepEqual(table.children.slice(2).map(n => n.children[0].textContent), a.split(''));
  const cells = byClass(table, 'dp-cell'), width = b.length + 1;
  for (const [name, coord] of [['src-diag',f.srcDiag],['src-up',f.srcUp],['src-left',f.srcLeft]]) {
    assert.deepEqual(cells.flatMap((n,i) => n.classList.contains(name) ? [[Math.floor(i / width),i % width]] : []), coord === null ? [] : [coord]);
  }
  if (f.answer !== null) {
    assert.equal(byClass(table, 'answer').length, 1);
    assert.equal(byClass(table, 'answer')[0].textContent, String(f.answer));
    assert.equal(f.trace.length, a.length * b.length);
  }
}
function checkCoin(h, st) {
  const {coins,amount,frame:f,masterTrace} = st; coinPhases.add(f.phase);
  const shown = masterTrace.slice(0, f.traceLen), traceHtml = h.el('trace-ui').innerHTML;
  const rows = [...traceHtml.matchAll(/<tr class="([^"]*)">([\s\S]*?)<\/tr>/g)];
  assert.equal(rows.length, shown.length);
  const expectedCount = amount === 0 ? (f.phase === 'return' ? 1 : 0) : ['ready','init','base'].includes(f.phase) ? 0 : ['afterInner','return'].includes(f.phase) ? f.a : f.a - 1;
  assert.equal(f.traceLen, expectedCount, 'trace follows only completed amounts, including the terminal zero base case');
  for (const [i,row] of shown.entries()) {
    assert.equal(row.a, amount === 0 ? 0 : i + 1);
    const value = coinOracle(coins, row.a);
    assert.equal(row.dpa, value < 0 ? '&infin;' : value);
    assert.equal(rows[i][2].replace(/\s*\n\s*/g,''), `<td><span class="nm">${row.a}</span></td><td>${row.coin}</td><td>${row.read}</td><td><span class="nm">${row.dpa}</span></td>`);
  }
  const root = h.el('visual-ui'), values = byClass(root, 'cell').map(el => el.textContent);
  assert.deepEqual(values, f.dp.map(v => v === 'Infinity' ? '∞' : String(v)));
  assert.deepEqual(byClass(root, 'coin-pill').map(el => el.textContent), coins.map(String));
  assert.equal(byClass(root, 'result-value')[0].textContent, String(f.ans));
  assert.equal(f.ans === 'pending', f.phase !== 'return');
  if (f.phase === 'return') assert.equal(f.traceLen, masterTrace.length, 'no terminal trace row is hidden');
}
function checkFrame(h) {
  const snapshot = h.snapshot(); h.exec(h.key === 'lcs' ? 'render(steps[stepIndex])' : 'render()');
  assert.equal(h.snapshot(), snapshot, 'render cannot mutate algorithm state');
  const st = h.state(); frameChecks++;
  (h.key === 'lcs' ? checkLcs : checkCoin)(h, st);
  const expectedLines = h.key === 'lcs' ? st.frame.highlight : st.frame.lines;
  assert.deepEqual(h.json('Array.from(document.querySelectorAll(".code-line")).filter(el => el.classList.contains("active")).map(el => Number(el.id.slice(5)))'), [...new Set(expectedLines)].sort((a,b) => a-b));
  assert.equal(h.el('btn-prev').disabled, st.stepIndex === 0);
}
function loadCustom(h, input) {
  const raw = Array.isArray(input) ? input.join(' | ') : typeof input === 'string' ? input : input.coins.join(', ') + ' | ' + input.amount;
  const n = h.alerts.length; h.el('custom-input').value = raw; h.clickCaption('Load');
  assert.equal(h.alerts.length, n, `accepted ${JSON.stringify(raw)}`);
}
function algorithmState(h) {
  const state = h.state();
  // Narrative encoding is the intended LCS display-only difference.
  if (h.key === 'lcs') delete state.frame.narration;
  // Zero-amount terminal trace visibility is the intended Coin Change difference.
  if (h.key === 'coin' && state.amount === 0) { delete state.masterTrace; if (state.frame.phase === 'return') delete state.frame.traceLen; }
  return state;
}
function checkAnswer(h) {
  const st = h.state(); oracleRuns++;
  if (h.key === 'lcs') assert.equal(st.frame.answer, lcsOracle(st.text1, st.text2));
  else assert.equal(st.frame.ans, coinOracle(st.coins, st.amount));
}
function exercise(h, reverse = true, pristine = null) {
  const initial = h.snapshot(), initialDom = h.dom(), frames = [], doms = [];
  for (let n = 0; n < 2000; n++) {
    checkFrame(h); frames.push(h.snapshot()); doms.push(h.dom());
    if (pristine) {
      assert.deepEqual(algorithmState(h), algorithmState(pristine), 'pristine algorithm states remain equal'); pristineComparisons++;
      const st = h.state();
      if ((h.key === 'lcs' && !/[&<>]/.test(st.text1 + st.text2)) || (h.key === 'coin' && !(st.amount === 0 && st.frame.phase === 'return'))) assert.equal(h.dom(), pristine.dom(), 'unaffected rendered states match pristine');
    }
    if (h.el('btn-next').disabled) break;
    h.click('btn-next'); if (pristine) pristine.click('btn-next');
    assert.ok(n < 1999, 'terminates');
  }
  checkAnswer(h);
  const terminal = h.snapshot(), terminalDom = h.dom(); h.exec('nextStep()'); assert.equal(h.snapshot(), terminal); assert.equal(h.dom(), terminalDom);
  if (reverse) {
    for (let i = frames.length - 2; i >= 0; i--) {
      h.click('btn-prev'); checkFrame(h); reverseChecks++;
      assert.equal(h.snapshot(), frames[i]); assert.equal(h.dom(), doms[i], 'back restores exact encoded markup and highlights');
      h.click('btn-next'); checkFrame(h); reverseChecks++;
      assert.equal(h.snapshot(), frames[i + 1]); assert.equal(h.dom(), doms[i + 1]); h.click('btn-prev');
    }
    assert.equal(h.snapshot(), initial); h.exec('prevStep()'); assert.equal(h.snapshot(), initial);
    for (let i = 1; i < frames.length; i++) h.click('btn-next');
    assert.equal(h.snapshot(), terminal); assert.equal(h.dom(), terminalDom);
  }
  h.click('btn-reset'); assert.equal(h.snapshot(), initial); assert.equal(h.dom(), initialDom);
}
const custom = {
  lcs: [['&amp;','&amp;'],['<img src=x>','<img src=x>'],['</span>','</span>'],['&#x41;','A&#x41;'],['&#65;','&#65;'],['&lt;','<'],['a<b>&"\'','b<&>"\''],['<>','><'],['',''],['','abc'],['abc',''],['a','a'],['aaaaaaaaaaaaaa','aaaaaaaaaaaaaa'],['abc','def'],['<script>','<script>'],['x & y',' & ']],
  coin: [{coins:[1],amount:0},{coins:[2],amount:3},{coins:[2,4],amount:7},{coins:[1,3,4],amount:6},{coins:[5,1,2,2],amount:11},{coins:[100],amount:3},{coins:[60],amount:60},{coins:[1,7,13],amount:60},{coins:[Number.MAX_SAFE_INTEGER,1],amount:2},{coins:[2,2],amount:4}]
};
for (const key of Object.keys(files)) {
  const probe = load(key);
  for (const id of probe.json('Object.keys(examples)')) test(`${key}: preset ${id}, forward/back/reset`, () => {
    const h = load(key), p = originals ? load(key,originals) : null;
    h.click('btn-ex-' + id); if (p) p.click('btn-ex-' + id); exercise(h,true,p);
  });
  custom[key].forEach((input,i) => test(`${key}: custom ${i + 1}, literal input and forward/back/reset`, () => {
    const h = load(key), p = originals ? load(key,originals) : null;
    loadCustom(h,input); if (p) loadCustom(p,input); exercise(h,true,p);
  }));
  test(`${key}: reset mid-run, pin persistence and example switch`, () => {
    const h = load(key); h.click('btn-ex-1'); h.exec(`togglePin('${key === 'lcs' ? 'i' : 'a'}')`);
    const initial = h.snapshot(), dom = h.dom(); h.click('btn-next'); h.click('btn-next'); h.click('btn-reset');
    assert.equal(h.snapshot(),initial); assert.equal(h.dom(),dom); h.click('btn-next'); h.click('btn-ex-2');
    const fresh = load(key); fresh.exec(`togglePin('${key === 'lcs' ? 'i' : 'a'}')`); fresh.click('btn-ex-2');
    assert.equal(h.snapshot(),fresh.snapshot()); assert.equal(h.dom(),fresh.dom()); exercise(h);
  });
  test(`${key}: current Windows markup, assets and handlers preserved`, () => {
    assert.match(probe.html, /src="\.\.\/visualizer-ui\/guided\.js"/);
    for (const id of ['btn-prev','btn-next','btn-reset']) assert.ok(probe.el(id).handler);
    if (originals) {
      const raw = fs.readFileSync(path.join(originals,files[key]));
      assert.equal(crypto.createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex'),blobs[key]);
      const withoutScripts = html => html.replace(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi,'');
      assert.equal(withoutScripts(probe.html),withoutScripts(raw.toString()));
    }
  });
}
const invalid = {
  coin: ['', '1', '1 |', '1 |   ', '1 | 2 | 3', '1 | 2 |', '1 || 2', '| 2', ', | 2', ',1 | 2', '1, | 2', '1,,2 | 2', '1, ,2 | 2', '0 | 1', '-1 | 1', '1.5 | 2', 'NaN | 1', 'Infinity | 1', '-Infinity | 1', '1e309 | 1', '9007199254740992 | 1', '9007199254740993 | 1', 'x | 1', '1 | x', '1 | Infinity', '1 | NaN', '1 | -1', '1 | 1.2', '1 | 61', '1 | 9007199254740992', '1 | 1e309', '1 | <b>', '1.0000000000000001 | 1', '1 | 0.0000000000000000000001', '1 | 1e-999', '0x10 | 16', '1 | 0x10', '1e1 | 10', '1 | 1e1'],
  lcs: ['abc', 'abc|def|ghi', '||', 'abcdefghijklmno|a', 'a|abcdefghijklmno']
};
for (const [key,inputs] of Object.entries(invalid)) for (const position of ['initial','middle','terminal']) test(`${key}: atomic rejection at ${position}, continued playback and corrected input`, () => {
  const h = load(key), control = load(key);
  h.click('btn-ex-2'); control.click('btn-ex-2');
  const advance = position === 'initial' ? 0 : position === 'middle' ? 4 : 2000;
  for (let i = 0; i < advance && !h.el('btn-next').disabled; i++) { h.click('btn-next'); control.click('btn-next'); }
  h.exec(`togglePin('${key === 'lcs' ? 'i' : 'a'}')`); control.exec(`togglePin('${key === 'lcs' ? 'i' : 'a'}')`);
  for (const raw of inputs) {
    h.el('custom-input').value = raw;
    const before = h.snapshot(), allSteps = h.json('steps'), dom = h.dom(), alerts = h.alerts.length;
    h.clickCaption('Load'); rejectionChecks++;
    assert.equal(h.alerts.length,alerts + 1, `reject ${JSON.stringify(raw)}`);
    assert.equal(h.snapshot(),before,'all committed state preserved'); assert.deepEqual(h.json('steps'),allSteps,'history untouched');
    assert.equal(h.dom(),dom,'display, input and controls untouched');
  }
  control.el('custom-input').value = h.el('custom-input').value;
  h.click('btn-prev'); control.click('btn-prev'); h.click('btn-next'); control.click('btn-next');
  assert.equal(h.snapshot(),control.snapshot()); assert.equal(h.dom(),control.dom());
  const corrected = key === 'lcs' ? ['&amp;','&amp;'] : {coins:[1,3,4],amount:6};
  loadCustom(h,corrected); loadCustom(control,corrected);
  assert.equal(h.snapshot(),control.snapshot()); assert.equal(h.dom(),control.dom()); exercise(h);
});
test('coin: zero terminal row appears once and disappears on Back/Reset', () => {
  const h = load('coin'); h.click('btn-ex-3');
  assert.equal(h.state().frame.traceLen,0); h.click('btn-next'); assert.equal(h.state().frame.traceLen,0);
  while (!h.el('btn-next').disabled) h.click('btn-next'); assert.equal(h.state().frame.traceLen,1); checkFrame(h);
  h.click('btn-prev'); assert.equal(h.state().frame.traceLen,0); checkFrame(h);
  h.click('btn-next'); assert.equal(h.state().frame.traceLen,1); checkFrame(h);
  h.click('btn-reset'); assert.equal(h.state().frame.traceLen,0); checkFrame(h);
});
test('lcs: literal entity regression is five characters throughout', () => {
  const h = load('lcs'); loadCustom(h,['&amp;','&amp;']); checkFrame(h);
  assert.equal(h.state().text1.length,5);
  assert.match(byClass(h.el('visual-ui'),'str-chip')[0].innerHTML,/&amp;amp;/);
  while (!h.el('btn-next').disabled) h.click('btn-next');
  checkFrame(h); assert.equal(h.state().frame.answer,5);
});
function strings(alphabet,max) {
  const out = ['']; let layer = [''];
  for (let i=1;i<=max;i++) { layer = layer.flatMap(s => alphabet.map(ch => s+ch)); out.push(...layer); }
  return out;
}
test('lcs: exhaustive binary strings through length three, all frames and subsequence oracle', () => {
  const h=load('lcs'); for (const a of strings(['a','b'],3)) for (const b of strings(['a','b'],3)) { loadCustom(h,[a,b]); exercise(h,false); }
});
test('coin: all nonempty denomination subsets of 1..5, amounts 0..12, BFS oracle', () => {
  const h=load('coin');
  for (let mask=1;mask<32;mask++) for (let amount=0;amount<=12;amount++) {
    const coins = [1,2,3,4,5].filter((_,i) => mask & (1 << i)); loadCustom(h,{coins,amount}); exercise(h,false);
  }
});
test('all algorithm display phases covered', () => {
  assert.deepEqual([...coinPhases].sort(),['ready','init','base','outer','inner-loop','inner','skip','return'].sort());
  assert.deepEqual([...lcsPhases].sort(),['init','compare','write','return'].sort());
});
console.log(JSON.stringify({groups,failures,oracleRuns,frameChecks,reverseChecks,pristineComparisons,rejectionChecks,scope:'Actual inline JS in a Node VM; raw escaped-markup assertions, no HTML parser/browser or Windows Obsidian verification'}));
if (failures) process.exitCode = 1;
