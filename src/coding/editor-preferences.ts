import {useSyncExternalStore} from 'react';
const key='study.tabOutEnabled';
let enabled=true;
try{enabled=localStorage.getItem(key)!=='false';}catch{}
const listeners=new Set<()=>void>();
export function setTabOutEnabled(value:boolean){
  enabled=value;try{localStorage.setItem(key,String(value));}catch{}
  listeners.forEach(listener=>listener());
}
export function useTabOutEnabled(){return useSyncExternalStore(listener=>{listeners.add(listener);return()=>{listeners.delete(listener);};},()=>enabled);}
