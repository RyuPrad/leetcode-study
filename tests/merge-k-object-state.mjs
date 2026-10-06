import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { ROOT } from '../scripts/content.mjs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ reducedMotion: 'reduce' });
let transitions = 0, pointerWrites = 0;
try {
  await page.goto(pathToFileURL(path.join(ROOT, 'LinkedList/merge_k_sorted_lists_visualizer.html')).href);
  await page.waitForFunction(() => window.studyLessonAdapter?.objectSnapshot);
  for (const input of ['1,4,5; 1,3,4; 2,6', '1,1,1; 1,1; 1', '2,7; 1,5,9; 3', '5; 2,4; 1', '', ' ']) {
    const evidence = await page.evaluate(input => {
      document.getElementById('custom-input').value = input;
      window.loadCustom();
      const source = window.studyLessonSource;
      const frameAt = index => source.objectFrame(index);
      const variable = (frame, id) => frame.stack[0].variables.find(item => item.id === id)?.value;
      const target = value => value && typeof value === 'object' && 'ref' in value ? value.ref : value;
      const object = (frame, id) => frame.objects.find(item => item.id === id);
      const next = (frame, id) => object(frame, id)?.entries.find(item => item.key === 'next')?.value;
      const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      let writes = 0;
      const initial = JSON.stringify(frameAt(0));
      for (let index = 1; index < source.count(); index++) {
        const before = frameAt(index - 1), after = frameAt(index), line = source.readAt(index).executedLine;
        const curr = target(variable(before, 'helper:curr'));
        if ([20, 23, 28].includes(line)) {
          const selected = line === 20 ? variable(before, 'helper:l1') : line === 23 ? variable(before, 'helper:l2') : variable(before, 'helper:l1') || variable(before, 'helper:l2');
          if (!same(next(after, curr), selected)) throw Error(`Line ${line} did not retain the actual selected node reference`);
          if (!same(variable(before, 'helper:curr'), variable(after, 'helper:curr'))) throw Error('Link assignment advanced curr');
          writes++;
        }
        if ([21, 24].includes(line)) {
          const name = line === 21 ? 'helper:l1' : 'helper:l2';
          if (!same(variable(after, name), next(before, target(variable(before, name))))) throw Error('Source pointer did not advance to its actual next node');
        }
        if (line === 26 && !same(variable(after, 'helper:curr'), next(before, curr))) throw Error('curr did not advance to the previously linked node');
      }
      const final = frameAt(source.count() - 1), values = [], seen = new Set();
      let node = target(variable(final, 'return'));
      while (typeof node === 'string') {
        if (seen.has(node)) throw Error('Merged output contains a cycle');
        seen.add(node); values.push(object(final, node).entries.find(item => item.key === 'val').value); node = target(next(final, node));
      }
      if (source.index() !== 0 || JSON.stringify(frameAt(0)) !== initial) throw Error('Pure historical projections changed the live state');
      return { states: source.count(), writes, values, ids: [...seen] };
    }, input);
    const expected = input.trim() ? input.split(';').flatMap(group => group.split(',').map(value => Number(value.trim()))).sort((a, b) => a - b) : [];
    assert.deepEqual(evidence.values, expected);
    assert.equal(new Set(evidence.ids).size, expected.length);
    transitions += evidence.states - 1;
    pointerWrites += evidence.writes;
  }
  const report = { passed: true, cases: 6, transitions, pointerWrites };
  fs.writeFileSync(path.join(ROOT, 'test-results/merge-k-object-state.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
