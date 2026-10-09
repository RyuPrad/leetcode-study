import { app, BrowserWindow, dialog, ipcMain, Menu, powerMonitor, protocol, session, shell } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import type { Catalog } from '../shared/types';
import { StudyStore, validateData } from './store';
import { StudyTracker } from './tracker';
import { assetPath, rendererPolicy, contentPolicy } from './protocol';
import type { CodeDraft } from '../shared/coding';
import { validateDraft } from './coding-data';
import type { GuidedLessonIdentity } from '../shared/guided';
import { validateCurrentGuidedProgress } from './guided-data';

app.setName('LeetCode Study');
if (process.env.STUDY_DATA_DIR) app.setPath('userData', path.resolve(process.env.STUDY_DATA_DIR));
protocol.registerSchemesAsPrivileged([{ scheme: 'study', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);
let win: BrowserWindow;
let store: StudyStore;
let tracker: StudyTracker;
// A renderer document belongs to one profile. Restoring retires that document's
// writes before any late runner, editor, Guided, or navigation callback can land.
let profileEpoch = 0;
function assertProfile(epoch: unknown) {
  if (epoch !== profileEpoch) throw new Error('This workspace was replaced by a restored backup. Reopen the workspace to continue.');
}
let heartbeat: ReturnType<typeof setInterval> | undefined;
let draftTimer: ReturnType<typeof setTimeout> | undefined;
let pendingDrafts: Record<string,CodeDraft> = {};
let draftWaiters: {resolve:()=>void;reject:(error:unknown)=>void}[] = [];
function flushDrafts() {
  clearTimeout(draftTimer);
  if(!Object.keys(pendingDrafts).length)return;
  const waiters=draftWaiters;
  try { store.saveDrafts(pendingDrafts); pendingDrafts={}; draftWaiters=[]; waiters.forEach(w=>w.resolve()); sendData(); }
  catch(error) { draftWaiters=[]; waiters.forEach(w=>w.reject(error)); throw error; }
}
const root = path.resolve(__dirname, '..');
const devUrl = !app.isPackaged ? process.env.STUDY_DEV_URL : undefined;
const uiOrigin = devUrl || 'study://app';
function trusted(url: string) { try { const source = new URL(url), expected = new URL(uiOrigin); return source.protocol === expected.protocol && source.host === expected.host; } catch { return false; } }
function sendData() { if (win && !win.isDestroyed()) win.webContents.send('study:data', store.snapshot()); }
function sendTimer() { if (win && !win.isDestroyed()) win.webContents.send('study:timer', tracker.state()); }
function pausePlayback() { if (win && !win.isDestroyed()) win.webContents.send('study:pause-playback'); }
function report(error: unknown) { console.error(error); if (win && !win.isDestroyed()) win.webContents.send('study:error', error instanceof Error ? error.message : 'Unable to save study data.'); }
function safe(action: () => void) { try { action(); } catch (error) { report(error); } }
const hasLock = app.requestSingleInstanceLock();
if (!hasLock) app.quit();
else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } });
  app.whenReady().then(async () => {
    const catalog: Catalog = JSON.parse(fs.readFileSync(path.join(root, 'content/catalog.json'), 'utf8'));
    const guidedLessons = new Map((JSON.parse(fs.readFileSync(path.join(root, 'content/guided-lessons.json'), 'utf8')) as GuidedLessonIdentity[]).map(lesson => [lesson.id, lesson]));
    const problemIds = new Set(catalog.entries.filter(e => e.number).map(e => e.id));
    const assertProblem = (id: unknown) => { if (typeof id !== 'string' || !problemIds.has(id)) throw new Error('Unknown problem.'); };
    store = new StudyStore(app.getPath('userData'));
    tracker = new StudyTracker(store);
    protocol.handle('study', request => {
      const file = assetPath(request.url, root, catalog);
      if (!file || request.method !== 'GET') return new Response('Not found', { status: 404 });
      const mime: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.wasm':'application/wasm', '.ttf':'font/ttf' };
      try {
        return new Response(new Uint8Array(fs.readFileSync(file)), { headers: { 'content-type': mime[path.extname(file)] || 'application/octet-stream', 'Content-Security-Policy': new URL(request.url).hostname === 'app' ? rendererPolicy : contentPolicy, 'X-Content-Type-Options': 'nosniff' } });
      } catch { return new Response('Not found', { status: 404 }); }
    });
    session.defaultSession.setPermissionRequestHandler((_contents, permission, callback) => callback(permission === 'fullscreen'));
    session.defaultSession.setPermissionCheckHandler((_contents, permission, requestingOrigin) => permission === 'fullscreen' && requestingOrigin.startsWith('study://content'));
    session.defaultSession.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*', 'file://*/*', 'ws://*/*', 'wss://*/*'] }, (details, callback) => {
      const allowed = devUrl && (details.url.startsWith(`${devUrl}/`) || details.url.startsWith(devUrl.replace('http:', 'ws:')));
      callback({ cancel: !allowed });
    });
    win = new BrowserWindow({ width: 1480, height: 940, minWidth: 1024, minHeight: 720, show: false, backgroundColor: '#10141c', title: 'LeetCode Study', icon: path.join(root, 'icon.png'), webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false, webviewTag: false, backgroundThrottling: process.env.STUDY_HEADLESS !== '1' } });
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      { label: 'File', submenu: [{ role: 'close' }] },
      { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
      { label: 'View', submenu: [{ role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }, ...(!app.isPackaged ? [{ role: 'toggleDevTools' as const }] : [])] }
    ]));
    win.setMenuBarVisibility(false);
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    win.webContents.on('will-navigate', (event, url) => { if (!trusted(url)) event.preventDefault(); });
    win.webContents.on('will-attach-webview', event => event.preventDefault());
    win.on('focus', () => safe(() => { tracker.setFocused(true); sendTimer(); }));
    win.on('blur', () => { pausePlayback(); safe(() => { tracker.setFocused(false); sendTimer(); }); });
    win.on('minimize', () => { pausePlayback(); safe(() => { tracker.setFocused(false); sendTimer(); }); });
    win.on('close', event => {
      try { flushDrafts(); tracker.end(); } catch (error) { event.preventDefault(); report(error); dialog.showMessageBox(win, { type: 'error', message: 'Your latest study data could not be saved.', detail: 'Free some disk space or export a backup, then try closing again.' }); }
    });
    const suspend = () => { pausePlayback(); safe(() => { tracker.setSuspended(true); sendTimer(); }); };
    const resume = () => safe(() => { tracker.setSuspended(false); tracker.setFocused(win.isFocused()); sendTimer(); });
    powerMonitor.on('suspend', suspend); powerMonitor.on('lock-screen', suspend);
    powerMonitor.on('resume', resume); powerMonitor.on('unlock-screen', resume);
    function handle(channel: string, fn: (...args: any[]) => unknown) {
      ipcMain.handle(channel, async (event, ...args) => {
        if (event.sender !== win.webContents || event.senderFrame !== win.webContents.mainFrame || !trusted(event.senderFrame.url)) throw new Error('Untrusted request.');
        return fn(...args);
      });
    }
    function handleProfile(channel: string, fn: (...args: any[]) => unknown) {
      handle(channel, (epoch, ...args) => { assertProfile(epoch); return fn(...args); });
    }
    handle('study:bootstrap', () => ({ catalog, data: store.snapshot(), notice: store.notice, version: app.getVersion(), profileEpoch }));
    handleProfile('study:progress', (id, patch) => { assertProblem(id); store.updateProgress(id, patch); sendData(); return store.snapshot(); });
    handleProfile('study:select', id => { if (id !== null) assertProblem(id); flushDrafts(); const state = tracker.select(id); sendData(); sendTimer(); return state; });
    ipcMain.on('study:activity', (event, epoch) => { if (epoch === profileEpoch && event.sender === win.webContents && event.senderFrame === win.webContents.mainFrame && trusted(event.senderFrame.url)) safe(() => tracker.activity()); });
    handleProfile('study:edit-session', (id, patch) => { tracker.edit(id, patch); sendData(); sendTimer(); return store.snapshot(); });
    handleProfile('study:delete-session', id => { tracker.delete(id); sendData(); sendTimer(); return store.snapshot(); });
    handleProfile('study:save-draft', (id,source,cases) => { assertProblem(id); pendingDrafts[id]=validateDraft({source,cases,updatedAt:new Date().toISOString()}); clearTimeout(draftTimer); draftTimer=setTimeout(()=>safe(flushDrafts),300); return new Promise<void>((resolve,reject)=>draftWaiters.push({resolve,reject})); });
    handleProfile('study:submission', (id,source,result) => { assertProblem(id); flushDrafts(); store.recordSubmission(id,source,result); sendData(); return store.snapshot(); });
    handleProfile('study:guided-progress', (id, progress) => {
      assertProblem(id);
      const lesson = guidedLessons.get(id);
      if (!lesson) throw new Error('This problem does not have a guided lesson.');
      const clean = validateCurrentGuidedProgress(progress, lesson, store.snapshot().guided[id]);
      store.saveGuidedProgress(id, clean);
      sendData();
      return store.snapshot();
    });
    handle('study:export', async epoch => {
      assertProfile(epoch);
      flushDrafts(); tracker.tick(); tracker.checkpoint();
      const result = await dialog.showSaveDialog(win, { title: 'Export study backup', defaultPath: `LeetCode-Study-backup-${new Date().toISOString().slice(0, 10)}.json`, filters: [{ name: 'Study backup', extensions: ['json'] }] });
      if (result.canceled || !result.filePath) return false;
      assertProfile(epoch);
      fs.writeFileSync(result.filePath, JSON.stringify(store.snapshot(), null, 2));
      return true;
    });
    handle('study:import', async epoch => {
      assertProfile(epoch);
      const result = await dialog.showOpenDialog(win, { title: 'Restore study backup', properties: ['openFile'], filters: [{ name: 'Study backup', extensions: ['json'] }] });
      if (result.canceled || !result.filePaths[0]) return false;
      assertProfile(epoch);
      const file = result.filePaths[0];
      if (fs.statSync(file).size > 50 * 1024 * 1024) throw new Error('The backup is too large (50 MB maximum).');
      const data = validateData(JSON.parse(fs.readFileSync(file, 'utf8')));
      const answer = await dialog.showMessageBox(win, { type: 'question', title: 'Restore backup', message: `Restore ${Object.keys(data.progress).length} progress records, ${data.sessions.length} sessions, ${Object.keys(data.drafts).length} drafts, ${data.submissions.length} submissions, and ${Object.keys(data.guided).length} guided lessons?`, detail: 'This replaces your current history, progress, drafts, submissions, and guided learning progress. A copy of the current data will be saved in the application data folder.', buttons: ['Cancel', 'Restore backup'], defaultId: 0, cancelId: 0 });
      if (answer.response !== 1) return false;
      assertProfile(epoch);
      flushDrafts(); tracker.restore(data);
      profileEpoch++;
      store.notice = 'Your backup was restored.';
      pausePlayback(); sendTimer(); return true;
    });
    handle('study:external', async raw => { const url = new URL(String(raw)); if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Only web links can be opened.'); await shell.openExternal(url.href); });
    heartbeat = setInterval(() => safe(() => { tracker.tick(); sendTimer(); }), 1000);
    win.once('ready-to-show', () => { if (process.env.STUDY_HEADLESS !== '1') win.show(); });
    await win.loadURL(devUrl || 'study://app/index.html');
  }).catch(error => { console.error(error); dialog.showErrorBox('LeetCode Study could not start', error instanceof Error ? error.message : String(error)); app.quit(); });
}
app.on('window-all-closed', () => app.quit());
app.on('will-quit', () => { if (heartbeat) clearInterval(heartbeat); });
