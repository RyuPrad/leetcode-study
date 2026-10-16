// Run the real CLI entrypoints in disposable source copies, without dependencies
// or a browser. These checks cover tooling safety, not Guided UI behavior.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const sourceOption = process.argv.indexOf('--source');
const root = sourceOption < 0 ? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  : path.resolve(process.argv[sourceOption + 1]);
const writers = ['compile-guided-a.mjs', 'author-guided-b.mjs'];
const omitted = new Set(['.git', 'node_modules', 'dist', 'release', '.baseline', '.test-data', 'test-results', 'reports']);

function snapshot(directory, relative = '') {
  return fs.readdirSync(path.join(directory, relative), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const name = path.join(relative, entry.name), file = path.join(directory, name);
    if (entry.isDirectory()) return [{ name, directory: true }, ...snapshot(directory, name)];
    const stat = fs.lstatSync(file, { bigint: true });
    return [{ name, modified: String(stat.mtimeNs), mode: String(stat.mode),
      sha256: createHash('sha256').update(entry.isSymbolicLink() ? fs.readlinkSync(file) : fs.readFileSync(file)).digest('hex') }];
  });
}

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'guided-writer-safety-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const repo = path.join(directory, 'repo');
  fs.cpSync(root, repo, { recursive: true, filter: source => !omitted.has(path.relative(root, source).split(path.sep)[0]) });
  const traces = path.join(repo, '.test-data', 'guided-authoring');
  fs.mkdirSync(traces, { recursive: true });
  // A retired writer must refuse before attempting to consume any trace.
  fs.writeFileSync(path.join(traces, '235.json'), 'invalid legacy trace\n');
  const elsewhere = path.join(directory, 'elsewhere');
  fs.mkdirSync(path.join(elsewhere, 'visualizer-ui'), { recursive: true });
  fs.writeFileSync(path.join(elsewhere, 'visualizer-ui', 'guided-content-a.json'), 'cwd shard A sentinel\n');
  fs.writeFileSync(path.join(elsewhere, 'visualizer-ui', 'guided-content-b.json'), 'cwd shard B sentinel\n');
  return { directory, repo, elsewhere };
}

function refuseUnchanged(writer, args, cwd, files) {
  const before = snapshot(files.directory);
  const result = spawnSync(process.execPath, [path.join(files.repo, 'scripts', writer), ...args], {
    cwd, encoding: 'utf8', timeout: 10000,
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null, 'The guard must fail normally, not time out or crash');
  assert.equal(result.status, 1, 'Every legacy invocation must fail closed');
  assert.equal(result.stdout, '', 'No writer success or partial-validation message');
  assert.match(result.stderr, /Legacy Guided bulk writing is disabled/);
  assert.match(result.stderr, /increment that lesson version/);
  assert.match(result.stderr, /npm run check:guided and npm run test:guided/);
  assert.match(result.stderr, /Maintaining Guided content/);
  assert.doesNotMatch(result.stderr, /ENOENT|SyntaxError|Missing authored lesson|HISTORICAL_MODULE_EXECUTED/);
  assert.deepEqual(snapshot(files.directory), before, 'No source, shard, trace, or cwd file may be created, removed, rewritten, or touched');
}

for (const writer of writers) {
  test(`${writer}: default, legacy, malformed, and override-like arguments cannot write`, async t => {
    const files = fixture(t);
    const cases = [
      ['default', []],
      ['legacy partial validation', ['--validate-partial']],
      ['help', ['--help']],
      ['force-like flag', ['--force']],
      ['missing output value', ['--output']],
      ['canonical output target', ['--output', 'visualizer-ui/guided-content-a.json']],
      ['malformed selection', ['--lesson', 'not-a-number']],
      ['positional selection', ['235', '437', '785']],
      ['unexpected arguments', ['--', '--validate-partial', '{invalid-json']],
    ];
    for (const [name, args] of cases) await t.test(name, () => refuseUnchanged(writer, args, files.repo, files));
    await t.test('unrelated working directory', () => refuseUnchanged(writer, [], files.elsewhere, files));
    for (const shard of ['a', 'b']) {
      const name = `visualizer-ui/guided-content-${shard}.json`;
      assert.deepEqual(fs.readFileSync(path.join(files.repo, name)), fs.readFileSync(path.join(root, name)),
        'Every current entry, checkpoint, loader, and version is preserved byte-for-byte');
    }
  });

  test(`${writer}: missing and malformed authoring inputs still reach the guard first`, t => {
    const files = fixture(t);
    fs.writeFileSync(path.join(files.repo, 'visualizer-ui', 'lessons.json'), '{malformed catalog');
    refuseUnchanged(writer, [], files.repo, files);
    fs.rmSync(path.join(files.repo, 'visualizer-ui'), { recursive: true });
    fs.rmSync(path.join(files.repo, '.test-data'), { recursive: true });
    refuseUnchanged(writer, ['--validate-partial'], files.repo, files);
  });

  test(`${writer}: historical authoring dependencies never execute`, t => {
    const files = fixture(t);
    const marker = path.join(files.repo, 'historical-module-executed');
    const sideEffect = `import fs from 'node:fs';\nfs.writeFileSync(${JSON.stringify(marker)}, 'unsafe');\nthrow Error('HISTORICAL_MODULE_EXECUTED');\n`;
    fs.writeFileSync(path.join(files.repo, 'scripts', 'author-guided-a.mjs'), sideEffect + 'export const authored = new Map();\n');
    fs.writeFileSync(path.join(files.repo, 'scripts', 'author-guided-b-late.mjs'), sideEffect + 'export function authorLate() {}\n');
    refuseUnchanged(writer, [], files.repo, files);
    assert.equal(fs.existsSync(marker), false);
  });
}
