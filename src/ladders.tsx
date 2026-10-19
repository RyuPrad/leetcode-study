import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, ExternalLink, Info, ListOrdered, Lock, SkipForward } from 'lucide-react';
import type { Difficulty, Entry, Progress, SolutionMethod } from '../shared/types';

// Solution-method ladders: every LeetCode problem that shares a method, from easiest to hardest.
const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const kindLabels: Record<SolutionMethod['kind'], string> = { algorithm: 'Algorithm', technique: 'Technique', 'data-structure': 'Data structure' };
const categoryLabels: Record<NonNullable<Entry['category']>, string> = { algorithms: 'Algorithms', database: 'Database (SQL)', javascript: 'JavaScript', concurrency: 'Concurrency', shell: 'Shell' };
export interface Lookup { all: Entry[]; byId: Map<string, Entry>; methods: Map<string, SolutionMethod>; }
// Method topics in sidebar order, then any topic that only methods use (one that is never a primary method's).
export function methodTopics(topics: string[], methods: Iterable<SolutionMethod>) {
  return [...new Set([...topics, ...[...methods].map(method => method.topic)])];
}
export function DifficultyBadge({ difficulty }: { difficulty?: Difficulty }) { return difficulty ? <span className={`difficulty ${difficulty.toLowerCase()}`}>{difficulty}</span> : null; }
export const leetCodeUrl = (entry: Entry) => `https://leetcode.com/problems/${entry.slug}/`;
// Matches ladderOrder in scripts/content.mjs: difficulty, then higher acceptance, then number.
export function ladderCompare(a: Entry, b: Entry) {
  return difficulties.indexOf(a.difficulty!) - difficulties.indexOf(b.difficulty!) || (b.acceptance ?? 0) - (a.acceptance ?? 0) || a.number! - b.number!;
}
const completed = (progress: Record<string, Progress>, id: string) => progress[id]?.status === 'completed';
function StatusIcon({ status }: { status?: Progress['status'] }) {
  return status === 'completed' ? <CheckCircle2 size={13} className="ladder-status completed" aria-label="Completed"/> : status === 'in-progress' ? <span className="status-dot ladder-status" aria-label="In progress"/> : <Circle size={12} className="ladder-status" aria-hidden="true"/>;
}

// Method names under a library row, for problems without curated solution techniques.
export function MethodLabels({ entry, methods }: { entry: Entry; methods: Map<string, SolutionMethod> }) {
  if (!entry.methods?.length) return null;
  return <ul className="technique-labels" aria-label={`Solution methods for ${entry.title}`}>
    {entry.methods.map(key => { const method = methods.get(key); return method && <li key={key} className={`technique-chip technique-${method.kind}`} title={`${kindLabels[method.kind]}: ${method.summary}`}>{method.name}</li>; })}
  </ul>;
}

interface LadderProps { entry: Entry; lookup: Lookup; progress: Record<string, Progress>; compact?: boolean; onNavigate: (entry: Entry) => void; onOpenLadder: (key: string) => void; }
export function MethodLadders({ entry, lookup, progress, compact, onNavigate, onOpenLadder }: LadderProps) {
  const methods = (entry.methods ?? []).map(key => lookup.methods.get(key)).filter((method): method is SolutionMethod => Boolean(method));
  if (!methods.length) return <p className="muted">No solution methods are recorded for this problem.</p>;
  return <div className={`method-ladders ${compact ? 'compact' : ''}`}>
    {!compact && <div className="section-heading"><h2>Method ladders</h2><p>Every LeetCode problem that shares a method with this one, from easiest to hardest: Easy, then Medium, then Hard, and the higher acceptance rate first within a difficulty.</p></div>}
    {methods.map((method, index) => <LadderSection key={method.key} method={method} primary={index === 0} entry={entry} lookup={lookup} progress={progress} compact={compact} onNavigate={onNavigate} onOpenLadder={onOpenLadder}/>)}
  </div>;
}
function LadderSection({ method, primary, entry, lookup, progress, compact, onNavigate, onOpenLadder }: LadderProps & { method: SolutionMethod; primary: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const { ladder } = method, total = ladder.length, position = ladder.indexOf(entry.id);
  const at = (index: number) => index >= 0 && index < total ? lookup.byId.get(ladder[index]) : undefined;
  const easier = at(position - 1), harder = at(position + 1);
  const done = ladder.filter(id => completed(progress, id)).length;
  const nextOpen = ladder.slice(position + 1).find(id => !completed(progress, id));
  const unsolved = nextOpen && nextOpen !== harder?.id ? lookup.byId.get(nextOpen) : undefined;
  const start = expanded ? 0 : Math.max(0, position - 3), end = expanded ? total : Math.min(total, Math.max(position, 0) + 8);
  const label = (item: Entry) => `${item.number}. ${item.title} (${item.difficulty})`;
  return <section className="ladder" aria-label={`${method.name} ladder`}>
    <header className="ladder-heading">
      <div><h3>{method.name}<span className={`technique-kind technique-${method.kind}`}>{kindLabels[method.kind]}</span>{primary && <span className="ladder-primary">Primary method</span>}</h3><p>{method.summary}</p></div>
      <div className="ladder-step" aria-label={`Step ${position + 1} of ${total}`}><strong>{position + 1}</strong><span>of {total}</span></div>
    </header>
    <div className="ladder-progress"><span className="difficulty-track"><i style={{ width: `${done / total * 100}%` }}/></span><small>{done} of {total} completed</small></div>
    <div className="ladder-actions">
      <button className="subtle-button" disabled={!easier} title={easier ? label(easier) : 'This is the easiest problem on this ladder'} aria-label={easier ? `Easier: ${label(easier)}` : 'No easier problem'} onClick={() => easier && onNavigate(easier)}><ArrowLeft size={14}/>Easier</button>
      <button className="subtle-button" disabled={!harder} title={harder ? label(harder) : 'This is the hardest problem on this ladder'} aria-label={harder ? `Harder: ${label(harder)}` : 'No harder problem'} onClick={() => harder && onNavigate(harder)}>Harder<ArrowRight size={14}/></button>
      {unsolved && <button className="subtle-button" title={label(unsolved)} aria-label={`Next not completed: ${label(unsolved)}`} onClick={() => onNavigate(unsolved)}><SkipForward size={14}/>Next not completed</button>}
      <button className="subtle-button" onClick={() => onOpenLadder(method.key)}><ListOrdered size={14}/>Open in library</button>
    </div>
    {!compact && <>
      <ol className="ladder-list">{ladder.slice(start, end).map((id, offset) => {
        const item = lookup.byId.get(id), current = id === entry.id;
        if (!item) return null;
        return <li key={id} className={current ? 'current' : ''}><button aria-current={current ? 'step' : undefined} disabled={current} onClick={() => onNavigate(item)}>
          <span className="ladder-index">{start + offset + 1}</span><span className="ladder-title">{item.number}. {item.title}</span>
          {item.premium && <Lock size={11} className="premium-mark" aria-label="LeetCode Premium"/>}{!item.indexOnly && <span className="kit-mark" title="Includes notes, a visualizer and a local judge">Study kit</span>}
          <DifficultyBadge difficulty={item.difficulty}/><span className="ladder-acceptance" title="LeetCode acceptance rate">{item.acceptance?.toFixed(1)}%</span><StatusIcon status={progress[id]?.status}/>
        </button></li>;
      })}</ol>
      {total > end - start || expanded ? <button className="ladder-expand" onClick={() => setExpanded(!expanded)}>{expanded ? 'Show nearby problems only' : `Show all ${total} problems`}</button> : null}
    </>}
  </section>;
}

// The Overview tab of an index-only problem: what LeetCode says about it, and where it sits on each ladder.
export function ProblemOverview({ entry, lookup, progress, onNavigate, onOpenLadder, onOpenExternal }: LadderProps & { onOpenExternal: (url: string) => void }) {
  return <article className="problem-overview">
    <div className="note-only"><Info size={16}/>This problem links to LeetCode and has no bundled notes, visualizer or local judge. Solve it on LeetCode, then record your progress, time and reflections here.</div>
    <dl className="overview-facts">
      <div><dt>Difficulty</dt><dd><DifficultyBadge difficulty={entry.difficulty}/></dd></div>
      <div><dt>Acceptance</dt><dd>{entry.acceptance?.toFixed(1)}%</dd></div>
      <div><dt>Category</dt><dd>{entry.category ? categoryLabels[entry.category] : '—'}</dd></div>
      <div><dt>Access</dt><dd>{entry.premium ? <><Lock size={12}/> LeetCode Premium</> : 'Free'}</dd></div>
    </dl>
    <button className="primary-button" onClick={() => onOpenExternal(leetCodeUrl(entry))}><ExternalLink size={15}/>Open on LeetCode</button>
    {entry.tags?.length ? <><h3>LeetCode tags</h3><ul className="overview-tags">{entry.tags.map(tag => <li key={tag} className="topic-chip">{tag}</li>)}</ul></> : null}
    <h3>Solution methods</h3>
    <MethodLadders entry={entry} lookup={lookup} progress={progress} compact onNavigate={onNavigate} onOpenLadder={onOpenLadder}/>
  </article>;
}

// Every method with its ladder size and your progress, grouped by topic.
export function MethodsView({ lookup, topics, progress, onNavigate, onOpenLadder }: { lookup: Lookup; topics: string[]; progress: Record<string, Progress>; onNavigate: (entry: Entry) => void; onOpenLadder: (key: string) => void }) {
  const [query, setQuery] = useState('');
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const methods = [...lookup.methods.values()].filter(method => terms.every(term => `${method.name} ${method.summary} ${method.topic}`.toLowerCase().includes(term)));
  const groups = methodTopics(topics, lookup.methods.values()).map(topic => ({ topic, methods: methods.filter(method => method.topic === topic) })).filter(group => group.methods.length);
  return <>
    <div className="page-heading"><div><div className="eyebrow">ONE METHOD, EVERY PROBLEM</div><h1>Method ladders</h1><p>Every LeetCode problem grouped by the method its solution uses, ordered from easiest to hardest. Climb a ladder to practise one idea until it sticks.</p></div></div>
    <div className="methods-search search-input"><input type="search" aria-label="Search methods" placeholder="Search methods…" value={query} onChange={event => setQuery(event.target.value)}/></div>
    {groups.length ? groups.map(group => <section key={group.topic} className="method-group" aria-label={group.topic}><h2>{group.topic}</h2><div className="method-grid">{group.methods.map(method => {
      const items = method.ladder.map(id => lookup.byId.get(id)).filter((item): item is Entry => Boolean(item));
      const done = items.filter(item => completed(progress, item.id)).length, next = items.find(item => !completed(progress, item.id));
      return <article key={method.key} className="method-card">
        <h3>{method.name}</h3><span className={`technique-kind technique-${method.kind}`}>{kindLabels[method.kind]}</span>
        <p>{method.summary}</p>
        <div className="method-counts">{difficulties.map(level => <span key={level} className={`difficulty ${level.toLowerCase()}`}>{items.filter(item => item.difficulty === level).length} {level}</span>)}</div>
        <div className="ladder-progress"><span className="difficulty-track"><i style={{ width: `${items.length ? done / items.length * 100 : 0}%` }}/></span><small>{done} of {items.length} completed</small></div>
        <div className="ladder-actions">{next && <button className="primary-button" title={`${next.number}. ${next.title}`} onClick={() => onNavigate(next)}>{done ? 'Continue' : 'Start'}<ArrowRight size={14}/></button>}<button className="subtle-button" onClick={() => onOpenLadder(method.key)}><ListOrdered size={14}/>View ladder</button></div>
      </article>;
    })}</div></section>) : <div className="empty-state"><h3>No matching methods</h3><p>Try a different search.</p></div>}
  </>;
}
