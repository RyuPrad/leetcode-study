import './visualization/walkthrough-mode';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, Star, Flag, Check, CheckCircle2, Circle, Clock3, ChevronRight, Code2, PanelLeftClose, PanelLeftOpen, History, Settings2, Download, Upload, X, ArrowLeft, Trash2, Save, Layers, FileText, ExternalLink, Activity, Pencil, ArrowUpRight, BookOpen, HardDrive, Pause } from 'lucide-react';
import type { Catalog, Entry, Outcome, ProblemStatus, Progress, SolutionTechnique, StudySession, TimerState, UserData } from '../shared/types';
import {useEditorFocusRequest} from './coding/editor-focus';
const CodeWorkspace = lazy(() => import('./coding/CodeWorkspace'));
const GuidedWorkspace = lazy(() => import('./guided/GuidedWorkspace'));

const emptyProgress: Progress = { status: 'not-started', bookmarked: false, needsReview: false, updatedAt: '' };
const labels: Record<ProblemStatus, string> = { 'not-started': 'Not started', 'in-progress': 'In progress', completed: 'Completed' };
const outcomeLabels: Record<Outcome, string> = { studied: 'Studied', solved: 'Solved', 'needs-review': 'Needs review' };
const emptyTimer: TimerState = { problemId: null, sessionId: null, durationMs: 0, running: false, reason: 'inactive' };
const techniqueKinds: Record<SolutionTechnique['kind'], string> = { algorithm: 'Algorithm', technique: 'Technique', 'data-structure': 'Data structure' };
type View = 'library' | 'problem' | 'history' | 'references';
type Filter = 'all' | ProblemStatus | 'bookmarked' | 'review';
function duration(ms: number, seconds = false) { const sec = Math.floor(ms / 1000); if (seconds) return `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`; return sec >= 3600 ? `${Math.floor(sec / 3600)}h ${Math.floor(sec % 3600 / 60)}m` : sec >= 60 ? `${Math.floor(sec / 60)}m` : `${sec}s`; }
function SolutionTechniqueLabels({ entry }: { entry: Entry }) {
  if (!entry.solutionTechniques?.length) return null;
  return <ul className="technique-labels" aria-label={`Algorithms and techniques for ${entry.title}`}>
    {entry.solutionTechniques.map(method => <li key={method.name} className={`technique-chip technique-${method.kind}`} title={`${techniqueKinds[method.kind]}: ${method.role}`}>{method.name}</li>)}
  </ul>;
}
function SolutionTechniques({ entry }: { entry: Entry }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (ref.current?.open && event.target instanceof Node && !ref.current.contains(event.target)) ref.current.open = false; };
    const blur = () => { if (ref.current) ref.current.open = false; };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('blur', blur);
    return () => { document.removeEventListener('pointerdown', outside); window.removeEventListener('blur', blur); };
  }, []);
  const methods = entry.solutionTechniques;
  if (!entry.number || !methods?.length) return null;
  return <details ref={ref} className="solution-techniques" onKeyDown={event => { if (event.key === 'Escape' && event.currentTarget.open) { event.currentTarget.open = false; event.currentTarget.querySelector('summary')?.focus(); event.stopPropagation(); } }}>
    <summary aria-label={`Algorithms and techniques (${methods.length})`} title="Algorithms and techniques used in this solution"><ChevronRight size={14} aria-hidden="true"/><span className="technique-summary-label">Algorithms & techniques</span><span className="technique-count">{methods.length}</span></summary>
    <div className="solution-techniques-body" tabIndex={0} role="region" aria-label="Solution algorithms and techniques">
      <p>Methods used in this problem’s bundled solutions.</p>
      <dl className="solution-techniques-list">{methods.map(method => <div key={method.name}>
        <dt><span>{method.name}</span><span className={`technique-kind technique-${method.kind}`}>{techniqueKinds[method.kind]}</span></dt>
        <dd>{method.role}</dd>
      </div>)}</dl>
    </div>
  </details>;
}
function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="modal" aria-label={title} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-heading"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={18}/></button></div>{children}</dialog>;
}
function SessionEditor({ session, onSave, onDelete, onClose }: { session: StudySession; onSave: (patch: Pick<StudySession, 'durationMs' | 'outcome' | 'reflection'>) => Promise<void>; onDelete: () => Promise<void>; onClose: () => void }) {
  const [minutes, setMinutes] = useState((session.durationMs / 60000).toFixed(2));
  const [outcome, setOutcome] = useState(session.outcome);
  const [reflection, setReflection] = useState(session.reflection);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); try { await onSave({ durationMs: Math.round(Number(minutes) * 60000), outcome, reflection }); onClose(); } catch (e) { setError(String(e)); } finally { setBusy(false); } }
  return <Modal title="Practice session" onClose={onClose}><form onSubmit={submit}><p className="muted">{new Date(session.startedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p><div className="form-grid"><label>Time spent <span>(minutes)</span><input type="number" min="0" max="525600" step="0.01" required value={minutes} onChange={e => setMinutes(e.target.value)}/></label><label>Outcome<select aria-label="Outcome" value={outcome} onChange={e => setOutcome(e.target.value as Outcome)}><option value="studied">Studied</option><option value="solved">Solved</option><option value="needs-review">Needs review</option></select></label></div><label className="form-label">Reflection<textarea aria-label="Reflection" rows={6} maxLength={20000} placeholder="What clicked? What would you approach differently next time?" value={reflection} onChange={e => setReflection(e.target.value)}/></label><p className="form-hint">Choosing Solved marks the problem Completed. Needs review adds it to your review queue.</p>{error && <p role="alert" className="error-text">{error}</p>}<div className="modal-actions">{confirm ? <><span className="error-text">Delete this session?</span><button type="button" className="danger-button" disabled={busy} onClick={async () => { setBusy(true); try { await onDelete(); onClose(); } catch (e) { setError(String(e)); setBusy(false); } }}>Confirm delete</button><button type="button" className="subtle-button" onClick={() => setConfirm(false)}>Keep</button></> : <><button type="button" className="subtle-button danger" onClick={() => setConfirm(true)}><Trash2 size={15}/>Delete session</button><button className="primary-button" disabled={busy} type="submit"><Save size={15}/>{busy ? 'Saving…' : 'Save changes'}</button></>}</div></form></Modal>;
}
function Notes({ entry, entries, onNavigate, onError }: { entry: Entry; entries: Entry[]; onNavigate: (entry: Entry) => void; onError: (error: unknown) => void }) {
  const findEntry = (target: string) => entries.find(e => e.title === target || e.notePath.replace(/\.md$/, '') === target || e.notePath.split('/').at(-1)?.replace(/\.md$/, '') === target);
  const markdown = entry.markdown.replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g, (_all, target, label) => `[${label || target}](#entry=${encodeURIComponent(findEntry(target)?.id || target)})`);
  return <article className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ href, children }) => <a href={href} onClick={event => { event.preventDefault(); if (!href) return; if (href.startsWith('#entry=')) { const found = entries.find(e => e.id === decodeURIComponent(href.slice(7))); if (found) onNavigate(found); } else if (/^https?:\/\//.test(href)) void window.study.openExternal(href).catch(onError); else { const found = findEntry(decodeURIComponent(href).replace(/\.md$/, '')); if (found) onNavigate(found); } }}>{children}{href?.startsWith('http') && <ExternalLink size={12}/>}</a> }}>{markdown}</ReactMarkdown></article>;
}
export default function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [data, setData] = useState<UserData>({ version: 3, progress: {}, sessions: [], drafts: {}, submissions: [], guided: {} });
  const [timer, setTimer] = useState(emptyTimer);
  const [view, setView] = useState<View>('library');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [topic, setTopic] = useState('all');
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('number');
  const [tab, setTab] = useState('visualizer');
  const [codeOpened, setCodeOpened] = useState<string | null>(null);
  const [learnOpened, setLearnOpened] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [settings, setSettings] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [codeFocusRequest, requestCodeFocus] = useEditorFocusRequest(view === 'problem' && tab === 'code' && !settings && !editing);
  const [notice, setNotice] = useState<{ message: string; error?: boolean } | null>(null);
  const [version, setVersion] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => { if (view !== 'problem' || !['learn', 'visualizer', 'code'].includes(tab)) return; const compact = () => { if (innerWidth < 1200 || innerHeight < 740) setCollapsed(true); }; compact(); window.addEventListener('resize', compact); return () => window.removeEventListener('resize', compact); }, [view, selectedId, tab]);
  const search = useRef<HTMLInputElement>(null);
  const searchRequested = useRef(false);
  function focusSearch() { if (search.current) search.current.focus(); else { searchRequested.current = true; setView('library'); } }
  useEffect(() => { if (view === 'library' && searchRequested.current && search.current) { search.current.focus(); searchRequested.current = false; } }, [view, catalog]);
  const frame = useRef<HTMLIFrameElement>(null);
  const [referenceObjectFocus, setReferenceObjectFocus] = useState(false);
  const pauseVisualizer = () => frame.current?.contentWindow?.postMessage({ type: 'study:pause' }, 'study://content');
  const onError = (e: unknown) => setNotice({ message: e instanceof Error ? e.message.replace(/^Error invoking remote method '[^']+': Error: /, '') : String(e), error: true });
  useEffect(() => {
    if (!window.study) { onError('Open LeetCode Study using the desktop application.'); return; }
    void window.study.bootstrap().then(result => { setCatalog(result.catalog); setData(result.data); setVersion(result.version); if (result.notice) setNotice({ message: result.notice }); }).catch(onError);
    const dispose = [window.study.onData(setData), window.study.onTimer(setTimer), window.study.onPlaybackPause(pauseVisualizer), window.study.onError(onError)];
    let lastActivity = 0;
    const activity = () => { if (performance.now() - lastActivity > 800) { window.study.activity(); lastActivity = performance.now(); } };
    const message = (event: MessageEvent) => { if (event.source !== frame.current?.contentWindow || event.origin !== 'study://content') return; if (event.data?.type === 'study:activity') activity(); if (event.data?.type === 'study:search') { focusSearch(); } if (event.data?.type === 'study:object-focus' && typeof event.data.focused === 'boolean') setReferenceObjectFocus(event.data.focused); };
    const hotkey = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); focusSearch(); } };
    for (const event of ['pointerdown', 'keydown', 'wheel', 'input']) window.addEventListener(event, activity, { passive: true });
    window.addEventListener('message', message); window.addEventListener('keydown', hotkey);
    return () => { dispose.forEach(f => f()); for (const event of ['pointerdown', 'keydown', 'wheel', 'input']) window.removeEventListener(event, activity); window.removeEventListener('message', message); window.removeEventListener('keydown', hotkey); };
  }, []);
  const entry = catalog?.entries.find(e => e.id === selectedId);
  useEffect(() => { if (catalog) void window.study.selectProblem(view === 'problem' && entry?.number ? entry.id : null).then(setTimer).catch(onError); }, [view, selectedId, Boolean(catalog)]);
  useEffect(() => { if (view !== 'problem' || tab !== 'visualizer' || settings || editing) pauseVisualizer(); }, [view, tab, settings, editing]);
  useEffect(() => { if (notice && !notice.error) { const id = setTimeout(() => setNotice(null), 6500); return () => clearTimeout(id); } }, [notice]);
  function openEntry(next: Entry) { setReferenceObjectFocus(false); setSelectedId(next.id); setCodeOpened(null); setLearnOpened(null); setTab(next.visualizerPath ? 'visualizer' : 'notes'); setReady(false); setView('problem'); }
  function library(nextFilter: Filter = 'all', nextTopic = 'all') { setReferenceObjectFocus(false); setView('library'); setFilter(nextFilter); setTopic(nextTopic); setQuery(''); }
  async function progress(id: string, patch: Partial<Progress>) { try { setData(await window.study.setProgress(id, patch)); } catch (e) { onError(e); } }
  if (!catalog) return <div className="boot-screen"><Code2 size={38}/><h1>LeetCode Study</h1><p>{notice?.message || 'Opening your workspace…'}</p></div>;
  const problems = catalog.entries.filter(e => e.number);
  const completed = problems.filter(e => data.progress[e.id]?.status === 'completed').length;
  const bookmarked = problems.filter(e => data.progress[e.id]?.bookmarked).length;
  const review = problems.filter(e => data.progress[e.id]?.needsReview).length;
  const totalTime = data.sessions.reduce((sum, s) => sum + (s.id === timer.sessionId ? timer.durationMs : s.durationMs), 0);
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = problems.filter(e => {
    const p = data.progress[e.id] || emptyProgress;
    return (topic === 'all' || e.topic === topic) && (filter === 'all' || filter === p.status || filter === 'bookmarked' && p.bookmarked || filter === 'review' && p.needsReview) && terms.every(term => e.searchText.includes(term));
  }).sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : (a.number! - b.number!));
  const recent = [...data.sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).map(s => catalog.entries.find(e => e.id === s.problemId)).find(Boolean);
  const entryProgress = entry ? data.progress[entry.id] || emptyProgress : emptyProgress;
  const sessions = [...data.sessions].filter(s => view !== 'problem' || s.problemId === entry?.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const editSession = data.sessions.find(s => s.id === editing);
  function historyList() { return sessions.length ? <div className="session-list">{sessions.map(s => { const item = catalog!.entries.find(e => e.id === s.problemId); const active = timer.sessionId === s.id; return <div className="session-card" key={s.id}><div className={`session-symbol ${s.outcome}`}><History size={17}/></div><div className="session-detail">{view !== 'problem' && <button className="session-title" onClick={() => item && openEntry(item)}>{item?.title || s.problemId}<ChevronRight size={13}/></button>}<div className="session-meta"><span>{new Date(s.startedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>{active && <span className="live-label">Current session</span>}</div><p className={s.reflection ? '' : 'muted'}>{s.reflection || 'No reflection yet. Add what you learned.'}</p></div><span className={`outcome ${s.outcome}`}>{outcomeLabels[s.outcome]}</span><span className="session-duration">{duration(active ? timer.durationMs : s.durationMs)}</span><button className="icon-button" title="Edit session" aria-label="Edit session" onClick={() => setEditing(s.id)}><Pencil size={16}/></button></div>; })}</div> : <div className="empty-state"><History size={30}/><h3>Your practice starts here</h3><p>Open a problem to start a session. Your time and reflections will appear here.</p><button className="primary-button" onClick={() => library()}>Explore problems<ChevronRight size={15}/></button></div>; }
  return <div className={`app ${collapsed ? 'sidebar-collapsed' : ''} ${view === 'problem' ? 'practice-workspace' : ''} ${referenceObjectFocus && view === 'problem' && tab === 'visualizer' && !settings && !editing ? 'reference-object-focus' : ''}`}>
    <aside className="sidebar">
      <button className="brand" onClick={() => library()} aria-label="LeetCode Study home"><span className="brand-mark"><Code2 size={24}/><i/></span><span className="brand-text">LeetCode<span>STUDY</span></span></button>
      <div className="workspace-label"><span/>PERSONAL WORKSPACE</div>
      <nav className="main-nav" aria-label="Main navigation">
        <button title="Problem library" className={view === 'library' && filter !== 'bookmarked' && filter !== 'review' ? 'active' : ''} onClick={() => library()}><Layers size={18}/><span>Problem library</span><b>{problems.length}</b></button>
        <button title="Bookmarks" className={view === 'library' && filter === 'bookmarked' ? 'active' : ''} onClick={() => library('bookmarked')}><Star size={18}/><span>Bookmarks</span>{bookmarked > 0 && <b>{bookmarked}</b>}</button>
        <button title="Review queue" className={view === 'library' && filter === 'review' ? 'active' : ''} onClick={() => library('review')}><Flag size={18}/><span>Review queue</span>{review > 0 && <b>{review}</b>}</button>
        <button title="Practice history" className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}><History size={18}/><span>Practice history</span></button>
        <button title="Reference guides" className={view === 'references' || entry?.topic === 'Reference' && view === 'problem' ? 'active' : ''} onClick={() => setView('references')}><BookOpen size={18}/><span>Reference guides</span></button>
      </nav>
      <div className="topic-heading"><span>TOPICS</span><span>{catalog.topics.length}</span></div>
      <nav className="topic-nav" aria-label="Topics">{catalog.topics.map((name, i) => { const topicEntries = problems.filter(e => e.topic === name); const done = topicEntries.filter(e => data.progress[e.id]?.status === 'completed').length; return <button key={name} className={topic === name && view === 'library' ? 'active' : ''} onClick={() => library('all', name)}><span className={`topic-dot color-${i % 5}`}/><span>{name}</span><small>{done > 0 ? `${done}/` : ''}{topicEntries.length}</small></button>; })}</nav>
      <div className="sidebar-bottom"><div className="sidebar-progress"><div><span>Your progress</span><strong>{Math.round(completed / problems.length * 100)}%</strong></div><div className="progress-track"><i style={{ width: `${completed / problems.length * 100}%` }}/></div><p>{completed} of {problems.length} completed</p></div><button className="settings-button" title="Settings and backup" aria-label="Settings and backup" onClick={() => setSettings(true)}><Settings2 size={17}/><span>Settings & backup</span><span className="version">v{version}</span></button></div>
    </aside>
    <div className="app-body">
      <header className="topbar"><button className="icon-button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen size={18}/> : <PanelLeftClose size={18}/>}</button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={13}/><strong>{view === 'problem' ? entry?.topic : view === 'history' ? 'Practice history' : view === 'references' ? 'Reference guides' : 'Problem library'}</strong></div><div className="topbar-right"><button className="quick-search" onClick={() => { focusSearch(); }}><Search size={14}/><span>Find a problem</span><kbd>Ctrl K</kbd></button><span className="offline-label"><span/>Offline ready</span></div></header>
      {notice && !settings && <div className={`notice ${notice.error ? 'notice-error' : ''}`} role={notice.error ? 'alert' : 'status'}><span>{notice.message}</span><button aria-label="Dismiss message" onClick={() => setNotice(null)}><X size={15}/></button></div>}
      <main className={`main-content ${view === 'problem' ? 'problem-content' : ''}`}>
        {view === 'library' && <>
          <div className="page-heading"><div><div className="eyebrow">LEARN. TRACE. UNDERSTAND.</div><h1>{filter === 'bookmarked' ? 'Your bookmarks' : filter === 'review' ? 'Review queue' : topic !== 'all' ? topic : 'Problem library'}</h1><p>Go beyond the solution. See how every algorithm works, one step at a time.</p></div><div className="library-badge"><Code2 size={24}/><span><strong>{catalog.visualizers.length}</strong> interactive visualizers</span></div></div>
          <div className="stats-grid"><div className="stat"><span className="stat-icon green"><CheckCircle2 size={19}/></span><div><span>Completed</span><strong>{completed}<small> / {problems.length}</small></strong></div><div className="stat-spark">{Math.round(completed / problems.length * 100)}%</div></div><div className="stat"><span className="stat-icon blue"><Clock3 size={19}/></span><div><span>Study time</span><strong>{duration(totalTime)}</strong></div></div><div className="stat"><span className="stat-icon purple"><Activity size={19}/></span><div><span>Practice sessions</span><strong>{data.sessions.length}</strong></div></div><div className="stat"><span className="stat-icon amber"><Star size={19}/></span><div><span>Bookmarked</span><strong>{bookmarked}</strong></div></div></div>
          {recent && <button className="resume-card" onClick={() => openEntry(recent)}><span className="resume-icon"><History size={18}/></span><span><small>PICK UP WHERE YOU LEFT OFF</small><strong>{recent.number}. {recent.title}<span>{recent.topic}</span></strong></span><ArrowUpRight size={19}/></button>}
          <section className="library-panel" aria-label="Problem library"><div className="library-tools"><div className="search-input"><Search size={18}/><input ref={search} type="search" aria-label="Search problems" placeholder="Search problems, algorithms, techniques, or notes…" value={query} onChange={e => setQuery(e.target.value)}/><kbd>Ctrl K</kbd></div><select className="sort-select" aria-label="Sort problems" value={sort} onChange={e => setSort(e.target.value)}><option value="number">Problem number</option><option value="title">Title A–Z</option></select></div><div className="filter-row">{(['all', 'not-started', 'in-progress', 'completed'] as Filter[]).map(value => <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{value === 'all' ? 'All problems' : labels[value as ProblemStatus]}</button>)}{topic !== 'all' && <button className="topic-filter" onClick={() => setTopic('all')}>{topic}<X size={12}/></button>}<span>{visible.length} problems</span></div>
            {visible.length ? <div className="table-scroll"><table className="problem-table"><thead><tr><th className="number-col">#</th><th>PROBLEM</th><th>TOPIC</th><th>PROGRESS</th><th><span className="sr-only">Bookmark</span><Star size={13}/></th></tr></thead><tbody>{visible.map(p => { const state = data.progress[p.id] || emptyProgress; return <tr key={p.id}><td className="number-col">{String(p.number).padStart(3, '0')}</td><td><button className="problem-link" onClick={() => openEntry(p)} aria-label={`Open ${p.title}`}><span>{p.title}</span>{state.needsReview && <Flag size={12} className="review-marker"/>}<ChevronRight size={14}/></button><SolutionTechniqueLabels entry={p}/></td><td><span className="topic-chip">{p.topic}</span></td><td><span className={`status-label ${state.status}`}>{state.status === 'completed' ? <CheckCircle2 size={13}/> : state.status === 'in-progress' ? <span className="status-dot"/> : <Circle size={12}/>} {labels[state.status]}</span></td><td><button className={`icon-button bookmark ${state.bookmarked ? 'is-bookmarked' : ''}`} aria-label={`Bookmark ${p.title}`} aria-pressed={state.bookmarked} onClick={() => void progress(p.id, { bookmarked: !state.bookmarked })}><Star size={16} fill={state.bookmarked ? 'currentColor' : 'none'}/></button></td></tr>; })}</tbody></table></div> : <div className="empty-state"><Search size={30}/><h3>No matching problems</h3><p>Try a different search or clear the current filters.</p><button className="subtle-button" onClick={() => library()}>Clear filters</button></div>}
          </section><footer className="page-footer"><HardDrive size={13}/>Your progress stays on this PC.<span>Practice at your own pace.</span></footer>
        </>}
        {view === 'problem' && entry && <>
          <div className="problem-heading"><button className="icon-button back-button" aria-label="Back to library" onClick={() => library()}><ArrowLeft size={19}/></button><div><div className="eyebrow">{entry.number ? `PROBLEM ${String(entry.number).padStart(3, '0')}` : 'REFERENCE GUIDE'}<span> / {entry.topic}</span></div><h1 title={entry.title}>{entry.title}</h1></div>{entry.number && <div className="problem-actions"><button className={`icon-button ${entryProgress.bookmarked ? 'is-bookmarked' : ''}`} title="Bookmark" aria-label="Bookmark problem" aria-pressed={entryProgress.bookmarked} onClick={() => void progress(entry.id, { bookmarked: !entryProgress.bookmarked })}><Star size={18} fill={entryProgress.bookmarked ? 'currentColor' : 'none'}/></button><button className={`review-button ${entryProgress.needsReview ? 'selected' : ''}`} title="Needs review" aria-pressed={entryProgress.needsReview} onClick={() => void progress(entry.id, { needsReview: !entryProgress.needsReview })}><Flag size={14}/>Needs review</button><select className={`progress-select ${entryProgress.status}`} aria-label="Problem progress" value={entryProgress.status} onChange={e => void progress(entry.id, { status: e.target.value as ProblemStatus })}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>}</div>
          <div className="workspace-tabbar"><div role="tablist" aria-label="Problem views">{entry.visualizerPath && <button role="tab" aria-selected={tab === 'learn'} onClick={() => { setLearnOpened(entry.id); setTab('learn'); }}><BookOpen size={16}/>Learn{data.guided[entry.id]?.completedAt && <Check size={13}/>}</button>}{entry.visualizerPath && <button role="tab" aria-selected={tab === 'visualizer'} onClick={() => setTab('visualizer')}><Code2 size={16}/>Visualizer</button>}{entry.number && <button role="tab" aria-selected={tab === 'code'} onClick={() => { setCodeOpened(entry.id); setTab('code'); requestCodeFocus(); }}><Code2 size={16}/>Code</button>}<button role="tab" aria-selected={tab === 'notes'} onClick={() => setTab('notes')}><FileText size={16}/>Notes</button>{entry.number && <button role="tab" aria-selected={tab === 'history'} onClick={() => setTab('history')}><History size={16}/>History<span className="tab-count">{sessions.length}</span></button>}</div><SolutionTechniques key={entry.id} entry={entry}/>{entry.number && <div className={`study-timer ${timer.running ? 'running' : ''}`} title="Automatically pauses when the app is unfocused or after five minutes of inactivity">{timer.running ? <span className="timer-dot"/> : <Pause size={12}/>}<span>{duration(timer.durationMs, true)}</span><small>{timer.running ? 'studying' : timer.reason === 'idle' ? 'idle · paused' : 'paused'}</small>{timer.sessionId && <button aria-label="Add session reflection" title="Add reflection or correct time" onClick={() => setEditing(timer.sessionId)}><Pencil size={13}/></button>}</div>}</div>
          {entry.visualizerPath && <div className="visualizer-container" hidden={tab !== 'visualizer'}>{!ready && <div className="frame-loading">Loading visualizer…</div>}<iframe key={entry.id} ref={frame} title={`${entry.title} visualizer`} sandbox="allow-scripts allow-same-origin" allow="fullscreen" allowFullScreen referrerPolicy="no-referrer" onLoad={() => setReady(true)} src={`study://content/${entry.visualizerPath.split('/').map(encodeURIComponent).join('/')}?embedded=1&parentOrigin=${encodeURIComponent(location.origin)}`}/></div>}
          {entry.visualizerPath && learnOpened === entry.id && <Suspense fallback={<div className="frame-loading">Opening guided lesson...</div>}><GuidedWorkspace key={entry.id} entry={entry} progress={data.guided[entry.id]} active={tab === 'learn' && !settings && !editing} onError={onError} onSearch={() => { focusSearch(); }}/></Suspense>}
          {entry.number && codeOpened === entry.id && <Suspense fallback={<div className="editor-loading">Loading coding workspace?</div>}><CodeWorkspace key={entry.id} problemId={entry.id} draft={data.drafts[entry.id]} submissions={data.submissions.filter(s => s.problemId === entry.id)} active={tab === 'code' && !settings && !editing} focusRequest={codeFocusRequest} onRequestFocus={requestCodeFocus}/></Suspense>}
          {tab === 'notes' && <div className="notes-container">{!entry.visualizerPath && entry.number && <div className="note-only"><FileText size={16}/>This problem has a written solution and variable guide.</div>}<Notes entry={entry} entries={catalog.entries} onNavigate={openEntry} onError={onError}/></div>}
          {tab === 'history' && <div className="history-container"><div className="section-heading"><div><h2>Your practice, over time</h2><p>Reflect on each attempt and keep track of what you learned.</p></div></div>{historyList()}</div>}
        </>}
        {view === 'history' && <><div className="page-heading"><div><div className="eyebrow">A RECORD OF YOUR WORK</div><h1>Practice history</h1><p>{data.sessions.length} sessions · {duration(totalTime)} of focused study</p></div><span className="page-icon"><History size={28}/></span></div>{historyList()}</>}
        {view === 'references' && <><div className="page-heading"><div><div className="eyebrow">KEEP THE FUNDAMENTALS CLOSE</div><h1>Reference guides</h1><p>Patterns and conventions to bring into your next problem.</p></div></div><div className="reference-grid">{catalog.entries.filter(e => !e.number).map(e => <button className="reference-card" key={e.id} onClick={() => openEntry(e)}><span className="reference-icon">{e.id.includes('variables') ? <Code2 size={26}/> : <BookOpen size={26}/>}</span><h2>{e.title}</h2><p>{e.id.includes('variables') ? 'Consistent variable names across arrays, trees, graphs, and more.' : 'A practical reference for common coding interview patterns.'}</p><span>Open guide<ArrowUpRight size={16}/></span></button>)}</div></>}
      </main>
    </div>
    {settings && <Modal title="Settings & backup" onClose={() => setSettings(false)}>{notice && <p role={notice.error ? "alert" : "status"} className={notice.error ? "error-text" : "backup-notice"}>{notice.message}</p>}<div className="settings-intro"><span className="brand-mark"><Code2 size={24}/></span><div><h3>LeetCode Study</h3><p>Version {version} · Your offline study workspace</p></div></div><div className="settings-section"><h3><HardDrive size={17}/>Your data, on your PC</h3><p>Progress, bookmarks, practice history, code drafts, submissions, and guided lesson answers are saved automatically. Export a backup to keep a copy or move to another computer.</p><div className="backup-actions"><button className="primary-button" onClick={() => void window.study.exportBackup().then(saved => { if (saved) setNotice({ message: 'Your backup was exported.' }); }).catch(onError)}><Download size={16}/>Export backup</button><button className="subtle-button" onClick={() => void window.study.importBackup().then(restored => { if (restored) window.location.reload(); }).catch(onError)}><Upload size={16}/>Restore backup</button></div></div><div className="settings-section"><h3><Clock3 size={17}/>Automatic study time</h3><p>Time is recorded while a problem is open and this window is active. Tracking pauses after 5 minutes without activity, or when you switch apps. Edit a session to correct its time or add a reflection.</p></div><div className="settings-section"><h3>Keyboard shortcuts</h3><div className="shortcut-row"><span>Find a problem</span><kbd>Ctrl K</kbd></div><div className="shortcut-row"><span>Step through a visualizer</span><span><kbd>←</kbd> <kbd>→</kbd></span></div><div className="shortcut-row"><span>Run code</span><kbd>Ctrl Enter</kbd></div><div className="shortcut-row"><span>Submit to local tests</span><kbd>Ctrl Shift Enter</kbd></div><div className="shortcut-row"><span>Zoom workspace</span><span><kbd>Ctrl +</kbd> <kbd>Ctrl −</kbd></span></div></div></Modal>}
    {editSession && <SessionEditor key={editSession.id} session={{ ...editSession, durationMs: editSession.id === timer.sessionId ? timer.durationMs : editSession.durationMs }} onClose={() => setEditing(null)} onSave={async patch => { setData(await window.study.editSession(editSession.id, patch)); }} onDelete={async () => { setData(await window.study.deleteSession(editSession.id)); }}/>} 
  </div>;
}
