import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { CodingProblem, CodeCase } from '../../shared/coding';
import type { DebugCommand, DebugEvent, DebugMotion } from '../../shared/debugging';
import { DebugHistory } from '../../shared/debug-history';
import type { VisualizationFrame, VisualLocation } from '../../shared/visualization';
import type { ObjectFocus } from '../../shared/object-view';
import FrameView from '../visualization/FrameView';
import {PanelWorkspace,StudyPanel} from '../visualization/PanelWorkspace';
import type {PanelLayout} from '../../shared/panel-layout';
import DebugWorker from './debug.worker?worker';
import './debugging.css';
import {useWalkthroughMode,setWalkthroughMode} from '../visualization/walkthrough-mode';
const CodeEditor=lazy(()=>import('./CodeEditor'));
export default function DebugWorkspace({problem,source,cases,active,onClose,objectTextSize:controlledObjectTextSize,onObjectTextSizeChange}:{problem:CodingProblem;source:string;cases:CodeCase[];active:boolean;onClose:()=>void;objectTextSize?:number;onObjectTextSizeChange?:(size:number)=>void}){
  const panelLayout=useRef<PanelLayout|null>(null);
  const detail=useWalkthroughMode(),[moment,setMoment]=useState(2),[presentationPaused,setPresentationPaused]=useState(false);
  const [objectFocus,setObjectFocus]=useState<ObjectFocus|null>(null),[localObjectTextSize,setLocalObjectTextSize]=useState(16),[objectControlsOpen,setObjectControlsOpen]=useState(false);
  const [compactControls,setCompactControls]=useState(()=>matchMedia('(max-height:740px),(max-width:850px)').matches);
  const objectTextSize=controlledObjectTextSize??localObjectTextSize,setObjectTextSize=onObjectTextSizeChange||setLocalObjectTextSize;
  useEffect(()=>{setObjectControlsOpen(false);},[objectFocus]);
  useEffect(()=>{const preference=matchMedia('(max-height:740px),(max-width:850px)'),change=()=>setCompactControls(preference.matches);preference.addEventListener('change',change);return()=>preference.removeEventListener('change',change);},[]);
  useEffect(()=>{if(!compactControls)setObjectControlsOpen(false);},[compactControls]);
  const acknowledged=useRef<number|null>(null);
  const [selectedCase,setSelectedCase]=useState(0),[restart,setRestart]=useState(0),[breakpoints,setBreakpoints]=useState<number[]>([]),[lines,setLines]=useState<number[]>([]),[frames,setFrames]=useState<VisualizationFrame[]>([]),[cursor,setCursor]=useState<number|null>(null),[status,setStatus]=useState('Starting'),[paused,setPaused]=useState(false),[speed,setSpeed]=useState(1),[result,setResult]=useState<Extract<DebugEvent,{type:'finished'}>|null>(null),[location,setLocation]=useState<VisualLocation|null>(null);
  const worker=useRef<Worker|null>(null),session=useRef(''),history=useRef(new DebugHistory()),breaks=useRef(breakpoints),host=useRef<HTMLDivElement>(null),motion=useRef<DebugMotion>('into');
  useEffect(()=>{
    if(!compactControls||!objectControlsOpen)return;
    const outside=(event:PointerEvent)=>{
      const target=event.target;if(!(target instanceof Node))return;
      if(host.current?.querySelector('.debug-object-secondary')?.contains(target)||host.current?.querySelector('.debug-object-more')?.contains(target))return;
      setObjectControlsOpen(false);
    };
    document.addEventListener('pointerdown',outside,true);return()=>document.removeEventListener('pointerdown',outside,true);
  },[compactControls,objectControlsOpen]);
  breaks.current=breakpoints;
  const live=frames.at(-1),frame=cursor===null?live:frames.find(f=>f.index===cursor)||frames[0],historical=!!frame&&frame!==live;
  function send(command:Omit<Extract<DebugCommand,{type:'motion'}>,'sessionId'>|{type:'pause'}|{type:'breakpoints';lines:number[]}){worker.current?.postMessage({...command,sessionId:session.current});}
  function move(next:DebugMotion){if(historical||result||!paused&&!presentationPaused)return;motion.current=next;setPresentationPaused(false);if(next!=='play')setMoment(2);send({type:'motion',motion:next,speed,presentation:detail});}
  function pause(){if(live&&!result){setPresentationPaused(true);setPaused(true);setStatus('Paused');}send({type:'pause'});}
  useEffect(()=>{
    const instance=new DebugWorker();worker.current=instance;const id=crypto.randomUUID();session.current=id;history.current=new DebugHistory();setFrames([]);setCursor(null);setResult(null);setPaused(false);setStatus('Starting');setLocation(null);setObjectFocus(null);setObjectControlsOpen(false);
    instance.onmessage=({data}:MessageEvent<DebugEvent>)=>{
      if(data.sessionId!==session.current)return;
      if(data.type==='started'){setLines(data.executableLines);setStatus('Running');}
      if(data.type==='running'){setPaused(false);setStatus(motion.current==='play'?'Playing':'Running');}
      if(data.type==='frame'){
        setFrames(history.current.append(data.frame));setMoment(data.paused?2:0);acknowledged.current=null;setPaused(data.paused);setStatus(data.paused?data.reason:motion.current==='play'?'Playing':'Running');
      }
      if(data.type==='finished'){setResult(data);setPaused(false);setStatus(data.error?'Stopped with error':'Finished');instance.terminate();worker.current=null;}
    };
    instance.onerror=error=>{error.preventDefault();setResult({type:'finished',sessionId:id,error:error.message||'Unable to start the debugger.',logs:[],durationMs:0});setStatus('Stopped with error');instance.terminate();worker.current=null;};
    instance.postMessage({type:'start',sessionId:id,problemId:problem.id,source,test:cases[selectedCase],breakpoints:breaks.current} satisfies DebugCommand);
    return()=>{session.current='';instance.terminate();worker.current=null;};
  },[selectedCase,restart]);
  useEffect(()=>{setLocation((paused||historical?frame?.location:frame?.operations?.[0]?.location)||frame?.location||null);},[frame,moment,paused,historical]);
  useEffect(()=>{if(!active||historical||paused||presentationPaused||result||motion.current!=='play'||!live)return;if(detail==='compact'){worker.current?.postMessage({type:'presented',sessionId:session.current,index:live.index});return;}const timer=setTimeout(()=>{if(moment<2)setMoment(n=>n+1);else if(acknowledged.current!==live.index){acknowledged.current=live.index;worker.current?.postMessage({type:'presented',sessionId:session.current,index:live.index});}},2000/speed);return()=>clearTimeout(timer);},[active,historical,paused,presentationPaused,result,detail,live,moment,speed]);
  useEffect(()=>{pause();setMoment(2);},[detail]);
  useEffect(()=>{if(!active)pause();},[active]);
  useEffect(()=>{const dispose=window.study.onPlaybackPause(pause);const hide=()=>{if(document.hidden)pause();};document.addEventListener('visibilitychange',hide);return()=>{dispose();document.removeEventListener('visibilitychange',hide);};},[]);
  const keyboard=useRef({move,pause,paused});keyboard.current={move,pause,paused};
  useEffect(()=>{const listener=(event:KeyboardEvent)=>{if(!active)return;const state=keyboard.current;if(['F5','F10','F11'].includes(event.key)){event.preventDefault();event.stopPropagation();if(event.key==='F5'&&event.shiftKey)onClose();else state.move(event.key==='F5'?'continue':event.key==='F10'?'over':event.shiftKey?'out':'into');}};window.addEventListener('keydown',listener,true);return()=>window.removeEventListener('keydown',listener,true);},[active]);
  const toolbar=<header className="debug-toolbar"><strong>Live debugger</strong><label>Case <select aria-label="Debug test case" value={selectedCase} onChange={e=>setSelectedCase(Number(e.target.value))}>{cases.map((test,i)=><option value={i} key={i}>{test.name}</option>)}</select></label><span className={`debug-status ${paused?'paused':''}`} role="status">{historical?'Inspecting history':status}</span><button onClick={()=>setRestart(n=>n+1)}>↻ Restart</button><button onClick={()=>panelLayout.current?.maximize('diagram',panelLayout.current.snapshot().maximized!=='diagram')}>Focus diagram</button><button onClick={onClose}>{result?'Back to code':'■ Stop / edit'}</button></header>;
  const controls=<div className="debug-controls"><button disabled={(!paused&&!presentationPaused)||historical||!!result} onClick={()=>move('continue')} title="Continue to next breakpoint (F5)">▶ Continue</button>{paused||presentationPaused||result?<button disabled={(!paused&&!presentationPaused)||historical||!!result} onClick={()=>move('play')}>▷ Play</button>:<button onClick={pause}>Ⅱ Pause</button>}<label>Speed <select aria-label="Debug playback speed" value={speed} onChange={e=>{const next=Number(e.target.value);setSpeed(next);if(!paused&&!result&&motion.current==='play')send({type:'motion',motion:'play',speed:next,presentation:detail});}}>{[.5,1,2,4].map(n=><option key={n} value={n}>{n}×</option>)}</select></label><button disabled={!paused||historical||!!result} onClick={()=>move('into')} title="Step Into (F11)">Step Into</button><button disabled={!paused||historical||!!result} onClick={()=>move('over')} title="Step Over (F10)">Step Over</button><button disabled={!paused||historical||!!result} onClick={()=>move('out')} title="Step Out (Shift+F11)">Step Out</button><span>Click the editor gutter to set breakpoints.</span></div>;
  const timeline=!!frames.length&&<div className="debug-timeline"><button aria-label="Previous recorded state" disabled={frames.indexOf(frame!)<=0} onClick={()=>{pause();setCursor(frames[frames.indexOf(frame!)-1].index);}}>←</button><input aria-label="Debug history" type="range" min={0} max={frames.length-1} value={frames.indexOf(frame!)} onChange={e=>{pause();const index=Number(e.target.value);setCursor(index===frames.length-1?null:frames[index].index);}}/><span>Step {frame?.index} · {frames.length} checkpoints</span>{historical&&<button onClick={()=>setCursor(null)}>Return to live</button>}<small>{history.current.dropped>0?`${history.current.dropped} older checkpoints removed. `:''}Continue samples history; Play records every step.</small></div>;
  const moments=<div className="debug-moments"><label>Walkthrough <select aria-label="Walkthrough detail" value={detail} onChange={e=>setWalkthroughMode(e.target.value as 'detailed'|'compact')}><option value="detailed">Detailed walkthrough</option><option value="compact">Compact walkthrough</option></select></label>{detail==='detailed'&&<><button disabled={!frame||moment===0} onClick={()=>{pause();setMoment(m=>Math.max(0,m-1));}}>Previous moment</button><button disabled={!frame||moment===2} onClick={()=>{pause();setMoment(m=>Math.min(2,m+1));}}>Next moment</button><span>{['Focus','Action','Result'][moment]} / {moment+1}/3</span></>}</div>;
  return <div className={`debug-workspace debug-free-panels ${objectFocus?'debug-object-focus':''}`} ref={host} data-object-controls-open={objectControlsOpen}>
    {objectFocus||compactControls?<><div className="debug-object-commandbar"><strong>Live debugger</strong><span>{historical?'Inspecting history':status}</span><button className="debug-object-more" aria-expanded={objectControlsOpen} aria-controls="debug-object-secondary-controls" onClick={()=>setObjectControlsOpen(value=>!value)}>More controls</button><button aria-label="Close debugger and return to code" onClick={onClose}>{result?'Back to code':'Stop / edit'}</button></div><div className="debug-object-secondary" id="debug-object-secondary-controls" role="region" aria-label="Debugger controls">{toolbar}{controls}{moments}</div>{timeline}</>:<>{toolbar}{controls}{timeline}{moments}</>}
    <PanelWorkspace view="debug" onInteraction={pause} layoutRef={panelLayout}>{frame?<FrameView key={`${problem.id}:${selectedCase}:${restart}`} frame={detail==='detailed'&&moment<2?{...(frames[frames.indexOf(frame)-1]||frame),reads:[],changes:[]}:frame} previousFrame={detail==='detailed'&&moment<2?frames[frames.indexOf(frame)-2]:frames[frames.indexOf(frame)-1]} operationFrame={frame} moment={detail==='compact'?2:moment} onSelectLocation={location=>{setLocation(location);panelLayout.current?.show('code');}} onObjectFocusChange={setObjectFocus} objectTextSize={objectTextSize} onObjectTextSizeChange={setObjectTextSize}/>:<div className="viz-empty">Preparing the selected test case…</div>}{result&&<StudyPanel id="result" title="Result" autoShow><section className={`debug-result ${result.error||result.accepted===false?'failed':'accepted'}`} role="status"><strong>{result.error?'Execution stopped':result.accepted?'Result matches expected':'Result differs from expected'}</strong>{result.error?<pre>{result.error}</pre>:<><label>Returned</label><pre>{JSON.stringify(result.actual)}</pre><label>Expected</label><pre>{JSON.stringify(result.expected)}</pre></>}<small>{result.durationMs} ms active execution · Debugging does not submit a solution.</small></section></StudyPanel>}<StudyPanel id="code" title="Your Code" bodyClassName="debug-source"><div className="debug-source-label">YOUR CODE <span>{historical?'Historical checkpoint':frame?.phase==='before'?'Arrow = next statement':'Arrow = current checkpoint'}</span></div><Suspense fallback={<div className="editor-loading">Loading source…</div>}><CodeEditor source={source} onChange={()=>{}} problemId={`${problem.id}-debug`} active={active&&!objectFocus} line={null} readOnly traceLocation={location} breakpoints={breakpoints} executableLines={lines} onBreakpointsChange={next=>{setBreakpoints(next);send({type:'breakpoints',lines:next});}}/></Suspense></StudyPanel></PanelWorkspace>
  </div>;
}
