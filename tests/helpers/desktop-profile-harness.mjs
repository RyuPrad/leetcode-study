// Dependency-free harness for the actual main/preload/store/tracker code. Only
// Electron's transport, native dialogs, window, and scheduling are replaced.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire, stripTypeScriptTypes } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const sourceOption = process.argv.indexOf('--source');
const root = sourceOption < 0 ? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..') : path.resolve(process.argv[sourceOption + 1]);
export const readSource = name => fs.readFileSync(path.join(root, name), 'utf8');
export const stamp = '2026-01-01T00:00:00.000Z';
export const empty = () => ({ version: 3, progress: {}, sessions: [], drafts: {}, submissions: [], guided: {} });
export const accepted = () => ({ verdict: 'Accepted', passed: 1, total: 1, durationMs: 1, cases: [{ name: 'Example', input: [], verdict: 'Accepted', logs: [], durationMs: 1 }] });
export const guided = runId => ({ lessonVersion: 1, caseId: 'guided-default', runId, cursor: 0, answers: {} });
function compile(source) {
  const js = stripTypeScriptTypes(source, { mode: 'transform' });
  const exports = [...js.matchAll(/export (?:class|function|const) (\w+)/g)].map(match => match[1]);
  return js.replace(/import\s+([^;]+?)\s+from\s+['"]([^'"]+)['"];?/g, (_, bindings, name) => `const ${bindings} = require(${JSON.stringify(name)});`)
    .replace(/export (class|function|const) /g, '$1 ').replace(/export\s*\{\s*\};?/g, '') + `\n;({${exports.join(',')}});`;
}
export async function desktopFixture(t, initial = empty()) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'restore-isolation-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'study-data.json'), backup = path.join(directory, 'incoming.json');
  fs.writeFileSync(file, JSON.stringify(initial, null, 2));
  fs.writeFileSync(backup, JSON.stringify(empty()));
  let clock = 0, fault = null;
  const timers = new Map(), intervals = new Map(), handlers = new Map(), events = new Map(), sent = [], calls = [], errors = [];
  const fsApi = Object.create(fs);
  fsApi.readFileSync = (name, ...args) => {
    if (String(name).replaceAll('\\', '/').endsWith('content/catalog.json')) return JSON.stringify({ version: 1, entries: [{ id: 'leetcode:1', number: 1 }, { id: 'leetcode:2', number: 2 }], topics: [], visualizers: [] });
    if (String(name).replaceAll('\\', '/').endsWith('content/guided-lessons.json')) return JSON.stringify([{ id: 'leetcode:1', version: 1, caseId: 'guided-default', checkpoints: [{ id: 'q1', beforeIndex: 0, afterIndex: 1, options: [{ id: 'a' }], correctOptionId: 'a' }] }]);
    return fs.readFileSync(name, ...args);
  };
  fsApi.writeFileSync = (name, ...args) => { if (fault === 'archive' && String(name).includes('.before-import-')) throw Error('Injected archive failure'); return fs.writeFileSync(name, ...args); };
  fsApi.renameSync = (from, to) => {
    // Only fail the imported replacement, not the checkpoint immediately before it.
    if (fault === 'commit' && to === file && JSON.parse(fs.readFileSync(from, 'utf8')).drafts['leetcode:2']?.source === 'restored source') throw Error('Injected commit failure');
    if (fault === 'draft' && to === file) throw Error('Injected draft flush failure');
    return fs.renameSync(from, to);
  };
  const windowEvents = new Map();
  const webContents = { mainFrame: { url: 'study://app/index.html' }, send: (...args) => sent.push(args), setWindowOpenHandler() {}, on() {} };
  const window = { webContents, setMenuBarVisibility() {}, on: (name, fn) => windowEvents.set(name, fn), once() {}, isDestroyed: () => false, isFocused: () => true, loadURL: async () => {}, show() {}, focus() {} };
  const dialog = { showOpenDialog: async () => ({ canceled: false, filePaths: [backup] }), showMessageBox: async () => ({ response: 1 }), showSaveDialog: async () => ({ canceled: false, filePath: path.join(directory, 'export.json') }), showErrorBox: (...args) => errors.push(args) };
  let ready;
  const electron = {
    app: { setName() {}, setPath() {}, getPath: () => directory, requestSingleInstanceLock: () => true, on() {}, quit() {}, isPackaged: true, getVersion: () => 'test', whenReady: () => ({ then(fn) { ready = fn(); return ready; } }) },
    BrowserWindow: function () { return window; }, dialog,
    ipcMain: { handle: (name, fn) => handlers.set(name, fn), on: (name, fn) => events.set(name, fn) },
    Menu: { setApplicationMenu() {}, buildFromTemplate: value => value }, powerMonitor: { on() {} },
    protocol: { registerSchemesAsPrivileged() {}, handle() {} },
    session: { defaultSession: { setPermissionRequestHandler() {}, setPermissionCheckHandler() {}, webRequest: { onBeforeRequest() {} } } }, shell: { openExternal: async () => {} },
  };
  const cache = new Map();
  const load = name => {
    if (name === 'electron') return electron;
    if (name === 'node:fs') return fsApi;
    if (name.startsWith('node:')) return require(name);
    const absolute = name.endsWith('.ts') ? name : `${name}.ts`;
    if (cache.has(absolute)) return cache.get(absolute);
    const code = compile(fs.readFileSync(absolute, 'utf8'));
    const context = vm.createContext({ require: id => load(id.startsWith('.') ? path.resolve(path.dirname(absolute), id) : id), structuredClone, performance: { now: () => clock }, console });
    const result = vm.runInContext(code, context, { filename: absolute }); cache.set(absolute, result); return result;
  };
  const context = vm.createContext({ require: id => load(id.startsWith('.') ? path.resolve(root, 'desktop', id) : id), __dirname: path.join(root, 'dist/desktop'), process: { env: {}, isMainFrame: true }, URL, Response, Uint8Array, console: { error: error => errors.push(String(error)) },
    setTimeout: (fn, ms) => { const key = {}; timers.set(key, { fn, ms }); return key; }, clearTimeout: key => timers.delete(key), setInterval: fn => { const key = {}; intervals.set(key, fn); return key; }, clearInterval: key => intervals.delete(key) });
  vm.runInContext(compile(readSource('desktop/main.ts')), context, { filename: 'desktop/main.ts' });
  await ready;
  assert.ok(handlers.has('study:import'), errors.join('\n'));
  const event = { sender: webContents, senderFrame: webContents.mainFrame };
  const openDocument = async () => {
    let api;
    const ipcRenderer = { invoke: async (name, ...args) => { calls.push({ name, args }); return structuredClone(await handlers.get(name)(event, ...args)); }, send: (name, ...args) => events.get(name)(event, ...args), on() {}, removeListener() {} };
    const preload = vm.createContext({ require: () => ({ ipcRenderer, contextBridge: { exposeInMainWorld: (_name, value) => { api = value; } } }), process: { isMainFrame: true } });
    vm.runInContext(compile(readSource('desktop/preload.ts')), preload, { filename: 'desktop/preload.ts' });
    await api.bootstrap(); return api;
  };
  const api = await openDocument();
  const { StudyStore } = load(path.join(root, 'desktop/store.ts'));
  return { directory, file, backup, api, dialog, calls, sent, errors, timers, openDocument,
    store: vm.runInContext('store', context), tracker: vm.runInContext('tracker', context),
    epoch: () => vm.runInContext('profileEpoch', context),
    disk: () => JSON.parse(fs.readFileSync(file, 'utf8')), restart: () => new StudyStore(directory).snapshot(),
    fail: value => { fault = value; },
    flush: () => vm.runInContext('flushDrafts()', context),
    advance: ms => { clock += ms; for (const fn of intervals.values()) fn(); },
    close: () => windowEvents.get('close')({ preventDefault() { throw Error('Close unexpectedly prevented'); } }),
  };
}
export function codeRunner(api) {
  const source = readSource('src/coding/CodeWorkspace.tsx');
  const between = (start, end) => { const from = source.indexOf(start), to = source.indexOf(end, from); assert.ok(from >= 0 && to > from, `Runner source boundary: ${start}`); return source.slice(from, to); };
  const code = between('  function disposeRunner()', '  useEffect(()=>{mounted.current') + between('  function start(mode:', '  const startRef=') + `\nfunction leaveProblem(){${between('    mounted.current=false;', '  };},[]);')}\n}`;
  const state = { workers: [], errors: [], writes: [], timers: new Set() };
  const study = { ...api, recordSubmission(...args) { const promise = api.recordSubmission(...args); state.writes.push(promise); return promise; } };
  const context = vm.createContext({ window: { study }, problemId: 'leetcode:1', problem: { examples: [{}], tests: [{}] }, active: true, debugCases: null, custom: false,
    current: { current: { source: 'old pending source', cases: '[]' } }, worker: { current: null }, job: { current: null }, watchdog: {}, caseWatchdog: {}, startTime: { current: 0 }, mounted: { current: true }, progress: { total: 2 },
    setResult() {}, setResultSource() {}, setResultMode() {}, setBusy() {}, setPanel() {}, setError: value => { if (value) state.errors.push(value); }, setPreview() {}, setLine() {}, setProgress() {},
    console: { error: value => state.errors.push(String(value)) }, crypto, performance, JOB_TIMEOUT: 30000,
    setTimeout: fn => { state.timers.add(fn); return fn; }, clearTimeout: fn => state.timers.delete(fn),
    JudgeWorker: class { constructor() { state.workers.push(this); } postMessage() {} terminate() { this.terminated = true; } },
  });
  vm.runInContext(stripTypeScriptTypes(code, { mode: 'strip' }), context);
  return { state, start: () => vm.runInContext("start('submit')", context), finish: result => { context.value = result; return vm.runInContext('finish(value)', context); }, leave: async () => { vm.runInContext('leaveProblem()', context); await Promise.allSettled(state.writes); } };
}
