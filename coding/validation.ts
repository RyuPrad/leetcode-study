import type { CodingProblem, Json, CodeCase } from '../shared/coding';
import { CASE_LIMIT, INPUT_LIMIT } from '../shared/coding';
const array = Array.isArray;
const integer = (x: any) => Number.isSafeInteger(x);
const sorted = (a: number[], strict = false) => a.every((v,i) => !i || (strict ? v > a[i-1] : v >= a[i-1]));
const unique = (a: unknown[]) => new Set(a).size === a.length;
const matrix = (a: any) => array(a) && a.length > 0 && a.length <= 100 && a.every((r: any) => array(r) && r.length > 0 && r.length <= 100 && r.length === a[0].length);
const treeIds = new Set([94,98,100,102,104,105,110,124,144,145,199,226,230,235,297,337,437,450,543,572,700,701,1325,1448]);
function tree(values: any[]): boolean { let slots = 1; for (const value of values) { if (slots-- <= 0) return false; if (value !== null) { if (!integer(value)) return false; slots += 2; } } return true; }
function bst(values: any[]): boolean { const queue: [number,number][] = [[-Infinity,Infinity]]; let i = 0; for (let q = 0; q < queue.length && i < values.length; q++) { const [lo,hi] = queue[q],v = values[i++]; if (v === null) continue; if (!integer(v) || v <= lo || v >= hi) return false; queue.push([lo,v],[v,hi]); } return i === values.length; }
export function validateInput(problem: CodingProblem, input: unknown): string | null {
  const fail = (message: string): never => { throw new Error(message); };
  try {
    if (!array(input) || input.length !== problem.parameters.length) fail(`Use an array of ${problem.parameters.length} arguments: ${problem.parameters.join(', ')}.`);
    if (JSON.stringify(input).length > INPUT_LIMIT) fail('Each case must be smaller than 256 KiB.');
    const a = input as any[], n = problem.number;
    let cells = 0;
    function bounded(v: any, depth = 0) { if (++cells > 20000 || depth > 12) fail('Input is too large or too deeply nested.'); if (typeof v === 'number' && !Number.isFinite(v)) fail('Numbers must be finite.'); if (typeof v === 'string' && v.length > 10000) fail('Strings are limited to 10,000 characters.'); if (array(v)) { if (v.length > 2000) fail('Arrays are limited to 2,000 items.'); v.forEach(x => bounded(x,depth+1)); } else if (v !== null && !['number','string','boolean'].includes(typeof v)) fail('Use only JSON numbers, strings, booleans, null, and arrays.'); }
    bounded(a);
    if (problem.kind === 'design') {
      const [ops,args] = a;
      if (!array(ops) || !array(args) || !ops.length || ops.length !== args.length || ops[0] !== problem.entry || ops.length > 500) fail(`Use matching operations and arguments arrays, starting with ${problem.entry}. Limit: 500 operations.`);
      let size = n === 703 ? args[0]?.[1]?.length || 0 : 0, lastTime = -1;
      for (let i=0;i<ops.length;i++) {
        const method = i === 0 ? 'constructor' : ops[i], parameters = problem.methods?.[method] || (i === 0 ? [] : undefined);
        if(i && (method==='constructor' || !Object.hasOwn(problem.methods || {},method))) fail('Use a documented public operation.');
        if (!parameters || !array(args[i]) || args[i].length !== parameters.length) fail(`Invalid arguments for ${String(ops[i])}.`);
        if (!parameters) throw new Error('Unknown operation.');
        for (let j=0;j<parameters.length;j++) { const p=parameters[j],v=args[i][j]; if (['word','prefix','str','key','value'].includes(p) && [208,211,981].includes(n)) { if (typeof v !== 'string' || !v.length || (n !== 981 && !/^[a-z.]+$/.test(v))) fail(`${p} must be a nonempty string (lowercase letters for tries; . is allowed only in WordDictionary.search).`); if (n===208 && v.includes('.') || n===211 && method==='addWord' && v.includes('.')) fail('Inserted words use lowercase letters.'); } else if (!['matrix','nums','point'].includes(p) && !integer(v)) fail(`${p} must be an integer.`); }
        if (!i && [146,622,703].includes(n) && args[0][0] < 1) fail('Capacity/k must be positive.');
        if (!i && n===460 && args[0][0]<0) fail('Capacity cannot be negative.');
        if (!i && n===304 && !matrix(args[0][0])) fail('matrix must be nonempty and rectangular.');
        if (!i && n===703 && (!array(args[0][1]) || args[0][1].some((v:any)=>!integer(v)) || args[0][1].length < args[0][0]-1)) fail('nums must contain at least k - 1 integers.');
        if (['push','addNum'].includes(method) || n===703 && method==='add') size++;
        if ([155,225,232,295,895].includes(n) && ['pop','top','peek','getMin','findMedian'].includes(method) && !size) fail(`${method} requires a nonempty structure.`);
        if (method==='pop') size--;
        if (n===933 && i) { if (args[i][0] <= lastTime || args[i][0] < 1) fail('ping times must be positive and strictly increasing.'); lastTime = args[i][0]; }
        if (n===981 && method==='set') { if (args[i][2] <= lastTime) fail('set timestamps must be strictly increasing.'); lastTime=args[i][2]; }
        if (n===304 && i) { const [r,c,R,C]=args[i], mat=args[0][0]; if (r<0||c<0||R<r||C<c||R>=mat.length||C>=mat[0].length) fail('sumRegion coordinates are outside the matrix.'); }
        if (n===2013 && i && (!array(args[i][0]) || args[i][0].length!==2 || args[i][0].some((v:any)=>!integer(v)||v<0||v>1000))) fail('Points must have two integer coordinates in [0,1000].');
      }
      return null;
    }
    // Infer primitive container types from the maintained example contract, allowing empty arrays.
    const sample = problem.examples[0]?.input;
    function shape(value: any, example: any, depth = 0): boolean {
      if (example === null) return value === null || integer(value);
      if (array(example)) { if (!array(value)) return false; const specimen = example.find(x => x !== null); return specimen === undefined || value.every(v => treeIds.has(n) && v === null || shape(v,specimen,depth+1)); }
      return typeof value === typeof example && (typeof example !== 'number' || n === 50 || n === 399 || integer(value));
    }
    if (n!==138 && sample && a.some((v,i) => !shape(v,sample[i]))) fail(`Arguments must match the example types: ${problem.parameters.join(', ')}.`);
    if (n===138 && a[0].some((p:any)=>!array(p)||p.length!==2||!integer(p[0])||p[1]!==null&&(!integer(p[1])||p[1]<0||p[1]>=a[0].length))) fail('Each random-list node is [value, randomIndexOrNull].');
    if (treeIds.has(n) && n!==105) {
      const indices = n===100 || n===572 ? [0,1] : [0];
      for (const i of indices) if (!tree(a[i])) fail('Trees use level-order arrays with null for missing children; no unreachable nodes.');
      if ([230,235,450,700,701].includes(n) && !bst(a[0])) fail('root must be a binary search tree with distinct values.');
      if ([124,230,235,572,700,1325,1448].includes(n) && !a[0].length) fail('This problem requires a nonempty tree.');
      if (n===230 && (a[1]<1 || a[1]>a[0].filter((v:any)=>v!==null).length)) fail('k must identify an existing node.');
      if (n===235 && (a[1]===a[2] || !a[0].includes(a[1]) || !a[0].includes(a[2]))) fail('p and q must be distinct values present in the tree.');
      if (n===701 && a[0].includes(a[1])) fail('val must not already be in the tree.');
    }
    if (n===437 && (a[0].filter((v:any)=>v!==null).length>1000 || a[0].some((v:any)=>v!==null&&Math.abs(v)>1000000000) || Math.abs(a[1])>1000)) fail('Path Sum III allows at most 1,000 non-null nodes, node values in [-1,000,000,000, 1,000,000,000], and targetSum in [-1,000, 1,000].');
    if (n===105 && (a[0].length!==a[1].length || !unique(a[0]) || a[0].some((v:any)=>!a[1].includes(v)))) fail('Traversals must contain the same distinct values.');
    if ([19,25,92,143,2807].includes(n) && !a[0].length) fail('The list must be nonempty.');
    if ([19,25].includes(n) && (a[1]<1 || a[1]>a[0].length)) fail('n/k must be between 1 and the list length.');
    if (n===92 && (a[1]<1||a[2]<a[1]||a[2]>a[0].length)) fail('Require 1 <= left <= right <= list length.');
    if (n===141 && (a[1]<-1||a[1]>=a[0].length)) fail('pos must be -1 or a valid node index.');
    if (n===2 && a.some(v=>!v.length || v.some((d:any)=>d<0||d>9) || v.length>1&&v.at(-1)===0)) fail('Digit lists are nonempty, reversed, and have no leading zero.');
    if (n===21 && a.some(v=>!sorted(v)) || n===23 && a[0].some((v:any)=>!array(v)||!sorted(v))) fail('Input lists must be sorted.');
    if ([26,35,167,658,704].includes(n) && !sorted(a[0],[35,704].includes(n))) fail('The input array must be sorted (distinct values for binary search).');
    if (n===34 && !sorted(a[0])) fail('nums must be sorted in nondecreasing order; duplicates are allowed.');
    if (n===4 && (a[0].length+a[1].length===0 || a.some(v=>!sorted(v)))) fail('Provide sorted arrays with at least one value in total.');
    if ([1,167].includes(n)) { let count=0; for(let i=0;i<a[0].length;i++) for(let j=i+1;j<a[0].length;j++) if(a[0][i]+a[0][j]===a[1]) count++; if(count!==1) fail('Exactly one pair must sum to target.'); }
    if ([11,15,18,45,53,55,84,121,122,134,135,136,152,153,169,198,213,215,238,239,287,300,309,312,416,473,494,698,735,739,746,763,767,846,860,875,877,881,912,918,973,978,1011,1046,1049,1140,1406,1834,1863,1929,2709].includes(n) && !a[0].length) fail('This input must be nonempty.');
    if ([33,81,153].includes(n)) { const v=a[0]; if(!v.length || n!==81&&!unique(v) || v.filter((x:number,i:number)=>x>v[(i+1)%v.length]).length>1) fail('nums must be a rotated sorted array (distinct unless problem 81).'); }
    const grids = [36,48,54,63,64,73,74,79,130,200,212,286,329,417,427,463,695,778,867,994,1631];
    if (grids.includes(n) && !matrix(a[0])) fail('Use a nonempty rectangular matrix, at most 100 by 100.');
    if ([48,427,778].includes(n) && a[0].length!==a[0][0].length) fail('The matrix must be square.');
    if (n===427 && (a[0].length & (a[0].length-1))) fail('Quad-tree grid size must be a power of two.');
    if (n===36 && (a[0].length!==9 || a[0][0].length!==9 || a[0].flat().some((v:any)=>!/^([1-9]|\.)$/.test(v)))) fail('Sudoku must be a 9 by 9 board of digit strings or dots.');
    for (const [ids, allowed] of [[[63,427,463,695],[0,1]],[[994],[0,1,2]],[[200],['0','1']],[[130],['X','O']]] as [number[],any[]][]) if(ids.includes(n) && a[0].flat().some((v:any)=>!allowed.includes(v))) fail(`Grid values must be one of ${allowed.join(', ')}.`);
    if (n===74 && !sorted(a[0].flat(),true)) fail('The matrix must be strictly increasing in row-major order.');
    if (n===778 && (!unique(a[0].flat()) || a[0].flat().some((v:number)=>v<0||v>=a[0].length**2))) fail('Elevations must be a permutation of 0 through n*n - 1.');
    if ([215,239,347,973].includes(n) && (a[1]<1||a[1]>(n===347?new Set(a[0]).size:a[0].length))) fail('k is outside the available elements.');
    if (n===658 && (a[1]<1||a[1]>a[0].length)) fail('k is outside the array.');
    if (n===88 && (a[1]<0||a[3]<0||a[0].length!==a[1]+a[3]||a[2].length!==a[3]||!sorted(a[0].slice(0,a[1]))||!sorted(a[2]))) fail('Require sorted prefixes and nums1.length = m + n, nums2.length = n.');
    if (n===169 && !a[0].some((v:any)=>a[0].filter((x:any)=>x===v).length>a[0].length/2)) fail('A majority element must exist.');
    if (n===136 && (a[0].filter((v:any)=>a[0].filter((x:any)=>x===v).length===1).length!==1 || a[0].some((v:any)=>a[0].filter((x:any)=>x===v).length>2))) fail('One value occurs once; every other value occurs twice.');
    if (n===287 && (a[0].some((v:any)=>v<1||v>=a[0].length)||new Set(a[0].filter((v:any,i:number)=>a[0].indexOf(v)!==i)).size!==1)) fail('Use n+1 values in [1,n], with exactly one repeated value.');
    if (n===268 && (!unique(a[0])||a[0].some((v:any)=>v<0||v>a[0].length))) fail('Use distinct values in [0,n].');
    if (n===75 && a[0].some((v:any)=>![0,1,2].includes(v))) fail('Colors must be 0, 1, or 2.');
    if (n===66 && (!a[0].length||a[0].some((v:any)=>v<0||v>9)||a[0].length>1&&a[0][0]===0)) fail('Use decimal digits without a leading zero.');
    if ([39,40,322,377,416,473,698,875,1011,1046,1049,1863,1929,2709,2807].includes(n) && a[0].some((v:any)=>v<=0)) fail('Array values must be positive.');
    if ([39,377,322].includes(n) && !unique(a[0])) fail('Candidates/coins must be distinct.');
    if (n===518 && (a[0]<0||a[1].some((v:any)=>v<=0)||!unique(a[1]))) fail('amount is nonnegative; coin values are positive and distinct.');
    if ([51,52].includes(n) && (a[0]<1||a[0]>9)) fail('n must be in [1,9].');
    if (n===17 && !/^[2-9]{0,4}$/.test(a[0])) fail('Use up to four digits from 2 through 9.');
    if ([46,47,78,90,1863].includes(n) && a[0].length>12 || [39,40,131,473,698].includes(n) && a[0].length>16 || n===140&&a[0].length>20) fail('This backtracking input is too large (12 elements, 16 for partition/combination problems, 20 for Word Break II).');
    if ([46,78].includes(n) && !unique(a[0])) fail('All values must be distinct.');
    if (n===77 && (a[0]<1||a[0]>16||a[1]<1||a[1]>a[0])) fail('Require 1 <= k <= n <= 16.');
    const scalarBounds: Record<number,[number,number]> = {7:[-2147483648,2147483647],22:[1,8],69:[0,2147483647],70:[1,45],168:[1,2147483647],190:[0,4294967295],191:[1,2147483647],202:[1,2147483647],279:[1,10000],338:[0,1000],343:[2,58],1137:[0,37]};
    if (scalarBounds[n] && (a[0]<scalarBounds[n][0]||a[0]>scalarBounds[n][1])) fail(`Value must be in [${scalarBounds[n].join(', ')}].`);
    if (n===374 && (a[0]<1||a[0]>2147483647||a[1]<1||a[1]>a[0])) fail('Require 1 <= pick <= n <= 2^31 - 1.');
    if (n===1095) { const v=a[1],p=v.indexOf(Math.max(...v)); if(v.length<3||p===0||p===v.length-1||!sorted(v.slice(0,p+1),true)||!sorted(v.slice(p).reverse(),true)) fail('arr must strictly rise then strictly fall, with an interior peak.'); }
    if (n===50 && (a[0]===0&&a[1]<=0||a[1]<-2147483648||a[1]>2147483647)) fail('Use a valid base and a signed 32-bit exponent.');
    if (n===201 && (a[0]<0||a[1]<a[0]||a[1]>2147483647)) fail('Require 0 <= left <= right <= 2^31 - 1.');
    if (n===3133 && (a[0]<1||a[0]>100000000||a[1]<0||a[1]>100000000)) fail('Require 1 <= n <= 10^8 and 0 <= x <= 10^8.');
    if ([10,91,394].includes(n) && n===10 && /(^\*|\*\*)/.test(a[1])) fail('Every * must follow a letter or dot.');
    if (n===10 && !/^[a-z.*]*$/.test(a[1]) || n===91&&!/^\d+$/.test(a[0])) fail('Use the documented character alphabet.');
    if (n===1871 && (!/^0[01]+$/.test(a[0])||a[1]<1||a[2]<a[1]||a[2]>=a[0].length)) fail('s starts with 0; require 1 <= minJump <= maxJump < s.length.');
    if (n===698 && (a[1]<1||a[1]>a[0].length)) fail('k must be between 1 and nums.length.');
    if (n===875 && a[1]<a[0].length || n===1011 && (a[1]<1||a[1]>a[0].length) || n===410 && (a[1]<1||a[1]>a[0].length)) fail('days/h/k is outside the problem constraints.');
    if (n===877 && (a[0].length%2!==0||a[0].reduce((s:number,v:number)=>s+v,0)%2!==1)) fail('Stone Game requires an even number of positive piles with an odd total.');
    if (n===1405 && (a.some(v=>v<0||v>100)||a.every(v=>v===0))) fail('Counts are in [0,100] and at least one is positive.');
    if ([45,55,121,122,134,135,198,213,309,410,746,494].includes(n) && a[0].some((v:any)=>v<0)) fail('These array values must be nonnegative.');
    if(n===45){let end=0;for(let i=0;i<a[0].length&&i<=end;i++)end=Math.max(end,i+a[0][i]);if(end<a[0].length-1)fail('The last index must be reachable for Jump Game II.');}
    if(n===134 && (a[0].length!==a[1].length||a[1].some((v:any)=>v<0)))fail('gas and cost must have equal lengths and nonnegative values.');
    if(n===209 && (a[0]<=0||!a[1].length||a[1].some((v:any)=>v<=0)))fail('target and all nums values must be positive.');
    if([56,252,253,435].includes(n) && a[0].some((r:any)=>r.length!==2||(n===56?r[0]>r[1]:r[0]>=r[1])))fail('Intervals need ordered endpoints; meetings and problem 435 require start < end.');
    if(n===57 && (a[1].length!==2||a[1][0]>a[1][1]||a[0].some((r:any,i:number)=>r.length!==2||r[0]>r[1]||i>0&&r[0]<=a[0][i-1][1])))fail('Existing intervals must be sorted and disjoint; newInterval has start <= end.');
    if(n===133){const g=a[0];if(g.some((row:any,i:number)=>!unique(row)||row.some((v:any)=>v<1||v>g.length||v===i+1||!g[v-1].includes(i+1))))fail('Use a simple undirected adjacency list with nodes 1 through n.');const seen=new Set<number>();const visit=(i:number)=>{if(seen.has(i))return;seen.add(i);g[i].forEach((v:number)=>visit(v-1));};if(g.length)visit(0);if(seen.size!==g.length)fail('The graph must be connected.');}
    const edgeSpecs:Record<number,[number,number,number]>={207:[0,1,0],210:[0,1,0],261:[0,1,0],310:[0,1,0],323:[0,1,0],997:[0,1,1],1462:[0,1,0],1489:[0,1,0],743:[1,0,1],787:[0,1,0],2392:[0,1,1]};
    if(edgeSpecs[n]){const [ni,ei,base]=edgeSpecs[n],size=a[ni],edges=a[ei];if(!integer(size)||size<1||size>2000||!array(edges)||edges.some((e:any)=>!array(e)||e.length!==([1489,743,787].includes(n)?3:2)||e.some((v:any)=>!integer(v))||e[0]===e[1]||e[0]<base||e[1]<base||e[0]>=size+base||e[1]>=size+base))fail('Graph edges must have valid distinct endpoints within the node range.');}
    if(n===310 && a[1].length!==a[0]-1)fail('The graph must be a tree.');
    if(n===2402 && (a[0]<1||a[0]>100||!unique(a[1].map((m:any)=>m[0]))||a[1].some((m:any)=>m.length!==2||m[0]<0||m[0]>=m[1])))fail('Use 1–100 rooms and meetings with distinct starts and start < end.');
    if(n===853 && (a[1].length!==a[2].length||!unique(a[1])||a[1].some((p:any)=>p<0||p>=a[0])||a[2].some((v:any)=>v<=0)))fail('Each car needs a distinct position before target and a positive speed.');
    if(n===881 && (a[1]<1||a[0].some((v:any)=>v<1||v>a[1])))fail('Every positive person weight must fit within limit.');
    if(n===502 && (a[0]<0||a[1]<0||a[2].length!==a[3].length||a[2].concat(a[3]).some((v:any)=>v<0)))fail('profits and capital must have equal lengths and nonnegative values; k and w are nonnegative.');
    if(n===846 && a[1]<1)fail('groupSize must be positive.');
    if(n===752 && (!/^\d{4}$/.test(a[1])||a[0].some((s:any)=>!/^\d{4}$/.test(s))))fail('Lock states must have exactly four digits.');
    if(n===953 && (a[1].length!==26||!unique([...a[1]])||!/^[a-z]+$/.test(a[1])))fail('order must be a permutation of the lowercase alphabet.');
    if(n===371 && a.some(v=>v < -1000||v > 1000))fail('Both integers must be in [-1000,1000].');
    if(n===3133 && a[1]===0)fail('x must be positive.');
    if(n===150){const stack:number[]=[];for(const token of a[0]){if(['+','-','*','/'].includes(token)){if(stack.length<2)fail('RPN needs two operands before each operator.');const y=stack.pop()!,x=stack.pop()!;if(token==='/'&&y===0)fail('Cannot divide by zero.');stack.push(token==='+'?x+y:token==='-'?x-y:token==='*'?x*y:Math.trunc(x/y));}else {if(!/^-?\d+$/.test(token))fail('RPN operands must be integers.');stack.push(Number(token));}}if(stack.length!==1)fail('RPN must leave exactly one result.');}
    if(n===394){let depth=0;for(let i=0;i<a[0].length;i++){const c=a[0][i];if(c==='['){if(!/\d/.test(a[0][i-1]||''))fail('A repeat count must precede [.');depth++;}else if(c===']'){if(--depth<0)fail('Unbalanced brackets.');}else if(!/[a-z0-9]/.test(c))fail('Use lowercase letters, digits, and brackets.');}if(depth)fail('Unbalanced brackets.');}
    return null;
  } catch(e) { return e instanceof Error ? e.message : 'Invalid input.'; }
}
export function parseCases(problem: CodingProblem, text: string): CodeCase[] {
  if (text.length > INPUT_LIMIT) throw new Error('Custom cases exceed 256 KiB.');
  let values: unknown;
  try { values = JSON.parse(text); } catch { throw new Error('Custom cases must be valid JSON: an array of argument arrays.'); }
  if (!array(values) || !values.length || values.length > CASE_LIMIT) throw new Error(`Enter between 1 and ${CASE_LIMIT} cases.`);
  return values.map((input,i) => { const error = validateInput(problem,input); if(error) throw new Error(`Case ${i+1}: ${error}`); return {name:`Custom ${i+1}`,input:input as Json[]}; });
}
