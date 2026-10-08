/* Focused dependency-free integration regressions for LeetCode 34.
 * Executes the real inline lesson and complete production learning, operations,
 * Object State, Object View and Guided core scripts in a structural DOM model.
 * This does not validate browser painting/layout, animation, pointer hit-testing,
 * screen-reader behavior, or Windows/Electron embedding. Workspace/playback are
 * synthetic anchors here; real workspace.js playback remains a browser/CI gate.
 * Run: node tests/windows-search-range.test.cjs [--source <repository>]
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {fixture, trace, plain, snapshot, baseline} = require('./helpers/search-range-dom.cjs');
const at = process.argv.indexOf('--source');
const root = at < 0 ? path.resolve(__dirname, '..') : path.resolve(process.argv[at + 1]);
const lines = {
  INIT_LEFT: 7, INIT_RIGHT: 8, LOWER_CHECK: 9, LOWER_MID: 10,
  LOWER_COMPARE: 11, LOWER_MOVE_LEFT: 12, LOWER_MOVE_RIGHT: 14,
  SAVE_FIRST: 17, RESET_LEFT: 18, RESET_RIGHT: 19, UPPER_CHECK: 20,
  UPPER_MID: 21, UPPER_COMPARE: 22, UPPER_MOVE_LEFT: 23,
  UPPER_MOVE_RIGHT: 25, SAVE_AFTER_LAST: 28, CHECK_FOUND: 29,
  RETURN_MISSING: 30, RETURN_RANGE: 32, END: null,
};
const registers = ['left', 'right', 'mid', 'first', 'afterLast', 'ans'];
const pick = (raw, keys) => Object.fromEntries(keys.map(key => [key, raw[key]]));
const oracle = (nums, target) => [nums.indexOf(target), nums.lastIndexOf(target)];
const boundary = (nums, target, upper = false) => {
  const index = nums.findIndex(value => upper ? value > target : value >= target);
  return index < 0 ? nums.length : index;
};
const serializeElement = element => ({tag: element.tagName, id: element.id || '',
  className: element.className, html: element.innerHTML, text: element._text,
  attributes: {...element.attributes}, dataset: {...element.dataset},
  children: element.children.map(serializeElement)});

function accepted(h, nums, target) {
  const before = h.alerts.length;
  assert.equal(h.load(JSON.stringify(nums), target), true);
  assert.equal(h.alerts.length, before);
  assert.equal(h.source.index(), 0);
  assert.deepEqual(h.current().nums, nums);
  assert.equal(h.current().target, target);
}

function assertInstruction(h, before, after) {
  const phase = before.execState, expected = pick(before, registers);
  let next;
  switch (phase) {
    case 'INIT_LEFT': expected.left = 0; next = 'INIT_RIGHT'; break;
    case 'INIT_RIGHT': expected.right = before.nums.length; next = 'LOWER_CHECK'; break;
    case 'LOWER_CHECK': next = before.left < before.right ? 'LOWER_MID' : 'SAVE_FIRST'; break;
    case 'LOWER_MID': expected.mid = before.left + Math.floor((before.right - before.left) / 2); next = 'LOWER_COMPARE'; break;
    case 'LOWER_COMPARE': next = before.nums[before.mid] < before.target ? 'LOWER_MOVE_LEFT' : 'LOWER_MOVE_RIGHT'; break;
    case 'LOWER_MOVE_LEFT': expected.mid = null; expected.left = before.mid + 1; next = 'LOWER_CHECK'; break;
    case 'LOWER_MOVE_RIGHT': expected.mid = null; expected.right = before.mid; next = 'LOWER_CHECK'; break;
    case 'SAVE_FIRST': expected.first = before.left; next = 'RESET_LEFT'; break;
    case 'RESET_LEFT': expected.left = 0; next = 'RESET_RIGHT'; break;
    case 'RESET_RIGHT': expected.right = before.nums.length; next = 'UPPER_CHECK'; break;
    case 'UPPER_CHECK': next = before.left < before.right ? 'UPPER_MID' : 'SAVE_AFTER_LAST'; break;
    case 'UPPER_MID': expected.mid = before.left + Math.floor((before.right - before.left) / 2); next = 'UPPER_COMPARE'; break;
    case 'UPPER_COMPARE': next = before.nums[before.mid] <= before.target ? 'UPPER_MOVE_LEFT' : 'UPPER_MOVE_RIGHT'; break;
    case 'UPPER_MOVE_LEFT': expected.mid = null; expected.left = before.mid + 1; next = 'UPPER_CHECK'; break;
    case 'UPPER_MOVE_RIGHT': expected.mid = null; expected.right = before.mid; next = 'UPPER_CHECK'; break;
    case 'SAVE_AFTER_LAST': expected.afterLast = before.left; next = 'CHECK_FOUND'; break;
    case 'CHECK_FOUND': next = before.first === before.nums.length || before.nums[before.first] !== before.target ? 'RETURN_MISSING' : 'RETURN_RANGE'; break;
    case 'RETURN_MISSING': expected.ans = [-1, -1]; next = 'END'; break;
    case 'RETURN_RANGE': expected.ans = [before.first, before.afterLast - 1]; next = 'END'; break;
    default: assert.fail(`Unexpected instruction ${phase}`);
  }
  assert.deepEqual(pick(after, registers), expected, `${phase}: only this reference instruction assigns its register`);
  assert.equal(after.execState, next, `${phase}: exact next instruction`);
  assert.equal(after.phase, phase === 'RESET_LEFT' ? 'upper' : phase === 'SAVE_AFTER_LAST' ? 'result' : before.phase);
  if (/_MOVE_(LEFT|RIGHT)$/.test(phase)) assert.equal(after.currentValue, null, 'loop-local inspected value leaves scope');
  if (after.execState !== 'END') assert.equal(after.ans, null, 'no speculative answer before return');
  assert.deepEqual(after.nums, before.nums, `${phase}: never reorder or mutate input`);
  assert.equal(after.target, before.target, `${phase}: never synthesize target + 1`);
  if (/_MID$/.test(phase)) {
    assert.equal(after.currentValue, before.nums[expected.mid]);
    assert.ok(before.left <= expected.mid && expected.mid < before.right);
  }
  if (phase === 'SAVE_FIRST') assert.equal(after.first, boundary(before.nums, before.target));
  if (phase === 'SAVE_AFTER_LAST') assert.equal(after.afterLast, boundary(before.nums, before.target, true));
  const transition = plain(h.adapter.currentTransition());
  assert.equal(transition.instruction.line, lines[phase]);
  assert.equal(transition.instruction.phase, phase);
  assert.equal(transition.toIndex, transition.fromIndex + 1);
}

function run(h, nums, target, instructions = true) {
  accepted(h, nums, target);
  const frames = [h.current()];
  const maximum = 16 + 8 * Math.ceil(Math.log2(nums.length + 1));
  while (h.current().execState !== 'END') {
    const before = h.current();
    assert.ok(frames.length <= maximum, 'two logarithmic searches terminate within the instruction bound');
    assert.deepEqual(plain(h.source.pendingInstruction()), {line: lines[before.execState], phase: before.execState});
    assert.equal(h.adapter.snapshot().location.line, lines[before.execState]);
    assert.deepEqual(h.document.querySelectorAll('.code-line.active').map(element => element.id), [`line-${lines[before.execState]}`]);
    if (/^(LOWER_|UPPER_|SAVE_FIRST|SAVE_AFTER_LAST)/.test(before.execState)) {
      assert.ok(0 <= before.left && before.left <= before.right && before.right <= nums.length, 'half-open window stays within [0,n]');
      const upper = before.phase === 'upper';
      assert.ok(nums.slice(0, before.left).every(value => upper ? value <= target : value < target), 'excluded left prefix satisfies the boundary predicate');
      assert.ok(nums.slice(before.right).every(value => upper ? value > target : value >= target), 'excluded right suffix cannot contain an earlier boundary');
    }
    h.exec('nextStep()');
    const after = h.current();
    if (instructions) assertInstruction(h, before, after);
    assert.equal(h.source.index(), frames.length);
    frames.push(after);
    assert.equal(h.el('btn-prev').disabled, false);
  }
  assert.deepEqual(h.current().ans, oracle(nums, target), 'independent linear oracle');
  assert.equal(h.current().first, boundary(nums, target));
  assert.equal(h.current().afterLast, boundary(nums, target, true));
  assert.equal(h.source.pendingInstruction(), null);
  assert.equal(h.el('btn-next').disabled, true);
  assert.equal(h.el('btn-next').textContent, 'Finished!');
  assert.deepEqual(h.document.querySelectorAll('.code-line.active').map(element => element.id), []);
  const cells = h.el('visual-ui').querySelectorAll('.cell');
  assert.equal(cells.length, nums.length + 1, 'n is visibly represented as a boundary sentinel');
  assert.equal(cells.at(-1).classList.contains('sentinel'), true);
  assert.equal(cells.at(-1).classList.contains('found'), false, 'sentinel never becomes an array result');
  assert.deepEqual(cells.flatMap((cell, index) => cell.classList.contains('found') ? [index] : []),
    nums.flatMap((value, index) => value === target ? [index] : []));
  const done = h.state(); h.exec('nextStep(); nextStep()');
  assert.equal(h.state(), done, 'extra Next does not mutate terminal state/history');
  return frames;
}

test('34: independent oracle and exact per-instruction assignments for boundaries, duplicates and safe-integer extremes', () => {
  const h = fixture(root), max = Number.MAX_SAFE_INTEGER;
  const cases = [
    [[], 0], [[8], 8], [[8], 7], [[8], 9],
    [[5, 7, 7, 8, 8, 10], 8], [[5, 7, 7, 8, 8, 10], 6],
    [[1, 1, 1, 1], 1], [[1, 1, 1, 1], 0], [[1, 1, 1, 1], 2],
    [[-5, -5, -3, -1, 0], -5], [[-5, -5, -3, -1, 0], 0],
    [[-max, -max, -1, 0, max, max], -max],
    [[-max, -max, -1, 0, max, max], max],
    [[-max, -max, -1, 0, max, max], max - 1],
    [[-max], max], [[max], -max],
  ];
  let seed = 34;
  const random = limit => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % limit; };
  for (let i = 0; i < 48; i++) {
    const nums = Array.from({length: random(17)}, () => random(11) - 5).sort((a, b) => a - b);
    cases.push([nums, random(15) - 7]);
  }
  for (const [nums, target] of cases) run(h, nums, target);
  assert.equal(h.alerts.length, 0);
});

test('34: each preset completes, Back/replay restore exact raw state, and reset clears history once', async () => {
  const h = fixture(root), defaults = h.current();
  const presetIds = [...h.html.matchAll(/onclick="loadExample\((\d+)\)"/g)].map(match => Number(match[1]));
  assert.ok(presetIds.length >= 3, 'provides found, missing and empty/edge presets');
  for (const id of presetIds) {
    h.exec(`loadExample(${id})`);
    const initial = h.current(), frames = trace(h);
    assert.deepEqual(h.current().ans, oracle(initial.nums, initial.target));
    assert.equal(h.exec('activeExample'), id);
    for (let index = frames.length - 2; index >= 0; index--) {
      h.exec('prevStep()'); assert.deepEqual(h.current(), frames[index].raw);
      assert.deepEqual(h.json('trace'), frames[index].trace, 'Back restores only completed trace rows');
      assert.deepEqual(snapshot(h), frames[index].rendered, 'Back restores the complete modeled visible snapshot');
      assert.equal(h.source.index(), index);
    }
    const start = h.state(); h.exec('prevStep(); prevStep()'); assert.equal(h.state(), start);
    for (let index = 1; index < frames.length; index++) {
      h.exec('nextStep()'); assert.deepEqual(h.current(), frames[index].raw);
      assert.deepEqual(h.json('trace'), frames[index].trace, 'reexecution deterministically restores the same trace');
      assert.deepEqual(snapshot(h), frames[index].rendered, 'replay restores the complete modeled visible snapshot');
      assert.equal(plain(h.adapter.currentTransition()).instruction.line, frames[index - 1].pendingInstruction.line);
    }
    const oldEpoch = h.epoch(), resets = h.resets.length;
    h.adapter.reset();
    assert.deepEqual(h.current(), initial);
    assert.equal(h.source.index(), 0); assert.equal(h.epoch(), oldEpoch + 1);
    assert.equal(h.resets.length, resets + 1); assert.equal(h.adapter.currentTransition(), null);
    assert.equal(h.walkthrough.stage, 0); assert.equal(h.el('btn-prev').disabled, true);
  }
  assert.deepEqual(defaults.nums, [5, 7, 7, 8, 8, 10]); assert.equal(defaults.target, 8);
});

test('34: rejected loads preserve state, journal, walkthrough Action, focus, pins and epoch at initial and advanced checkpoints', async () => {
  const invalid = [
    ['', '8'], ['   ', '8'], ['1,,2', '8'], ['[1,]', '8'], ['[1,2', '8'], ['1,2]', '8'],
    ['[[1],2]', '8'], ['[1,null,2]', '8'], ['[1,true,2]', '8'], ['[1,"2"]', '8'],
    ['[2,1]', '8'], ['[1,NaN]', '8'], ['[1,Infinity]', '8'], ['[1,2.5]', '8'],
    ['[9007199254740992]', '8'], ['[-9007199254740992]', '8'],
    ['[1,2]', ''], ['[1,2]', '1.5'], ['[1,2]', 'Infinity'], ['[1,2]', 'NaN'],
    ['[1,2]', '9007199254740992'], ['[1,2]', '8abc'],
  ];
  for (const checkpoint of [0, 7]) {
    const h = fixture(root);
    h.exec('nextStep()'); const firstTransition = h.adapter.currentTransition();
    await h.adapter.seek(checkpoint);
    h.exec('pinned.left = true; render()');
    h.walkthrough.refresh(); await h.walkthrough.next();
    assert.equal(h.walkthrough.stage, 1); h.focus();
    for (const [nums, target] of invalid) {
      const before = {state: h.state(), epoch: h.epoch(), resets: h.resets.length,
        renders: h.renders.length, alerts: h.alerts.length, notifications: h.notifications(),
        frame: h.adapter.snapshot(), transition: h.adapter.currentTransition(),
        operation: h.walkthrough.operation, children: [...h.objectContainer.children], text: h.objectContainer.textContent};
      assert.equal(h.load(nums, target), false, `${nums} | ${target}: explicit rejection`);
      assert.equal(h.alerts.length, before.alerts + 1);
      assert.equal(h.state(), before.state, 'input/preset/history/pins all unchanged');
      assert.equal(h.epoch(), before.epoch); assert.equal(h.resets.length, before.resets);
      assert.equal(h.renders.length, before.renders); assert.equal(h.notifications(), before.notifications);
      assert.equal(h.adapter.snapshot(), before.frame); assert.equal(h.adapter.currentTransition(), before.transition);
      assert.equal(h.walkthrough.operation, before.operation); assert.equal(h.walkthrough.stage, 1);
      assert.equal(h.objectContainer.dataset.objectFocused, 'true');
      assert.ok(h.workspace.classList.contains('study-object-focus'));
      assert.deepEqual(h.objectContainer.children, before.children); assert.equal(h.objectContainer.textContent, before.text);
      assert.equal(h.el('custom-input').value, nums); assert.equal(h.el('target-input').value, String(target));
    }
    await h.adapter.seek(1);
    assert.deepEqual(plain(h.adapter.currentTransition()), plain(firstTransition), 'history replay reconstructs the same earlier journal entry after rejection');
    const oldEpoch = h.epoch(), resets = h.resets.length;
    accepted(h, [-4, -4, 0, 2], -4);
    assert.equal(h.epoch(), oldEpoch + 1); assert.equal(h.resets.length, resets + 1);
    assert.equal(h.adapter.currentTransition(), null); assert.equal(h.exec('activeExample'), 0);
    assert.equal(h.walkthrough.stage, 0); assert.equal(h.objectContainer.dataset.objectFocused, 'false');
  }
});

test('34: historical previews and semantic Object View snapshots are pure and detached', () => {
  const h = fixture(root), frames = trace(h);
  const before = {state: h.state(), frame: h.adapter.snapshot(), index: h.source.index(),
    epoch: h.epoch(), renders: h.renders.length, notifications: h.notifications(), visual: serializeElement(h.el('visual-ui'))};
  for (let index = 0; index < frames.length; index++) {
    const preview = h.source.preview(index);
    assert.ok(preview, `preview ${index} exists`);
    assert.notEqual(preview, h.el('visual-ui'));
    const object = plain(h.source.objectFrame(index));
    assert.deepEqual(object, frames[index].objectFrame, `historical Object View ${index} comes from that checkpoint`);
    assert.equal(h.state(), before.state); assert.equal(h.adapter.snapshot(), before.frame);
    assert.equal(h.source.index(), before.index); assert.equal(h.epoch(), before.epoch);
    assert.equal(h.renders.length, before.renders); assert.equal(h.notifications(), before.notifications);
    assert.deepEqual(serializeElement(h.el('visual-ui')), before.visual, 'preview leaves live diagram unchanged');
    preview.textContent = 'edited detached preview';
    const captured = h.source.objectFrame(index); captured.stack[0].variables.length = 0;
    assert.deepEqual(plain(h.source.objectFrame(index)), frames[index].objectFrame, 'consumer mutations cannot affect a historical projection');
  }
  for (const index of [-1, .5, frames.length, NaN]) {
    assert.equal(h.source.preview(index), null, 'invalid preview never navigates');
    assert.throws(() => h.source.objectFrame(index));
  }
  const detached = h.source.read(); detached.nums[0] = 12345; detached.ans[0] = 12345;
  assert.equal(h.state(), before.state, 'public reads never expose mutable live arrays');
});

test('34: Detailed commits once, replays moments without reexecution, Compact advances once, and seek restores run checkpoints', async () => {
  const h = fixture(root), initial = h.current(), initialIndex = h.source.index();
  assert.equal(h.walkthrough.mode, 'detailed'); assert.equal(h.walkthrough.stage, 0);
  await h.walkthrough.next(); assert.equal(h.walkthrough.stage, 1);
  assert.deepEqual(h.current(), initial); assert.equal(h.source.index(), initialIndex);
  await h.walkthrough.next(); assert.equal(h.walkthrough.stage, 2);
  assert.equal(h.source.index(), initialIndex + 1);
  const committed = h.state(), operation = h.walkthrough.operation;
  assert.equal(operation.committed, true); assert.equal(operation.location.line, 7);
  const previousMoment = h.document.querySelector('.operation-controls').children[0];
  previousMoment.click(); assert.equal(h.walkthrough.stage, 1);
  assert.equal(h.state(), committed); assert.equal(h.renders.at(-1).index, initialIndex);
  assert.ok(h.document.querySelector('.operation-replay'));
  previousMoment.click(); assert.equal(h.walkthrough.stage, 0); assert.equal(h.state(), committed);
  await h.walkthrough.next(); await h.walkthrough.next();
  assert.equal(h.walkthrough.stage, 2); assert.equal(h.state(), committed);
  assert.equal(h.renders.at(-1).index, initialIndex + 1);
  await h.walkthrough.next(); assert.equal(h.walkthrough.stage, 0); assert.equal(h.state(), committed);
  assert.equal(h.walkthrough.operation.location.line, 8);
  h.walkthrough.setMode('compact');
  const index = h.source.index(); await h.walkthrough.next();
  assert.equal(h.source.index(), index + 1); assert.equal(h.current().right, initial.nums.length);
  h.walkthrough.setMode('detailed');
  await h.adapter.seek(500); assert.equal(h.current().execState, 'END');
  assert.deepEqual(h.current().ans, [3, 4]);
  const terminal = h.current(), terminalIndex = h.source.index(), terminalTransition = h.adapter.currentTransition();
  await h.adapter.seek(0); assert.deepEqual(h.current(), initial);
  await h.adapter.seek(terminalIndex); assert.deepEqual(h.current(), terminal);
  assert.equal(h.adapter.currentTransition().instruction.line, terminalTransition.instruction.line);
  assert.equal(h.adapter.currentTransition().instruction.phase, terminalTransition.instruction.phase);
  assert.equal(h.source.pendingInstruction(), null);
});

test('34: Guided expected input and all checkpoints match the complete production capture and strict validator', () => {
  const h = fixture(root), frames = trace(h);
  const lessons = ['a', 'b'].flatMap(shard => JSON.parse(fs.readFileSync(path.join(root, `visualizer-ui/guided-content-${shard}.json`), 'utf8')));
  const lesson = lessons.find(item => item.id === 'leetcode:34');
  assert.ok(lesson, 'new lesson has curated Guided content');
  assert.deepEqual(frames[0].projected.values, lesson.expectedInput);
  assert.equal(lesson.checkpoints.length, 3);
  const meanings = {
    decision: {before: {phase: 'lower', left: 0, right: 6, mid: 3, first: null, ans: null},
      after: {phase: 'lower', left: 0, right: 3, mid: null, first: null, ans: null}},
    change: {before: {phase: 'upper', left: 0, right: 6, mid: 3, first: 3, ans: null},
      after: {phase: 'upper', left: 4, right: 6, mid: null, first: 3, ans: null}},
    result: {before: {phase: 'result', first: 3, afterLast: 5, ans: null},
      after: {phase: 'result', first: 3, afterLast: 5, ans: [3, 4]}},
  };
  for (const checkpoint of lesson.checkpoints) {
    assert.ok(checkpoint.beforeIndex < checkpoint.afterIndex);
    for (const side of ['before', 'after']) {
      const frame = frames[checkpoint[side + 'Index']], state = frame.projected;
      assert.deepEqual(pick(frame.raw, Object.keys(meanings[checkpoint.id][side])), meanings[checkpoint.id][side],
        `${checkpoint.id}/${side}: independent meaning, not just a self-approved projection`);
      assert.equal(h.context.StudyGuided.matches(state, checkpoint[side]), true, `${checkpoint.id}/${side}`);
      const wrong = structuredClone(state); wrong.phase += ' wrong';
      assert.equal(h.context.StudyGuided.matches(wrong, checkpoint[side]), false, 'strict phases are still validated');
    }
  }
  assert.deepEqual(frames.at(-1).raw.ans, [3, 4]);
  h.adapter.reset(); assert.deepEqual(plain(h.context.StudyGuided.project(h.adapter.snapshot())).values, lesson.expectedInput);
});


test('34: chart captions distinguish excluded boundary candidates from compared elements without advancing state', async () => {
  const h = fixture(root), frames = trace(h);
  const note = visual => visual.querySelector('.boundary-note').textContent;
  const find = predicate => {
    const frame = frames.find(item => predicate(item.raw));
    assert.ok(frame, 'expected real instruction checkpoint exists');
    return frame;
  };
  const lowerEquality = find(raw => raw.execState === 'LOWER_MOVE_RIGHT' && raw.currentValue === raw.target);
  const lowerMoved = frames[lowerEquality.index + 1];
  assert.match(note(h.source.preview(lowerEquality.index)), /lower boundary may still be n = 6/,
    'caption describes the current window before the pending right assignment');
  const lowerVisual = h.source.preview(lowerMoved.index);
  assert.equal(lowerMoved.raw.right, 3);
  assert.ok(lowerVisual.querySelector('.cell.right.discarded'), 'the excluded candidate is outside the active comparison window');
  assert.match(note(lowerVisual), /Compare array elements in \[0, 3\)/);
  assert.match(note(lowerVisual), /right = 3 is excluded from further comparisons, but is still a possible lower boundary/);
  const upperMoved = find(raw => raw.phase === 'upper' && raw.left === 4 && raw.right === 5);
  assert.match(note(h.source.preview(upperMoved.index)), /right = 5 .*still a possible upper boundary/);
  const meeting = find(raw => raw.phase === 'lower' && raw.left === 3 && raw.right === 3);
  assert.match(note(h.source.preview(meeting.index)), /meeting index is the lower boundary/);
  assert.match(note(h.source.preview(meeting.index)), /empty search window does not mean the target is absent/);

  const captions = frames.map(frame => {
    const before = h.state(), index = h.source.index(), epoch = h.epoch();
    const caption = note(h.source.preview(frame.index));
    assert.equal(h.state(), before, 'caption projection cannot change raw state, history or pins');
    assert.equal(h.source.index(), index); assert.equal(h.epoch(), epoch);
    return caption;
  });
  for (const frame of frames) {
    await h.adapter.seek(frame.index);
    assert.equal(note(h.el('visual-ui')), captions[frame.index], 'seek uses the same caption as the detached checkpoint');
  }
  await h.adapter.seek(lowerMoved.index);
  h.exec('prevStep()');
  assert.equal(note(h.el('visual-ui')), note(h.source.preview(lowerEquality.index)), 'Back restores the previous candidate explanation');
  h.exec('nextStep()');
  assert.equal(note(h.el('visual-ui')), note(lowerVisual), 'replay restores the same explanation');
});

test('34: boundary captions handle n, empty windows and the partially reset upper search', () => {
  const h = fixture(root);
  for (const [nums, target] of [[[2, 2], 2], [[2, 2], 3], [[1, 3, 3, 5], 4], [[], 0]]) {
    accepted(h, nums, target);
    const frames = trace(h);
    for (const frame of frames) {
      const raw = frame.raw, caption = h.source.preview(frame.index).querySelector('.boundary-note').textContent;
      if (!nums.length) {
        assert.match(caption, /only boundary is n = 0/);
        assert.match(caption, /no array element is read/);
      } else if (raw.execState === 'RESET_RIGHT') {
        assert.match(caption, new RegExp(`reset in progress: left is now 0.*next instruction resets right to n = ${nums.length}`));
        assert.doesNotMatch(caption, /pointers meet|Compare array elements/, 'a half-reset window is not presented as the new search');
      } else if (raw.left !== null && raw.right !== null && raw.phase !== 'result') {
        if (raw.left === raw.right) {
          assert.match(caption, new RegExp(`pointers meet at ${raw.left}`));
          assert.match(caption, /empty search window does not mean the target is absent/);
          if (raw.left === nums.length) assert.match(caption, /boundary is n, past the last array element/);
        } else if (raw.right === nums.length) {
          assert.match(caption, new RegExp(`boundary may still be n = ${nums.length}`));
          assert.match(caption, /not an array element and is never read/);
        }
      } else {
        assert.doesNotMatch(caption, /pointers meet|Compare array elements/, 'initializing and result states do not claim an active search');
      }
    }
    assert.deepEqual(h.current().ans, oracle(nums, target));
  }
});

test('34: modeled default text snapshots retain the reviewed correction or baseline contract', async () => {
  const file = 'Binary Search/find_first_and_last_position_of_element_in_sorted_array_visualizer.html';
  const original = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/visualizer-baseline.json'), 'utf8'))[file];
  const corrections = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/visualizer-corrections.json'), 'utf8'));
  const expected = corrections[file]?.expected || original;
  assert.ok(original, 'visualizer remains registered in the original snapshot baseline');
  const actual = await baseline(fixture(root));
  assert.deepEqual(actual.expected, expected);
  assert.deepEqual(actual.snapshots.initial, actual.snapshots.restarted);
  // No assertion here represents browser CSS/layout/motion or Windows validation.
});


test('34: every pending operation is authored against its exact reference line', () => {
  const h = fixture(root);
  const rules = h.context.studyOperationRules.find(rule => rule.id === 'leetcode:34');
  assert.ok(rules);
  for (const line of new Set(Object.values(lines).filter(Number.isInteger))) {
    assert.ok(rules.lines[line], `operation metadata includes line ${line}`);
    assert.equal(rules.lines[line].code.trim(), h.el(`line-${line}`).textContent.trim());
    assert.ok(rules.lines[line].focus && rules.lines[line].action);
  }
  assert.equal(h.document.querySelectorAll('.code-line').length, 33);
});
