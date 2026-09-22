import { CODE_LIMIT, INPUT_LIMIT, verdicts } from '../shared/coding';
import type { CodeDraft, JudgeResult } from '../shared/coding';
const object = (v: any) => v !== null && typeof v === 'object' && !Array.isArray(v);
const date = (v: any) => typeof v === 'string' && Number.isFinite(Date.parse(v));
const duration = (v: any) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 3600000;
export function validateDraft(v: any): CodeDraft {
  if (!object(v) || typeof v.source !== 'string' || v.source.length > CODE_LIMIT || typeof v.cases !== 'string' || v.cases.length > INPUT_LIMIT || !date(v.updatedAt)) throw new Error('Invalid code draft. Source and custom cases are limited to 256 KiB each.');
  return {source:v.source,cases:v.cases,updatedAt:v.updatedAt};
}
export function validateResult(v: any): JudgeResult {
  if (!object(v) || !verdicts.includes(v.verdict) || !Number.isInteger(v.total) || v.total < 1 || v.total > 100 || !Number.isInteger(v.passed) || v.passed < 0 || v.passed > v.total || !duration(v.durationMs) || !Array.isArray(v.cases) || v.cases.length > v.total || JSON.stringify(v).length > 4*1024*1024) throw new Error('Invalid submission result.');
  const cases = v.cases.map((c: any) => {
    if (!object(c) || typeof c.name !== 'string' || c.name.length > 100 || !Array.isArray(c.input) || JSON.stringify(c.input).length > INPUT_LIMIT || !verdicts.includes(c.verdict) || !duration(c.durationMs) || c.error !== undefined && (typeof c.error !== 'string' || c.error.length > 8000) || !Array.isArray(c.logs) || c.logs.some((l: any)=>typeof l!=='string') || c.logs.join('\n').length > 70000) throw new Error('Invalid test case result.');
    return {name:c.name,input:JSON.parse(JSON.stringify(c.input)),verdict:c.verdict,durationMs:c.durationMs,logs:[...c.logs],...(c.actual!==undefined?{actual:JSON.parse(JSON.stringify(c.actual))}:{}),...(c.expected!==undefined?{expected:JSON.parse(JSON.stringify(c.expected))}:{}),...(c.error?{error:c.error}:{})};
  });
  if (v.passed !== cases.filter((c: any)=>c.verdict==='Accepted').length || v.verdict==='Accepted' && (v.passed!==v.total || cases.length!==v.total) || v.verdict!=='Accepted' && v.passed===v.total) throw new Error('Inconsistent submission verdict.');
  return {verdict:v.verdict,passed:v.passed,total:v.total,durationMs:v.durationMs,cases};
}
