import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Progress, StudySession, UserData } from '../shared/types';
import type { CodeDraft, JudgeResult } from '../shared/coding';
import { CODE_LIMIT } from '../shared/coding';
import { validateDraft, validateResult } from './coding-data';
import type { GuidedProgress } from '../shared/guided';
import { validateGuidedProgress } from './guided-data';

export const emptyData = (): UserData => ({ version: 3, progress: {}, sessions: [], drafts: {}, submissions: [], guided: {} });
const statuses = new Set(['not-started', 'in-progress', 'completed']);
const outcomes = new Set(['studied', 'solved', 'needs-review']);
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value));
const problemId = (value: unknown) => typeof value === 'string' && /^leetcode:[1-9]\d*$/.test(value);
export function validateData(value: unknown): UserData {
  if (!isObject(value) || (value.version !== 1 && value.version !== 2 && value.version !== 3) || !isObject(value.progress) || !Array.isArray(value.sessions) || value.version!==1 && (!isObject(value.drafts) || !Array.isArray(value.submissions)) || value.version===3 && !isObject(value.guided)) throw new Error('This is not a supported LeetCode Study backup (versions 1, 2 and 3).');
  for (const [id, p] of Object.entries(value.progress)) {
    if (!problemId(id) || !isObject(p) || !statuses.has(String(p.status)) || typeof p.bookmarked !== 'boolean' || typeof p.needsReview !== 'boolean' || !date(p.updatedAt)) throw new Error('The backup contains invalid progress records.');
  }
  const ids = new Set();
  for (const s of value.sessions) {
    if (!isObject(s) || typeof s.id !== 'string' || !/^[\w-]{1,100}$/.test(s.id) || ids.has(s.id) || !problemId(s.problemId) || !date(s.startedAt) || !date(s.updatedAt) || !(s.endedAt === null || date(s.endedAt)) || typeof s.durationMs !== 'number' || !Number.isFinite(s.durationMs) || s.durationMs < 0 || s.durationMs > 31_536_000_000 || !outcomes.has(String(s.outcome)) || typeof s.reflection !== 'string' || s.reflection.length > 20000) throw new Error('The backup contains invalid study sessions.');
    ids.add(s.id);
  }
  // Reconstruct known fields; never carry executable or arbitrary object properties into the store.
  return {
    version: 3,
    progress: Object.fromEntries(Object.entries(value.progress).map(([id, p]) => { const v = p as unknown as Progress; return [id, { status: v.status, bookmarked: v.bookmarked, needsReview: v.needsReview, updatedAt: v.updatedAt }]; })),
    sessions: value.sessions.map(s => ({ id: s.id, problemId: s.problemId, startedAt: s.startedAt, endedAt: s.endedAt, updatedAt: s.updatedAt, durationMs: s.durationMs, outcome: s.outcome, reflection: s.reflection })),
    drafts: value.version===1 ? {} : Object.fromEntries(Object.entries(value.drafts as Record<string,unknown>).map(([id,draft])=>{if(!problemId(id))throw new Error('Invalid draft problem.');return [id,validateDraft(draft)];})),
    submissions: value.version===1 ? [] : (value.submissions as any[]).map(s=>{if(!isObject(s)||typeof s.id!=='string'||!/^[\w-]{1,100}$/.test(s.id)||ids.has(s.id)||!problemId(s.problemId)||!date(s.createdAt)||typeof s.source!=='string'||s.source.length>CODE_LIMIT)throw new Error('Invalid submission.');ids.add(s.id);return {id:s.id,problemId:s.problemId as string,source:s.source,createdAt:s.createdAt as string,result:validateResult(s.result)};}),
    guided: value.version!==3 ? {} : Object.fromEntries(Object.entries(value.guided as Record<string, unknown>).map(([id, progress]) => { if (!problemId(id)) throw new Error('Invalid guided lesson problem.'); return [id, validateGuidedProgress(progress)]; }))
  };
}
export class StudyStore {
  private data: UserData = emptyData();
  readonly file: string;
  notice: string | null = null;
  constructor(directory: string) {
    fs.mkdirSync(directory, { recursive: true });
    this.file = path.join(directory, 'study-data.json');
    let migrated: 1 | 2 | undefined;
    if (fs.existsSync(this.file)) {
      try { const raw=JSON.parse(fs.readFileSync(this.file, 'utf8')); this.data = validateData(raw); migrated=raw.version===1 || raw.version===2 ? raw.version : undefined; }
      catch {
        fs.copyFileSync(this.file, `${this.file}.corrupt-${Date.now()}`);
        try { const raw=JSON.parse(fs.readFileSync(`${this.file}.bak`, 'utf8')); this.data = validateData(raw); migrated=raw.version===1 || raw.version===2 ? raw.version : undefined; this.notice = 'Your last recovery backup was restored. The unreadable file was preserved.'; }
        catch { throw new Error('Your study data and recovery backup could not be read. Both files have been preserved. Restore a valid backup before continuing.'); }
      }
    }
    if (migrated) { fs.copyFileSync(this.notice ? `${this.file}.bak` : this.file, `${this.file}.v${migrated}-${Date.now()}.json`); this.notice ||= 'Your study data was upgraded. A copy of the previous version was preserved.'; }
    let interrupted = false;
    for (const s of this.data.sessions) if (s.endedAt === null) { s.endedAt = s.updatedAt; interrupted = true; }
    if (interrupted || this.notice) this.write(false);
  }
  snapshot(): UserData { return structuredClone(this.data); }
  private write(backup = true) {
    const temp = `${this.file}.${randomUUID()}.tmp`;
    const bytes = JSON.stringify(this.data, null, 2);
    const fd = fs.openSync(temp, 'w');
    try { fs.writeFileSync(fd, bytes); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    try {
      if (backup && fs.existsSync(this.file)) fs.copyFileSync(this.file, `${this.file}.bak`);
      fs.renameSync(temp, this.file);
    } catch (error) { fs.rmSync(temp, { force: true }); throw error; }
  }
  private commit(next: UserData) {
    const previous = this.data;
    this.data = validateData(next);
    try { this.write(); } catch (error) { this.data = previous; throw error; }
  }
  updateProgress(id: string, patch: Partial<Pick<Progress, 'status' | 'bookmarked' | 'needsReview'>>) {
    if (!problemId(id) || !isObject(patch) || Object.keys(patch).some(k => !['status', 'bookmarked', 'needsReview'].includes(k))) throw new Error('Invalid progress update.');
    const next = this.snapshot();
    next.progress[id] = { ...(next.progress[id] ?? { status: 'not-started', bookmarked: false, needsReview: false }), ...patch, updatedAt: new Date().toISOString() };
    this.commit(next);
  }
  putSession(session: StudySession) {
    const next = this.snapshot();
    const index = next.sessions.findIndex(s => s.id === session.id);
    if (index < 0) next.sessions.push(session); else next.sessions[index] = session;
    this.commit(next);
  }
  editSession(id: string, patch: Pick<StudySession, 'durationMs' | 'outcome' | 'reflection'>) {
    if (!isObject(patch) || Object.keys(patch).some(k => !['durationMs', 'outcome', 'reflection'].includes(k))) throw new Error('Invalid session update.');
    const next = this.snapshot();
    const session = next.sessions.find(s => s.id === id);
    if (!session) throw new Error('This session no longer exists.');
    Object.assign(session, patch, { updatedAt: new Date().toISOString() });
    if (patch.outcome === 'solved' || patch.outcome === 'needs-review') {
      const p = next.progress[session.problemId] ?? { status: 'in-progress', bookmarked: false, needsReview: false, updatedAt: session.updatedAt };
      if (patch.outcome === 'solved') p.status = 'completed'; else p.needsReview = true;
      p.updatedAt = session.updatedAt;
      next.progress[session.problemId] = p;
    }
    this.commit(next);
  }
  deleteSession(id: string) { const next = this.snapshot(); next.sessions = next.sessions.filter(s => s.id !== id); this.commit(next); }
  saveDrafts(drafts: Record<string, CodeDraft>) {
    const next=this.snapshot();
    for(const [id,draft] of Object.entries(drafts)) { if(!problemId(id))throw new Error('Invalid draft problem.');next.drafts[id]=validateDraft(draft); }
    this.commit(next);
  }
  recordSubmission(problem: string, source: string, result: JudgeResult) {
    if(!problemId(problem)||typeof source!=='string'||source.length>CODE_LIMIT)throw new Error('Invalid submission source.');
    const next=this.snapshot(), now=new Date().toISOString(), clean=validateResult(result);
    next.submissions.push({id:randomUUID(),problemId:problem,source,createdAt:now,result:clean});
    if(clean.verdict==='Accepted')next.progress[problem]={...(next.progress[problem]??{bookmarked:false,needsReview:false}),status:'completed',updatedAt:now};
    this.commit(next);
  }
  saveGuidedProgress(problem: string, progress: GuidedProgress) {
    if (!problemId(problem)) throw new Error('Invalid guided lesson problem.');
    const next = this.snapshot();
    next.guided[problem] = validateGuidedProgress(progress);
    this.commit(next);
  }
  restore(value: unknown) {
    const next = validateData(value);
    for (const s of next.sessions) if (s.endedAt === null) s.endedAt = s.updatedAt;
    const archive = `${this.file}.before-import-${Date.now()}.json`;
    fs.writeFileSync(archive, JSON.stringify(this.data, null, 2));
    this.commit(next);
  }
}
