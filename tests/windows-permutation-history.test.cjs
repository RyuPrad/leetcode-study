/* Dependency-free Permutations history regressions. Runs the actual inline
 * builders and the production learning/operations/Objects/Guided projections.
 * The DOM model does not cover browser painting or Windows/Electron embedding.
 * Golden snapshots: main 6c89c9001caebb28c0b50ec07ff089aa4c9b6fcb.
 * Optional --originals compares every frame to a pinned pristine builder using
 * a streaming sink: even the five-number baseline never retains deep history.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const test = require('node:test');
const {fixture: dom, plain, snapshot} = require('./helpers/search-range-dom.cjs');
const option = (name, fallback) => { const i = process.argv.indexOf(name); return i < 0 ? fallback : path.resolve(process.argv[i + 1]); };
const root = option('--source', path.resolve(__dirname, '..'));
const originals = option('--originals', null);
const file = 'Backtracking/permutations_visualizer.html';
const fixture = directory => dom(directory || root, {file});
const cases = [
  [[1,2,3], 'aaf571a0963da41e19c40d6db558374036f9a11215c412c3fb6ac9c7ed9e6306'],
  [[0,1], 'fb44c866ed3e9570cfdafefe42e4f3c8a4faad8c8cee7cbb73a3528d8caa54be'],
  [[1], 'b5fb87bfa0784815de73d3545c67f48ea955a1d1dec717bfbb9fece91193e90e'],
  [[1,2,3,4], '97f3c697a8463630b336eba5a418395a2d57fa86087c2967f08a9a19bb704c71'],
  [[5,6], 'a608a0d376c77854047c48cb140a36fd01439fc932ca63f52e911370fd511f65'],
  [[2,4,6], 'f91153f39791beee20faf3ac6dc941a3c29ac050db031cd8e7805bef91c4c271'],
  [[-2,-1,0,1,2], '1abda004751d2918643839a107ebeecece0119f0aefe0618449df6b3508a5738'],
  [[], '82649234d34ce02ca76a866c1b83654dc8af302c96b9ed2f3d9a14da0c2bebbb'],
];
function hashStream() {
  const hash = crypto.createHash('sha256').update('['); let count = 0;
  return {add(frame) { if (count++) hash.update(','); hash.update(JSON.stringify(frame)); }, finish() { return hash.update(']').digest('hex'); }};
}
function digest(frames) { const hash = hashStream(); for (const frame of frames) hash.add(frame); return hash.finish(); }
function builders(directory = root, stream) {
  const html = fs.readFileSync(path.join(directory, file), 'utf8');
  let builder = html.slice(html.indexOf('    function originalInstructionBuilder('), html.indexOf('    function loadExample('));
  const metadata = html.slice(html.indexOf('    function prepareInstructionSteps('), html.indexOf('    // STUDY LESSON BRIDGE START'));
  if (stream) {
    // Change only where the baseline retains the finished snapshot. Its actual
    // algorithm, per-snapshot deep copies and instruction metadata still run.
    assert.equal(builder.split('localSteps.push(base);').length, 2);
    builder = builder.replace('localSteps.push(base);', 'emitBaseline(base);');
  }
  const stats = {traceCopies: 0, resultCopies: 0};
  const context = vm.createContext({countCopies(kind, count) { stats[kind] += count; }});
  vm.runInContext(`const nativeMap = Array.prototype.map;
    Array.prototype.map = function(callback, ...rest) {
      const text = String(callback).replace(/\\s+/g, '');
      if (text === 't=>({...t})') countCopies('traceCopies', this.length);
      if (text === 'r=>[...r]') countCopies('resultCopies', this.length);
      return nativeMap.call(this, callback, ...rest);
    };\n${builder}\n${metadata}`, context);
  let previous = null, emitted = 0;
  if (stream) context.emitBaseline = frame => {
    // Retain one scalar instruction sentinel instead of previous full frames.
    const prepared = context.prepareInstructionSteps(emitted ? [{executedLine: previous}, frame] : [frame]);
    if (!emitted) stream(prepared[0], emitted++);
    previous = frame.executedLine; stream(frame, emitted++);
  };
  return {stats, build(input) { stats.traceCopies = stats.resultCopies = 0; previous = null; emitted = 0; return context.buildSteps(input); }};
}

for (const [input, hash] of cases) test(`46: exact full timeline for [${input}]`, () => {
  const builder = builders(), frames = builder.build(input);
  assert.equal(digest(frames), hash, 'every field, key order, instruction, index, narration and historical prefix matches the pinned baseline');
  if (originals) {
    let compared = 0;
    const baseline = builders(originals, (frame, index) => { assert.equal(JSON.stringify(frames[index]), JSON.stringify(frame), `snapshot ${index}`); compared++; });
    baseline.build(input);
    assert.equal(compared, frames.length);
  }
  const results = frames.at(-1).res;
  assert.equal(results.length, input.reduce((n, _, i) => n * (i + 1), 1));
  assert.equal(new Set(results.map(JSON.stringify)).size, results.length);
  for (const result of results) assert.deepEqual([...result].sort((a,b) => a-b), [...input].sort((a,b) => a-b));
});

test('46: maximum input retains count-backed prefixes, with no eager history copies', () => {
  const builder = builders(), frames = builder.build([-2,-1,0,1,2]);
  assert.equal(frames.length, 4463, 'ready plus all 4462 original instruction snapshots');
  assert.deepEqual(builder.stats, {traceCopies: 0, resultCopies: 0});
  for (const frame of frames) for (const key of ['trace','res']) {
    const descriptor = Object.getOwnPropertyDescriptor(frame, key);
    assert.equal(typeof descriptor.get, 'function'); assert.equal(descriptor.enumerable, true);
    assert.equal('value' in descriptor, false, 'the frame cannot retain an expanded prefix');
  }
  const last = frames.at(-1), trace = last.trace, result = last.res;
  assert.equal(trace.length, 1475); assert.equal(result.length, 120);
  assert.deepEqual(builder.stats, {traceCopies: 1475, resultCopies: 120}, 'one observation copies only its own prefix');
  if (originals) {
    const baseline = builders(originals, () => {}); baseline.build([-2,-1,0,1,2]);
    assert.deepEqual(baseline.stats, {traceCopies: 3280590, resultCopies: 266700});
  }
});

test('46: materialized arrays and rows cannot mutate another observation, frame, or later run', () => {
  const builder = builders(), frames = builder.build([1,2,3,4,5]);
  const recordIndex = frames.findIndex(f => f.phase === 'RECORD');
  const earlier = JSON.stringify(frames[recordIndex]), ending = JSON.stringify(frames.at(-1));
  const record = frames[recordIndex], res = record.res, trace = record.trace;
  res[0][0] = 999; res[0].push(999); res.push([999]); trace[0].note = 'changed'; trace.push({id:999});
  assert.equal(JSON.stringify(record), earlier); assert.equal(JSON.stringify(frames.at(-1)), ending);
  assert.notEqual(record.res, record.res); assert.notEqual(record.trace[0], record.trace[0]);
  const second = builder.build([9]); second.at(-1).res[0][0] = -1;
  assert.equal(JSON.stringify(record), earlier, 'old run getter retains its own logs');
  assert.equal(JSON.stringify(frames.at(-1)), ending);
  assert.deepEqual(plain(second.at(-1).res), [[9]]);
});

function observe(h) {
  return {raw: h.current(), rendered: snapshot(h), frame: plain(h.adapter.snapshot()),
    object: plain(h.source.objectFrame()), operation: plain(h.walkthrough.operation),
    transition: plain(h.adapter.currentTransition()), guided: plain(h.context.StudyGuided.project(h.adapter.snapshot()))};
}
test('46: presets preserve production operation/Object identities and Back, seek, replay and reload', async () => {
  const h = fixture(), before = originals ? fixture(originals) : null;
  for (let preset = 1; preset <= 6; preset++) {
    h.exec(`loadExample(${preset})`); before?.exec(`loadExample(${preset})`);
    h.walkthrough.setMode("compact"); before?.walkthrough.setMode("compact");
    const count = h.source.count();
    const positions = [...new Set([1,2,6,12,Math.floor(count/2),count-1,3,0])].filter(i => i < count);
    for (const index of positions) {
      await h.adapter.seek(index); if (before) await before.adapter.seek(index);
      const expected = observe(h);
      if (before) assert.deepEqual(expected, observe(before), `preset ${preset}, index ${index}`);
      if (index > 0) { h.adapter.previous(); h.adapter.next(); assert.deepEqual(observe(h), expected); }
      if (index > 0) {
        const raw = h.current(), timeline = h.exec('steps'), indexBefore = h.source.index();
        // Detailed replay asks the production before-view fallback to preview a
        // previous frame. It must restore the committed index and history.
        h.walkthrough.setMode('detailed');
        h.document.querySelector('.operation-controls').querySelector('button').click();
        await h.walkthrough.next();
        assert.equal(h.source.index(), indexBefore); assert.deepEqual(h.current(), raw);
        assert.equal(h.exec('steps'), timeline);
        h.walkthrough.setMode('compact');
      }
    }
    const final = h.source.readAt(count-1); h.exec(`loadExample(${preset})`);
    assert.equal(h.source.index(), 0); assert.deepEqual(plain(h.source.readAt(count-1)), plain(final));
  }
});

test('46: maximum input supports random seek, Objects focus, detached reads and safe reload', async () => {
  const h = fixture(); assert.equal(h.load('-2,-1,0,1,2'), true);
  const hash = digest(h.exec('steps'));
  for (const index of [4462,2231,101,4400,15,0,4400]) {
    await h.adapter.seek(index); const value = h.current(), object = plain(h.source.objectFrame());
    if (h.objectContainer.dataset.objectFocused !== 'true') h.focus();
    assert.equal(h.source.index(), index); assert.deepEqual(h.current(), value);
    assert.deepEqual(plain(h.source.objectFrame()), object);
    if (index) { h.adapter.previous(); h.adapter.next(); assert.deepEqual(h.current(), value); assert.deepEqual(plain(h.source.objectFrame()), object); }
    const raw = h.source.readAt(index); raw.res.push([999]); raw.trace.push({id:999});
    assert.deepEqual(h.current(), value);
  }
  assert.equal(digest(h.exec('steps')), hash);
  const prior = h.exec('steps'); assert.equal(h.load('9'), true);
  assert.equal(h.source.index(), 0); assert.equal(digest(prior), hash);
  assert.equal(h.load('1,2,3,4,5,6'), false); assert.deepEqual(h.current().nums, [9]);
});

test('46: authored Guided checkpoints and projected meanings are unchanged', async () => {
  const h = fixture();
  const lesson = ['a','b'].flatMap(part => JSON.parse(fs.readFileSync(path.join(root, `visualizer-ui/guided-content-${part}.json`), 'utf8'))).find(item => item.id === 'leetcode:46');
  if (lesson.loader) h.exec(`${lesson.loader.functionName}(...${JSON.stringify(lesson.loader.args)})`);
  assert.deepEqual(plain(h.context.StudyGuided.project(h.adapter.snapshot()).values), lesson.expectedInput);
  for (const checkpoint of lesson.checkpoints) for (const side of ['before','after']) {
    await h.adapter.seek(checkpoint[`${side}Index`]);
    const projected = h.context.StudyGuided.project(h.adapter.snapshot());
    assert.equal(h.context.StudyGuided.matches(projected, checkpoint[side]), true, `${checkpoint.id} ${side}`);
  }
});
