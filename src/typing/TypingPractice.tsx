import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Keyboard, SkipForward, Trophy } from 'lucide-react';
import definitions from '../../coding/problems.json';
import type { CodingProblem, Language } from '../../shared/coding';
import { languageNames, languages } from '../../shared/coding';
import type { Entry, Progress } from '../../shared/types';
import { loadSolution } from '../coding/solutions';
import TypingTrainer from './TypingTrainer';
import type { TypingStats } from './engine';
import { toLines, units, wholeSolution, type Snippet, type TypingLine } from './snippets';
import { addTypingResult, personalBest, setTypingSettings, useTypingResults, useTypingSettings, type TypingMode, type TypingSource } from './typing-store';
import './typing.css';

const problems = new Map((definitions as CodingProblem[]).map(p => [p.id, p]));
const sourceNames: Record<TypingSource, string> = { started: 'Started & completed', completed: 'Completed', all: 'All problems' };
// Each load gets a new serial, so even the same snippet picked again starts a fresh attempt.
interface Loaded { serial: number; problem: CodingProblem; language: Language; mode: TypingMode; snippets: Snippet[]; index: number; lines: TypingLine[]; }
let serial = 0;

async function load(problem: CodingProblem, language: Language, mode: TypingMode, index?: number): Promise<Loaded> {
  const text = await loadSolution(problem, language);
  const snippets = mode === 'solution' ? [wholeSolution(text)] : units(text, language);
  const pick = index ?? Math.floor(Math.random() * snippets.length), chosen = snippets[Math.min(pick, snippets.length - 1)];
  return { serial: ++serial, problem, language, mode, snippets, index: snippets.indexOf(chosen), lines: toLines(chosen.source, language) };
}
function save(loaded: Loaded, stats: TypingStats) {
  addTypingResult({ at: new Date().toISOString(), problemId: loaded.problem.id, language: loaded.language, mode: loaded.mode, unit: loaded.snippets[loaded.index].label,
    ms: stats.ms, wpm: stats.wpm, raw: stats.raw, accuracy: stats.accuracy, correct: stats.correct, incorrect: stats.incorrect, extra: stats.extra, missed: stats.missed });
}

function ModeToggle({ mode, onChange }: { mode: TypingMode; onChange: (mode: TypingMode) => void }) {
  return <div className="typing-segment" role="group" aria-label="Typing mode">
    {(['snippet', 'solution'] as TypingMode[]).map(m => <button key={m} aria-pressed={mode === m} onClick={() => onChange(m)}>{m === 'snippet' ? 'Snippet' : 'Whole solution'}</button>)}
  </div>;
}
function LanguageSelect({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return <label className="typing-select">Language <select aria-label="Typing language" value={language} onChange={e => onChange(e.target.value as Language)}>{languages.map(l => <option key={l} value={l}>{languageNames[l]}</option>)}</select></label>;
}

type Props = { active: boolean } & (
  | { kind: 'catalog'; entries: Entry[]; progress: Record<string, Progress>; topics: string[]; onOpenProblem: (entry: Entry) => void }
  | { kind: 'problem'; problemId: string; language: Language });
export default function TypingPractice(props: Props) {
  return props.kind === 'catalog' ? <CatalogPractice {...props}/> : <ProblemPractice {...props}/>;
}

/** The sidebar page: random snippets from problems you have started (by default), so solutions stay hidden until you have tried them. */
function CatalogPractice({ active, entries, progress, topics, onOpenProblem }: Extract<Props, { kind: 'catalog' }>) {
  const settings = useTypingSettings(), results = useTypingResults();
  const [loaded, setLoaded] = useState<Loaded | null>(null), [error, setError] = useState(''), [round, setRound] = useState(0);
  const lastProblem = useRef<string | null>(null), request = useRef(0);
  const pool = useMemo(() => entries.filter(e => e.number && problems.has(e.id) && (settings.topic === 'all' || e.topic === settings.topic) && (
    settings.source === 'all' || settings.source === 'completed' && progress[e.id]?.status === 'completed' || settings.source === 'started' && ['in-progress', 'completed'].includes(progress[e.id]?.status ?? ''))), [entries, progress, settings.source, settings.topic]);
  const poolRef = useRef(pool); poolRef.current = pool;
  const empty = pool.length === 0;
  // A new snippet whenever a setting changes or Next is pressed; progress changes alone keep the current one.
  useEffect(() => {
    const choices = poolRef.current.filter(e => poolRef.current.length < 2 || e.id !== lastProblem.current);
    if (!choices.length) { setLoaded(null); return; }
    const entry = choices[Math.floor(Math.random() * choices.length)], id = ++request.current;
    lastProblem.current = entry.id; setError('');
    load(problems.get(entry.id)!, settings.language, settings.mode).then(next => { if (id === request.current) setLoaded(next); }, e => { if (id === request.current) setError(String(e).replace(/^Error: /, '')); });
  }, [settings.language, settings.mode, settings.source, settings.topic, round, empty]);
  const entry = loaded && entries.find(e => e.id === loaded.problem.id);
  const best = personalBest(results, settings.language, settings.mode)?.wpm ?? null;
  const recent = results.slice(-10).reverse();
  return <div className="typing-page" hidden={!active}>
    <div className="page-heading"><div><div className="eyebrow">BUILD FLUENCY WITH REAL CODE</div><h1>Typing practice</h1><p>Type reference solutions, brackets and symbols included. Indentation is automatic and comments are skipped.</p></div><span className="page-icon"><Keyboard size={28}/></span></div>
    <div className="typing-toolbar">
      <ModeToggle mode={settings.mode} onChange={mode => setTypingSettings({ mode })}/>
      <LanguageSelect language={settings.language} onChange={language => setTypingSettings({ language })}/>
      <label className="typing-select">Problems <select aria-label="Problems to type" value={settings.source} onChange={e => setTypingSettings({ source: e.target.value as TypingSource })}>{(Object.keys(sourceNames) as TypingSource[]).map(s => <option key={s} value={s}>{sourceNames[s]}</option>)}</select></label>
      <label className="typing-select">Topic <select aria-label="Topic" value={settings.topic} onChange={e => setTypingSettings({ topic: e.target.value })}><option value="all">All topics</option>{topics.filter(t => entries.some(e => e.number && e.topic === t)).map(t => <option key={t} value={t}>{t}</option>)}</select></label>
      <span className="typing-pool">{pool.length} {pool.length === 1 ? 'problem' : 'problems'}</span>
    </div>
    {empty ? <div className="empty-state typing-empty"><Keyboard size={30}/><h3>No problems to type yet</h3><p>{settings.source === 'all' ? 'No problems match this topic.' : `Typing practice uses ${settings.source === 'completed' ? 'problems you have completed' : 'problems you have started or completed'}${settings.topic === 'all' ? '' : ` in ${settings.topic}`}, so solutions stay hidden until you have tried them.`}</p>{settings.source !== 'all' && <button className="primary-button" onClick={() => setTypingSettings({ source: 'all' })}>Include all problems</button>}</div>
      : error ? <p className="error-text">{error}</p>
      : !loaded || !entry ? <div className="typing-loading">Loading a snippet…</div>
      : <section className="typing-card" aria-label="Snippet">
        <header className="typing-snippet-head"><div><strong>{entry.number}. {entry.title}</strong><span>{entry.topic} · {languageNames[loaded.language]} · {loaded.snippets[loaded.index].label}</span></div><button className="subtle-button" onClick={() => onOpenProblem(entry)}>Open problem<ArrowUpRight size={14}/></button></header>
        <TypingTrainer key={loaded.serial} lines={loaded.lines} active={active} best={best} onFinish={stats => save(loaded, stats)}
          actions={<button className="primary-button" autoFocus onClick={() => setRound(n => n + 1)}><SkipForward size={14}/>Next snippet</button>}/>
      </section>}
    <section className="typing-history" aria-label="Personal bests">
      <div className="section-heading"><h2>Personal bests</h2><p>{settings.mode === 'snippet' ? 'Snippet' : 'Whole solution'} mode · saved on this PC, not in study-data backups</p></div>
      <div className="stats-grid">{languages.map(l => { const top = personalBest(results, l, settings.mode); return <div className="stat" key={l}><span className="stat-icon blue"><Trophy size={18}/></span><div><span>{languageNames[l]}</span><strong>{top ? Math.round(top.wpm) : '–'}<small> wpm</small></strong></div>{top && <div className="stat-spark">{Math.floor(top.accuracy)}%</div>}</div>; })}</div>
      {recent.length > 0 && <><h3 className="typing-subheading">Recent runs</h3><ol className="typing-runs">{recent.map(r => { const p = problems.get(r.problemId); return <li key={r.at + r.problemId}><span className="typing-run-wpm">{Math.round(r.wpm)}<small> wpm</small></span><span>{Math.floor(r.accuracy)}%</span><span className="typing-run-title">{p ? `${p.number}. ${p.title}` : r.problemId}<small>{languageNames[r.language]} · {r.mode === 'snippet' ? r.unit : 'Whole solution'}</small></span><time dateTime={r.at}>{new Date(r.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time></li>; })}</ol></>}
    </section>
  </div>;
}

/** The problem's Type tab. Like Code's Solution button, it asks before showing the reference solution. */
function ProblemPractice({ active, problemId, language: initialLanguage }: Extract<Props, { kind: 'problem' }>) {
  const problem = problems.get(problemId)!, settings = useTypingSettings(), results = useTypingResults();
  const [revealed, setRevealed] = useState(false), [language, setLanguage] = useState(initialLanguage), [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null), [error, setError] = useState('');
  const mode = settings.mode;
  useEffect(() => {
    if (!revealed) return;
    let current = true; setError('');
    load(problem, language, mode, index).then(next => { if (current) setLoaded(next); }, e => { if (current) setError(String(e).replace(/^Error: /, '')); });
    return () => { current = false; };
  }, [revealed, language, mode, index]);
  const best = personalBest(results, language, mode, problemId);
  const count = loaded?.snippets.length ?? 0;
  if (!revealed) return <div className="typing-tab" hidden={!active}><div className="empty-state typing-gate"><Keyboard size={30}/><h3>Reveal the solution?</h3><p>Typing practice shows the reference {languageNames[language]} solution for {problem.title}. Your draft and progress stay unchanged.</p><button className="primary-button" onClick={() => setRevealed(true)}>Show solution and type it</button></div></div>;
  return <div className="typing-tab" hidden={!active}>
    <div className="typing-toolbar">
      <ModeToggle mode={mode} onChange={next => { setIndex(0); setTypingSettings({ mode: next }); }}/>
      {mode === 'snippet' && count > 1 && <label className="typing-select">Snippet <select aria-label="Snippet" value={loaded?.index ?? 0} onChange={e => setIndex(Number(e.target.value))}>{loaded!.snippets.map((s, i) => <option key={i} value={i}>{s.label}</option>)}</select></label>}
      <LanguageSelect language={language} onChange={next => { setIndex(0); setLanguage(next); }}/>
      <span className="typing-pool">{best ? <><Trophy size={13}/>Best {Math.round(best.wpm)} wpm · {Math.floor(best.accuracy)}%</> : 'No runs yet'}</span>
    </div>
    {error ? <p className="error-text">{error}</p> : !loaded ? <div className="typing-loading">Loading the solution…</div>
      : <section className="typing-card" aria-label="Snippet">
        <TypingTrainer key={loaded.serial} lines={loaded.lines} active={active} best={best?.wpm ?? null} onFinish={stats => save(loaded, stats)}
          actions={mode === 'snippet' && count > 1 ? <button className="primary-button" autoFocus onClick={() => setIndex((loaded.index + 1) % count)}><SkipForward size={14}/>Next snippet</button> : undefined}/>
      </section>}
  </div>;
}
