import { memo, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { TypingRun, type TypingStats } from './engine';
import type { TypingLine } from './snippets';

type LineState = 'past' | 'current' | 'future';
const keyName = (char: string) => char === '\n' ? 'Enter' : char === ' ' ? 'Space' : char;
const clock = (ms: number) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// Only the lines whose typed text or state changed re-render on a keystroke.
const Line = memo(function Line({ line, typed, state, last }: { line: TypingLine; typed: string; state: LineState; last: boolean }) {
  const style = { '--indent': line.indent } as CSSProperties;
  if (line.skip) return <div className="typing-line skip" style={style}>{line.comment || ' '}</div>;
  const { text } = line, chars: ReactNode[] = [];
  for (let j = 0; j < text.length; j++) {
    const t = typed[j], space = text[j] === ' ';
    const cls = t === undefined ? state === 'past' ? 'missed' : '' : t === text[j] ? 'ok' : 'bad';
    chars.push(<span key={j} className={`${cls}${space && cls === 'bad' ? ' space' : ''}`} data-caret={state === 'current' && j === typed.length ? '' : undefined}>{text[j]}</span>);
  }
  const extra = typed.slice(text.length);
  return <div className={`typing-line ${state}`} style={style}>
    {chars}{extra && <span className="extra">{extra}</span>}
    {state === 'current' && typed.length >= text.length && <span className="typing-eol" data-caret="">{last ? '' : '↵'}</span>}
    {line.comment && <span className="typing-comment">{line.comment}</span>}
  </div>;
});

/** Per-second WPM, with the seconds that had mistakes marked along the bottom. */
function TypingChart({ samples }: { samples: TypingStats['samples'] }) {
  const box = useRef<HTMLDivElement>(null), [width, setWidth] = useState(560), [hover, setHover] = useState<number | null>(null);
  useLayoutEffect(() => {
    const element = box.current; if (!element) return;
    const measure = () => setWidth(Math.max(240, element.clientWidth));
    measure(); const observer = new ResizeObserver(measure); observer.observe(element); return () => observer.disconnect();
  }, []);
  if (samples.length < 2) return null;
  const height = 150, left = 34, right = 44, top = 14, plot = 92, rug = top + plot + 22;
  const max = Math.max(...samples.map(s => s.wpm), 10), step = max > 100 ? 50 : max > 40 ? 20 : 10, yMax = Math.ceil(max / step) * step;
  const x = (i: number) => left + i / (samples.length - 1) * (width - left - right), y = (v: number) => top + plot - v / yMax * plot;
  const path = samples.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s.wpm).toFixed(1)}`).join('');
  const every = samples.length > 60 ? 15 : samples.length > 20 ? 5 : samples.length > 8 ? 2 : 1;
  const ticks = [0, yMax / 2, yMax], end = samples[samples.length - 1];
  const nearest = (clientX: number) => { const bounds = box.current!.getBoundingClientRect(); return Math.max(0, Math.min(samples.length - 1, Math.round((clientX - bounds.left - left) / (width - left - right) * (samples.length - 1)))); };
  const shown = hover === null ? null : samples[hover];
  return <figure className="typing-chart" aria-label="Words per minute over time">
    <figcaption><span><i className="line-key"/>WPM</span><span><i className="dot-key"/>Mistakes</span></figcaption>
    <div ref={box} className="typing-chart-plot">
      <svg width={width} height={height} tabIndex={0} role="img" aria-label={`WPM over ${samples.length} seconds, ending at ${Math.round(end.wpm)}`}
        onPointerMove={e => setHover(nearest(e.clientX))} onPointerLeave={() => setHover(null)} onBlur={() => setHover(null)}
        onFocus={() => setHover(h => h ?? samples.length - 1)}
        onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); setHover(h => Math.max(0, Math.min(samples.length - 1, (h ?? samples.length - 1) + (e.key === 'ArrowLeft' ? -1 : 1)))); } else if (e.key === 'Escape') setHover(null); }}>
        {ticks.map(t => <g key={t}><line className="grid" x1={left} x2={width - right} y1={y(t)} y2={y(t)}/><text className="axis" x={left - 7} y={y(t) + 3} textAnchor="end">{t}</text></g>)}
        {samples.map((_, i) => (i + 1) % every === 0 && <text key={i} className="axis" x={x(i)} y={top + plot + 13} textAnchor="middle">{i + 1}s</text>)}
        <path className="area" d={`${path}L${x(samples.length - 1)},${y(0)}L${x(0)},${y(0)}Z`}/>
        <path className="wpm" d={path}/>
        <circle className="end" cx={x(samples.length - 1)} cy={y(end.wpm)} r={4}/>
        <text className="end-label" x={x(samples.length - 1) + 8} y={y(end.wpm) + 4}>{Math.round(end.wpm)}</text>
        {samples.map((s, i) => s.errors > 0 && <circle key={i} className="mistake" cx={x(i)} cy={rug} r={4}/>)}
        {shown && <><line className="crosshair" x1={x(hover!)} x2={x(hover!)} y1={top} y2={rug + 6}/><circle className="end" cx={x(hover!)} cy={y(shown.wpm)} r={4}/></>}
      </svg>
      {shown && <div className="typing-tooltip" role="status" style={{ left: Math.min(x(hover!) + 10, width - 150) }}><strong>{Math.round(shown.wpm)}</strong> WPM<br/><strong>{shown.errors}</strong> {shown.errors === 1 ? 'mistake' : 'mistakes'}<br/><span>{hover! + 1}s · raw {Math.round(shown.raw)}</span></div>}
    </div>
    <details className="typing-table"><summary>Per-second values</summary><table><thead><tr><th>Second</th><th>WPM</th><th>Raw</th><th>Mistakes</th></tr></thead><tbody>{samples.map((s, i) => <tr key={i}><td>{i + 1}</td><td>{Math.round(s.wpm)}</td><td>{Math.round(s.raw)}</td><td>{s.errors}</td></tr>)}</tbody></table></details>
  </figure>;
}

function Results({ stats, best, onRetry, actions }: { stats: TypingStats; best: number | null; onRetry: () => void; actions?: ReactNode }) {
  const record = best === null || stats.wpm > best;
  return <section className="typing-results" aria-label="Typing results">
    <div className="typing-score">
      <div><span>WPM</span><strong>{Math.round(stats.wpm)}</strong></div>
      <div><span>Accuracy</span><strong>{Math.floor(stats.accuracy)}%</strong></div>
      {record && <span className="typing-record"><Trophy size={14}/>New personal best</span>}
    </div>
    <dl className="typing-details">
      <div><dt>Raw</dt><dd>{Math.round(stats.raw)}</dd></div>
      <div><dt>Time</dt><dd>{(stats.ms / 1000).toFixed(1)}s</dd></div>
      <div title="correct / incorrect / extra / missed"><dt>Characters</dt><dd>{stats.correct}<span>/</span>{stats.incorrect}<span>/</span>{stats.extra}<span>/</span>{stats.missed}</dd></div>
    </dl>
    {stats.misses.length > 0 && <p className="typing-misses"><span>Most missed</span>{stats.misses.slice(0, 5).map(([char, n]) => <span key={char}><kbd>{keyName(char)}</kbd>×{n}</span>)}</p>}
    <TypingChart samples={stats.samples}/>
    <div className="typing-actions">{actions}<button className="subtle-button" autoFocus={!actions} onClick={onRetry}><RotateCcw size={14}/>Retry</button></div>
  </section>;
}

interface Props {
  lines: TypingLine[];
  active: boolean;
  /** The best saved WPM before this attempt, for the personal-best badge. */
  best: number | null;
  onFinish: (stats: TypingStats) => void;
  /** Extra result-card buttons, such as Next; the first should take focus. */
  actions?: ReactNode;
}
/** One typing attempt; Retry starts a fresh one over the same lines. */
export default function TypingTrainer(props: Props) {
  const [attempt, setAttempt] = useState(0);
  return <Attempt key={attempt} {...props} onRetry={() => setAttempt(n => n + 1)}/>;
}

function Attempt({ lines, active, best, onFinish, actions, onRetry }: Props & { onRetry: () => void }) {
  const [run] = useState(() => new TypingRun(lines)), [, render] = useReducer((n: number) => n + 1, 0);
  const [stats, setStats] = useState<TypingStats | null>(null), [focused, setFocused] = useState(false);
  const bestBefore = useRef(best).current;
  const root = useRef<HTMLDivElement>(null), input = useRef<HTMLTextAreaElement>(null), text = useRef<HTMLDivElement>(null), caret = useRef<HTMLSpanElement>(null);
  const finish = useRef(onFinish), reported = useRef(false); finish.current = onFinish;
  const update = () => {
    if (run.done && !reported.current) { reported.current = true; const result = run.stats(performance.now()); setStats(result); finish.current(result); }
    render();
  };
  const pause = () => { run.pause(performance.now()); render(); };

  useEffect(() => {
    const element = input.current!;
    const now = () => performance.now();
    let composing = false;
    const before = (event: InputEvent) => {
      if (event.inputType === 'insertCompositionText') return; // dead keys and IMEs finish in compositionend
      if (event.cancelable) event.preventDefault();
      if (event.inputType === 'insertText' && event.data) { for (const char of event.data) run.type(char, now()); update(); }
      else if (event.inputType === 'insertLineBreak' || event.inputType === 'insertParagraph') { run.enter(now()); update(); }
      // Paste, drop, undo and other edits are ignored.
    };
    const compose = () => { composing = true; };
    const composed = (event: CompositionEvent) => { composing = false; for (const char of event.data ?? '') run.type(char, now()); element.value = ''; update(); };
    const key = (event: KeyboardEvent) => {
      if (event.isComposing) return;
      if (event.key === 'Enter' && !event.ctrlKey && !event.altKey && !event.metaKey) { event.preventDefault(); run.enter(now()); update(); }
      else if (event.key === 'Backspace' && !event.altKey && !event.metaKey) { event.preventDefault(); if (event.ctrlKey) run.backspaceWord(); else run.backspace(); update(); }
      else if (event.key === 'Escape') element.blur();
    };
    const clear = () => { if (!composing) element.value = ''; };
    const listeners: [string, EventListener][] = [['beforeinput', before as EventListener], ['compositionstart', compose], ['compositionend', composed as EventListener], ['keydown', key as EventListener], ['input', clear]];
    for (const [type, listener] of listeners) element.addEventListener(type, listener);
    return () => { for (const [type, listener] of listeners) element.removeEventListener(type, listener); };
  }, [run]);

  // Leaving the view, minimizing, locking Windows or switching away pauses the clock, as playback does elsewhere.
  useEffect(() => { if (active && !run.done) input.current?.focus({ preventScroll: true }); else if (!active) { input.current?.blur(); pause(); } }, [active]);
  useEffect(() => {
    const dispose = window.study?.onPlaybackPause?.(pause);
    const hidden = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', hidden);
    return () => { dispose?.(); document.removeEventListener('visibilitychange', hidden); };
  }, []);
  // While unfocused, a printable key refocuses the text (it is not typed), unless another control has focus.
  useEffect(() => {
    if (!active || focused || run.done) return;
    const key = (event: KeyboardEvent) => {
      const target = document.activeElement;
      if (event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1 || target && target !== document.body && !root.current?.contains(target)) return;
      if (target instanceof HTMLButtonElement || target instanceof HTMLSelectElement || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof SVGElement || target?.closest('details')) return;
      event.preventDefault(); input.current?.focus({ preventScroll: true });
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [active, focused, stats]);
  const running = run.running;
  useEffect(() => { if (!running) return; const id = setInterval(render, 250); return () => clearInterval(id); }, [running]);

  // The caret sits at the next character (or the line end) and the text scrolls to keep it a third of the way down.
  useLayoutEffect(() => {
    const box = text.current, mark = caret.current; if (!box || !mark) return;
    const target = box.querySelector<HTMLElement>('[data-caret]');
    if (!target || run.done) { mark.hidden = true; return; }
    mark.hidden = false;
    mark.style.transform = `translate(${target.offsetLeft}px, ${target.offsetTop}px)`;
    mark.style.height = `${target.offsetHeight}px`;
    const top = target.offsetTop, height = target.offsetHeight;
    if (top < box.scrollTop + height || top > box.scrollTop + box.clientHeight - 2 * height) box.scrollTo({ top: Math.max(0, top - box.clientHeight / 3), behavior: reducedMotion() ? 'auto' : 'smooth' });
  });

  const now = performance.now(), elapsed = run.elapsed(now), progress = run.progress();
  const live = run.started ? run.stats(now) : null;
  const last = (() => { let i = lines.length - 1; while (i >= 0 && lines[i].skip) i--; return i; })();
  // The input comes first so Tab reaches Restart next, as in Monkeytype (Tab, then Enter).
  return <div ref={root} className={`typing-trainer ${focused ? 'focused' : ''} ${running ? 'running' : ''}`}>
    <textarea ref={input} className="typing-input" aria-label="Type the code shown" autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck={false} rows={1}
      onFocus={() => setFocused(true)} onBlur={() => { setFocused(false); pause(); }}/>
    <div className="typing-live" aria-live="off">
      <span><b>{clock(elapsed)}</b></span>
      <span><b>{live ? Math.round(live.wpm) : 0}</b> WPM</span>
      <span><b>{live ? Math.floor(live.accuracy) : 100}%</b> accuracy</span>
      <span className="typing-progress"><i style={{ width: `${progress.total ? progress.done / progress.total * 100 : 0}%` }}/></span>
      <button className="subtle-button typing-restart" onClick={onRetry} title="Restart (Tab, then Enter)"><RotateCcw size={13}/>Restart</button>
    </div>
    <div className="typing-frame" onMouseDown={e => { if (e.button === 0) { e.preventDefault(); input.current?.focus({ preventScroll: true }); } }}>
      <div ref={text} className="typing-text">
        {lines.map((line, i) => <Line key={i} line={line} typed={run.typed[i]} last={i === last} state={i < run.line || i === run.line && run.done ? 'past' : i === run.line ? 'current' : 'future'}/>)}
        <span ref={caret} className="typing-caret"/>
      </div>
      {!focused && !run.done && <div className="typing-overlay">{run.started ? 'Paused. Click or press a key to continue.' : 'Click or press a key to start typing.'}</div>}
    </div>
    {stats && <Results stats={stats} best={bestBefore} onRetry={onRetry} actions={actions}/>}
  </div>;
}
