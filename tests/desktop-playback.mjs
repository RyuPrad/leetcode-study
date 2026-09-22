import assert from 'node:assert/strict';
import path from 'node:path';
import { ROOT } from '../scripts/content.mjs';

// Called with Two Sum open. Use real Electron focus and real iframe button clicks.
export async function testDesktopPlayback(app, page) {
  const frame = page.frameLocator('iframe');
  const child = () => page.frames().find(frame => frame.url().startsWith('study://content'));
  const state = () => child().evaluate(() => JSON.stringify({
    variables: document.querySelector('#console-ui').textContent,
    narration: document.querySelector('#narration-ui').textContent,
    active: [...document.querySelectorAll('.code-line.active')].map(el => el.id)
  }));
  const focus = () => app.evaluate(({ BrowserWindow }) => { const win = BrowserWindow.getAllWindows()[0]; win.restore(); win.show(); win.focus(); });
  const start = async () => {
    await frame.locator('#btn-reset').click();
    await frame.getByRole('button', { name: 'Play', exact: true }).click();
    assert.equal(await frame.locator('#study-play').getAttribute('aria-pressed'), 'true');
  };
  const assertStopped = async () => {
    await child().waitForFunction(() => document.getElementById('study-play').getAttribute('aria-pressed') === 'false');
    const stopped = await state();
    await page.waitForTimeout(350);
    assert.equal(await state(), stopped);
  };
  await focus();
  await start();
  await child().waitForFunction(() => !document.getElementById('btn-prev').disabled);
  await frame.getByRole('button', { name: 'Pause', exact: true }).click();
  const stopped = await state(); await page.waitForTimeout(1100); assert.equal(await state(), stopped);
  await frame.getByLabel('Playback speed', { exact: true }).selectOption('4');

  for (const tab of ['Notes', 'History']) {
    await start(); await page.getByRole('tab', { name: new RegExp(`^${tab}`) }).click();
    await assertStopped();
    await page.getByRole('tab', { name: 'Visualizer', exact: true }).click(); await assertStopped();
  }
  for (const name of ['Settings and backup', 'Add session reflection']) {
    await start(); await page.getByRole('button', { name, exact: true }).click();
    await assertStopped();
    await page.getByRole('button', { name: 'Close dialog', exact: true }).click(); await assertStopped();
  }
  await start();
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].minimize());
  await assertStopped(); await focus(); await assertStopped();
  await start();
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].blur());
  await assertStopped(); await focus(); await assertStopped();
  for (const [stop, resume] of [['suspend', 'resume'], ['lock-screen', 'unlock-screen']]) {
    await start();
    // Exercise the actual power-monitor listeners without suspending the test PC.
    await app.evaluate(({ powerMonitor }, name) => powerMonitor.emit(name), stop);
    await assertStopped();
    await app.evaluate(({ powerMonitor }, name) => powerMonitor.emit(name), resume);
    await assertStopped();
  }
  await start();
  await child().evaluate(() => {
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'study:pause' }, origin: 'https://example.invalid', source: parent }));
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'study:pause' }, origin: 'study://app', source: window }));
  });
  assert.equal(await frame.locator('#study-play').getAttribute('aria-pressed'), 'true', 'Untrusted pause messages are ignored');
  await frame.getByRole('button', { name: 'Pause', exact: true }).click();

  for (const zoom of [1, 1.25, 1.5]) {
    await app.evaluate(({ BrowserWindow }, zoom) => { const win = BrowserWindow.getAllWindows()[0]; win.setContentSize(1280, 800); win.webContents.setZoomFactor(zoom); }, zoom);
    await page.waitForTimeout(100);
    assert.ok(await frame.locator('#study-play').isVisible());
    assert.ok(await frame.locator('#study-speed').isVisible());
    assert.ok(await child().evaluate(() => {
      const toolbar = document.querySelector('.study-controls');
      return [toolbar, ...toolbar.querySelectorAll('button:not([hidden]),.study-speed')].filter(el => el.checkVisibility()).every(el => {
        const rect = el.getBoundingClientRect(); return rect.left >= 0 && rect.right <= innerWidth + 1;
      });
    }), `Playback toolbar fits at ${zoom * 100}%`);
  }
  await app.evaluate(({ BrowserWindow }) => { const win = BrowserWindow.getAllWindows()[0]; win.setContentSize(1440, 900); win.webContents.setZoomFactor(1); });
  await page.screenshot({ path: path.join(ROOT, 'test-results/playback-workspace.png') });
  await start();
  await page.getByRole('button', { name: 'Back to library', exact: true }).click();
  assert.equal(await page.locator('iframe').count(), 0);
  await page.getByRole('button', { name: 'Open Two Sum', exact: true }).click();
  assert.equal(await frame.getByLabel('Playback speed', { exact: true }).inputValue(), '1');
  await assertStopped();
  console.log('PASS desktop playback, view/dialog/focus/power pauses, message validation and toolbar scaling');
}
