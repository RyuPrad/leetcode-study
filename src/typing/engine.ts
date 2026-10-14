import type { TypingLine } from './snippets';

/** Monkeytype-style results. WPM counts five characters as a word; accuracy counts every keystroke, including ones later corrected. */
export interface TypingStats {
  ms: number; wpm: number; raw: number; accuracy: number;
  correct: number; incorrect: number; extra: number; missed: number;
  /** The characters you were meant to type when you made a mistake, most frequent first. A line break is "\n". */
  misses: [string, number][];
  /** One entry per second of active typing: cumulative net WPM, raw WPM in that second, and mistakes in that second. */
  samples: { wpm: number; raw: number; errors: number }[];
}
export const EXTRA_LIMIT = 20;

/**
 * One attempt at typing a list of lines. Leading indentation is automatic, blank and comment-only lines are skipped,
 * and a wrong character is recorded in place (the cursor still advances) until Backspace corrects it.
 * Times are passed in (performance.now()) so the run can be tested with a fake clock.
 */
export class TypingRun {
  readonly lines: readonly TypingLine[];
  /** What was typed on each line; characters past the line's end are extras. */
  readonly typed: string[];
  line: number;
  done = false;
  started = false;
  keystrokes = 0;
  correctKeys = 0;
  private readonly first: number;
  private readonly last: number;
  private active = 0;
  private since: number | null = null;
  private finishedAt = 0;
  private readonly misses = new Map<string, number>();
  private readonly events: { t: number; ok: boolean }[] = [];

  constructor(lines: readonly TypingLine[]) {
    this.lines = lines;
    this.typed = lines.map(() => '');
    this.first = lines.findIndex(l => !l.skip);
    let last = lines.length - 1;
    while (last >= 0 && lines[last].skip) last--;
    this.last = last;
    this.line = Math.max(0, this.first);
    if (this.first < 0) this.done = true;
  }
  get running() { return this.since !== null && !this.done; }
  get column() { return this.typed[this.line].length; }
  elapsed(now: number) { return this.done ? this.finishedAt : this.active + (this.since === null ? 0 : now - this.since); }
  pause(now: number) { if (this.since !== null) { this.active += now - this.since; this.since = null; } }
  private resume(now: number) { this.started = true; if (this.since === null) this.since = now; }
  private record(now: number, ok: boolean, expected?: string) {
    this.keystrokes++;
    if (ok) this.correctKeys++;
    else if (expected !== undefined) this.misses.set(expected, (this.misses.get(expected) ?? 0) + 1);
    this.events.push({ t: this.elapsed(now), ok });
  }
  private finish(now: number) { this.finishedAt = this.elapsed(now); this.pause(now); this.done = true; }
  private nextLine(from: number) { let i = from + 1; while (i < this.lines.length && this.lines[i].skip) i++; return i; }
  private previousLine(from: number) { let i = from - 1; while (i >= 0 && this.lines[i].skip) i--; return i; }
  /** True when a line is not exactly its text, so Backspace may return to it (as Monkeytype allows only for incorrect words). */
  hasError(index: number) { return this.typed[index] !== this.lines[index].text; }

  type(char: string, now: number) {
    if (this.done) return;
    const text = this.lines[this.line].text, typed = this.typed[this.line];
    if (typed.length >= text.length + EXTRA_LIMIT) return;
    this.resume(now);
    const expected = typed.length < text.length ? text[typed.length] : '\n';
    this.record(now, char === expected, expected);
    this.typed[this.line] = typed + char;
    if (this.line === this.last && this.typed[this.line].length >= text.length) this.finish(now);
  }

  enter(now: number) {
    if (this.done) return;
    const text = this.lines[this.line].text, typed = this.typed[this.line];
    // Enter before any typing would only skip the line; ignore it so a stray key does not start the clock.
    if (!typed.length && !this.started) return;
    this.resume(now);
    this.record(now, typed.length >= text.length, typed.length < text.length ? text[typed.length] : undefined);
    if (this.line === this.last) { this.finish(now); return; }
    this.line = this.nextLine(this.line);
  }

  backspace() {
    if (this.done) return;
    const typed = this.typed[this.line];
    if (typed.length) { this.typed[this.line] = typed.slice(0, -1); return; }
    this.back();
  }

  /** Ctrl+Backspace: removes trailing spaces, then the word or run of symbols before them. */
  backspaceWord() {
    if (this.done) return;
    const typed = this.typed[this.line];
    if (!typed.length) { this.back(); return; }
    const trimmed = typed.replace(/ +$/, ''), word = trimmed.match(/(?:\w+|[^\w ]+)$/)?.[0] ?? '';
    this.typed[this.line] = trimmed.slice(0, trimmed.length - word.length);
  }

  private back() {
    const previous = this.previousLine(this.line);
    if (previous < 0 || !this.hasError(previous)) return;
    this.line = previous;
  }

  /** Progress through the code characters, for the live counter. */
  progress() {
    let done = 0, total = 0;
    this.lines.forEach((line, i) => { if (line.skip) return; total += line.text.length; if (i < this.line) done += line.text.length; else if (i === this.line) done += Math.min(line.text.length, this.typed[i].length); });
    return { done: this.done ? total : done, total };
  }

  stats(now: number): TypingStats {
    const ms = Math.max(1, this.elapsed(now));
    let correct = 0, incorrect = 0, extra = 0, missed = 0, breaks = 0, goodBreaks = 0;
    this.lines.forEach((line, i) => {
      if (line.skip || i > this.line) return;
      const typed = this.typed[i], text = line.text;
      for (let j = 0; j < Math.min(typed.length, text.length); j++) if (typed[j] === text[j]) correct++; else incorrect++;
      extra += Math.max(0, typed.length - text.length);
      // Lines already left (and the last line when Enter ended the run early) count their untyped characters as missed.
      if (i < this.line || this.done) missed += Math.max(0, text.length - typed.length);
      if (i < this.line) { breaks++; if (typed.length >= text.length) goodBreaks++; }
    });
    const minutes = ms / 60000, round = (n: number) => Math.round(n * 100) / 100;
    const seconds = Math.max(1, Math.ceil(ms / 1000)), samples: TypingStats['samples'] = [];
    let cumulative = 0, e = 0;
    for (let s = 1; s <= seconds; s++) {
      const end = Math.min(s * 1000, ms);
      let keys = 0, errors = 0;
      while (e < this.events.length && (this.events[e].t < end || s === seconds)) { keys++; if (this.events[e].ok) cumulative++; else errors++; e++; }
      const span = end - (s - 1) * 1000;
      samples.push({ wpm: round(cumulative / 5 / (end / 60000)), raw: round(keys / 5 / (Math.max(span, 1) / 60000)), errors });
    }
    return {
      ms: Math.round(ms), wpm: round((correct + goodBreaks) / 5 / minutes), raw: round((correct + incorrect + extra + breaks) / 5 / minutes),
      accuracy: this.keystrokes ? round(this.correctKeys / this.keystrokes * 100) : 100,
      correct, incorrect, extra, missed,
      misses: [...this.misses].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])), samples
    };
  }
}
