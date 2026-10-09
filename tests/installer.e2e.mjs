// Run after a silent install into .test-data/installed-app. --seed initializes a test profile;
// a subsequent run verifies that reinstalling/upgrading preserved that profile.
import { _electron as electron } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { ROOT } from '../scripts/content.mjs';
import { testDesktopPlayback } from './desktop-playback.mjs';
const seed = process.argv.includes('--seed');
const expectedVersion = process.env.STUDY_EXPECT_VERSION || JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
const env = { ...process.env, STUDY_DATA_DIR: path.join(ROOT, '.test-data/installed-profile'), STUDY_HEADLESS: '0', PATH: `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}` };
delete env.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({ executablePath: path.join(ROOT, '.test-data/installed-app/LeetCode Study.exe'), args: [], env, timeout: 30000 });
try {
  const page = await app.firstWindow(); page.setDefaultTimeout(15000);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.waitForSelector('.problem-table');
  assert.ok(await app.evaluate(({ app }) => app.isPackaged));
  assert.equal(await app.evaluate(({ app }) => app.getVersion()), expectedVersion);
  const { catalog, data } = await page.evaluate(() => window.study.bootstrap());
  assert.equal(catalog.visualizers.length, 255);
  await app.evaluate(({ session }) => session.defaultSession.enableNetworkEmulation({ offline: true }));
  if (seed) {
    await page.getByRole('button', { name: 'Open Two Sum', exact: true }).click();
    await page.evaluate(() => window.study.setProgress('leetcode:1', { status: 'completed', bookmarked: true, needsReview: true }));
    const state = await page.evaluate(() => window.study.bootstrap());
    await page.evaluate(id => window.study.editSession(id, { durationMs: 420000, outcome: 'solved', reflection: 'Installer retention check.' }), state.data.sessions[0].id);
    const frame = page.frames().find(frame => frame.url().startsWith('study://content'));
    let count = 0;
    for (const file of catalog.visualizers) {
      await frame.goto(`study://content/${file.split('/').map(encodeURIComponent).join('/')}?embedded=1`, { waitUntil: 'load' });
      await frame.locator('.study-workspace').waitFor();
      await frame.locator('#btn-next').evaluate(button => button.click());
      assert.equal(await frame.evaluate(() => typeof window.study), 'undefined');
      if (++count % 50 === 0) console.log(`Installed offline content: ${count}/${catalog.visualizers.length}`);
    }
    assert.deepEqual(errors, []);
    console.log('PASS installed app launches with no Node/Git on PATH and all 255 packaged visualizers work offline');
  } else {
    assert.equal(data.progress['leetcode:1'].status, 'completed');
    assert.ok(data.progress['leetcode:1'].bookmarked);
    assert.equal(data.sessions[0].reflection, 'Installer retention check.');
    assert.ok(data.sessions[0].durationMs >= 420000);
    await page.getByRole('button', { name: 'Open Two Sum', exact: true }).click();
    await testDesktopPlayback(app, page);
    console.log('PASS reinstall preserves progress, bookmarks and practice history');
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(ROOT, `test-results/installer-${expectedVersion}-${seed ? 'first-run' : 'reinstall'}.json`), JSON.stringify({ passed: true, version: expectedVersion, packaged: true, offline: true, count: seed ? catalog.visualizers.length : undefined }, null, 2));
} finally { await app.close(); }
