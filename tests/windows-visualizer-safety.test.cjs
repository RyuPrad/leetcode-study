// Run: node tests/windows-visualizer-safety.test.cjs [--originals /path/to/pinned/source]
// Dependency-free regression harness: runs the actual inline scripts with a small DOM stub.
// This verifies algorithms, loaders, state preservation, and render-call termination, not browser layout.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const crypto = require('node:crypto');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const baseline = require('./fixtures/windows-safety-controls-baselines.json').files;
const originalArg = process.argv.indexOf('--originals');
if (originalArg >= 0 && !process.argv[originalArg + 1]) throw new Error('--originals requires a source directory');
const originals = originalArg >= 0 ? path.resolve(process.argv[originalArg + 1]) : null;

const paths = {
  tree: 'Graphs/minimum_height_trees_visualizer.html',
  combination: 'Backtracking/combination_sum_visualizer.html',
  merge: 'Intervals/merge_intervals_visualizer.html',
  insert: 'Intervals/insert_interval_visualizer.html',
  network: 'Advanced Graphs/network_delay_time_visualizer.html',
};
class Element {
  constructor(tag = 'div') { this.tagName = tag; this.style = {}; this.children = []; this.attributes = {}; this.className = ''; this.value = ''; this.disabled = false; this.textContent = ''; this.html = ''; this.listeners = {}; this.classList = { add: (...a) => a.forEach(x => { if (!this.className.split(' ').includes(x)) this.className += ' ' + x; }), remove: (...a) => { this.className = this.className.split(' ').filter(x => !a.includes(x)).join(' '); }, contains: x => this.className.split(' ').includes(x) }; }
  set innerHTML(s) { this.html = s; this.children = []; }
  get innerHTML() { return this.html; }
  appendChild(e) { this.children.push(e); return e; }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] || null; }
  addEventListener(k, fn) { this.listeners[k] = fn; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 640, height: 340 }; }
  querySelectorAll() { return []; }
}
function load(key, dir = root) {
  const html = fs.readFileSync(path.join(dir, paths[key]), 'utf8');
  const elements = new Map();
  for (const match of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)) {
    const e = new Element(); e.id = match[1]; e.className = match[0].match(/\bclass="([^"]*)"/)?.[1] || ''; elements.set(e.id, e);
  }
  const document = {
    body: new Element('body'), documentElement: new Element('html'), fullscreenElement: null,
    getElementById: id => elements.get(id) || null,
    createElement: t => new Element(t), createElementNS: (_, t) => new Element(t),
    addEventListener() {},
    querySelectorAll: s => [...elements.values()].filter(e => s.startsWith('.') && e.className.split(' ').includes(s.slice(1))),
  };
  const alerts = [];
  const sandbox = { StudyObjectState: { frame: (number, snapshot, spec) => ({number, snapshot, spec}) }, document, alert: m => alerts.push(m), console, window: { innerWidth: 1280, innerHeight: 900, addEventListener() {} } };
  const context = vm.createContext(sandbox);
  const exec = source => vm.runInContext(source, context, { timeout: 2000 });
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  for (const s of scripts) exec(s[1]);
  return { exec, document, alerts, context, elements };
}
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
function json(h, expr) { return JSON.parse(h.exec('JSON.stringify(' + expr + ')')); }
function dom(h) { return JSON.stringify([...h.elements].filter(([id]) => id !== 'custom-input').map(([id,e]) => [id,e.html,e.textContent,e.disabled,e.className,e.children])); }
const state = {
  tree: '({ n, edges, steps, stepIndex, activeExample, positions })',
  combination: '({ candidates, target, steps, stepIndex, activeExample })',
  merge: '({ intervalsInput, steps, stepIndex, activeExample })',
  insert: '({ intervalsInput, newIntervalInput, steps, stepIndex, activeExample })',
  network: '({ input, steps, stepIndex, activeExample, nodePositions, masterTrace })',
};
function valid(h, raw) {
  h.document.getElementById('custom-input').value = raw;
  const oldCount = h.alerts.length;
  h.exec('loadCustom()');
  assert.equal(h.alerts.length, oldCount, 'unexpected alert: ' + h.alerts.at(-1));
  assert.equal(h.exec('activeExample'), 0);
  h.exec('while (stepIndex < steps.length - 1) nextStep()');
  assert.equal(h.document.getElementById('btn-next').disabled, true);
  return json(h, 'steps[steps.length - 1]');
}
function invalid(key, cases) {
  const h = load(key);
  h.exec('nextStep(); nextStep()');
  for (const raw of cases) test(key + ' rejects ' + JSON.stringify(raw).slice(0, 95), () => {
    const before = h.exec('JSON.stringify(' + state[key] + ')'); const beforeDom = dom(h); const count = h.alerts.length;
    h.document.getElementById('custom-input').value = raw;
    h.exec('loadCustom()');
    assert.equal(h.alerts.length, count + 1, 'expected one visible validation alert');
    assert.equal(h.exec('JSON.stringify(' + state[key] + ')'), before, 'invalid load changed state');
    assert.equal(dom(h), beforeDom, 'invalid load changed rendered UI');
  });
}
for (const key of Object.keys(paths)) {
  const h = load(key), old = originals ? load(key, originals) : null;
  const html = fs.readFileSync(path.join(root, paths[key]), 'utf8');
  test(`${key}: shared assets and lesson bridge remain unchanged`, () => {
    assert.equal(hash(html.match(/    \/\/ STUDY LESSON BRIDGE START[\s\S]*?    \/\/ STUDY LESSON BRIDGE END/)[0]), baseline[paths[key]].bridgeSha256);
    assert.deepEqual([...html.matchAll(/(?:src|href)="(\.\.\/visualizer-ui\/[^"]+)"/g)].map(m=>m[1]), baseline[paths[key]].sharedAssets);
  });
  const count = h.exec('Object.keys(examples).length');
  for (let i = 1; i <= count; i++) test(`${key} preset ${i}: unchanged snapshots, render every step, back/forward, reset`, () => {
    h.exec(`loadExample(${i})`);
    assert.equal(hash(h.exec('JSON.stringify(steps)')), baseline[paths[key]].presets[i]);
    if (old) { old.exec(`loadExample(${i})`); assert.deepEqual(json(h, 'steps'), json(old, 'steps')); }
    h.exec('while (stepIndex < steps.length - 1) nextStep()');
    assert.equal(h.document.getElementById('btn-next').disabled, true);
    const final = h.exec('JSON.stringify(steps[stepIndex])');
    h.exec('prevStep(); nextStep()'); assert.equal(h.exec('JSON.stringify(steps[stepIndex])'), final);
    h.exec('init()'); assert.equal(h.exec('stepIndex'), 0);
    assert.equal(h.alerts.length, 0);
    assert.equal(h.exec('window.studyLessonSource.count()'), h.exec('steps.length'));
    h.exec('window.studyLessonSource.jump(1e9)');
    assert.equal(h.exec('window.studyLessonSource.index()'), h.exec('steps.length - 1'));
    assert.deepEqual(json(h, 'window.studyLessonSource.objectFrame().snapshot'), json(h, 'window.studyLessonSource.read()'));
    h.exec('window.studyLessonSource.jump(-1)');
    assert.equal(h.exec('stepIndex'), 0);
  });
}
invalid('tree', ['4 | 0,1; 1,2; 2,0', '4 | 0,1; 1,0; 2,3', '1 | 0,0', '3 | 0,0; 1,2', '3 | 0,1', '2 | 0,2', '2 | 0,0.5', '2 | 0,', '2 | ,1', '101 |', 'Infinity |', '1.5 |', '1 ||', '1 | ;', '|']);
test('tree accepts single node and ordinary custom tree', () => { const h=load('tree'); assert.deepEqual(valid(h,'1 |').ans,[0]); assert.deepEqual(valid(h,'4 | 0,1; 1,2; 2,3').ans,[1,2]); });
invalid('combination', ['1e-300 | 7', 'Infinity | 7', '0 | 7', '-1 | 7', '2.5 | 7', '2,2 | 7', '2 | -1', '2 | 1.5', '2 | Infinity', '2 |', '2,,3 | 7', '9007199254740992 | 7', '2 | 23', '1,2,3,4,5,6,7 | 7', '1,2,3,4,5,6 | 22']);
test('combination accepts zero target, empty candidates and unsorted candidates', () => { const h=load('combination'); assert.deepEqual(valid(h,' | 0').res,[[]]); assert.deepEqual(valid(h,' | 7').res,[]); assert.deepEqual(valid(h,'3,2 | 7').res,[[3,2,2]]); assert.deepEqual(valid(h,'9007199254740991 | 1').res,[]); });
const badIvs = ['1e20,1e20','Infinity,Infinity','-Infinity,2','NaN,2','3,1','1,','1,,2','1,2;','1,2;;3,4','-1000000001,0',Array.from({length:101},(_,i)=>`${i},${i}`).join(';')];
invalid('merge', [...badIvs,'','[]']);
invalid('insert', [...badIvs.map(s=>s+' | 0,1'),' | 1e20,1e20',' | Infinity,2',' | 3,1',' | 1,2 | 3,4','4,5; 1,2 | 6,7','1,3; 2,4 | 5,6','1,2; 2,3 | 5,6']);
test('merge accepts decimal, negative, point and boundary endpoints', () => { const h=load('merge'); assert.deepEqual(valid(h,'-2.5,0; 0,2; 5,5').res,[[-2.5,2],[5,5]]); assert.deepEqual(valid(h,'-1e9,1e9').res,[[-1e9,1e9]]); });
test('insert preserves both explicit empty formats and valid sorted intervals', () => { const h=load('insert'); assert.deepEqual(valid(h,' | 5,7').res,[[5,7]]); assert.deepEqual(valid(h,'[] | 5,7').res,[[5,7]]); assert.deepEqual(valid(h,'-3,-2; 2,3 | -2.5,2.5').res,[[-3,3]]); });
for (const key of ['merge','insert']) test(key+' axis always terminates with <=16 ticks, including 1e20 reproduction', () => { const h=load(key); for(const scale of ['{lo:1e20,hi:1e20}', '{lo:1e20,hi:1e20+16384}', '{lo:-1e9,hi:1e9}', '{lo:0,hi:16}', '{lo:Infinity,hi:Infinity}', '{lo:NaN,hi:2}']) { const ticks=json(h,`makeAxis(${scale}).children.map(e => ({text:e.textContent,left:e.style.left}))`); assert.ok(ticks.length<=16); assert.ok(ticks.every(t=>Number.isFinite(Number(t.text)) && !/NaN|Infinity/.test(t.left))); } });
invalid('network', ['times=[[1,2,-1],[2,1,-1]]; n=2; k=1','times=[[1,2,1e309]]; n=2; k=1','times=[[1,2,"1"]]; n=2; k=1','times=[[1,2,null]]; n=2; k=1','times=[[1.5,2,1]]; n=2; k=1','times=[[1,"2",1]]; n=2; k=1','times=[[1,3,1]]; n=2; k=1','times=[[1,2,0.5]]; n=2; k=1','times=[[1,2,9007199254740992]]; n=2; k=1','times=[[1,2,9007199254740991],[2,3,1]]; n=3; k=1','times=[]; n=2.5; k=1','times=[]; n=2garbage; k=1','times=[]; n=2; k=1.5','times=[]; n=101; k=1','times=[]; n=2; k=0','times=[]; n=2; k=1; garbage','times=null; n=2; k=1','times=[[]]; n=2; k=1','times='+JSON.stringify(Array.from({length:201},()=>[1,2,1]))+'; n=2; k=1']);
test('network accepts empty edge lists, zero weights and zero-weight cycles', () => { const h=load('network'); assert.equal(valid(h,'times=[]; n=1; k=1').ans,0); assert.equal(valid(h,'times=[]; n=2; k=1').ans,-1); assert.equal(valid(h,'times=[[1,2,0],[2,1,0]]; n=2; k=1').ans,0); assert.equal(valid(h,'times=[[1,2,9007199254740991]]; n=2; k=1').ans,Number.MAX_SAFE_INTEGER); });
test('tree accepts the 100-node cap and returns the path centroids', () => {
  const h=load('tree');
  const edges=Array.from({length:99},(_,i)=>[i,i+1]);
  assert.deepEqual(json(h,`buildSteps(100,${JSON.stringify(edges)}).at(-1).ans`),[49,50]);
});
test('combination accepts the deepest supported target', () => {
  const h=load('combination');
  const final=valid(h,'1 | 22');
  assert.deepEqual(final.res,[Array(22).fill(1)]);
});
test('intervals accept their 100-interval caps and maintain correct results', () => {
  const list=Array.from({length:100},(_,i)=>[2*i,2*i+1]);
  const raw=list.map(x=>x.join(',')).join(';');
  assert.deepEqual(valid(load('merge'),raw).res,list);
  assert.deepEqual(valid(load('insert'),raw+' | 200,201').res,[...list,[200,201]]);
});
test('network accepts its 100-node and 200-edge caps', () => {
  const h=load('network');
  const edges=Array.from({length:99},(_,i)=>[i+1,i+2,1]);
  edges.push(...Array.from({length:101},()=>[1,100,200]));
  assert.equal(json(h,`buildSteps({times:${JSON.stringify(edges)},n:100,k:1}).at(-1).ans`),99);
});
test('tree results agree with exhaustive BFS heights for 50 generated trees', () => {
  const h=load('tree');
  for(let sample=1;sample<=50;sample++) {
    const n=1+sample%14;
    const edges=Array.from({length:n-1},(_,i)=>[i+1,(sample*17+i*7)%(i+1)]);
    const adj=Array.from({length:n},()=>[]);for(const [a,b] of edges){adj[a].push(b);adj[b].push(a);}
    const heights=adj.map((_,r)=>{const q=[r],dist=Array(n).fill(-1);dist[r]=0;for(let j=0;j<q.length;j++)for(const v of adj[q[j]])if(dist[v]<0){dist[v]=dist[q[j]]+1;q.push(v);}return Math.max(...dist);});
    const min=Math.min(...heights),expected=heights.flatMap((v,i)=>v===min?[i]:[]);
    assert.deepEqual(json(h,`buildSteps(${n},${JSON.stringify(edges)}).at(-1).ans`).sort((a,b)=>a-b),expected);
  }
});
console.log(`\n${passed} tests passed. VM/DOM-stub verification only; real browser layout is separate.`);
