// Dependency-free catalog/schema regressions. Native layout is covered by ui-layout.e2e.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildContent, collectCatalog, TOPICS, validateSolutionTechniques } from '../scripts/content.mjs';

const methods = [
  { name: 'Boundary binary search', kind: 'algorithm', role: 'Narrows the first and last matching positions independently.' },
  { name: 'Candidate tracking', kind: 'technique', role: 'Keeps a matching index while continuing toward the requested boundary.' },
  { name: 'Hash map', kind: 'data-structure', role: 'Fixture-only structure to exercise all supported metadata kinds.' },
];
const valid = () => ({ 'leetcode:34': structuredClone(methods) });

test('solution metadata keeps every named method and its implementation role', () => {
  assert.deepEqual(validateSolutionTechniques(valid(), ['leetcode:34']), valid());
  const spaced = valid(); spaced['leetcode:34'][0].name = ' Boundary binary search ';
  assert.equal(validateSolutionTechniques(spaced, ['leetcode:34'])['leetcode:34'][0].name, methods[0].name);
});

test('metadata requires exact problem coverage and nonempty method lists', () => {
  for (const value of [null, [], 'invalid', 1]) assert.throws(() => validateSolutionTechniques(value, ['leetcode:34']), /object keyed by problem ID/);
  assert.throws(() => validateSolutionTechniques({}, ['leetcode:34']), /Missing solution techniques for leetcode:34/);
  assert.throws(() => validateSolutionTechniques({ ...valid(), 'leetcode:999999': methods }, ['leetcode:34']), /Unknown solution techniques problem ID/);
  assert.throws(() => validateSolutionTechniques({ ...valid(), 'reference:cheatsheet': methods }, ['leetcode:34']), /Unknown solution techniques problem ID/);
  for (const value of [[], {}, null, 'binary search']) assert.throws(() => validateSolutionTechniques({ 'leetcode:34': value }, ['leetcode:34']), /nonempty array/);
});

test('schema rejects malformed methods, unsupported kinds, and duplicate names', () => {
  for (const method of [null, [], 'binary search', 1]) assert.throws(() => validateSolutionTechniques({ 'leetcode:34': [method] }, ['leetcode:34']), /Invalid leetcode:34 solution technique/);
  for (const name of ['', '  ', 1, null]) assert.throws(() => validateSolutionTechniques({ 'leetcode:34': [{ ...methods[0], name }] }, ['leetcode:34']), /Missing name/);
  for (const role of ['', '  ', 1, null]) assert.throws(() => validateSolutionTechniques({ 'leetcode:34': [{ ...methods[0], role }] }, ['leetcode:34']), /Missing role/);
  for (const kind of ['', 'sorting', 'Algorithm', 1, null]) assert.throws(() => validateSolutionTechniques({ 'leetcode:34': [{ ...methods[0], kind }] }, ['leetcode:34']), /Invalid kind/);
  assert.throws(() => validateSolutionTechniques({ 'leetcode:34': [{ ...methods[0], typo: true }] }, ['leetcode:34']), /Unexpected field/);
  assert.throws(() => validateSolutionTechniques({ 'leetcode:34': [methods[0], { ...methods[0], name: ' BOUNDARY BINARY SEARCH ', kind: 'technique' }] }, ['leetcode:34']), /Duplicate solution technique/);
});

function fixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'study-solution-techniques-'));
  try {
    for (const topic of TOPICS) fs.mkdirSync(path.join(root, topic));
    fs.mkdirSync(path.join(root, 'visualizer-ui'));
    fs.writeFileSync(path.join(root, 'Binary Search/34. Find First and Last Position.md'), '# Find matching positions\nA fixture note.');
    for (const name of ['Leetcode Cheatsheet.md', 'Variable Naming Guide.md']) fs.writeFileSync(path.join(root, name), '# Reference guide');
    const filename = path.join(root, 'visualizer-ui/solution-techniques.json');
    fs.writeFileSync(filename, JSON.stringify(valid()));
    run(root, filename);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test('catalog includes searchable names and roles, while reference guides stay exempt', () => fixture(root => {
  const catalog = collectCatalog(root), problem = catalog.entries.find(entry => entry.number === 34);
  assert.deepEqual(problem.solutionTechniques, methods);
  for (const method of methods) {
    assert.ok(problem.searchText.includes(method.name.toLowerCase()));
    assert.ok(problem.searchText.includes(method.role.toLowerCase()));
  }
  const terms = '34 BOUNDARY candidate independently'.toLowerCase().split(/\s+/);
  assert.deepEqual(catalog.entries.filter(entry => terms.every(term => entry.searchText.includes(term))).map(entry => entry.id), ['leetcode:34']);
  assert.equal(catalog.entries.filter(entry => !entry.number).length, 2);
  assert.ok(catalog.entries.filter(entry => !entry.number).every(entry => !Object.hasOwn(entry, 'solutionTechniques')));
}));

test('offline content build bundles the curated metadata and fails on incomplete coverage', () => fixture((root, filename) => {
  const catalog = buildContent(root);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'dist/content/catalog.json'), 'utf8')), catalog);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'dist/content/visualizer-ui/solution-techniques.json'), 'utf8')), valid());
  fs.writeFileSync(filename, '{}');
  assert.throws(() => buildContent(root), /Missing solution techniques for leetcode:34/);
  fs.writeFileSync(filename, '{broken');
  assert.throws(() => collectCatalog(root), /solution-techniques\.json/);
  fs.rmSync(filename);
  assert.throws(() => collectCatalog(root), /solution-techniques\.json/);
}));

test('every real bundled problem has validated algorithms/techniques, all searchable offline', () => {
  const catalog = collectCatalog();
  const problems = catalog.entries.filter(entry => entry.number);
  assert.equal(problems.length, 254);
  for (const entry of problems) {
    assert.ok(entry.solutionTechniques.length > 0, entry.id);
    for (const method of entry.solutionTechniques) {
      assert.ok(entry.searchText.includes(method.name.toLowerCase()), `${entry.id}: ${method.name}`);
      assert.ok(entry.searchText.includes(method.role.toLowerCase()), `${entry.id}: ${method.role}`);
    }
  }
});
