import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { CodingProblem, CodeCase } from '../../shared/coding';
import type { DebugCommand, DebugEvent } from '../../shared/debugging';
import { WALKTHROUGH_FRAME_LIMIT } from '../../shared/debugging';
import type { VisualizationFrame } from '../../shared/visualization';
import { parseCases } from '../../coding/validation';
import FrameView from '../visualization/FrameView';
import { PanelWorkspace, StudyPanel } from '../visualization/PanelWorkspace';
import DebugWorker from './debug.worker?worker';
import './debugging.css';
const CodeEditor = lazy(() => import('./CodeEditor'));
type Recording = Extract<DebugEvent, { type: 'recorded' }>;

/** A generated kit's visualizer: records every step of the reference solution on an example or a custom
 *  input with the debugger engine, then replays it with Play, Step and a seekable timeline. */
export default function WalkthroughWorkspace({ problem, narration = {}, active }: { problem: CodingProblem; narration?: Record<string, string>; active: boolean }) {
  const [selected, setSelected] = useState(0), [custom, setCustom] = useState<CodeCase | null>(null), [customText, setCustomText] = useState(() => JSON.stringify([problem.examples[0]?.input ?? []]));
  const [editing, setEditing] = useState(false), [inputError, setInputError] = useState('');
  const [recording, setRecording] = useState<Recording | null>(null), [cursor, setCursor] = useState(0), [playing, setPlaying] = useState(false), [speed, setSpeed] = useState(1);
  const test = custom ?? problem.examples[selected];
  const session = useRef('');
  useEffect(() => {
    const worker = new DebugWorker(), id = crypto.randomUUID();
    session.current = id; setRecording(null); setCursor(0); setPlaying(false);
    worker.onmessage = ({ data }: MessageEvent<DebugEvent>) => { if (data.sessionId !== session.current || data.type !== 'recorded') return; setRecording(data); worker.terminate(); };
    worker.onerror = event => { event.preventDefault(); setRecording({ type: 'recorded', sessionId: id, frames: [], truncated: false, error: event.message || 'Unable to start the walkthrough.', logs: [], executableLines: [] }); worker.terminate(); };
    worker.postMessage({ type: 'record', sessionId: id, problem, language: 'javascript', source: problem.reference, test, limit: WALKTHROUGH_FRAME_LIMIT } satisfies DebugCommand);
    return () => { session.current = ''; worker.terminate(); };
  }, [problem, selected, custom]);
  const frames = recording?.frames ?? [], last = frames.length - 1, frame = frames[Math.min(cursor, last)];
  // Play advances one recorded step at a time and stops on the last one.
  useEffect(() => {
    if (!playing || !active) return;
    if (cursor >= last) { setPlaying(false); return; }
    const timer = setTimeout(() => setCursor(c => Math.min(last, c + 1)), 900 / speed);
    return () => clearTimeout(timer);
  }, [playing, active, cursor, last, speed]);
  useEffect(() => { if (!active) setPlaying(false); }, [active]);
  useEffect(() => window.study.onPlaybackPause(() => setPlaying(false)), []);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (!active || editing || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
      if (event.key === 'ArrowRight') { setPlaying(false); setCursor(c => Math.min(last, c + 1)); }
      else if (event.key === 'ArrowLeft') { setPlaying(false); setCursor(c => Math.max(0, c - 1)); }
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', keys); return () => window.removeEventListener('keydown', keys);
  }, [active, editing, last]);
  function runCustom() {
    try { const [next] = parseCases(problem, customText); if (!next) throw new Error('Enter one case.'); setCustom({ name: 'Custom input', input: next.input }); setEditing(false); setInputError(''); }
    catch (error) { setInputError(String(error).replace(/^Error: /, '')); }
  }
  const line = frame?.location?.line, note = line !== undefined ? narration[String(line)] : undefined, finished = !!recording && cursor >= last;
  const status = !recording ? 'Recording the walkthrough…' : recording.error && !frames.length ? 'The walkthrough could not run' : `Step ${Math.min(cursor, last) + 1} of ${frames.length}${recording.truncated ? ' (first steps only)' : ''}`;
  return <div className="walkthrough-workspace debug-free-panels">
    <header className="debug-toolbar walkthrough-toolbar">
      <strong>Walkthrough</strong>
      <label>Input <select aria-label="Walkthrough input" value={custom ? 'custom' : selected} onChange={e => { if (e.target.value !== 'custom') { setCustom(null); setSelected(Number(e.target.value)); } }}>
        {problem.examples.map((example, i) => <option key={i} value={i}>{example.name}</option>)}{custom && <option value="custom">Custom input</option>}</select></label>
      <button onClick={() => setEditing(!editing)} aria-expanded={editing}>Custom input…</button>
      <span className="debug-status" role="status">{status}</span>
    </header>
    {editing && <div className="walkthrough-custom"><label>One case, as a JSON array of argument arrays<textarea aria-label="Custom walkthrough input" rows={3} value={customText} onChange={e => setCustomText(e.target.value)}/></label>{inputError && <p className="error-text" role="alert">{inputError}</p>}<div><button onClick={runCustom}>Walk through this input</button><button onClick={() => { setEditing(false); setInputError(''); }}>Cancel</button></div></div>}
    <div className="debug-controls walkthrough-controls">
      <button aria-label="First step" disabled={!frames.length || cursor === 0} onClick={() => { setPlaying(false); setCursor(0); }}>⏮</button>
      <button aria-label="Previous step" disabled={!frames.length || cursor === 0} onClick={() => { setPlaying(false); setCursor(c => Math.max(0, c - 1)); }}>←</button>
      {playing ? <button onClick={() => setPlaying(false)}>Ⅱ Pause</button> : <button disabled={!frames.length} onClick={() => { if (finished) setCursor(0); setPlaying(true); }}>▷ {finished ? 'Replay' : 'Play'}</button>}
      <button aria-label="Next step" disabled={!frames.length || finished} onClick={() => { setPlaying(false); setCursor(c => Math.min(last, c + 1)); }}>→</button>
      <input aria-label="Walkthrough timeline" type="range" min={0} max={Math.max(0, last)} value={Math.min(cursor, Math.max(0, last))} disabled={!frames.length} onChange={e => { setPlaying(false); setCursor(Number(e.target.value)); }}/>
      <label>Speed <select aria-label="Walkthrough speed" value={speed} onChange={e => setSpeed(Number(e.target.value))}>{[0.5, 1, 2, 4].map(s => <option key={s} value={s}>{s}×</option>)}</select></label>
    </div>
    <section className="walkthrough-narration" aria-live="polite" aria-label="What this step does">
      {line !== undefined && <span className="walkthrough-line">Line {line}</span>}
      <p>{finished && recording && !recording.error ? <>Finished. The solution returns <code>{JSON.stringify(recording.actual)}</code>{test.expected !== undefined && <> (expected <code>{JSON.stringify(test.expected)}</code>)</>}.</> : note ?? (frame ? 'The highlighted line runs next. Watch the variables and diagrams change.' : recording?.error ?? 'Recording every step of the reference solution…')}</p>
    </section>
    <PanelWorkspace view="debug" onInteraction={() => setPlaying(false)}>
      {frame ? <FrameView key={`${problem.id}:${session.current}`} frame={frame} previousFrame={frames[cursor - 1]} operationFrame={frame} moment={2}/> : <div className="viz-empty">{recording?.error ?? 'Recording the walkthrough…'}</div>}
      <StudyPanel id="code" title="Reference Code" bodyClassName="debug-source"><div className="debug-source-label">REFERENCE SOLUTION <span>Arrow = this step</span></div><Suspense fallback={<div className="editor-loading">Loading source…</div>}><CodeEditor language="javascript" source={problem.reference} onChange={() => {}} problemId={`${problem.id}-walkthrough`} active={active} line={null} readOnly traceLocation={frame?.location ?? null}/></Suspense></StudyPanel>
    </PanelWorkspace>
  </div>;
}
