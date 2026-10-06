import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Play, Send, Square, RotateCcw, Check, History, Code2, ChevronRight, X } from 'lucide-react';
import definitions from '../../coding/problems.json';
import { parseCases } from '../../coding/validation';
import type { CodingProblem, CodeDraft, Submission, JudgeEvent, JudgeResult, JudgeJob } from '../../shared/coding';
import { CODE_LIMIT, INPUT_LIMIT, JOB_TIMEOUT } from '../../shared/coding';
import JudgeWorker from './judge.worker?worker';
import {setTabOutEnabled,useTabOutEnabled} from './editor-preferences';
import type {EditorFocusRequest} from './editor-focus';
import './coding.css';
const CodeEditor=lazy(()=>import('./CodeEditor'));
const DebugWorkspace=lazy(()=>import('./DebugWorkspace'));
const pretty=(value:unknown)=>JSON.stringify(value,null,2);
export default function CodeWorkspace({problemId,draft,submissions,active,focusRequest,onRequestFocus}:{problemId:string;draft?:CodeDraft;submissions:Submission[];active:boolean;focusRequest:EditorFocusRequest|null;onRequestFocus:()=>void}) {
  const problem=(definitions as CodingProblem[]).find(p=>p.id===problemId)!;
  const tabOutEnabled=useTabOutEnabled();
  const [source,setSource]=useState(draft?.source??problem.starter),[cases,setCases]=useState(draft?.cases??pretty(problem.examples.map(t=>t.input)));
  const [custom,setCustom]=useState(false),[saveStatus,setSaveStatus]=useState('Saved locally'),[error,setError]=useState('');
  const [busy,setBusy]=useState<'run'|'submit'|null>(null),[progress,setProgress]=useState({completed:0,total:0}),[result,setResult]=useState<JudgeResult|null>(null),[resultMode,setResultMode]=useState('');
  const [panel,setPanel]=useState<'cases'|'results'|'submissions'>('cases'),[confirm,setConfirm]=useState<'reset'|Submission|null>(null),[preview,setPreview]=useState<Submission|null>(null),[line,setLine]=useState<number|null>(null);
  const [debugCases,setDebugCases]=useState<import('../../shared/coding').CodeCase[]|null>(null);
  const [objectTextSize,setObjectTextSize]=useState(16);
  const [resultSource,setResultSource]=useState<string|null>(null);
  const [leftWidth,setLeftWidth]=useState(36),[bottomHeight,setBottomHeight]=useState(34);
  const workspace=useRef<HTMLDivElement>(null),right=useRef<HTMLDivElement>(null),dialog=useRef<HTMLDialogElement>(null);
  const current=useRef({source,cases}),revision=useRef(0),mounted=useRef(true),worker=useRef<Worker|null>(null),job=useRef<JudgeJob|null>(null),watchdog=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),caseWatchdog=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const startTime=useRef(0);
  const previewDialog=useRef<HTMLDialogElement>(null);
  current.current={source,cases};
  function disposeRunner(){worker.current?.terminate();worker.current=null;clearTimeout(watchdog.current);clearTimeout(caseWatchdog.current);}
  async function finish(value:JudgeResult){
    const snapshot=job.current;if(!snapshot)return;job.current=null;disposeRunner();setResult(value);setResultSource(snapshot.source);setResultMode(snapshot.mode==='submit'?'Submit':'Run');setBusy(null);setPanel('results');
    if(snapshot.mode==='submit')try{await window.study.recordSubmission(problemId,snapshot.source,value);}catch(e){if(mounted.current)setError(`Submission could not be saved: ${String(e)}`);}
  }
  function stop(){if(job.current)void finish({verdict:'Cancelled',passed:0,total:progress.total||1,durationMs:Math.round(performance.now()-startTime.current),cases:[]});}
  useEffect(()=>{mounted.current=true;return()=>{
    mounted.current=false;
    const snapshot=job.current;job.current=null;disposeRunner();
    if(snapshot?.mode==='submit')void window.study.recordSubmission(problemId,snapshot.source,{verdict:'Cancelled',passed:0,total:problem.examples.length+problem.tests.length,durationMs:Math.round(performance.now()-startTime.current),cases:[]}).catch(console.error);
  };},[]);
  useEffect(()=>{if(confirm)dialog.current?.showModal();},[confirm]);
  useEffect(()=>{if(preview)previewDialog.current?.showModal();},[preview]);
  useEffect(()=>{if(!revision.current&&draft){setSource(draft.source);setCases(draft.cases);}},[draft]);
  // Main owns the debounce: every edit crosses IPC immediately, so closing/navigation
  // can flush the latest revision without waiting for a renderer timer.
  function persist(nextSource:string,nextCases:string){
    const rev=++revision.current;setSaveStatus('Saving…');
    void window.study.saveDraft(problemId,nextSource,nextCases).then(()=>{if(mounted.current&&rev===revision.current)setSaveStatus('Saved locally');}).catch(e=>{if(mounted.current&&rev===revision.current){setSaveStatus('Save failed');setError(String(e));}});
  }
  function changeSource(value:string){if(value.length>CODE_LIMIT){setError('Code is limited to 256 KiB.');return;}setSource(value);current.current.source=value;persist(value,current.current.cases);}
  function changeCases(value:string){setCases(value);current.current.cases=value;persist(current.current.source,value);}
  function start(mode:'run'|'submit'){
    if(job.current||!active||debugCases)return;setError('');setPreview(null);setLine(null);
    let inputs=problem.examples;
    try{if(mode==='run'&&custom)inputs=parseCases(problem,current.current.cases);}catch(e){setError(String(e).replace(/^Error: /,''));setPanel('cases');return;}
    const snapshot:JudgeJob={jobId:crypto.randomUUID(),problemId,source:current.current.source,mode,cases:inputs};
    const total=mode==='submit'?problem.examples.length+problem.tests.length:inputs.length;
    job.current=snapshot;setBusy(mode);setProgress({completed:0,total});setResult(null);setPanel('results');startTime.current=performance.now();
    const fail=(message:string,verdict:JudgeResult['verdict']='Runtime error')=>void finish({verdict,passed:0,total,durationMs:Math.round(performance.now()-startTime.current),cases:[{name:'Runner',input:[],verdict,logs:[],durationMs:0,error:message}]});
    try{
      const instance=new JudgeWorker();worker.current=instance;
      instance.onmessage=({data}:MessageEvent<JudgeEvent>)=>{if(job.current?.jobId!==data.jobId)return;if(data.type==='progress'){setProgress({completed:data.completed,total:data.total});clearTimeout(caseWatchdog.current);caseWatchdog.current=setTimeout(()=>fail('The case exceeded its execution limit.','Time limit exceeded'),5500);}else void finish(data.result);};
      instance.onerror=e=>{e.preventDefault();fail(e.message||'Unable to start the offline runner.');};
      watchdog.current=setTimeout(()=>fail('The 30 second job limit was reached.','Time limit exceeded'),JOB_TIMEOUT);
      instance.postMessage(snapshot);
    }catch(e){fail(String(e));}
  }
  const startRef=useRef(start);startRef.current=start;
  useEffect(()=>{const listener=(event:KeyboardEvent)=>{if(active&&!confirm&&!preview&&(event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();event.stopPropagation();startRef.current(event.shiftKey?'submit':'run');}};window.addEventListener('keydown',listener,true);return()=>window.removeEventListener('keydown',listener,true);},[active,confirm,preview]);
  function startDebug(){try{setDebugCases(custom?parseCases(problem,current.current.cases):problem.examples);}catch(e){setError(String(e).replace(/^Error: /,''));setPanel('cases');}}
  function drag(event:React.PointerEvent,axis:'x'|'y'){
    const element=event.currentTarget as HTMLElement;element.setPointerCapture(event.pointerId);
    const move=(e:PointerEvent)=>{const box=(axis==='x'?workspace:right).current!.getBoundingClientRect();if(axis==='x')setLeftWidth(Math.max(24,Math.min(60,(e.clientX-box.left)/box.width*100)));else setBottomHeight(Math.max(22,Math.min(70,(box.bottom-e.clientY)/box.height*100)));};
    const end=()=>{element.removeEventListener('pointermove',move);element.removeEventListener('lostpointercapture',end);};element.addEventListener('pointermove',move);element.addEventListener('lostpointercapture',end);
  }
  return <div className="coding-workspace" hidden={!active} ref={workspace} style={{'--description-width':`${leftWidth}%`,'--results-height':`${bottomHeight}%`} as React.CSSProperties}>
    {debugCases&&<Suspense fallback={<div className="editor-loading">Loading debugger?</div>}><DebugWorkspace problem={problem} source={source} cases={debugCases} active={active} objectTextSize={objectTextSize} onObjectTextSizeChange={setObjectTextSize} onClose={()=>{setDebugCases(null);onRequestFocus();}}/></Suspense>}
    <section className="code-description" aria-label="Problem description">
      <div className="code-section-label"><Code2 size={15}/>DESCRIPTION<span>JavaScript</span></div>
      <div className="description-body"><h2>{problem.number}. {problem.title}</h2><p>{problem.description}</p><div className="contract"><span>{problem.kind==='design'?'Class contract':'Function contract'}</span><code>{problem.kind==='design'?problem.entry:`${problem.entry}(${problem.parameters.filter(p=>![141,374].includes(problem.number)||!['pos','pick'].includes(p)).join(', ')})`}</code></div>
        {problem.examples.map((t,i)=><div className="problem-example" key={i}><h3>Example {i+1}</h3><label>Arguments</label><pre>{JSON.stringify(t.input)}</pre><label>Expected {problem.kind.includes('codec')?'round trip':'result'}</label><pre>{JSON.stringify(t.expected)}</pre></div>)}
        <h3>Input & execution</h3><ul className="constraints">{problem.constraints.map((c,i)=><li key={i}>{c}</li>)}</ul>
        <p className="local-note">Local test results. Submit checks the bundled practice suite and marks accepted solutions Completed. The Visualizer tab shows the reference walkthrough.</p>
      </div>
    </section>
    <div className="code-splitter vertical" role="separator" aria-label="Resize description" aria-orientation="vertical" aria-valuenow={Math.round(leftWidth)} tabIndex={0} onPointerDown={e=>drag(e,'x')} onKeyDown={e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setLeftWidth(v=>Math.max(24,Math.min(60,v+(e.key==='ArrowLeft'?-2:2))));}}}/>
    <section className="code-right" ref={right} aria-label="Coding workspace">
      <div className="code-toolbar"><span className="language-label"><i/>JavaScript</span><button className="tabout-toggle" aria-label="TabOut" aria-pressed={tabOutEnabled} title="Tab jumps past the next closing bracket or quote on this line. Shift+Tab jumps backward. Toggle to use normal indentation." onClick={()=>setTabOutEnabled(!tabOutEnabled)}>TabOut <span>{tabOutEnabled?'On':'Off'}</span></button><span className={`draft-status ${saveStatus==='Save failed'?'error-text':''}`} aria-live="polite">{saveStatus==='Saved locally'&&<Check size={12}/>} {saveStatus}</span><button className="icon-button" title="Reset code" aria-label="Reset code" disabled={!!busy} onClick={()=>setConfirm('reset')}><RotateCcw size={14}/></button><div className="run-actions">{busy?<button className="stop-code" onClick={stop}><Square size={12}/>Stop</button>:<><button className="run-code" title="Run examples or custom cases (Ctrl+Enter)" onClick={()=>start('run')}><Play size={13}/>Run</button><button className="run-code" title="Debug one case with live breakpoints" onClick={startDebug}>Debug</button><button className="submit-code" title="Submit to local tests (Ctrl+Shift+Enter)" onClick={()=>start('submit')}><Send size={13}/>Submit</button></>}</div></div>
      <Suspense fallback={<div className="editor-loading">Loading editor…</div>}><CodeEditor source={source} onChange={changeSource} problemId={problemId} active={active&&!debugCases&&!confirm&&!preview} focusRequest={focusRequest} line={line} tabOutEnabled={tabOutEnabled}/></Suspense>
      <div className="code-splitter horizontal" role="separator" aria-label="Resize test results" aria-orientation="horizontal" aria-valuenow={Math.round(bottomHeight)} tabIndex={0} onPointerDown={e=>drag(e,'y')} onKeyDown={e=>{if(['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();setBottomHeight(v=>Math.max(22,Math.min(70,v+(e.key==='ArrowUp'?2:-2))));}}}/>
      <div className="code-bottom"><div className="code-panel-tabs" role="tablist" aria-label="Code panels">{(['cases','results','submissions'] as const).map(p=><button key={p} role="tab" aria-selected={panel===p} onClick={()=>setPanel(p)}>{p==='cases'?'Test cases':p==='results'?'Local test results':`Submissions (${submissions.length})`}</button>)}</div>
        {error&&<div className="code-error" role="alert">{error}<button className="icon-button" aria-label="Dismiss code error" onClick={()=>setError('')}><X size={12}/></button></div>}
        <div className="code-panel-scroll">
          {panel==='cases'&&<><div className="case-mode"><label><input type="radio" name={`cases-${problemId}`} checked={!custom} onChange={()=>setCustom(false)}/>Examples ({problem.examples.length})</label><label><input type="radio" name={`cases-${problemId}`} checked={custom} onChange={()=>setCustom(true)}/>Custom cases</label></div>{custom?<><p className="case-help">Enter an array of cases. Each case contains <code>[{problem.parameters.join(', ')}]</code>. Expected results are calculated locally.</p><textarea className="custom-cases" aria-label="Custom test cases" spellCheck={false} maxLength={INPUT_LIMIT} value={cases} onChange={e=>changeCases(e.target.value)}/></>:<div className="example-cases">{problem.examples.map((t,i)=><div key={i}><span>Case {i+1}</span><code>{JSON.stringify(t.input)}</code></div>)}</div>}<p className="case-help">Ctrl+Enter to Run · Ctrl+Shift+Enter to Submit</p></>}
          {panel==='results'&&(busy?<div className="judge-running" role="status"><span className="runner-pulse"/><strong>{busy==='submit'?'Checking local test suite':'Running code'}…</strong><p>{progress.completed} of {progress.total} cases checked</p></div>:result?<>{resultSource!==null&&resultSource!==source&&<p className="case-help">These results are for an earlier version of your code.</p>}<div className={`judge-summary ${result.verdict==='Accepted'?'accepted':'failed'}`} role="status"><strong>{result.verdict}</strong><span>{result.passed} / {result.total} passed · {result.durationMs} ms · {resultMode}</span></div>{result.cases.map((r,i)=><details className="case-result" key={i} open={r.verdict!=='Accepted'||i===0}><summary><span className={r.verdict==='Accepted'?'accepted':'failed'}>{r.verdict==='Accepted'?'✓':'×'}</span>{r.name}<small>{r.verdict} · {r.durationMs} ms</small></summary><dl><dt>Input</dt><dd><pre>{JSON.stringify(r.input)}</pre></dd>{r.actual!==undefined&&<><dt>Output</dt><dd><pre>{JSON.stringify(r.actual)}</pre></dd></>}{r.expected!==undefined&&<><dt>Expected</dt><dd><pre>{JSON.stringify(r.expected)}</pre></dd></>}</dl>{r.error&&<div className="runtime-error"><pre>{r.error}</pre>{/solution\.js:(\d+)/.test(r.error)&&<button className="subtle-button" onClick={()=>{setLine(null);setTimeout(()=>setLine(Number(r.error!.match(/solution\.js:(\d+)/)![1])),0);}}>Go to error line</button>}</div>}{r.logs.length>0&&<><label className="console-label">Console</label><pre className="console-output">{r.logs.join('\n')}</pre></>}</details>)}</>:<div className="code-empty"><Play size={22}/><p>Run your code to see results here.</p></div>)}
          {panel==='submissions'&&(submissions.length?<div className="submission-list">{[...submissions].reverse().map(s=><button key={s.id} onClick={()=>setPreview(s)}><span className={s.result.verdict==='Accepted'?'accepted':'failed'}>{s.result.verdict}</span><time>{new Date(s.createdAt).toLocaleString()}</time><small>{s.result.passed}/{s.result.total} passed</small><ChevronRight size={13}/></button>)}</div>:<div className="code-empty"><History size={22}/><p>Your submitted solutions will appear here.</p></div>)}
        </div>
      </div>
    </section>
    {confirm&&<dialog ref={dialog} className="modal" aria-label={confirm==='reset'?'Reset solution':'Reopen submission'} onCancel={()=>setConfirm(null)}><div className="modal-heading"><h2>{confirm==='reset'?'Reset solution?':'Reopen this submission?'}</h2></div><p>This replaces the code in your current draft. Your submission history stays saved.</p><div className="modal-actions"><button className="subtle-button" onClick={()=>setConfirm(null)}>Cancel</button><button className="primary-button" onClick={()=>{changeSource(confirm==='reset'?problem.starter:confirm.source);setConfirm(null);setPreview(null);}}>{confirm==='reset'?'Reset code':'Replace draft'}</button></div></dialog>}
    {preview&&<dialog ref={previewDialog} className="submission-preview" aria-label="Submission details" onCancel={()=>setPreview(null)}><div className="submission-preview-header"><div><strong className={preview.result.verdict==='Accepted'?'accepted':'failed'}>{preview.result.verdict}</strong><p>{new Date(preview.createdAt).toLocaleString()} · {preview.result.passed}/{preview.result.total} passed · {preview.result.durationMs} ms</p></div><button className="icon-button" aria-label="Close submission" onClick={()=>setPreview(null)}><X size={18}/></button></div><pre tabIndex={0}>{preview.source}</pre><div className="modal-actions"><button className="subtle-button" onClick={()=>{setResult(preview.result);setResultSource(preview.source);setResultMode('Saved submission');setPanel('results');setPreview(null);}}>View results</button><button className="primary-button" disabled={!!busy} onClick={()=>setConfirm(preview)}>Reopen code</button></div></dialog>}
  </div>;
}
