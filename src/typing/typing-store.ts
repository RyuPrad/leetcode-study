import { useSyncExternalStore } from 'react';
import { isLanguage, type Language } from '../../shared/coding';
import { preferredLanguage } from '../coding/language-preference';
// Typing practice settings and results are renderer-only, like study.tabOutEnabled: they stay on this device and are not in study-data backups.
export type TypingMode = 'snippet' | 'solution';
export type TypingSource = 'started' | 'completed' | 'all';
export interface TypingSettings { mode: TypingMode; language: Language; source: TypingSource; topic: string; }
export interface TypingResult {
  at: string; problemId: string; language: Language; mode: TypingMode; unit: string;
  ms: number; wpm: number; raw: number; accuracy: number; correct: number; incorrect: number; extra: number; missed: number;
}
const settingsKey = 'study.typingSettings', resultsKey = 'study.typingResults';
export const RESULT_LIMIT = 300;
const modes = new Set(['snippet', 'solution']), sources = new Set(['started', 'completed', 'all']);
const read = (key: string): unknown => { try { return JSON.parse(localStorage.getItem(key) ?? 'null'); } catch { return null; } };
const write = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Preferences are optional. */ } };
const count = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0;

function loadSettings(): TypingSettings {
  const value = read(settingsKey) as Partial<TypingSettings> | null, defaults: TypingSettings = { mode: 'snippet', language: preferredLanguage(), source: 'started', topic: 'all' };
  if (!value || typeof value !== 'object') return defaults;
  return {
    mode: modes.has(value.mode as string) ? value.mode as TypingMode : defaults.mode,
    language: isLanguage(value.language) ? value.language : defaults.language,
    source: sources.has(value.source as string) ? value.source as TypingSource : defaults.source,
    topic: typeof value.topic === 'string' && value.topic.length < 200 ? value.topic : defaults.topic
  };
}
export function validResult(value: unknown): value is TypingResult {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return typeof r.at === 'string' && Number.isFinite(Date.parse(r.at)) && typeof r.problemId === 'string' && /^leetcode:[1-9]\d*$/.test(r.problemId)
    && isLanguage(r.language) && modes.has(r.mode as string) && typeof r.unit === 'string' && r.unit.length <= 200
    && ['ms', 'wpm', 'raw', 'accuracy', 'correct', 'incorrect', 'extra', 'missed'].every(k => count(r[k])) && (r.accuracy as number) <= 100;
}
function loadResults(): TypingResult[] { const value = read(resultsKey); return Array.isArray(value) ? value.filter(validResult).slice(-RESULT_LIMIT) : []; }

let settings = loadSettings(), results = loadResults();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const notify = () => listeners.forEach(listener => listener());
export function setTypingSettings(patch: Partial<TypingSettings>) { settings = { ...settings, ...patch }; write(settingsKey, settings); notify(); }
export function addTypingResult(result: TypingResult) { results = [...results, result].slice(-RESULT_LIMIT); write(resultsKey, results); notify(); }
export const useTypingSettings = () => useSyncExternalStore(subscribe, () => settings);
export const useTypingResults = () => useSyncExternalStore(subscribe, () => results);

/** The fastest saved run for a language and mode, optionally for one problem. */
export function personalBest(list: readonly TypingResult[], language: Language, mode: TypingMode, problemId?: string): TypingResult | null {
  let best: TypingResult | null = null;
  for (const r of list) if (r.language === language && r.mode === mode && (!problemId || r.problemId === problemId) && (!best || r.wpm > best.wpm)) best = r;
  return best;
}
