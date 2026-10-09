// Real Electron IPC + React cleanup + renderer reload. Hold delivery of a real
// judge result so native-dialog/driver timing cannot accidentally miss the race.
import { _electron as electron } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../scripts/content.mjs';
const problem = JSON.parse(fs.readFileSync(path.join(ROOT, 'coding/problems.json'), 'utf8')).find(p => p.number === 1);
const stamp = '2026-01-01T00:00:00.000Z';
const empty = () => ({ version: 3, progress: {}, sessions: [], drafts: {}, submissions: [], guided: {} });
const draft = source => ({ source, cases: '[]', updatedAt: stamp });
const restored = { ...empty(), progress: { 'leetcode:1': { status: 'not-started', bookmarked: true, needsReview: true, updatedAt: stamp } }, drafts: { 'leetcode:1': draft('// restored draft\n' + problem.reference) } };
fs.mkdirSync(path.join(ROOT, '.test-data'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'test-results'), { recursive: true });
const passed = [];
for (const scenario of ['UI restore', 'late Accepted', 'unmount Cancelled', 'file cancel', 'confirmation cancel', 'invalid backup', 'ordinary navigation']) {
  const directory = fs.mkdtempSync(path.join(ROOT, '.test-data/restore-isolation-'));
  const file = path.join(directory, 'study-data.json'), backup = path.join(directory, 'incoming.json');
  const oldSource = '// old pending source\n' + problem.reference;
  fs.writeFileSync(file, JSON.stringify({ ...empty(), drafts: { 'leetcode:1': draft(oldSource) } }));
  fs.writeFileSync(backup, scenario === 'invalid backup' ? '{invalid JSON' : JSON.stringify(restored));
  const priorArchive = `${file}.before-import-prior.json`, priorBytes = 'previous archive sentinel\n';
  fs.writeFileSync(priorArchive, priorBytes);
  const env = { ...process.env, STUDY_DATA_DIR: directory, STUDY_HEADLESS: '0' }; delete env.ELECTRON_RUN_AS_NODE;
  if (process.env.STUDY_TEST_EXE) env.PATH = `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`;
  const launch = () => electron.launch({ ...(process.env.STUDY_TEST_EXE ? { executablePath: process.env.STUDY_TEST_EXE, args: [] } : { args: [ROOT] }), env, timeout: 30000 });
  let app = await launch(), page = await app.firstWindow(); page.setDefaultTimeout(20000);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  try {
    await page.locator('.problem-table').waitFor();
    await page.evaluate(() => {
      const OriginalWorker = window.Worker, schedule = window.setTimeout;
      const watchdogs = new Set();
      // The real judge must finish within its normal limits. Once its Accepted
      // result is held, stop the UI's case/job delivery watchdogs so slow native
      // driver round-trips cannot turn this into an unrelated timeout test.
      window.setTimeout = (callback, delay, ...args) => {
        const id = schedule(callback, delay, ...args);
        if (delay === 5500 || delay === 30000) watchdogs.add(id);
        return id;
      };
      window.__heldJudge = { results: [], release: () => {} };
      window.Worker = class extends OriginalWorker {
        constructor(...args) {
          super(...args);
          this.addEventListener('message', event => {
            if (event.data?.type !== 'result' || !event.data.result || !event.data.jobId || this.releasing) return;
            event.stopImmediatePropagation();
            for (const timer of watchdogs) clearTimeout(timer);
            watchdogs.clear(); window.setTimeout = schedule;
            window.__heldJudge.results.push({ worker: this, data: event.data });
          });
        }
      };
      window.__heldJudge.release = () => {
        for (const { worker, data } of window.__heldJudge.results.splice(0)) {
          worker.releasing = true; worker.dispatchEvent(new MessageEvent('message', { data }));
        }
      };
    });
    await page.getByRole('searchbox', { name: 'Search problems' }).fill('Two Sum');
    await page.getByRole('button', { name: 'Open Two Sum', exact: true }).click();
    await page.getByRole('tab', { name: 'Code', exact: true }).click(); await page.locator('.monaco-editor').waitFor();
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await page.waitForFunction(() => window.__heldJudge.results.length === 1);
    assert.equal(await page.evaluate(() => window.__heldJudge.results[0].data.result.verdict), 'Accepted');
    assert.ok(await page.getByRole('button', { name: 'Stop', exact: true }).isVisible());
    const before = await page.evaluate(() => window.study.bootstrap());
    const sessionId = before.data.sessions.at(-1).id;
    await app.evaluate(({ dialog }, { backup, scenario }) => {
      dialog.showOpenDialog = async () => ({ canceled: scenario === 'file cancel', filePaths: scenario === 'file cancel' ? [] : [backup] });
      dialog.showMessageBox = async () => ({ response: scenario === 'confirmation cancel' ? 0 : 1, checkboxChecked: false });
    }, { backup, scenario });
    if (scenario === 'UI restore') {
      await page.getByRole('button', { name: 'Settings and backup', exact: true }).click();
      await page.getByRole('button', { name: 'Restore backup', exact: true }).click();
      await page.getByText('Your backup was restored.', { exact: true }).waitFor();
      assert.equal(await page.evaluate(() => typeof window.__heldJudge), 'undefined', 'successful UI restore creates a fresh renderer document');
    } else if (scenario === 'late Accepted' || scenario === 'unmount Cancelled') {
      assert.equal(await page.evaluate(() => window.study.importBackup()), true);
      // Repeated reads must not grant the old document access to the new profile.
      await page.evaluate(() => window.study.bootstrap());
      if (scenario === 'late Accepted') {
        await page.evaluate(() => window.__heldJudge.release());
        await page.getByRole('alert').filter({ hasText: 'workspace was replaced' }).waitFor();
      } else {
        const rejection = page.waitForEvent('console', message => message.type() === 'error' && message.text().includes('workspace was replaced'));
        await page.getByRole('button', { name: 'Back to library', exact: true }).click(); await rejection;
      }
      assert.deepEqual((await page.evaluate(() => window.study.bootstrap())).data, restored);
      await page.reload(); await page.getByText('Your backup was restored.', { exact: true }).waitFor();
    } else if (scenario === 'ordinary navigation') {
      await page.getByRole('button', { name: 'Back to library', exact: true }).click();
      await page.waitForFunction(async () => (await window.study.bootstrap()).data.submissions.at(-1)?.result.verdict === 'Cancelled');
    } else {
      const outcome = await page.evaluate(async () => { try { return await window.study.importBackup(); } catch (error) { return String(error); } });
      if (scenario === 'invalid backup') assert.match(outcome, /JSON|position|property/i); else assert.equal(outcome, false);
      await page.evaluate(() => window.__heldJudge.release());
      await page.waitForFunction(async () => (await window.study.bootstrap()).data.submissions.at(-1)?.result.verdict === 'Accepted');
      const current = (await page.evaluate(() => window.study.bootstrap())).data;
      assert.equal(current.sessions.at(-1).id, sessionId); assert.equal(current.submissions.at(-1).source, oldSource);
      assert.equal(current.drafts['leetcode:1'].source, oldSource);
    }
    if (['UI restore', 'late Accepted', 'unmount Cancelled'].includes(scenario)) {
      await page.locator('.problem-table').waitFor();
      assert.deepEqual((await page.evaluate(() => window.study.bootstrap())).data, restored);
      assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), restored);
      // Exercise a fenced mutation from the fresh epoch-1 document without
      // changing the backup's contents, then verify those exact bytes at restart.
      assert.equal((await page.evaluate(() => window.study.selectProblem(null))).problemId, null);
      const archiveName = fs.readdirSync(directory).find(name => name.includes('.before-import-') && !name.endsWith('prior.json'));
      assert.ok(archiveName); const archived = JSON.parse(fs.readFileSync(path.join(directory, archiveName), 'utf8'));
      assert.equal(archived.drafts['leetcode:1'].source, oldSource); assert.equal(archived.sessions.at(-1).id, sessionId);
      assert.equal(archived.submissions.length, 0); assert.equal(archived.progress['leetcode:1'].status, 'in-progress');
      await app.close(); app = await launch(); page = await app.firstWindow(); page.setDefaultTimeout(20000); page.on('pageerror', error => errors.push(error.message));
      await page.locator('.problem-table').waitFor();
      assert.deepEqual((await page.evaluate(() => window.study.bootstrap())).data, restored);
      assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), restored);
      // The new renderer can still edit normally; the fence is not a permanent lock.
      await page.evaluate(() => window.study.setProgress('leetcode:1', { bookmarked: false }));
      assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).progress['leetcode:1'].bookmarked, false);
    }
    assert.equal(fs.readFileSync(priorArchive, 'utf8'), priorBytes); assert.deepEqual(errors, []);
    passed.push(scenario); console.log(`PASS restore isolation: ${scenario}`);
  } finally { await app.close(); }
}
fs.writeFileSync(path.join(ROOT, 'test-results/restore-isolation.json'), JSON.stringify({ passed: true, cases: passed }, null, 2));
