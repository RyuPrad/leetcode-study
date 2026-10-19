import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { collectCatalog, ROOT } from '../scripts/content.mjs';
import { PROBLEM_COUNT } from '../scripts/library-size.mjs';
import { assetPath } from '../desktop/protocol';
import type { Catalog } from '../shared/types';
const catalog = collectCatalog() as Catalog;
test('every problem is catalogued with a stable ID and portable visualizer reference', () => {
  assert.equal(catalog.entries.filter(e => e.number).length, PROBLEM_COUNT); assert.equal(catalog.visualizers.length, PROBLEM_COUNT); assert.equal(new Set(catalog.entries.map(e => e.id)).size, PROBLEM_COUNT + 2);
  for (const entry of catalog.entries) { assert.ok(!entry.markdown.includes('<iframe')); if (entry.number) assert.equal(entry.id, `leetcode:${entry.number}`); if (entry.visualizerPath) { const source = fs.readFileSync(path.join(ROOT, entry.notePath), 'utf8'); assert.ok(!source.includes('file:///')); assert.ok(fs.readFileSync(path.join(ROOT, entry.visualizerPath), 'utf8').includes('../visualizer-ui/workspace.js')); } }
});
test('every problem carries its LeetCode difficulty and every listed difficulty names a problem', () => {
  const listed = JSON.parse(fs.readFileSync(path.join(ROOT, 'coding/difficulty.json'), 'utf8'));
  const problems = catalog.entries.filter(e => e.number);
  for (const entry of problems) assert.ok(['Easy', 'Medium', 'Hard'].includes(entry.difficulty!), `${entry.id} difficulty`);
  assert.deepEqual(Object.keys(listed).map(Number).sort((a, b) => a - b), problems.map(e => e.number).sort((a, b) => a! - b!));
  assert.equal(catalog.entries.filter(e => !e.number && e.difficulty).length, 0);
  // Spot checks against LeetCode, one per level.
  assert.deepEqual(['leetcode:1', 'leetcode:3', 'leetcode:4'].map(id => catalog.entries.find(e => e.id === id)?.difficulty), ['Easy', 'Medium', 'Hard']);
});
test('every problem has a visualizer and both reference guides remain accessible', () => {
  assert.deepEqual(catalog.entries.filter(e => e.number && !e.visualizerPath).map(e => e.number), []); assert.equal(catalog.entries.filter(e => e.topic === 'Reference').length, 2);
});
test('asset protocol only resolves catalogued content and shared presentation assets', () => {
  const root = path.join(ROOT, 'dist');
  assert.equal(assetPath('study://content/Array%20%26%20Hashing/two_sum_visualizer.html', root, catalog), path.join(root, 'content/Array & Hashing/two_sum_visualizer.html'));
  const assets = new Set<string>();
  for (const file of catalog.visualizers) {
    const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
    for (const match of html.matchAll(/(?:src|href)=["']\.\.\/(visualizer-ui\/[^"']+)["']/g)) assets.add(match[1]);
  }
  for (const asset of assets) {
    assert.ok(fs.existsSync(path.join(ROOT, asset)), `${asset} exists in the source bundle`);
    assert.equal(assetPath(`study://content/${asset}`, root, catalog), path.join(root, 'content', asset), `${asset} can load in the desktop visualizer`);
  }
  for (const url of ['file:///C:/Windows/system.ini', 'study://content/%2e%2e%2fdesktop/main.cjs', 'study://content/%5cWindows%5csystem.ini', 'study://content/catalog.json', 'study://app/desktop/main.cjs', 'study://other/index.html', 'study://content/%E0%A4%A']) assert.equal(assetPath(url, root, catalog), null, url);
});
test('every LeetCode problem is either a study kit or an index entry, with its solution methods', async () => {
  const { INDEX_PATH, MAX_METHODS } = await import('../scripts/content.mjs');
  const listed = JSON.parse(fs.readFileSync(path.join(ROOT, INDEX_PATH), 'utf8'));
  const kits = catalog.entries.filter(e => e.number), index = catalog.index!;
  assert.equal(kits.length + index.length, listed.length);
  assert.deepEqual([...kits, ...index].map(e => e.number).sort((a, b) => a! - b!), listed.map((p: { number: number }) => p.number).sort((a: number, b: number) => a - b));
  assert.equal(new Set([...kits, ...index].map(e => e.id)).size, listed.length);
  for (const entry of index) {
    assert.ok(entry.indexOnly && !entry.visualizerPath && !entry.markdown && entry.id === `leetcode:${entry.number}`, `${entry.id} is index-only`);
    assert.ok(['Easy', 'Medium', 'Hard'].includes(entry.difficulty!) && entry.slug && typeof entry.premium === 'boolean', `${entry.id} metadata`);
    assert.ok([...catalog.topics, ...catalog.indexTopics!].includes(entry.topic), `${entry.id} topic ${entry.topic}`);
  }
  for (const entry of [...kits, ...index]) assert.ok(entry.methods!.length >= 1 && entry.methods!.length <= MAX_METHODS, `${entry.id} methods`);
  // Study kits keep their curated topic, techniques and content.
  assert.ok(kits.every(e => !e.indexOnly && e.visualizerPath && e.solutionTechniques?.length));
});
test('each method ladder lists its problems once, from easiest to hardest', async () => {
  const { ladderOrder } = await import('../scripts/content.mjs');
  const byId = new Map([...catalog.entries, ...catalog.index!].map(e => [e.id, e]));
  const members = new Map<string, string[]>();
  for (const entry of byId.values()) for (const key of entry.methods ?? []) members.set(key, [...(members.get(key) ?? []), entry.id]);
  assert.deepEqual(catalog.methods!.map(m => m.key).sort(), [...members.keys()].sort(), 'Every used method has a ladder and every ladder is used');
  for (const method of catalog.methods!) {
    assert.equal(new Set(method.ladder).size, method.ladder.length, `${method.key} has no duplicates`);
    assert.deepEqual([...method.ladder].sort(), [...members.get(method.key)!].sort(), `${method.key} lists exactly its problems`);
    const items = method.ladder.map(id => byId.get(id)!);
    assert.deepEqual(items, [...items].sort(ladderOrder), `${method.key} runs from easiest to hardest`);
  }
});
test('the index rejects unknown methods, missing methods and study kits it does not list', async () => {
  const { collectIndex, INDEX_PATH, METHODS_PATH } = await import('../scripts/content.mjs');
  const root = fs.mkdtempSync(path.join(ROOT, '.test-data', 'index-'));
  try {
    fs.mkdirSync(path.join(root, 'coding'));
    const listed = JSON.parse(fs.readFileSync(path.join(ROOT, INDEX_PATH), 'utf8')).filter((p: { number: number }) => p.number <= 3);
    const methods = JSON.parse(fs.readFileSync(path.join(ROOT, METHODS_PATH), 'utf8'));
    const write = (problems: unknown[], assigned: Record<string, string[]>) => {
      fs.writeFileSync(path.join(root, INDEX_PATH), JSON.stringify(problems));
      fs.writeFileSync(path.join(root, METHODS_PATH), JSON.stringify({ methods: methods.methods, problems: assigned }));
    };
    const kit = [{ number: 1, difficulty: 'Easy' }];
    const run = (entries: unknown[]) => { const errors: string[] = []; const result = collectIndex(root, entries, errors); return { errors, result }; };
    write(listed, { 1: ['hash-lookup'], 2: ['linked-list'], 3: ['sliding-window-variable'] });
    const ok = run(kit);
    assert.deepEqual(ok.errors, []);
    assert.deepEqual(ok.result!.index.map((e: { number: number }) => e.number), [2, 3]);
    write(listed, { 1: ['hash-lookup'], 2: ['no-such-method'], 3: [] });
    assert.deepEqual(run(kit).errors, ['Unknown solution method no-such-method for problem 2', 'Problem 3 needs 1 to 3 solution methods']);
    write(listed.slice(1), { 2: ['linked-list'], 3: ['sliding-window-variable'] });
    assert.deepEqual(run(kit).errors, [`Study kit 1 is missing from ${INDEX_PATH}`]);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
