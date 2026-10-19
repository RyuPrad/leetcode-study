import { useEffect, useState } from 'react';
import type { CaseResult, CodingProblem, JudgeEvent, JudgeJob, TraceEvent } from '../../shared/coding';
import JudgeWorker from './judge.worker?worker';

/**
 * The walkthrough of an events kit (io.events): the reference runs on an example in virtual time, and each event its
 * adapter traced (calls, timers firing, promises settling, values yielded) becomes one step on a timeline.
 */
export default function TraceWalkthrough({ problem, narration = {} }: { problem: CodingProblem; narration?: Record<string, string> }) {
  const [selected, setSelected] = useState(0), [run, setRun] = useState<CaseResult | null>(null), [error, setError] = useState(''), [cursor, setCursor] = useState(0);
  useEffect(() => {
    setRun(null); setError(''); setCursor(0);
    const worker = new JudgeWorker(), jobId = `trace-${problem.id}-${selected}`;
    worker.onmessage = ({ data }: MessageEvent<JudgeEvent>) => {
      if (data.type !== 'result' || data.jobId !== jobId) return;
      const result = data.result.cases[0];
      if (result?.verdict === 'Accepted') setRun(result); else setError(result?.error ?? 'The reference could not run this example.');
      worker.terminate();
    };
    worker.onerror = () => setError('The walkthrough could not start.');
    const job: JudgeJob = { jobId, problemId: problem.id, language: 'javascript', source: problem.reference, mode: 'run', cases: [problem.examples[selected]], problem };
    worker.postMessage(job);
    return () => worker.terminate();
  }, [problem, selected]);
  const events: TraceEvent[] = run?.trace ?? [], steps = events.length + 1, event = events[cursor];
  const finished = run && cursor >= events.length;
  // Reference lines narrated in the kit, shown beside the timeline as the key ideas.
  const notes = Object.entries(narration).sort((a, b) => Number(a[0]) - Number(b[0]));
  return <div className="walkthrough-workspace trace-walkthrough">
    <header className="debug-toolbar walkthrough-toolbar"><strong>Walkthrough</strong>
      <label>Input <select aria-label="Walkthrough input" value={selected} onChange={e => setSelected(Number(e.target.value))}>{problem.examples.map((e, i) => <option key={i} value={i}>{e.name}</option>)}</select></label>
      <span className="debug-status" role="status">{error ? 'The walkthrough could not run' : run ? `Step ${cursor + 1} of ${steps}` : 'Running the reference…'}</span></header>
    <div className="debug-controls walkthrough-controls">
      <button aria-label="Previous step" disabled={!run || cursor === 0} onClick={() => setCursor(c => c - 1)}>←</button>
      <button aria-label="Next step" disabled={!run || cursor >= steps - 1} onClick={() => setCursor(c => c + 1)}>→</button>
      <input aria-label="Walkthrough timeline" type="range" min={0} max={Math.max(0, steps - 1)} value={cursor} disabled={!run} onChange={e => setCursor(Number(e.target.value))}/>
    </div>
    <section className="walkthrough-narration" aria-live="polite" aria-label="What this step does">
      {event && <span className="walkthrough-line">t = {event.t} ms</span>}
      <p>{error || (finished ? `Finished. The scenario returns ${JSON.stringify(run!.actual)}.` : event?.text) || 'Running the reference…'}</p>
    </section>
    <div className="sql-walkthrough-body">
      <pre className="sql-reference" aria-label="Reference solution">{problem.reference}</pre>
      <div className="trace-side">
        <ol className="trace-timeline" aria-label="Events">{events.map((e, i) => <li key={i} className={i === cursor ? 'active' : i > cursor ? 'later' : ''}><button onClick={() => setCursor(i)}><time>{e.t} ms</time><span>{e.text}</span></button></li>)}</ol>
        {finished && <dl className="trace-answer"><dt>Returned</dt><dd><pre>{JSON.stringify(run!.actual)}</pre></dd>{problem.examples[selected].expected !== undefined && <><dt>Expected</dt><dd><pre>{JSON.stringify(problem.examples[selected].expected)}</pre></dd></>}</dl>}
        {notes.length > 0 && <details className="trace-notes"><summary>Key lines of the reference</summary><ul>{notes.map(([line, note]) => <li key={line}><strong>Line {line}</strong> {note}</li>)}</ul></details>}
      </div>
    </div>
  </div>;
}
