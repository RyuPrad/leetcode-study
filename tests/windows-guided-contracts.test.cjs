/* Run: node tests/windows-guided-contracts.test.cjs [--source <vault>]
 * Executes the actual four visualizer engines, teaching capture and Guided validators
 * without installing dependencies or automating a browser. The small DOM model does
 * not validate painting, UI interactions or the full Windows/desktop Guided suite.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
function option(name, fallback) { const i = process.argv.indexOf(name); return i < 0 ? fallback : path.resolve(process.argv[i + 1]); }
const source = option('--source', path.resolve(__dirname, '..'));
const files = { 98: 'Trees/validate_binary_search_tree_visualizer.html', 297: 'Trees/serialize_and_deserialize_binary_tree_visualizer.html', 191: 'Bit Manipulation/number_of_1_bits_visualizer.html', 190: 'Bit Manipulation/reverse_bits_visualizer.html' };
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
  context.Element = Element;
  context.crypto = crypto.webcrypto;
  context.structuredClone = structuredClone;
  exec(fs.readFileSync(path.join(source,'visualizer-ui/learning.js'),'utf8').split('  function mount(){')[0] + ' globalThis.guidedCapture = capture; })();');
  exec(fs.readFileSync(path.join(source,'visualizer-ui/guided-core.js'),'utf8'));
  for (const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) exec(script[1]);
  const clickEl = el => { assert.ok(el?.handler, 'real inline handler exists'); if (!el.disabled) exec(el.handler); };
  return {key, html, exec, alerts, el: id => elements.get(id), json: code => plain(exec(code)),
    click: id => clickEl(elements.get(id)), clickCaption: caption => clickEl(buttons.find(el => el.caption === caption)),
    dom: () => JSON.stringify([...elements].filter(([id]) => id !== 'custom-input')),
    state: () => exec('JSON.stringify({treeArr,steps,stepIndex,activeExample,pinned})'),
    seek: i => exec(`stepIndex = ${i}; render();`)
  };
}

const all = ['a','b'].flatMap(shard=>JSON.parse(fs.readFileSync(path.join(source,`visualizer-ui/guided-content-${shard}.json`),'utf8')));
function projection(h,index){
  // Use production phase naming, including executedLine precedence.
  const phaseDefinition=fs.readFileSync(path.join(source,'visualizer-ui/learning.js'),'utf8').split('    const phase=')[1].split('\n')[0];
  return h.json(`(()=>{const phase=${phaseDefinition} const source=window.studyLessonSource,raw=source.readAt(${index}),next=source.readAt(Math.min(${index}+1,source.count()-1)); return StudyGuided.project(guidedCapture(raw,${index},phase(raw),'','',next.executedLine||raw.executedLine||1).frame);})()`);
}

// These checkpoints retain the user's reviewed version-2 teaching content and
// positions from commit 560c7403. Only the four trace contracts move to version 3.
const teachingHashes = {
  "98": "a97c1a5b212c5bb34d1b963ceb1e9f77c73e3c0ee037db83f20bb52f5c383ae1",
  "190": "307874b3c4b7039b6ed14a9363dc792da4e6b95c34ed3f9911714538db8ea410",
  "191": "9e5e309372bad3992b518ac13a878e30813be49775ecb4eb38d9f27eca3f89c1",
  "297": "bbc8444c001a3ae8856f582058cc781e61a7909a3f739b2164a59b7121515cdf"
};
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
function teachingContent(lesson) {
  const { version, expectedInput, checkpoints, ...content } = lesson;
  return { ...content, checkpoints: checkpoints.map(({ before, after, ...cp }) => cp) };
}
const meanings = {
  98: {
    decision: { before: {node:2,ans:'pending'}, after: {node:2,ans:'pending'} },
    change: { before: {node:2,ans:'pending'}, after: {node:3,low:2,ans:'pending'} },
    result: { before: {node:3,low:2,ans:'pending'}, after: {node:null,ans:true} }
  },
  190: {
    decision: {before:{n:43261596,res:0,i:0,lowbit:null},after:{n:43261596,res:0,i:0,lowbit:0}},
    change: {before:{n:10815399,res:0,i:2,lowbit:1},after:{n:10815399,res:1,i:2,lowbit:1}},
    result: {before:{n:0,res:964176192,i:32},after:{n:0,res:964176192,i:32,finished:true}}
  },
  191: {
    decision: {before:{n:11,count:0},after:{n:11,count:0}},
    change: {before:{n:10,nBefore:10,count:1},after:{n:8,nBefore:10,count:2}},
    result: {before:{n:0,count:3},after:{n:0,count:3}}
  },
  297: {
    decision: {before:{data:'1'},after:{data:'1'}},
    change: {before:{data:'1,2'},after:{data:'1,2,null'}},
    result: {before:{i:11,curBuildId:0,rebuiltLevelOrder:null},after:{i:11,curBuildId:null,rebuiltLevelOrder:[1,2,3,null,null,4,5],roundTripVerified:true}}
  }
};
let checkpoints = 0;
for (const number of [98,190,191,297]) {
  const lesson = all.find(l => l.id === `leetcode:${number}`), h = load(number);
  assert.equal(lesson.version,3);
  assert.equal(hash(teachingContent(lesson)),teachingHashes[number],`${number}: reviewed questions, choices, indices and code references stay unchanged`);
  const initial = projection(h,0);
  assert.equal(JSON.stringify(initial.values),JSON.stringify(lesson.expectedInput),`${number}: exact initial-state gate`);
  const sequenceBefore = h.exec('JSON.stringify(steps)');
  for (const cp of lesson.checkpoints) {
    for (const side of ['before','after']) {
      const index = cp[side+'Index'], projected = projection(h,index);
      assert.equal(h.exec(`StudyGuided.matches(${JSON.stringify(projected)},${JSON.stringify(cp[side])})`),true,`${number}/${cp.id}/${side}: real Guided validator`);
      // Independent algorithm facts ensure a snapshot edit cannot bless a wrong
      // answer, changed input, skipped instruction, or incorrect round trip.
      const raw = h.json(`window.studyLessonSource.readAt(${index})`), expected = meanings[number][cp.id][side];
      assert.deepEqual(Object.fromEntries(Object.keys(expected).map(key=>[key,raw[key]])),expected,`${number}/${cp.id}/${side}: algorithm meaning`);
      const wrong = structuredClone(projected);
      wrong.phase += ' incorrect';
      assert.equal(h.exec(`StudyGuided.matches(${JSON.stringify(wrong)},${JSON.stringify(cp[side])})`),false,`${number}: a wrong phase must still be rejected`);
    }
    checkpoints++;
  }
  assert.equal(h.exec('JSON.stringify(steps)'),sequenceBefore,`${number}: historical checks never mutate execution`);
  assert.equal(h.exec('window.studyLessonSource.index()'),0);
  h.exec('init()');
  assert.equal(JSON.stringify(projection(h,0).values),JSON.stringify(lesson.expectedInput),`${number}: restart uses the same fixed example`);
  const last = lesson.checkpoints.at(-1);
  const answers = Object.fromEntries(lesson.checkpoints.map(cp=>[cp.id,{correct:true,choiceId:cp.correctOptionId,attempts:1,hintLevel:0,revealed:false}]));
  const old = {lessonVersion:2,caseId:lesson.caseId,runId:'old-run',cursor:last.afterIndex,answers};
  const restored = h.json(`StudyGuided.restore(${JSON.stringify(lesson)},${JSON.stringify(old)})`);
  assert.equal(restored.lessonVersion,3); assert.equal(restored.cursor,0); assert.deepEqual(restored.answers,{}); assert.notEqual(restored.runId,'old-run');
  old.completedAt='2026-10-01T12:00:00.000Z';
  const completed = h.json(`StudyGuided.restore(${JSON.stringify(lesson)},${JSON.stringify(old)})`);
  assert.deepEqual(completed.previousCompletion,{lessonVersion:2,completedAt:old.completedAt},`${number}: previous completion is retained`);
  const older = {...old,completedAt:undefined,previousCompletion:{lessonVersion:1,completedAt:old.completedAt}};
  assert.deepEqual(h.json(`StudyGuided.restore(${JSON.stringify(lesson)},${JSON.stringify(older)})`).previousCompletion,older.previousCompletion,`${number}: an earlier completion also survives an unfinished attempt`);
  const current = {...old,lessonVersion:3};
  assert.deepEqual(h.json(`StudyGuided.restore(${JSON.stringify(lesson)},${JSON.stringify(current)})`),current,`${number}: current-version progress is preserved`);
  console.log(`PASS ${number}: exact initial state, six checkpoint states, algorithm semantics, pure reads, restart, and version migration`);
}
console.log(`PASS 4 Guided contracts, ${checkpoints} checkpoints; runtime comparison remains strict.`);
