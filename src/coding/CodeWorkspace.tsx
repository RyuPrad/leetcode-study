import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Play, Send, Square, RotateCcw, Check, History, Code2, ChevronRight, X, Lightbulb, Copy } from 'lucide-react';
import definitions from '../../coding/problems.json';
import { parseCases } from '../../coding/validation';
import type { CodingProblem, CodeDraft, Submission, JudgeEvent, JudgeResult, JudgeJob, Language } from '../../shared/coding';
import { CODE_LIMIT, INPUT_LIMIT, JOB_TIMEOUT, isNativeLanguage, languageNames, languages } from '../../shared/coding';
import type { CodeCase, ReferenceOutcome } from '../../shared/coding';
import { assembleNative } from '../../coding/engine';
import { contractLine, starter } from '../../coding/languages';
import { preferredLanguage, setPreferredLanguage } from './language-preference';
import { codeLanguageFor, onCodeLanguage, showCodeLanguage } from '../visualization/code-language';
import { loadSolution } from './solutions';
import { SqlInputTables, SqlTable } from './SqlWalkthrough';
import type { SqlResult } from '../../coding/sql-engine';
import JudgeWorker from './judge.worker?worker';
import {setTabOutEnabled,useTabOutEnabled} from './editor-preferences';
import type {EditorFocusRequest} from './editor-focus';
import './coding.css';
const CodeEditor=lazy(()=>import('./CodeEditor'));
const DebugWorkspace=lazy(()=>import('./DebugWorkspace'));
const pretty=(value:unknown)=>JSON.stringify(value,null,2);
// solution.js (JavaScript/TypeScript), solution.c, or the Java class file such as Solution.java.
const errorLine=/(?:solution\.(?:js|c)|\b[A-Z]\w*\.java):(\d+)/;
export default function CodeWorkspace({problemId,problem:kit,draft,submissions,active,focusRequest,onRequestFocus}:{problemId:string;problem?:CodingProblem;draft?:CodeDraft;submissions:Submission[];active:boolean;focusRequest:EditorFocusRequest|null;onRequestFocus:()=>void}) {
  // A generated kit is loaded by the app and passed in; hand-built kits are bundled.
  const problem=kit??(definitions as CodingProblem[]).find(p=>p.id===problemId)!;
  const offered:readonly Language[]=problem.languages??languages,offer=(l:Language|undefined)=>l&&offered.includes(l)?l:undefined;
  const tabOutEnabled=useTabOutEnabled();
  const [language,setLanguage]=useState<Language>(()=>offer(codeLanguageFor(problemId))??offer(draft?.language)??offer(preferredLanguage())??offered[0]);
  const [sources,setSources]=useState<CodeDraft['sources']>(()=>draft?.sources??{});
  const source=sources[language]??starter(problem,language);
  const [cases,setCases]=useState(draft?.cases??pretty(problem.examples.map(t=>t.input)));
  const [custom,setCustom]=useState(false),[saveStatus,setSaveStatus]=useState('Saved locally'),[error,setError]=useState('');
  const [busy,setBusy]=useState<'run'|'submit'|null>(null),[progress,setProgress]=useState({completed:0,total:0}),[result,setResult]=useState<JudgeResult|null>(null),[resultMode,setResultMode]=useState('');
  const [panel,setPanel]=useState<'cases'|'results'|'submissions'>('cases'),[confirm,setConfirm]=useState<'reset'|Submission|null>(null),[preview,setPreview]=useState<Submission|null>(null),[line,setLine]=useState<number|null>(null);
  const [debugCases,setDebugCases]=useState<import('../../shared/coding').CodeCase[]|null>(null);
  const [objectTextSize,setObjectTextSize]=useState(16);
  const [resultSource,setResultSource]=useState<string|null>(null);
  const [leftWidth,setLeftWidth]=useState(36),[bottomHeight,setBottomHeight]=useState(34);
  const workspace=useRef<HTMLDivElement>(null),right=useRef<HTMLDivElement>(null),dialog=useRef<HTMLDialogElement>(null);
  const current=useRef({source,cases,language}),revision=useRef(0),mounted=useRef(true),worker=useRef<Worker|null>(null),job=useRef<JudgeJob|null>(null),watchdog=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),caseWatchdog=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const startTime=useRef(0);
  const previewDialog=useRef<HTMLDialogElement>(null);
  // Reveal asks first; the solution then shows in the selected language.
  const [solution,setSolution]=useState<'ask'|{language:Language;source:string}|null>(null),[copied,setCopied]=useState(false);
  const solutionDialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{if(solution)solutionDialog.current?.showModal();},[solution]);
  async function revealSolution(){
    const target=current.current.language;
    try{const source=await loadSolution(problem,target);if(mounted.current){setCopied(false);setSolution({language:target,source});}}
    catch(e){if(mounted.current){setSolution(null);setError(String(e).replace(/^Error: /,''));}}
  }
  current.current={source,cases,language};
  const nativeJob=useRef<string|null>(null);
  function disposeRunner(){worker.current?.terminate();worker.current=null;clearTimeout(watchdog.current);clearTimeout(caseWatchdog.current);if(nativeJob.current){void window.study.cancelNative(nativeJob.current).catch(()=>{});nativeJob.current=null;}}
  async function finish(value:JudgeResult){
    const snapshot=job.current;if(!snapshot)return;job.current=null;disposeRunner();setResult(value);setResultSource(snapshot.source);setResultMode(snapshot.mode==='submit'?'Submit':'Run');setBusy(null);setPanel('results');
    if(snapshot.mode==='submit')try{await window.study.recordSubmission(problemId,snapshot.language,snapshot.source,value);}catch(e){if(mounted.current)setError(`Submission could not be saved: ${String(e)}`);}
  }
  function stop(){if(job.current)void finish({verdict:'Cancelled',passed:0,total:progress.total||1,durationMs:Math.round(performance.now()-startTime.current),cases:[]});}
  useEffect(()=>{mounted.current=true;return()=>{
    mounted.current=false;
    const snapshot=job.current;job.current=null;disposeRunner();
    if(snapshot?.mode==='submit')void window.study.recordSubmission(problemId,snapshot.language,snapshot.source,{verdict:'Cancelled',passed:0,total:problem.examples.length+problem.tests.length,durationMs:Math.round(performance.now()-startTime.current),cases:[]}).catch(console.error);
  };},[]);
  useEffect(()=>{if(confirm)dialog.current?.showModal();},[confirm]);
  useEffect(()=>{if(preview)previewDialog.current?.showModal();},[preview]);
  useEffect(()=>{if(!revision.current&&draft){setSources(draft.sources);setLanguage(offer(codeLanguageFor(problemId))??offer(draft.language)??offered[0]);setCases(draft.cases);}},[draft]);
  // Main owns the debounce: every edit crosses IPC immediately, so closing/navigation
  // can flush the latest revision without waiting for a renderer timer.
  function persist(nextSource:string,nextCases:string){
    const rev=++revision.current;setSaveStatus('Saving…');
    void window.study.saveDraft(problemId,current.current.language,nextSource,nextCases).then(()=>{if(mounted.current&&rev===revision.current)setSaveStatus('Saved locally');}).catch(e=>{if(mounted.current&&rev===revision.current){setSaveStatus('Save failed');setError(String(e));}});
  }
  function changeSource(value:string){if(value.length>CODE_LIMIT){setError('Code is limited to 256 KiB.');return;}const target=current.current.language;setSources(previous=>({...previous,[target]:value}));current.current.source=value;persist(value,current.current.cases);}
  // Each language keeps its own draft; switching saves which one is open.
  function changeLanguage(next:Language){
    if(job.current||next===current.current.language)return;
    const nextSource=sources[next]??starter(problem,next);
    setLanguage(next);setPreferredLanguage(next);setError('');setLine(null);
    current.current={...current.current,language:next,source:nextSource};
    persist(nextSource,current.current.cases);
  }
  // The Visualizer and Learn tabs show reference code in this language, and their picker changes it.
  const switchLanguage=useRef(changeLanguage);switchLanguage.current=changeLanguage;
  useEffect(()=>{showCodeLanguage(problemId,language);},[language]);
  useEffect(()=>onCodeLanguage(()=>{const next=codeLanguageFor(problemId);if(next&&offered.includes(next)&&next!==current.current.language)switchLanguage.current(next);}),[]);
  function replaceSource(target:Language,value:string){if(target!==current.current.language)changeLanguage(target);changeSource(value);}
  function changeCases(value:string){setCases(value);current.current.cases=value;persist(current.current.source,value);}
  function start(mode:'run'|'submit'){
    if(job.current||!active||debugCases)return;setError('');setPreview(null);setLine(null);
    let inputs=problem.examples;
    try{if(mode==='run'&&custom)inputs=parseCases(problem,current.current.cases);}catch(e){setError(String(e).replace(/^Error: /,''));setPanel('cases');return;}
    const snapshot:JudgeJob={jobId:crypto.randomUUID(),problemId,language:current.current.language,source:current.current.source,mode,cases:inputs,...(problem.generated?{problem}:{})};
    const total=mode==='submit'?problem.examples.length+problem.tests.length:inputs.length;
    job.current=snapshot;setBusy(mode);setProgress({completed:0,total});setResult(null);setPanel('results');startTime.current=performance.now();
    const fail=(message:string,verdict:JudgeResult['verdict']='Runtime error')=>void finish({verdict,passed:0,total,durationMs:Math.round(performance.now()-startTime.current),cases:[{name:'Runner',input:[],verdict,logs:[],durationMs:0,error:message}]});
    try{
      const instance=new JudgeWorker();worker.current=instance;
      instance.onmessage=({data}:MessageEvent<JudgeEvent>)=>{if(job.current?.jobId!==data.jobId)return;if(data.type==='references'){void runNative(data.cases,data.references);return;}if(data.type==='progress'){setProgress({completed:data.completed,total:data.total});clearTimeout(caseWatchdog.current);caseWatchdog.current=setTimeout(()=>fail('The case exceeded its execution limit.','Time limit exceeded'),5500);}else void finish(data.result);};
      instance.onerror=e=>{e.preventDefault();fail(e.message||'Unable to start the offline runner.');};
      // Native jobs also start a compiler or JVM; the desktop runner enforces their limits first.
      watchdog.current=setTimeout(()=>fail('The 30 second job limit was reached.','Time limit exceeded'),JOB_TIMEOUT+(isNativeLanguage(snapshot.language)?10000:0));
      instance.postMessage(snapshot);
    }catch(e){fail(String(e));}
    // Java/C: the worker has evaluated the reference; the desktop runner executes the solution.
    async function runNative(cases:CodeCase[],references:ReferenceOutcome[]){
      worker.current?.terminate();worker.current=null;clearTimeout(caseWatchdog.current);
      if(!isNativeLanguage(snapshot.language))return;
      const invalid=references.filter(r=>r.invalid).length;
      nativeJob.current=snapshot.jobId;
      const unsubscribe=window.study.onNativeProgress(({jobId,completed})=>{if(jobId===snapshot.jobId&&job.current?.jobId===jobId)setProgress({completed:Math.min(total,completed+invalid),total});});
      try{
        const run=await window.study.runNative({jobId:snapshot.jobId,problemId,language:snapshot.language,source:snapshot.source,inputs:cases.filter((_,i)=>!references[i].invalid).map(c=>c.input)});
        if(job.current?.jobId===snapshot.jobId)void finish(assembleNative(problem,cases,references,run,Math.round(performance.now()-startTime.current)));
      }catch(e){if(job.current?.jobId===snapshot.jobId)fail(String(e).replace(/^Error: (Error invoking remote method '[^']+': )?(Error: )?/,''));}
      finally{unsubscribe();if(nativeJob.current===snapshot.jobId)nativeJob.current=null;}
    }
  }
  const startRef=useRef(start);startRef.current=start;
  useEffect(()=>{const listener=(event:KeyboardEvent)=>{if(active&&!confirm&&!preview&&!solution&&(event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();event.stopPropagation();startRef.current(event.shiftKey?'submit':'run');}};window.addEventListener('keydown',listener,true);return()=>window.removeEventListener('keydown',listener,true);},[active,confirm,preview]);
  function startDebug(){try{setDebugCases(custom?parseCases(problem,current.current.cases):problem.examples);}catch(e){setError(String(e).replace(/^Error: /,''));setPanel('cases');}}
  function drag(event:React.PointerEvent,axis:'x'|'y'){
    const element=event.currentTarget as HTMLElement;element.setPointerCapture(event.pointerId);
    const move=(e:PointerEvent)=>{const box=(axis==='x'?workspace:right).current!.getBoundingClientRect();if(axis==='x')setLeftWidth(Math.max(24,Math.min(60,(e.clientX-box.left)/box.width*100)));else setBottomHeight(Math.max(22,Math.min(70,(box.bottom-e.clientY)/box.height*100)));};
    const end=()=>{element.removeEventListener('pointermove',move);element.removeEventListener('lostpointercapture',end);};element.addEventListener('pointermove',move);element.addEventListener('lostpointercapture',end);
  }
  return <div className="coding-workspace" hidden={!active} ref={workspace} style={{'--description-width':`${leftWidth}%`,'--results-height':`${bottomHeight}%`} as React.CSSProperties}>
    {debugCases&&<Suspense fallback={<div className="editor-loading">Loading debugger?</div>}><DebugWorkspace problem={problem} language={language} source={source} cases={debugCases} active={active} objectTextSize={objectTextSize} onObjectTextSizeChange={setObjectTextSize} onClose={()=>{setDebugCases(null);onRequestFocus();}}/></Suspense>}
    <section className="code-description" aria-label="Problem description">
      <div className="code-section-label"><Code2 size={15}/>DESCRIPTION<span>{languageNames[language]}</span></div>
      <div className="description-body"><h2>{problem.number}. {problem.title}</h2>{problem.generated?<div className="markdown kit-statement"><ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown></div>:<p>{problem.description}</p>}<div className="contract"><span>{problem.kind==='design'?'Class contract':problem.kind==='sql'?'Tables':'Function contract'}</span><code className="contract-signature">{language==='javascript'&&!problem.api?(problem.kind==='design'?problem.entry:`${problem.entry}(${problem.parameters.filter(p=>![141,374].includes(problem.number)||!['pos','pick'].includes(p)).join(', ')})`):contractLine(problem,language)}</code></div>
        {problem.examples.map((t,i)=>problem.kind==='sql'?<div className="problem-example" key={i}><h3>Example {i+1}</h3><label>Tables</label><SqlInputTables schema={problem.schema} input={t.input}/><label>Expected result</label>{t.expected?<SqlTable table={t.expected as unknown as SqlResult}/>:null}</div>:<div className="problem-example" key={i}><h3>Example {i+1}</h3><label>Arguments</label><pre>{JSON.stringify(t.input)}</pre><label>Expected {problem.kind.includes('codec')?'round trip':'result'}</label><pre>{JSON.stringify(t.expected)}</pre></div>)}
        <h3>Input & execution</h3><ul className="constraints">{problem.constraints.map((c,i)=><li key={i}>{c}</li>)}</ul>
        {isNativeLanguage(language)&&<p className="local-note native-note">{languageNames[language]} runs as a native program on this PC with the bundled {language==='java'?'Java 21 runtime':'Tiny C Compiler'}. Unlike JavaScript and TypeScript it is not sandboxed, so only run code you trust.</p>}
        <p className="local-note">Local test results. Submit checks the bundled practice suite and marks accepted solutions Completed. The Visualizer tab shows the reference walkthrough.</p>
      </div>
    </section>
    <div className="code-splitter vertical" role="separator" aria-label="Resize description" aria-orientation="vertical" aria-valuenow={Math.round(leftWidth)} tabIndex={0} onPointerDown={e=>drag(e,'x')} onKeyDown={e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setLeftWidth(v=>Math.max(24,Math.min(60,v+(e.key==='ArrowLeft'?-2:2))));}}}/>
    <section className="code-right" ref={right} aria-label="Coding workspace">
      <div className="code-toolbar"><label className="language-label"><i/><select aria-label="Language" value={language} disabled={!!busy||!!debugCases} onChange={e=>changeLanguage(e.target.value as Language)}>{offered.map(l=><option key={l} value={l}>{languageNames[l]}</option>)}</select></label><button className="tabout-toggle" aria-label="TabOut" aria-pressed={tabOutEnabled} title="Tab jumps past the next closing bracket or quote on this line. Shift+Tab jumps backward. Toggle to use normal indentation." onClick={()=>setTabOutEnabled(!tabOutEnabled)}>TabOut <span>{tabOutEnabled?'On':'Off'}</span></button><span className={`draft-status ${saveStatus==='Save failed'?'error-text':''}`} aria-live="polite">{saveStatus==='Saved locally'&&<Check size={12}/>} {saveStatus}</span><button className="icon-button" title="Reset code" aria-label="Reset code" disabled={!!busy} onClick={()=>setConfirm('reset')}><RotateCcw size={14}/></button><button className="subtle-button solution-button" title="Show the reference solution" disabled={!!busy} onClick={()=>setSolution('ask')}><Lightbulb size={13}/>Solution</button><div className="run-actions">{busy?<button className="stop-code" onClick={stop}><Square size={12}/>Stop</button>:<><button className="run-code" title="Run examples or custom cases (Ctrl+Enter)" onClick={()=>start('run')}><Play size={13}/>Run</button>{(language==='javascript'||language==='typescript')&&!problem.io?.events&&<button className="run-code" title="Debug one case with live breakpoints" onClick={startDebug}>Debug</button>}<button className="submit-code" title="Submit to local tests (Ctrl+Shift+Enter)" onClick={()=>start('submit')}><Send size={13}/>Submit</button></>}</div></div>
      <Suspense fallback={<div className="editor-loading">Loading editor…</div>}><CodeEditor source={source} onChange={changeSource} problemId={problemId} language={language} active={active&&!debugCases&&!confirm&&!preview&&!solution} focusRequest={focusRequest} line={line} tabOutEnabled={tabOutEnabled}/></Suspense>
      <div className="code-splitter horizontal" role="separator" aria-label="Resize test results" aria-orientation="horizontal" aria-valuenow={Math.round(bottomHeight)} tabIndex={0} onPointerDown={e=>drag(e,'y')} onKeyDown={e=>{if(['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();setBottomHeight(v=>Math.max(22,Math.min(70,v+(e.key==='ArrowUp'?2:-2))));}}}/>
      <div className="code-bottom"><div className="code-panel-tabs" role="tablist" aria-label="Code panels">{(['cases','results','submissions'] as const).map(p=><button key={p} role="tab" aria-selected={panel===p} onClick={()=>setPanel(p)}>{p==='cases'?'Test cases':p==='results'?'Local test results':`Submissions (${submissions.length})`}</button>)}</div>
        {error&&<div className="code-error" role="alert">{error}<button className="icon-button" aria-label="Dismiss code error" onClick={()=>setError('')}><X size={12}/></button></div>}
        <div className="code-panel-scroll">
          {panel==='cases'&&<><div className="case-mode"><label><input type="radio" name={`cases-${problemId}`} checked={!custom} onChange={()=>setCustom(false)}/>Examples ({problem.examples.length})</label><label><input type="radio" name={`cases-${problemId}`} checked={custom} onChange={()=>setCustom(true)}/>Custom cases</label></div>{custom?<><p className="case-help">Enter an array of cases. Each case contains <code>[{problem.parameters.join(', ')}]</code>. Expected results are calculated locally.</p><textarea className="custom-cases" aria-label="Custom test cases" spellCheck={false} maxLength={INPUT_LIMIT} value={cases} onChange={e=>changeCases(e.target.value)}/></>:<div className="example-cases">{problem.examples.map((t,i)=><div key={i}><span>Case {i+1}</span><code>{JSON.stringify(t.input)}</code></div>)}</div>}<p className="case-help">Ctrl+Enter to Run · Ctrl+Shift+Enter to Submit</p></>}
          {panel==='results'&&(busy?<div className="judge-running" role="status"><span className="runner-pulse"/><strong>{busy==='submit'?'Checking local test suite':'Running code'}…</strong><p>{progress.completed} of {progress.total} cases checked</p></div>:result?<>{resultSource!==null&&resultSource!==source&&<p className="case-help">These results are for an earlier version of your code.</p>}<div className={`judge-summary ${result.verdict==='Accepted'?'accepted':'failed'}`} role="status"><strong>{result.verdict}</strong><span>{result.passed} / {result.total} passed · {result.durationMs} ms · {resultMode}</span></div>{result.cases.map((r,i)=><details className="case-result" key={i} open={r.verdict!=='Accepted'||i===0}><summary><span className={r.verdict==='Accepted'?'accepted':'failed'}>{r.verdict==='Accepted'?'✓':'×'}</span>{r.name}<small>{r.verdict} · {r.durationMs} ms</small></summary><dl><dt>Input</dt><dd>{problem.kind==='sql'?<SqlInputTables schema={problem.schema} input={r.input}/>:<pre>{JSON.stringify(r.input)}</pre>}</dd>{r.actual!==undefined&&<><dt>Output</dt><dd>{problem.kind==='sql'?<SqlTable table={r.actual as unknown as SqlResult}/>:<pre>{JSON.stringify(r.actual)}</pre>}</dd></>}{r.expected!==undefined&&<><dt>Expected</dt><dd>{problem.kind==='sql'?<SqlTable table={r.expected as unknown as SqlResult}/>:<pre>{JSON.stringify(r.expected)}</pre>}</dd></>}</dl>{r.error&&<div className="runtime-error"><pre>{r.error}</pre>{errorLine.test(r.error)&&<button className="subtle-button" onClick={()=>{setLine(null);setTimeout(()=>setLine(Number(r.error!.match(errorLine)![1])),0);}}>Go to error line</button>}</div>}{r.logs.length>0&&<><label className="console-label">Console</label><pre className="console-output">{r.logs.join('\n')}</pre></>}</details>)}</>:<div className="code-empty"><Play size={22}/><p>Run your code to see results here.</p></div>)}
          {panel==='submissions'&&(submissions.length?<div className="submission-list">{[...submissions].reverse().map(s=><button key={s.id} onClick={()=>setPreview(s)}><span className={s.result.verdict==='Accepted'?'accepted':'failed'}>{s.result.verdict}</span><small className="submission-language">{languageNames[s.language]}</small><time>{new Date(s.createdAt).toLocaleString()}</time><small>{s.result.passed}/{s.result.total} passed</small><ChevronRight size={13}/></button>)}</div>:<div className="code-empty"><History size={22}/><p>Your submitted solutions will appear here.</p></div>)}
        </div>
      </div>
    </section>
    {confirm&&<dialog ref={dialog} className="modal" aria-label={confirm==='reset'?'Reset solution':confirm.id==='solution'?'Use reference solution':'Reopen submission'} onCancel={()=>setConfirm(null)}><div className="modal-heading"><h2>{confirm==='reset'?'Reset solution?':confirm.id==='solution'?'Use the reference solution?':'Reopen this submission?'}</h2></div><p>{confirm==='reset'?`This replaces your ${languageNames[language]} draft with the starter code.`:`This replaces your ${languageNames[confirm.language]} draft${confirm.language!==language?` and switches to ${languageNames[confirm.language]}`:''}.`} Your submission history stays saved.</p><div className="modal-actions"><button className="subtle-button" onClick={()=>setConfirm(null)}>Cancel</button><button className="primary-button" onClick={()=>{if(confirm==='reset')changeSource(starter(problem,language));else replaceSource(confirm.language,confirm.source);setConfirm(null);setPreview(null);}}>{confirm==='reset'?'Reset code':confirm.id==='solution'?'Use as draft':'Replace draft'}</button></div></dialog>}
    {solution&&<dialog ref={solutionDialog} className={solution==='ask'?'modal':'submission-preview solution-preview'} aria-label={solution==='ask'?'Reveal solution':'Reference solution'} onCancel={()=>setSolution(null)}>{solution==='ask'
      ?<><div className="modal-heading"><h2>Reveal the solution?</h2></div><p>This shows the reference {languageNames[language]} solution for {problem.title}. Your draft stays unchanged unless you choose to use it.</p><div className="modal-actions"><button className="subtle-button" onClick={()=>setSolution(null)}>Cancel</button><button className="primary-button" onClick={()=>void revealSolution()}>Show solution</button></div></>
      :<><div className="submission-preview-header"><div><strong>Reference solution</strong><p>{languageNames[solution.language]} · the algorithm the Visualizer walks through</p></div><button className="icon-button" aria-label="Close solution" onClick={()=>setSolution(null)}><X size={18}/></button></div><pre tabIndex={0} aria-label={`${languageNames[solution.language]} reference solution`}>{solution.source}</pre><div className="modal-actions"><button className="subtle-button" onClick={()=>{void navigator.clipboard.writeText(solution.source).then(()=>{if(mounted.current)setCopied(true);});}}><Copy size={13}/>{copied?'Copied':'Copy'}</button><button className="primary-button" disabled={!!busy} onClick={()=>{const s=solution;setSolution(null);setConfirm({id:'solution',problemId,language:s.language,source:s.source,createdAt:new Date().toISOString(),result:{verdict:'Accepted',passed:0,total:0,durationMs:0,cases:[]}});}}>Use as draft</button></div></>}</dialog>}
    {preview&&<dialog ref={previewDialog} className="submission-preview" aria-label="Submission details" onCancel={()=>setPreview(null)}><div className="submission-preview-header"><div><strong className={preview.result.verdict==='Accepted'?'accepted':'failed'}>{preview.result.verdict}</strong><p>{languageNames[preview.language]} · {new Date(preview.createdAt).toLocaleString()} · {preview.result.passed}/{preview.result.total} passed · {preview.result.durationMs} ms</p></div><button className="icon-button" aria-label="Close submission" onClick={()=>setPreview(null)}><X size={18}/></button></div><pre tabIndex={0}>{preview.source}</pre><div className="modal-actions"><button className="subtle-button" onClick={()=>{setResult(preview.result);setResultSource(preview.source);setResultMode('Saved submission');setPanel('results');setPreview(null);}}>View results</button><button className="primary-button" disabled={!!busy} onClick={()=>setConfirm(preview)}>Reopen code</button></div></dialog>}
  </div>;
}
