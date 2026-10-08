import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { collectCatalog, ROOT } from '../scripts/content.mjs';
import { assetPath } from '../desktop/protocol';
import type { Catalog } from '../shared/types';
const catalog = collectCatalog() as Catalog;
test('every problem is catalogued with a stable ID and portable visualizer reference', () => {
  assert.equal(catalog.entries.filter(e => e.number).length, 253); assert.equal(catalog.visualizers.length, 253); assert.equal(new Set(catalog.entries.map(e => e.id)).size, 255);
  for (const entry of catalog.entries) { assert.ok(!entry.markdown.includes('<iframe')); if (entry.number) assert.equal(entry.id, `leetcode:${entry.number}`); if (entry.visualizerPath) { const source = fs.readFileSync(path.join(ROOT, entry.notePath), 'utf8'); assert.ok(!source.includes('file:///')); assert.ok(fs.readFileSync(path.join(ROOT, entry.visualizerPath), 'utf8').includes('../visualizer-ui/workspace.js')); } }
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
