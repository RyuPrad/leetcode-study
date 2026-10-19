import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopApi } from '../shared/types';
// Keep this epoch for the lifetime of this document, including repeated bootstrap
// reads. Old async callbacks must never acquire a restored profile's write scope.
let profileEpoch: number | undefined;
const invokeProfile = (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, profileEpoch, ...args);
function listen(channel: string, callback: (value: any) => void) {
  const handler = (_event: Electron.IpcRendererEvent, value: unknown) => callback(value);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}
const api: DesktopApi = {
  bootstrap: async () => { const result = await ipcRenderer.invoke('study:bootstrap'); profileEpoch ??= result.profileEpoch; return result; },
  setProgress: (id, patch) => invokeProfile('study:progress', id, patch),
  selectProblem: id => invokeProfile('study:select', id),
  activity: () => ipcRenderer.send('study:activity', profileEpoch),
  editSession: (id, patch) => invokeProfile('study:edit-session', id, patch),
  deleteSession: id => invokeProfile('study:delete-session', id),
  saveDraft: (id, language, source, cases) => invokeProfile('study:save-draft', id, language, source, cases),
  recordSubmission: (id, language, source, result) => invokeProfile('study:submission', id, language, source, result),
  saveGuidedProgress: (id, progress) => invokeProfile('study:guided-progress', id, progress),
  loadKit: id => ipcRenderer.invoke('study:kit', id),
  nativeAvailability: () => ipcRenderer.invoke('study:native-available'),
  runNative: request => ipcRenderer.invoke('study:native-run', request),
  cancelNative: jobId => ipcRenderer.invoke('study:native-cancel', jobId),
  onNativeProgress: callback => listen('study:native-progress', callback),
  exportBackup: () => invokeProfile('study:export'),
  importBackup: () => invokeProfile('study:import'),
  openExternal: url => ipcRenderer.invoke('study:external', url),
  onData: callback => listen('study:data', callback),
  onTimer: callback => listen('study:timer', callback),
  onPlaybackPause: callback => listen('study:pause-playback', callback),
  onError: callback => listen('study:error', callback)
};
if (process.isMainFrame) contextBridge.exposeInMainWorld('study', api);
