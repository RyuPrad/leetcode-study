import type {VisualizationFrame,VisualOperation} from './visualization';
import {valueText} from './visualization';
export function observedOperations(frame:VisualizationFrame,previous?:VisualizationFrame):VisualOperation[]{
 const operations=[...(frame.operations||[])];
 for(const change of frame.changes.slice(0,12)){
  if(operations.some(op=>op.targets?.some(t=>t.objectId===change.objectId&&t.key===change.key)))continue;
  const pointer=!!change.objectId&&['next','left','right','parent'].includes(change.key||'');
  operations.push({kind:pointer?'pointer':change.after===undefined?'remove':'write',location:previous?.location||frame.location,focus:`Look at ${change.name}.`,action:pointer?'Update this reference.':`Observe the change to ${change.name}.`,result:`${change.name}: ${valueText(change.before)} → ${valueText(change.after)}.`,targets:change.objectId?[{objectId:change.objectId,key:change.key}]:[]});
 }
 if(!operations.length)operations.push({kind:frame.phase==='condition'?'compare':frame.phase==='return'?'return':'control',location:frame.location,focus:frame.phase==='before'?frame.action:'Look at the highlighted instruction.',action:frame.explanation,result:frame.phase==='before'?'The highlighted statement has not executed yet.':frame.action});
 return operations;
}
