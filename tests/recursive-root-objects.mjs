import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { ROOT, collectCatalog } from '../scripts/content.mjs';

const catalog = collectCatalog();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1360, height: 940 }, reducedMotion: 'reduce' });
const results = [], errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  for (const number of [104, 226]) {
    const file = catalog.entries.find(entry => entry.number === number).visualizerPath;
    await page.goto(pathToFileURL(path.join(ROOT, file)).href + '?walkthrough=compact');
    await page.waitForFunction(() => window.studyLessonAdapter?.objectSnapshot);
    for (const input of ['1,1,1,1,null,null,1', '1,null,1,1', '7,7,null', '1', '']) {
      await page.evaluate(input => {
        window.testRecursiveRootError = '';
        const alert = window.alert;
        window.alert = message => { window.testRecursiveRootError = message; };
        try { document.getElementById('custom-input').value = input; loadCustom(); }
        finally { window.alert = alert; }
      }, input);
      assert.equal(await page.evaluate(() => window.testRecursiveRootError), '', `${number}: custom input is accepted`);
      const result = await page.evaluate(async ({ number, input }) => {
        const source = studyLessonSource, adapter = studyLessonAdapter;
        const json = value => JSON.stringify(value);
        const initial = json(source.read()), initialIndex = source.index(), count = source.count();
        const historical = Array.from({ length: count }, (_, index) => json(source.readAt(index)));
        const frames = [], distinct = new Set();
        let nullCalls = 0, wholeTreeStates = 0;
        const variable = (frame, name) => frame.stack.flatMap(call => call.variables).find(value => value.name === name)?.value;
        const object = (frame, value) => frame.objects.find(item => item.id === value?.ref);
        const child = (frame, value, name) => object(frame, value)?.entries.find(entry => entry.key === name)?.value;
        const shape = (frame, value) => value === null ? null : value?.ref ? { val: child(frame, value, 'val'), left: shape(frame, child(frame, value, 'left')), right: shape(frame, child(frame, value, 'right')) } : value;
        const nativeShape = node => node === null ? null : { val: node.val, left: nativeShape(node.left), right: nativeShape(node.right) };
        const find = (node, id) => !node ? null : node._id === id ? node : find(node.left, id) || find(node.right, id);
        for (let index = 0; index < count; index++) {
          const raw = source.readAt(index), frame = source.objectFrame(index), root = variable(frame, 'root');
          frames.push(json(frame));
          const whole = Object.hasOwn(raw, 'root') ? raw.root : raw.layout.find(record => record.parentId === null)?.node ?? null;
          if (raw.stack.length) {
            if (raw.currentId === null) {
              if (root !== null) throw Error(`${number}:${index}: a null recursive argument became the whole tree`);
              nullCalls++;
            } else {
              if (root?.ref !== `tree:${raw.currentId}`) throw Error(`${number}:${index}: recursive root lost its source identity`);
              const expected = find(whole, raw.currentId);
              if (!expected || json(shape(frame, root)) !== json(nativeShape(expected))) throw Error(`${number}:${index}: the recursive root has the wrong subtree or child links`);
              distinct.add(root.ref);
            }
          } else {
            if (json(shape(frame, root)) !== json(nativeShape(whole))) throw Error(`${number}:${index}: Ready/Done must retain the whole tree`);
            wholeTreeStates++;
          }
          for (const item of frame.objects) if (item.kind === 'tree' && json(item.entries.map(entry => entry.key)) !== json(['val', 'left', 'right'])) throw Error('A tree object contains layout metadata or renamed algorithm fields');
          if (source.index() !== initialIndex || json(source.read()) !== initial) throw Error('Historical inspection executed or navigated the source');
          if (json(source.readAt(index)) !== historical[index]) throw Error('Historical inspection changed the existing source fixture');
        }
        if (!nullCalls || wholeTreeStates < 2) throw Error('The test did not cover null recursion and Ready/Done states');
        const indices = [...new Set([0, 1, Math.floor(count / 2), count - 1, ...Array.from({ length: count }, (_, index) => source.readAt(index).stack.length && source.readAt(index).currentId === null ? index : -1).filter(index => index >= 0)])];
        for (const index of indices) {
          await adapter.seek(index);
          if (json(source.objectFrame()) !== frames[index]) throw Error('Seek restored a different recursive argument');
          if (index > 0) {
            adapter.previous();
            if (json(source.objectFrame()) !== frames[index - 1]) throw Error('Back restored a different recursive argument');
            adapter.next();
            if (json(source.objectFrame()) !== frames[index]) throw Error('Forward replay changed the recursive argument');
          }
        }
        if (json(Array.from({ length: count }, (_, index) => json(source.readAt(index)))) !== json(historical)) throw Error('Navigation changed the original instruction/state history');
        const values = input ? input.split(',').map(value => value.trim() === 'null' ? null : Number(value)) : [];
        const oracleRoot = values.length ? { val: values[0], left: null, right: null } : null;
        const queue = oracleRoot ? [oracleRoot] : []; let cursor = 1;
        for (let index = 0; index < queue.length && cursor < values.length; index++) for (const side of ['left', 'right']) {
          const val = values[cursor++]; if (val !== null && val !== undefined) { const node = { val, left: null, right: null }; queue[index][side] = node; queue.push(node); }
        }
        const invert = node => node ? { val: node.val, left: invert(node.right), right: invert(node.left) } : null;
        const depth = node => node ? 1 + Math.max(depth(node.left), depth(node.right)) : 0;
        const final = source.objectFrame(count - 1);
        if (number === 226 && json(shape(final, variable(final, 'root'))) !== json(invert(oracleRoot))) throw Error('Done does not show the fully inverted original tree');
        if (number === 104 && source.readAt(count - 1).ans !== depth(oracleRoot)) throw Error('Object inspection changed the depth result');
        return { states: count, nullCalls, wholeTreeStates, distinctRecursiveRoots: distinct.size, pureHistoricalSnapshots: count, navigationChecks: indices.length };
      }, { number, input });
      if (input.startsWith('1,1,1')) assert.ok(result.distinctRecursiveRoots >= 3, 'Duplicate values retain distinct recursive node identities');
      results.push({ number, input, ...result });
    }
  }
  assert.deepEqual(errors, []);
  fs.mkdirSync(path.join(ROOT, 'test-results'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'test-results/recursive-root-objects.json'), JSON.stringify({ passed: true, results }, null, 2));
  console.log(`PASS ${results.length} recursive-root cases: real null arguments, stable duplicate identities, original Ready/Done roots, pure snapshots, Back and seek.`);
} finally { await browser.close(); }
