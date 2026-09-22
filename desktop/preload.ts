import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopApi } from '../shared/types';
function listen(channel: string, callback: (value: any) => void) {
  const handler = (_event: Electron.IpcRendererEvent, value: unknown) => callback(value);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}
const api: DesktopApi = {
  bootstrap: () => ipcRenderer.invoke('study:bootstrap'),
  setProgress: (id, patch) => ipcRenderer.invoke('study:progress', id, patch),
  selectProblem: id => ipcRenderer.invoke('study:select', id),
  activity: () => ipcRenderer.send('study:activity'),
  editSession: (id, patch) => ipcRenderer.invoke('study:edit-session', id, patch),
  deleteSession: id => ipcRenderer.invoke('study:delete-session', id),
  saveDraft: (id, source, cases) => ipcRenderer.invoke('study:save-draft', id, source, cases),
  recordSubmission: (id, source, result) => ipcRenderer.invoke('study:submission', id, source, result),
  saveGuidedProgress: (id, progress) => ipcRenderer.invoke('study:guided-progress', id, progress),
  exportBackup: () => ipcRenderer.invoke('study:export'),
  importBackup: () => ipcRenderer.invoke('study:import'),
  openExternal: url => ipcRenderer.invoke('study:external', url),
  onData: callback => listen('study:data', callback),
  onTimer: callback => listen('study:timer', callback),
  onPlaybackPause: callback => listen('study:pause-playback', callback),
  onError: callback => listen('study:error', callback)
};
if (process.isMainFrame) contextBridge.exposeInMainWorld('study', api);
