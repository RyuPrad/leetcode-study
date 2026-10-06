// Focused, dependency-free regressions for the selectively ported visualizer fixes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tests = fs.readdirSync(path.join(root, 'tests'))
  .filter(name => /^windows-.*\.test\.(?:cjs|mjs)$/.test(name)).sort();
if (!tests.length) throw new Error('No ported regression tests found.');
let failed = false;
for (const name of tests) {
  console.log(`\nRunning ${name}`);
  const result = spawnSync(process.execPath, [path.join(root, 'tests', name)], {
    cwd: root, stdio: 'inherit', timeout: 300000,
  });
  if (result.error || result.status !== 0) {
    failed = true;
    console.error(`${name} failed: ${result.error?.message || result.signal || result.status}`);
  }
}
process.exitCode = failed ? 1 : 0;
