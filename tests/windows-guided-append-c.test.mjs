// Run the append-only shard C Guided writer in disposable source copies, without dependencies
// or a browser. A synthetic trace stands in for a captured one, so these checks cover what the
// writer may change, not lesson quality.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const sourceOption = process.argv.indexOf('--source');
const root = sourceOption < 0 ? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  : path.resolve(process.argv[sourceOption + 1]);
const omitted = new Set(['.git', 'node_modules', 'dist', 'release', '.baseline', '.test-data', 'test-results', 'reports']);
const shardC = path.join('visualizer-ui', 'guided-content-c.json');
const retired = ['compile-guided-a.mjs', 'author-guided-a.mjs', 'author-guided-b.mjs', 'author-guided-b-late.mjs', 'legacy-guided-write-disabled.mjs'];

function snapshot(directory, relative = '') {
  return fs.readdirSync(path.join(directory, relative), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const name = path.join(relative, entry.name), file = path.join(directory, name);
    if (entry.isDirectory()) return [{ name, directory: true }, ...snapshot(directory, name)];
    const stat = fs.lstatSync(file, { bigint: true });
    return [{ name, modified: String(stat.mtimeNs), mode: String(stat.mode),
      sha256: createHash('sha256').update(entry.isSymbolicLink() ? fs.readlinkSync(file) : fs.readFileSync(file)).digest('hex') }];
  });
}

const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const numberOf = lesson => Number(lesson.id.split(':')[1]);

// The shape scripts/capture-guided-traces.mjs writes: the catalog entry, code rows, and states.
function syntheticTrace(spec, last) {
  const code = [{ line: 1, text: 'let total = 0;' }, { line: 2, text: 'for (const value of nums) {' },
    { line: 3, text: 'total += value;' }, { line: 4, text: 'return total;' }];
  const steps = Array.from({ length: last + 2 }, (_, index) => ({ index, phase: index ? 'run' : 'start',
    line: 1 + index % code.length, action: `Synthetic state ${index}.`, values: { nums: [1, 2, 3], total: index }, targets: [] }));
  return { ...spec, code, steps, finished: true };
}

async function fixture(t) {
  const directory = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'guided-append-c-')));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const repo = path.join(directory, 'repo');
  fs.cpSync(root, repo, { recursive: true, filter: source => !omitted.has(path.relative(root, source).split(path.sep)[0]) });
  const module = name => import(pathToFileURL(path.join(repo, 'scripts', name)).href);
  const { shardA, shardB, shardOf } = await module('guided-shards.mjs');
  const authored = new Map();
  (await module('author-guided-c.mjs')).authorAdded((number, intro, commonMistake, rows) => authored.set(number, { intro, commonMistake, rows }));
  const catalog = new Map(json(path.join(repo, 'visualizer-ui', 'lessons.json')).map(spec => [spec.number, spec]));

  // The last reviewed shard C lesson stands in for a newly added problem: its catalog entry and
  // authored rows are real, and only its Guided lesson is missing.
  const reviewed = json(path.join(repo, shardC)), added = numberOf(reviewed.at(-1)), existing = numberOf(reviewed[0]);
  assert.equal(shardOf(added), 'c');
  fs.writeFileSync(path.join(repo, shardC), JSON.stringify(reviewed.slice(0, -1), null, 2) + '\n');
  const shardAId = [...shardA].find(number => catalog.has(number)), shardBId = [...shardB].find(number => catalog.has(number));

  // Valid traces for the refused ids too, so only their shard or reviewed lesson can refuse them.
  const traces = path.join(repo, '.test-data', 'guided-authoring');
  fs.mkdirSync(traces, { recursive: true });
  const content = authored.get(added), trace = syntheticTrace(catalog.get(added), Math.max(...content.rows.map(row => row[0])));
  fs.writeFileSync(path.join(traces, `${added}.json`), JSON.stringify(trace));
  for (const number of [existing, shardAId, shardBId])
    fs.writeFileSync(path.join(traces, `${number}.json`), JSON.stringify(syntheticTrace(catalog.get(number), 120)));

  // The writer must not load the retired bulk writers, their guard, or their authoring records.
  const marker = path.join(directory, 'retired-module-executed');
  for (const name of retired) fs.writeFileSync(path.join(repo, 'scripts', name),
    `import fs from 'node:fs';\nfs.writeFileSync(${JSON.stringify(marker)}, ${JSON.stringify(name)});\nthrow Error('RETIRED_MODULE_EXECUTED');\n`);
  // A decoy shard in an unrelated working directory must not be the write target.
  const elsewhere = path.join(directory, 'elsewhere');
  fs.mkdirSync(path.join(elsewhere, 'visualizer-ui'), { recursive: true });
  fs.writeFileSync(path.join(elsewhere, shardC), 'cwd shard C sentinel\n');
  return { directory, repo, elsewhere, marker, added, existing, shardAId, shardBId, spec: catalog.get(added), content, trace };
}

function run(files, args, cwd = files.repo) {
  const result = spawnSync(process.execPath, [path.join(files.repo, 'scripts', 'add-guided-c.mjs'), ...args.map(String)], {
    cwd, encoding: 'utf8', timeout: 20000,
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null, 'The writer must finish normally, not time out or crash');
  return result;
}

// Refusals leave the tree as it was, so one baseline serves until a test changes the fixture.
function refuseUnchanged(files, args, reasons, cwd) {
  const before = files.baseline ??= snapshot(files.directory);
  const result = run(files, args, cwd);
  assert.equal(result.status, 1, 'Every refused request must fail');
  assert.equal(result.stdout, '', 'No success or partial-write message');
  assert.match(result.stderr, /^Refused; no Guided content was written\./);
  for (const reason of reasons) assert.match(result.stderr, reason);
  assert.doesNotMatch(result.stderr, /RETIRED_MODULE_EXECUTED|\n\s+at /, 'A refusal is a reported decision, not a crash');
  assert.deepEqual(snapshot(files.directory), before, 'No source, shard, trace, or cwd file may be created, removed, rewritten, or touched');
}

test('add-guided-c.mjs appends exactly the requested lesson at version 1', async t => {
  const files = await fixture(t);
  const shard = path.join(files.repo, shardC), beforeText = fs.readFileSync(shard, 'utf8'), before = snapshot(files.directory);
  const result = run(files, [files.added], files.elsewhere);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  assert.match(result.stdout, new RegExp(`^Appended 1 Guided lesson at version 1 to visualizer-ui/guided-content-c\\.json: leetcode:${files.added}\\.`));

  const others = entries => entries.filter(entry => entry.name !== path.join('repo', shardC));
  assert.deepEqual(others(snapshot(files.directory)), others(before),
    'Only shard C changes: no other source, shard, trace, temporary, retired-writer marker, or cwd file');
  const afterText = fs.readFileSync(shard, 'utf8');
  assert.ok(afterText.startsWith(beforeText.slice(0, beforeText.lastIndexOf('\n]')) + ',\n'), 'Every existing lesson keeps its exact bytes');
  const lessons = JSON.parse(afterText), lesson = lessons.at(-1);
  assert.deepEqual(lessons.slice(0, -1), JSON.parse(beforeText));
  assert.equal(afterText, JSON.stringify(lessons, null, 2) + '\n', 'The appended shard keeps the checked-in layout');

  // The one new lesson is bound from the authored rows, catalog entry, and trace of the request.
  const { spec, content, trace } = files;
  assert.deepEqual({ id: lesson.id, version: lesson.version, caseId: lesson.caseId, title: lesson.title, intro: lesson.intro,
    recap: lesson.recap, commonMistake: lesson.commonMistake, expectedInput: lesson.expectedInput },
  { id: spec.id, version: 1, caseId: 'guided-default', title: spec.title, intro: content.intro,
    recap: spec.why, commonMistake: content.commonMistake, expectedInput: trace.steps[0].values });
  assert.deepEqual(lesson.checkpoints.map(checkpoint => ({ id: checkpoint.id, beforeIndex: checkpoint.beforeIndex, afterIndex: checkpoint.afterIndex,
    prompt: checkpoint.prompt, answer: checkpoint.options.find(option => option.id === checkpoint.correctOptionId).text,
    choices: checkpoint.options.map(option => option.text).sort(), hints: checkpoint.hints,
    explanation: checkpoint.explanation, before: checkpoint.before[1], after: checkpoint.after[1] })),
  content.rows.map(([afterIndex, prompt, answer, wrong1, wrong2, hint1, hint2], index) => ({ id: ['decision', 'change', 'result'][index],
    beforeIndex: afterIndex - 1, afterIndex, prompt, answer, choices: [answer, wrong1.split('~')[0], wrong2.split('~')[0]].sort(),
    hints: [hint1, hint2], explanation: `Synthetic state ${afterIndex}. ${spec.why}`,
    before: { path: 'line', value: trace.steps[afterIndex - 1].line }, after: { path: 'line', value: trace.steps[afterIndex].line } })));

  // The extended shards pass the build's Guided contract, covering every visualizer exactly once.
  const { checkGuided } = await import(pathToFileURL(path.join(files.repo, 'scripts', 'check-guided.mjs')).href);
  assert.ok(checkGuided(files.repo).some(checked => checked.id === spec.id));

  await t.test('the appended lesson is then refused like any reviewed lesson', () =>
    refuseUnchanged(files, [files.added], [new RegExp(`${files.added} already has a reviewed lesson in visualizer-ui/guided-content-c\\.json`)]));
  assert.equal(fs.existsSync(files.marker), false);
  assert.equal(fs.readFileSync(path.join(files.elsewhere, shardC), 'utf8'), 'cwd shard C sentinel\n');
});

test('add-guided-c.mjs refuses reviewed, shard A/B, and malformed requests without changing a byte', async t => {
  const files = await fixture(t);
  const { added, existing, shardAId, shardBId } = files;
  const present = number => new RegExp(`${number} already has a reviewed lesson in visualizer-ui/guided-content-c\\.json; revise it in place`);
  const assigned = (number, shard) => new RegExp(`${number} is assigned to shard ${shard} by scripts/guided-shards\\.mjs`);
  const cases = [
    ['reviewed shard C lesson', [existing], [present(existing)]],
    ['shard A id', [shardAId], [assigned(shardAId, 'A')]],
    ['shard B id', [shardBId], [assigned(shardBId, 'B')]],
    ['new lesson with a reviewed one', [added, existing], [present(existing)]],
    ['new lesson between A and B ids', [shardAId, added, shardBId], [assigned(shardAId, 'A'), assigned(shardBId, 'B')]],
    ['repeated id', [added, added], [/may be requested once/]],
    ['no ids', [], [/Usage: node scripts\/add-guided-c\.mjs <problem number>/]],
    ['force-like flag', ['--force', added], [/Expected problem numbers only, got "--force"/]],
    ['output override', ['--output', shardC.replace(/\\/g, '/'), added], [/Expected problem numbers only/]],
    ['malformed ids', ['0', '1e3', '-5', `${added}.0`], [/Expected problem numbers only/]],
    ['id without a visualizer', [99999], [/99999 has no visualizer entry/]],
  ];
  for (const [name, args, reasons] of cases) await t.test(name, () => refuseUnchanged(files, args, reasons));
  await t.test('unrelated working directory', () => refuseUnchanged(files, [shardAId], [assigned(shardAId, 'A')], files.elsewhere));
  await t.test('missing trace', () => {
    fs.rmSync(path.join(files.repo, '.test-data', 'guided-authoring', `${added}.json`));
    files.baseline = undefined;
    refuseUnchanged(files, [added], [new RegExp(`${added} has no reference trace at \\.test-data/guided-authoring/${added}\\.json`)]);
  });
  for (const shard of ['a', 'b']) {
    const name = path.join('visualizer-ui', `guided-content-${shard}.json`);
    assert.deepEqual(fs.readFileSync(path.join(files.repo, name)), fs.readFileSync(path.join(root, name)));
  }
  assert.equal(fs.existsSync(files.marker), false);
});
