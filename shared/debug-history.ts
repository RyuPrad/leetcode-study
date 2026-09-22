import { DEBUG_HISTORY_BYTES, DEBUG_HISTORY_LIMIT } from './debugging';
import type { VisualizationFrame } from './visualization';

/** Bounded, detached inspection history. It never controls or rewinds the VM. */
export class DebugHistory {
  private entries:{frame:VisualizationFrame;bytes:number}[]=[];
  bytes=0;
  dropped=0;
  append(frame:VisualizationFrame){
    const bytes=JSON.stringify(frame).length*2;
    // Snapshot limits are smaller than the history budget; reject a malformed oversized frame.
    if(bytes>DEBUG_HISTORY_BYTES){this.dropped++;return this.frames();}
    this.entries.push({frame,bytes});this.bytes+=bytes;
    while(this.entries.length>DEBUG_HISTORY_LIMIT||this.bytes>DEBUG_HISTORY_BYTES){this.bytes-=this.entries.shift()!.bytes;this.dropped++;}
    return this.frames();
  }
  frames(){return this.entries.map(entry=>entry.frame);}
}
