import {useSyncExternalStore} from 'react';
export type WalkthroughMode='detailed'|'compact';
let current:WalkthroughMode=localStorage.getItem('study.walkthroughMode')==='compact'?'compact':'detailed';
const listeners=new Set<()=>void>();
export function setWalkthroughMode(mode:WalkthroughMode){if(mode!=='detailed'&&mode!=='compact')return;current=mode;localStorage.setItem('study.walkthroughMode',mode);listeners.forEach(fn=>fn());for(const frame of document.querySelectorAll('iframe'))frame.contentWindow?.postMessage({type:'study:walkthrough-mode',mode},'study://content');}
window.addEventListener('message',event=>{if(event.origin!=='study://content'||![...document.querySelectorAll('iframe')].some(f=>f.contentWindow===event.source))return;if(event.data?.type==='study:walkthrough-mode')setWalkthroughMode(event.data.mode);if(event.data?.type==='study:walkthrough-ready')(event.source as Window).postMessage({type:'study:walkthrough-mode',mode:current},'study://content');});
export function useWalkthroughMode(){return useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},()=>current);}
