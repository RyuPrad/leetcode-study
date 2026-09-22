import type { CodingProblem, Json } from '../shared/coding';
const key = (v: unknown) => JSON.stringify(v);
const sorted = (v: unknown[]) => v.map(key).sort();
const eq = (a: unknown, b: unknown) => key(a) === key(b);
const bag = (a: unknown[], b: unknown[]) => eq(sorted(a), sorted(b));
export function accepts(problem: CodingProblem, input: Json[], actual: any, expected: any): boolean {
  const n = problem.number, a = input as any[];
  if ([4,50,399,295].includes(n)) {
    const near = (x: any, y: any): boolean => typeof y === 'number' ? typeof x === 'number' && Number.isFinite(x) && Math.abs(x-y) <= 1e-5 * Math.max(1, Math.abs(y)) : Array.isArray(y) ? Array.isArray(x) && x.length === y.length && y.every((v,i) => near(x[i],v)) : x === y;
    return near(actual, expected);
  }
  if ([1,167].includes(n)) { if (!Array.isArray(actual) || actual.length !== 2 || !actual.every(Number.isInteger)) return false; const [i,j] = actual.map(v => v - (n === 167 ? 1 : 0)); return i !== j && i >= 0 && j >= 0 && i < a[0].length && j < a[0].length && a[0][i] + a[0][j] === a[1] && (n !== 167 || i < j); }
  if (n === 5) return typeof actual === 'string' && actual.length === expected.length && a[0].includes(actual) && actual === [...actual].reverse().join('');
  if (n === 76) { if (expected === '') return actual === ''; if (typeof actual !== 'string' || actual.length !== expected.length || !a[0].includes(actual)) return false; const count = (s: string) => [...s].reduce((m: Record<string,number>, c) => (m[c] = (m[c] || 0) + 1, m), {}); const need = count(a[1]), have = count(actual); return Object.keys(need).every(c => (have[c] || 0) >= need[c]); }
  if (n === 27) return actual && actual.length === expected.length && Array.isArray(actual.values) && bag(actual.values, expected.values);
  if ([15,18,39,40,77,78,90].includes(n)) return Array.isArray(actual) && actual.every(Array.isArray) && bag(actual.map(sorted), expected.map(sorted));
  if (n === 49) return Array.isArray(actual) && actual.every(Array.isArray) && bag(actual.map(sorted), expected.map(sorted));
  if ([17,22,46,47,51,131,140,212,229,310,347,417].includes(n)) return Array.isArray(actual) && bag(actual, expected);
  if (n === 1489) return Array.isArray(actual) && actual.length === 2 && actual.every(Array.isArray) && bag(actual[0],expected[0]) && bag(actual[1],expected[1]);
  if (n === 721) return Array.isArray(actual) && actual.every(Array.isArray) && bag(actual.map(row => [row[0], ...row.slice(1).sort()]), expected.map((row: any[]) => [row[0], ...row.slice(1).sort()]));
  if (n === 133) return Array.isArray(actual) && actual.every(Array.isArray) && actual.length === expected.length && actual.every((row,i) => bag(row, expected[i]));
  if (n === 973) { if (!Array.isArray(actual) || actual.length !== a[1]) return false; const points = a[0].map(key), maxDistance = Math.max(...expected.map((p: number[]) => p[0]**2+p[1]**2)); for (const point of actual) { const i = points.indexOf(key(point)); if (i < 0 || point[0]**2+point[1]**2 > maxDistance) return false; points.splice(i,1); } return true; }
  if (n === 767) return typeof actual === 'string' && actual.length === expected.length && (actual === '' || bag([...actual], [...a[0]]) && [...actual].every((c,i) => i === 0 || c !== actual[i-1]));
  if (n === 1405) return typeof actual === 'string' && actual.length === expected.length && !/(aaa|bbb|ccc|[^abc])/.test(actual) && ['a','b','c'].every((c,i) => [...actual].filter(v => v === c).length <= a[i]);
  if (n === 210) { if (!Array.isArray(actual)) return false; if (!expected.length) return actual.length === 0; return actual.length === a[0] && new Set(actual).size === a[0] && actual.every(v => Number.isInteger(v) && v >= 0 && v < a[0]) && a[1].every(([course,pre]: number[]) => actual.indexOf(pre) < actual.indexOf(course)); }
  if (n === 269) { if (typeof actual !== 'string') return false; if (!expected) return actual === ''; const chars = [...new Set<string>(a[0].join(''))]; if (!bag([...actual], chars)) return false; return a[0].slice(1).every((word: string,i: number) => { const prev = a[0][i]; let j = 0; while (j < Math.min(prev.length,word.length) && prev[j] === word[j]) j++; return j === Math.min(prev.length,word.length) ? prev.length <= word.length : actual.indexOf(prev[j]) < actual.indexOf(word[j]); }); }
  if (n === 2392) { if (!Array.isArray(actual)) return false; if (!expected.length) return actual.length === 0; const k = a[0], positions = new Map<number,number[]>(); if (actual.length !== k || actual.some(row => !Array.isArray(row) || row.length !== k)) return false; for (let r=0;r<k;r++) for (let c=0;c<k;c++) { const v = actual[r][c]; if (!Number.isInteger(v) || v < 0 || v > k || v && positions.has(v)) return false; if (v) positions.set(v,[r,c]); } return positions.size === k && [a[1],a[2]].every((edges,axis) => edges.every(([x,y]: number[]) => positions.get(x)![axis] < positions.get(y)![axis])); }
  // A BST deletion/insertion may use any valid shape with the required values.
  if ([450,701].includes(n)) { if (!Array.isArray(actual) || !bag(actual.filter(v => v !== null), expected.filter((v: any) => v !== null))) return false; const queue: [number,number][] = [[-Infinity,Infinity]]; let i=0; for (let q=0;q<queue.length && i<actual.length;q++) { const [lo,hi]=queue[q], v=actual[i++]; if (v === null) continue; if (typeof v !== 'number' || v <= lo || v >= hi) return false; queue.push([lo,v],[v,hi]); } return i===actual.length; }
  return eq(actual, expected);
}
