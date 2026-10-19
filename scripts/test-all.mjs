// Runs every check and test suite that CI runs, overlapping the independent ones so a machine
// with many cores finishes far sooner. Generated files are written once up front, browser and
// Node suites share a page budget sized to the machine, and desktop suites run a few at a time,
// each in its own profile. A desktop suite that fails is retried alone so a clash between windows
// is reported as flaky instead of hiding or inventing a failure.
// Usage: node scripts/test-all.mjs [--serial] [--only=name,...] [--skip-desktop] [--jobs=N] [--desktop-jobs=N]
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { ROOT } from './content.mjs';
import { workers } from './workers.mjs';

const arg = name => process.argv.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
const serial = process.argv.includes('--serial'), skipDesktop = process.argv.includes('--skip-desktop');
const only = arg('only')?.split(',').filter(Boolean);
const budget = serial ? 1 : Number(arg('jobs')) || workers();
const desktopJobs = serial ? 1 : Number(arg('desktop-jobs')) || 2;
const node = file => [process.execPath, file], tsx = file => [process.execPath, 'node_modules/tsx/dist/cli.mjs', file];

// name, command, kind and weight: how many pages or processes it keeps busy. Suites that spread
// their own work receive their weight as STUDY_TEST_WORKERS.
const suites = [];
const add = (name, command, kind = 'browser', weight = 1, spreads = false) => suites.push({ name, command, kind, weight, spreads });
add('unit', [...tsx('--test'), ...fs.readdirSync(path.join(ROOT, 'tests')).filter(f => f.endsWith('.test.ts')).map(f => `tests/${f}`)], 'node', 4);
add('check:signatures', tsx('scripts/check-signatures.ts'), 'node');
add('check:native', tsx('scripts/check-native.ts'), 'node', 6, true);
add('check:solutions', tsx('scripts/check-solutions.ts'), 'node', 6, true);
add('check:code-maps', node('scripts/code-maps.mjs'), 'node');
add('check:debugger', [...tsx('scripts/check-debugger.ts'), '--full'], 'node');
for (const f of fs.readdirSync(path.join(ROOT, 'tests')).filter(f => /^windows-.*\.test\.(?:cjs|mjs)$/.test(f)).sort()) add(`ported/${f.replace(/\.test\.\w+$/, '')}`, node(`tests/${f}`), 'node');
add('test:visualizers', node('scripts/validate-visualizers.mjs'), 'browser', 6, true);
add('test:lessons', node('tests/lessons.mjs'), 'browser', 6, true);
for (const f of ['object-view-ui', 'object-view-visual', 'object-view-stacking', 'reference-objects', 'merge-k-object-state', 'object-view-locals', 'reference-object-locals', 'tree-object-identities', 'new-reference-objects', 'recursive-root-objects', 'subtree-bst-object-identities'])
  add(`objects/${f}`, node(`tests/${f}.mjs`), 'browser', f === 'reference-objects' ? 6 : 1, f === 'reference-objects');
add('test:layout', node('tests/reference-layout.mjs'));
add('test:panels', node('tests/panel-layout.mjs'));
add('test:motion', node('tests/pointer-motion.mjs'));
add('guided/guided', node('tests/guided.mjs'), 'browser', 6, true);
add('guided/controls', node('tests/guided-controls.mjs'));
add('guided/transitions', node('tests/guided-transitions.mjs'));
add('operations/operations', node('tests/operations.mjs'), 'browser', 6, true);
add('operations/playback', node('tests/operation-playback.mjs'));
add('test:code-languages', node('tests/code-languages.mjs'), 'browser', 6, true);
for (const f of ['reference-transitions', 'state-instructions', 'precomputed-instructions', 'numeric-inputs', 'precomputed-statements', 'additional-statements', 'setup-statements', 'dp-setup', 'tree-projections', 'cache-projections'])
  add(`instructions/${f}`, node(`tests/${f}.mjs`), 'browser', f === 'precomputed-instructions' ? 6 : 1, f === 'precomputed-instructions');
add('test:presets', node('tests/preset-instructions.mjs'), 'browser', 6, true);
add('permutation-history', node('tests/permutation-history.mjs'));
add('test:oracles', node('tests/state-oracles.mjs'), 'browser', 6, true);
add('test:inputs', node('tests/visualizer-inputs.mjs'));
add('test:playback', node('tests/playback.mjs'));
add('editor/tabout', node('tests/tabout.mjs'));
add('editor/focus', node('tests/editor-focus.mjs'));
add('test:typing', node('tests/typing.mjs'));
add('test:ladders', node('tests/method-ladders.mjs'));
add('check:kits', tsx('scripts/check-kits.ts'), 'node', 2);
add('test:kits', node('tests/generated-kits.mjs'));
for (const [name, f] of [['test:e2e', 'desktop'], ['restore-isolation', 'restore-isolation'], ['test:motion:desktop', 'pointer-motion'], ['test:objects:desktop', 'object-view'], ['test:objects:readability:desktop', 'object-view-readability'], ['test:layout:desktop', 'ui-layout'], ['test:panels:desktop', 'panel-layout'], ['test:coding', 'coding'], ['test:debugger', 'debugger'], ['test:guided:desktop', 'guided'], ['test:kits:desktop', 'kits']])
  add(name, node(`tests/${f}.e2e.mjs`), 'desktop');

const logs = path.join(ROOT, 'test-results/logs'), timingsFile = path.join(ROOT, 'test-results/timings.json');
fs.mkdirSync(logs, { recursive: true });
let timings = {};
try { timings = JSON.parse(fs.readFileSync(timingsFile, 'utf8')); } catch {}
const selected = suites.filter(s => (!only || only.some(o => s.name === o || s.name.startsWith(o + '/'))) && !(skipDesktop && s.kind === 'desktop'));
if (only && !selected.length) throw new Error(`No suite matches ${only.join(', ')}. Suites: ${suites.map(s => s.name).join(', ')}`);
const seconds = ms => (ms / 1000).toFixed(1) + 's';
const children = new Set();
process.on('SIGINT', () => { for (const child of children) spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F']); process.exit(130); });

// Build once and write every generated file before anything reads them.
const started = Date.now();
for (const [label, command] of [['build', 'npm run build'], ['check:content', 'npm run check:content'], ['guided data', 'node scripts/check-guided.mjs --build'], ['operation data', 'node scripts/check-operations.mjs --build']]) {
  const t = Date.now(), result = spawnSync(command, { cwd: ROOT, shell: true, encoding: 'utf8', maxBuffer: 1 << 28 });
  fs.writeFileSync(path.join(logs, `prepare-${label.replace(/\W+/g, '-')}.log`), (result.stdout ?? '') + (result.stderr ?? ''));
  if (result.status !== 0) { console.error(`${label} failed:\n${((result.stdout ?? '') + (result.stderr ?? '')).split('\n').slice(-40).join('\n')}`); process.exit(1); }
  console.log(`prepared ${label} in ${seconds(Date.now() - t)}`);
}

function run(suite, weight) {
  return new Promise(resolve => {
    const t = Date.now(), log = fs.createWriteStream(path.join(logs, `${suite.name.replace(/[^\w.-]+/g, '-')}.log`));
    const env = { ...process.env, STUDY_SKIP_GENERATE: '1', STUDY_TEST_WORKERS: String(Math.max(1, weight)) };
    const child = spawn(suite.command[0], suite.command.slice(1), { cwd: ROOT, env });
    children.add(child);
    let tail = '';
    const keep = chunk => { log.write(chunk); tail = (tail + chunk).slice(-6000); };
    child.stdout.on('data', keep); child.stderr.on('data', keep);
    // Nothing should take half an hour; a hung suite is stopped and reported.
    const timer = setTimeout(() => { keep('\n[test-all] stopped after 30 minutes\n'); spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F']); }, 30 * 60000);
    child.on('close', code => { clearTimeout(timer); children.delete(child); log.end(); resolve({ ok: code === 0, ms: Date.now() - t, tail }); });
  });
}

const results = new Map();
function report(suite, result, note = '') {
  results.set(suite.name, { ...result, note });
  console.log(`${result.ok ? 'pass' : 'FAIL'}  ${suite.name.padEnd(40)} ${seconds(result.ms).padStart(8)}${note ? '  ' + note : ''}`);
  if (!result.ok && !note.startsWith('retrying')) console.log(result.tail.split('\n').slice(-25).map(l => '      ' + l).join('\n'));
}

// --serial gives spreading suites the 4 workers they always had, for a fair baseline.
// Longest first, using the last run's timings, so the slowest suite never starts last.
async function pool(list, capacity, weightOf, onDone = () => {}) {
  const queue = [...list].sort((a, b) => (timings[b.name] ?? 60000) - (timings[a.name] ?? 60000)), running = new Set();
  let free = capacity;
  const finished = [];
  await new Promise(done => {
    const next = () => {
      if (!queue.length && !running.size) return done();
      for (let i = 0; i < queue.length && free > 0; i++) {
        const suite = queue[i], weight = Math.min(weightOf(suite), capacity);
        if (weight > free && running.size) continue;
        queue.splice(i--, 1); free -= weight; running.add(suite);
        run(suite, !suite.spreads ? 1 : serial ? 4 : weight).then(result => { free += weight; running.delete(suite); finished.push([suite, result]); onDone(suite, result); next(); });
      }
    };
    next();
  });
  return finished;
}

const quick = selected.filter(s => s.kind !== 'desktop'), desktop = selected.filter(s => s.kind === 'desktop');
console.log(`\n${quick.length} browser and Node suites with ${budget} pages at a time${desktop.length ? `, then ${desktop.length} desktop suites ${desktopJobs} at a time` : ''}.\n`);
await pool(quick, budget, s => serial ? 1 : s.weight, report);
for (const [suite, result] of await pool(desktop, desktopJobs, () => 1)) {
  if (result.ok || desktopJobs === 1) { report(suite, result); continue; }
  report(suite, result, 'retrying alone');
  const again = await run(suite, 1);
  report(suite, again.ok ? { ...again, ok: true } : again, again.ok ? 'FLAKY: failed beside another desktop suite, passed alone' : 'failed again alone');
}

const wall = Date.now() - started, sum = [...results.values()].reduce((n, r) => n + r.ms, 0);
for (const [name, r] of results) timings[name] = r.ms;
fs.writeFileSync(timingsFile, JSON.stringify(timings, null, 2));
const failed = [...results].filter(([, r]) => !r.ok), flaky = [...results].filter(([, r]) => r.note.startsWith('FLAKY'));
console.log(`\n${results.size - failed.length}/${results.size} suites passed in ${seconds(wall)} (one at a time they took ${seconds(sum)}).`);
if (flaky.length) console.log(`Flaky beside other desktop suites: ${flaky.map(([n]) => n).join(', ')}`);
if (failed.length) { console.log(`Failed: ${failed.map(([n]) => n).join(', ')}\nLogs: test-results/logs`); process.exitCode = 1; }
