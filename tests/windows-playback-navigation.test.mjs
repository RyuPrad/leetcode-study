// Dependency-free checks of the actual playback harness navigation statements.
// Real Chromium load events and playback remain covered by tests/playback.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const source = fs.readFileSync(new URL('./playback.mjs', import.meta.url), 'utf8');
const navigations = [...source.matchAll(/await page\.goto\([^;\n]+\);/g)].map(match => match[0]);
assert.equal(navigations.length, 4, 'Cover sweep, interactions, reopen and custom-input navigation.');
assert.equal((source.match(/page\.goto\(/g) || []).length, navigations.length, 'Every navigation is covered.');
const root = path.resolve('fixture');
const file = 'Graphs/verifying_an_alien_dictionary_visualizer.html';
const url = pathToFileURL(path.join(root, file)).href + '?walkthrough=compact';
const run = (statement, page) => new Function('page', 'pathToFileURL', 'path', 'ROOT', 'file', 'url',
  `return (async () => { ${statement} })();`)(page, pathToFileURL, path, root, file, url);

for (const [index, statement] of navigations.entries()) {
  test(`navigation ${index + 1} waits for full load with a finite Windows budget`, async () => {
    const calls = [];
    let release;
    const loaded = new Promise(resolve => { release = resolve; });
    const page = { async goto(actualUrl, options) {
      calls.push({ actualUrl, options });
      await loaded;
    } };
    let finished = false;
    const pending = run(statement, page).then(() => { finished = true; });
    await Promise.resolve();
    assert.equal(finished, false, 'Navigation must not finish before the requested load event.');
    assert.deepEqual(calls, [{ actualUrl: url, options: { waitUntil: 'load', timeout: 90000 } }]);
    release();
    await pending;
    assert.equal(finished, true);
  });

  test(`navigation ${index + 1} propagates a timeout without retries or fallback`, async () => {
    let attempts = 0;
    const failure = new Error('page.goto: Timeout 90000ms exceeded.');
    const page = { async goto() { attempts++; throw failure; } };
    await assert.rejects(run(statement, page), error => error === failure);
    assert.equal(attempts, 1, 'A real load failure must not be silently retried or skipped.');
  });
}

test('navigation headroom does not loosen assertions or operation timeouts', () => {
  assert.doesNotMatch(source, /setDefault(?:Navigation)?Timeout\(/, 'Only explicit navigations receive the larger budget.');
  assert.match(source, /assert\.deepEqual\(await page\.evaluate\(snapshot\), final, `\$\{file\}: full playback matches manual result`\)/);
  assert.match(source, /assert\.deepEqual\(errors, \[\], file\)/);
  assert.match(source, /if \(failures\.length\) \{ console\.error\(failures\.join\('\\n'\)\); process\.exitCode = 1; \}/);
});
