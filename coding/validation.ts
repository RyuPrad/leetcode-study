import type { CodingProblem, Json, CodeCase } from '../shared/coding';
import { CASE_LIMIT, INPUT_LIMIT } from '../shared/coding';
const array = Array.isArray;
const integer = (x: any) => Number.isSafeInteger(x);
const sorted = (a: number[], strict = false) => a.every((v,i) => !i || (strict ? v > a[i-1] : v >= a[i-1]));
const unique = (a: unknown[]) => new Set(a).size === a.length;
const matrix = (a: any) => array(a) && a.length > 0 && a.length <= 100 && a.every((r: any) => array(r) && r.length > 0 && r.length <= 100 && r.length === a[0].length);
const treeIds = new Set([94,98,100,101,102,103,104,105,110,112,116,124,129,144,145,199,226,230,235,297,337,437,450,513,538,543,572,606,617,652,662,669,700,701,783,951,958,1325,1448]);
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
        for (let j=0;j<parameters.length;j++) { const p=parameters[j],v=args[i][j]; if (['word','prefix','str','key','value'].includes(p) && [208,211,981].includes(n)) { if (typeof v !== 'string' || !v.length || (n !== 981 && !/^[a-z.]+$/.test(v))) fail(`${p} must be a nonempty string (lowercase letters for tries; . is allowed only in WordDictionary.search).`); if (n===208 && v.includes('.') || n===211 && method==='addWord' && v.includes('.')) fail('Inserted words use lowercase letters.'); } else if (n===173 && p==='root') { if (!array(v) || !v.length || !tree(v) || !bst(v)) fail('root must be a nonempty binary search tree in level order.'); } else if (n===1993 && p==='parent') { const ok=array(v)&&v.length>=2&&v.length<=2000&&v[0]===-1&&v.slice(1).every((x:any)=>integer(x)&&x>=0&&x<v.length)&&v.every((_:any,i:number)=>{ let x=i,s=0; while (x!==-1) { x=v[x]; if (++s>v.length) return false; } return true; }); if (!ok) fail('parent[0] = -1 and the parents form a tree over nodes 0 to n - 1.'); } else if (n===1472 && ['homepage','url'].includes(p)) { if (typeof v !== 'string' || !/^[a-z.]{1,20}$/.test(v)) fail(`${p} must be 1 to 20 lowercase letters or dots.`); } else if (n===1396 && ['stationName','startStation','endStation'].includes(p)) { if (typeof v !== 'string' || !/^[A-Za-z]{1,10}$/.test(v)) fail(`${p} must be 1 to 10 letters.`); } else if (!['matrix','nums','point'].includes(p) && !integer(v)) fail(`${p} must be an integer.`); }
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
        if (n===303 && !i && (!array(args[0][0]) || !args[0][0].length || args[0][0].some((x:any)=>!integer(x)))) fail('nums must be a nonempty integer array.');
        if (n===303 && i && (args[i][0]<0 || args[i][1]<args[i][0] || args[i][1]>=args[0][0].length)) fail('Require 0 <= left <= right < nums.length.');
        if (n===1603 && !i && args[0].some((x:any)=>x<0||x>1000)) fail('Space counts are in [0, 1000].');
        if (n===1603 && i && ![1,2,3].includes(args[i][0])) fail('carType is 1, 2 or 3.');
        if (n===707 && i && args[i].some((x:any)=>!integer(x)||x<0||x>1000)) fail('Indexes and values are in [0, 1000].');
        if (n===1472 && args[i].some((x:any)=>typeof x==='string' ? !/^[a-z.]{1,20}$/.test(x) : !integer(x)||x<1||x>100)) fail('URLs have 1 to 20 lowercase letters or dots; steps are in [1, 100].');
        if (n===352 && method==='addNum' && (args[i][0]<0 || args[i][0]>10000)) fail('value is in [0, 10000].');
        if (n===2013 && i && (!array(args[i][0]) || args[i][0].length!==2 || args[i][0].some((v:any)=>!integer(v)||v<0||v>1000))) fail('Points must have two integer coordinates in [0,1000].');
      }
      if (n===1845) { const total=args[0][0], taken=new Set<number>(); let next=1; const freed:number[]=[]; if (!integer(total)||total<1||total>1e5) fail('n is in [1, 10^5].'); for (let i=1;i<ops.length;i++) { if (ops[i]==='reserve') { if (!freed.length && next>total) fail('reserve needs a free seat.'); let seat:number; if (freed.length) { freed.sort((x,y)=>x-y); seat=freed.shift()!; } else seat=next++; taken.add(seat); } else { const seat=args[i][0]; if (!taken.has(seat)) fail('unreserve needs a reserved seat.'); taken.delete(seat); freed.push(seat); } } }
      if (n===173) { const total=args[0][0].filter((v:any)=>v!==null).length; let used=0; for (let i=1;i<ops.length;i++) if (ops[i]==='next' && ++used>total) fail('next() is only called while hasNext() is true.'); }
      if (n===1993) { const size=args[0][0].length; for (let i=1;i<ops.length;i++) if (!integer(args[i][0])||args[i][0]<0||args[i][0]>=size||!integer(args[i][1])||args[i][1]<1||args[i][1]>1e4) fail('num is a node and user is in [1, 10^4].'); }
      if (n===380) { const set=new Set<number>(); for (let i=1;i<ops.length;i++) { const v=args[i][0]; if (ops[i]==='insert') set.add(v); else if (ops[i]==='remove') set.delete(v); else if (!set.size) fail('getRandom requires a nonempty set.'); } }
      if (n===1396) { const open=new Map<number,string>(), routes=new Set<string>(); let last=-Infinity; for (let i=1;i<ops.length;i++) { const v=args[i]; if (ops[i]==='getAverageTime') { if (!routes.has(v[0]+','+v[1])) fail('getAverageTime needs a completed trip on that route.'); continue; } if (v[2]<last) fail('Event times must not decrease.'); last=v[2]; if (ops[i]==='checkIn') { if (open.has(v[0])) fail('That customer is already checked in.'); open.set(v[0],v[1]); } else { if (!open.has(v[0])) fail('checkOut needs a matching checkIn.'); routes.add(open.get(v[0])+','+v[1]); open.delete(v[0]); } } }
      return null;
    }
    // Infer primitive container types from the maintained example contract, allowing empty arrays.
    const sample = problem.examples[0]?.input;
    function shape(value: any, example: any, depth = 0): boolean {
      if (example === null) return value === null || integer(value);
      if (array(example)) { if (!array(value)) return false; const specimen = example.find(x => x !== null); return specimen === undefined || value.every(v => treeIds.has(n) && v === null || shape(v,specimen,depth+1)); }
      return typeof value === typeof example && (typeof example !== 'number' || n === 50 || n === 399 || n === 1514 || integer(value));
    }
    if (n!==138 && sample && a.some((v,i) => !shape(v,sample[i]))) fail(`Arguments must match the example types: ${problem.parameters.join(', ')}.`);
    if (n===138 && a[0].some((p:any)=>!array(p)||p.length!==2||!integer(p[0])||p[1]!==null&&(!integer(p[1])||p[1]<0||p[1]>=a[0].length))) fail('Each random-list node is [value, randomIndexOrNull].');
    if (treeIds.has(n) && n!==105) {
      const indices = [100,572,617,951].includes(n) ? [0,1] : [0];
      for (const i of indices) if (!tree(a[i])) fail('Trees use level-order arrays with null for missing children; no unreachable nodes.');
      if ([230,235,450,538,669,700,701,783].includes(n) && !bst(a[0])) fail('root must be a binary search tree with distinct values.');
      if ([101,129,513,606,662,958].includes(n) && !a[0].length) fail('This problem requires a nonempty tree.');
      if (n===783 && a[0].filter((v:any)=>v!==null).length<2) fail('The tree needs at least two nodes.');
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
    if ([11,15,18,45,53,55,84,121,122,134,135,136,152,153,169,198,213,215,238,239,287,300,309,312,416,473,494,698,735,739,746,763,767,846,860,875,877,881,912,918,973,978,1011,1046,1049,1140,1406,1834,1863,1929,2709,283].includes(n) && !a[0].length) fail('This input must be nonempty.');
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
    const scalarBounds: Record<number,[number,number]> = {7:[-2147483648,2147483647],1553:[1,2000000000],1220:[1,20000],1359:[1,500],9:[-2147483648,2147483647],12:[1,3999],59:[1,20],263:[-2147483648,2147483647],118:[1,30],367:[1,2147483647],441:[1,2147483647],22:[1,8],69:[0,2147483647],70:[1,45],168:[1,2147483647],190:[0,4294967295],191:[1,2147483647],202:[1,2147483647],279:[1,10000],338:[0,1000],343:[2,58],1137:[0,37]};
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
    if(n===785){const g=a[0];if(!array(g)||g.length<1||g.length>100||g.some((row:any,u:number)=>!array(row)||!unique(row)||row.some((v:any)=>!integer(v)||v<0||v>=g.length||v===u))||g.some((row:number[],u:number)=>row.some(v=>!g[v].includes(u))))fail('Use 1–100 vertices with distinct integer neighbors in [0,n-1], no self edges, and symmetric undirected adjacency. Disconnected graphs are allowed.');}
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
    if(n===1984 && (!a[0].length || a[1]<1 || a[1]>a[0].length)) fail('nums is nonempty and k is between 1 and nums.length.');
    if(n===80 && (!a[0].length || !sorted(a[0]))) fail('nums must be nonempty and sorted.');
    if(n===1498 && (!a[0].length || a[0].some((v:any)=>v<1) || a[1]<1)) fail('nums is nonempty; values and target are positive.');
    if(n===1968 && (a[0].length<3 || !unique(a[0]))) fail('nums needs at least three distinct values.');
    if(n===1343 && (!a[0].length || a[0].some((v:any)=>v<1) || a[1]<1 || a[1]>a[0].length || a[2]<0)) fail('arr is nonempty and positive; 1 <= k <= arr.length; threshold >= 0.');
    if(n===1838 && (!a[0].length || a[0].some((v:any)=>v<1) || a[1]<1)) fail('nums is nonempty and positive; k >= 1.');
    if(n===904 && (!a[0].length || a[0].some((v:any)=>v<0||v>=a[0].length))) fail('fruits is nonempty with 0 <= fruits[i] < fruits.length.');
    if(n===1456 && (!/^[a-z]+$/.test(a[0]) || a[1]<1 || a[1]>a[0].length)) fail('s uses lowercase letters; 1 <= k <= s.length.');
    if(n===1888 && !/^[01]+$/.test(a[0])) fail('s is a nonempty binary string.');
    if(n===1658 && (!a[0].length || a[0].some((v:any)=>v<1) || a[1]<1)) fail('nums is nonempty and positive; x >= 1.');
    if(n===2390){if(!/^[a-z*]+$/.test(a[0]))fail('s uses lowercase letters and stars.');let kept=0;for(const c of a[0]){kept+=c==='*'?-1:1;if(kept<0)fail('Every star needs a letter to its left.');}}
    if(n===946 && (a[0].length!==a[1].length || !a[0].length || !unique(a[0]) || JSON.stringify([...a[0]].sort((x:number,y:number)=>x-y))!==JSON.stringify([...a[1]].sort((x:number,y:number)=>x-y)))) fail('popped must be a permutation of the distinct values in pushed.');
    if(n===402 && (!/^(0|[1-9]\d*)$/.test(a[0]) || a[1]<1 || a[1]>a[0].length)) fail('num has no leading zeros; 1 <= k <= num.length.');
    if(n===1209 && (!/^[a-z]+$/.test(a[0]) || a[1]<2)) fail('s uses lowercase letters; k >= 2.');
    if(n===456 && !a[0].length) fail('nums must be nonempty.');
    if(n===977 && (!a[0].length || !sorted(a[0]))) fail('nums must be nonempty and sorted.');
    if(n===540){const c=new Map<number,number>();for(const x of a[0])c.set(x,(c.get(x)||0)+1);if(!sorted(a[0])||[...c.values()].filter(x=>x===1).length!==1||[...c.values()].some(x=>x>2))fail('nums must be sorted with one single value and every other value twice.');}
    if(n===162 && (!a[0].length || a[0].some((x:number,i:number)=>i>0&&x===a[0][i-1]))) fail('nums is nonempty and neighbors differ.');
    if(n===2300 && (!a[0].length || !a[1].length || a[0].concat(a[1]).some((x:number)=>x<1) || a[2]<1)) fail('spells and potions are nonempty and positive; success >= 1.');
    if(n===2616 && (!a[0].length || a[0].some((x:number)=>x<0) || a[1]<0 || a[1]>Math.floor(a[0].length/2))) fail('nums is nonempty and nonnegative; 0 <= p <= nums.length / 2.');
    if(n===1898){const [t,q,r]=a;if(!/^[a-z]+$/.test(t)||!/^[a-z]+$/.test(q)||!unique(r)||r.some((x:number)=>x<0||x>=t.length))fail('s and p use lowercase letters; removable holds distinct indices of s.');let j=0;for(const ch of t)if(ch===q[j])j++;if(j<q.length)fail('p must be a subsequence of s.');}
    if(n===1268 && (!a[0].length || a[0].some((x:any)=>!/^[a-z]+$/.test(x)) || !unique(a[0]) || !/^[a-z]+$/.test(a[1]))) fail('products are distinct lowercase words; searchWord is lowercase.');
    if([1299,724,1822,280,665,2348,2215].includes(n) && (!a[0].length || n===2215 && !a[1].length)) fail('The input arrays must be nonempty.');
    if([392,28,438].includes(n) && (!/^[a-z]*$/.test(a[0]) || !/^[a-z]*$/.test(a[1]) || n!==392 && (!a[0].length || !a[1].length))) fail('Use lowercase letters (nonempty for this problem).');
    if(n===58 && (!/^[A-Za-z ]+$/.test(a[0]) || !/[A-Za-z]/.test(a[0]))) fail('s uses letters and spaces and has at least one word.');
    if(n===929 && (!a[0].length || a[0].some((e:any)=>!/^[a-z][a-z.+]*@[a-z.]+\.com$/.test(e)))) fail('Each email is local@domain.com with a lowercase local name not starting with + or a dot.');
    if(n===205 && (a[0].length!==a[1].length || !a[0].length)) fail('s and t are nonempty and the same length.');
    if(n===605 && (!a[0].length || a[0].some((x:any,i:number)=>x!==0&&x!==1||x===1&&a[0][i+1]===1) || a[1]<0)) fail('flowerbed holds 0s and 1s with no adjacent 1s; n >= 0.');
    if(n===496 && (!unique(a[1]) || !unique(a[0]) || a[0].some((x:any)=>!a[1].includes(x)) || a[1].some((x:any)=>x<0||x>10000))) fail('Values are distinct, in [0, 10000], and nums1 is a subset of nums2.');
    if(n===448 && (!a[0].length || a[0].some((x:any)=>x<1||x>a[0].length))) fail('Values must be in [1, n].');
    if([1189,2405,1930].includes(n) && (!/^[a-z]+$/.test(a[0]) || n===1930 && a[0].length<3)) fail('Use lowercase letters (at least 3 for problem 1930).');
    if(n===290 && (!/^[a-z]+$/.test(a[0]) || !/^[a-z]+( [a-z]+)*$/.test(a[1]))) fail('pattern is lowercase; s is lowercase words separated by single spaces.');
    if(n===554 && (!a[0].length || a[0].some((r:any)=>!r.length||r.some((w:any)=>w<1)) || new Set(a[0].map((r:any)=>r.reduce((x:number,y:number)=>x+y,0))).size!==1)) fail('Every row is nonempty, widths are positive, and all rows have the same total.');
    if(n===1963 && (a[0].length%2 || !/^[\[\]]+$/.test(a[0]) || [...a[0]].filter((c:string)=>c==='[').length*2!==a[0].length)) fail('s has equal numbers of [ and ].');
    if(n===2001 && (!a[0].length || a[0].some((r:any)=>r.length!==2||r.some((x:any)=>x<1)))) fail('Each rectangle is [width, height] with positive sides.');
    if(n===2002 && !/^[a-z]{2,12}$/.test(a[0])) fail('s has 2 to 12 lowercase letters.');
    if(n===2017 && (a[0].length!==2 || !a[0][0].length || a[0][0].length!==a[0][1].length || a[0].flat().some((x:any)=>x<1))) fail('grid has two rows of the same nonzero length with positive values.');
    if(n===179 && (!a[0].length || a[0].some((x:any)=>x<0))) fail('nums is nonempty and nonnegative.');
    if(n===523 && (!a[0].length || a[0].some((x:any)=>x<0) || a[1]<1)) fail('nums is nonempty and nonnegative; k >= 1.');
    if(n===838 && !/^[LR.]+$/.test(a[0])) fail('dominoes uses L, R and . only.');
    if(n===187 && !/^[ACGT]+$/.test(a[0])) fail('s uses A, C, G and T only.');
    if(n===1461 && (!/^[01]+$/.test(a[0]) || a[1]<1 || a[1]>20)) fail('s is binary; 1 <= k <= 20.');
    if(n===2483 && !/^[YN]+$/.test(a[0])) fail('customers uses Y and N only.');
    if(n===68 && (!a[0].length || a[1]<1 || a[0].some((w:any)=>!w.length||w.length>a[1]||/\s/.test(w)))) fail('Words are nonempty, contain no spaces, and fit in maxWidth.');
    if(n===2306 && (a[0].length<2 || !unique(a[0]) || a[0].some((w:any)=>!/^[a-z]+$/.test(w)))) fail('ideas holds at least two distinct lowercase words.');
    if(n===2439 && (a[0].length<2 || a[0].some((x:any)=>x<0||x>1e9))) fail('nums has at least 2 values in [0, 10^9].');
    if(n===1423 && (!a[0].length || a[0].some((x:any)=>x<1||x>10000) || a[1]<1 || a[1]>a[0].length)) fail('cardPoints values are in [1, 10^4]; 1 <= k <= cardPoints.length.');
    if(n===1921 && (!a[0].length || a[0].length!==a[1].length || a[0].some((x:any)=>x<1||x>1e5) || a[1].some((x:any)=>x<1||x>1e5))) fail('dist and speed are nonempty, the same length, with values in [1, 10^5].');
    if(n===1029 && (!a[0].length || a[0].length%2 || a[0].some((r:any)=>!Array.isArray(r)||r.length!==2||r.some((x:any)=>x<1||x>1000)))) fail('costs has an even number of [aCost, bCost] pairs with costs in [1, 1000].');
    if(n===646 && (!a[0].length || a[0].some((p:any)=>!Array.isArray(p)||p.length!==2||p[0]>=p[1]||p.some((x:any)=>x<-1000||x>1000)))) fail('Each pair is [left, right] with -1000 <= left < right <= 1000.');
    if(n===1647 && !/^[a-z]+$/.test(a[0])) fail('s is nonempty lowercase letters.');
    if(n===1288 && (!a[0].length || a[0].some((p:any)=>!Array.isArray(p)||p.length!==2||p[0]<0||p[0]>=p[1]||p[1]>1e5) || new Set(a[0].map((p:any)=>p.join())).size!==a[0].length)) fail('intervals are distinct [l, r] with 0 <= l < r <= 10^5.');
    if(n===1523 && (a[0]<0 || a[1]<a[0] || a[1]>1e9)) fail('Require 0 <= low <= high <= 10^9.');
    if(n===1572 && (!a[0].length || a[0].length>100 || a[0].some((r:any)=>r.length!==a[0].length) || a[0].flat().some((x:any)=>x<1||x>100))) fail('mat is a nonempty square matrix with values in [1, 100].');
    if(n===149 && (!a[0].length || a[0].length>300 || a[0].some((p:any)=>!Array.isArray(p)||p.length!==2||p.some((x:any)=>x<-1e4||x>1e4)) || new Set(a[0].map((p:any)=>p.join())).size!==a[0].length)) fail('points are 1 to 300 distinct [x, y] with coordinates in [-10^4, 10^4].');
    if(n===1260 && (!a[0].length || a[0].length>50 || !a[0][0].length || a[0][0].length>50 || a[0].some((r:any)=>r.length!==a[0][0].length) || a[0].flat().some((x:any)=>x<-1000||x>1000) || a[1]<0 || a[1]>100)) fail('grid is a nonempty rectangle up to 50 x 50 with values in [-1000, 1000]; 0 <= k <= 100.');
    if(n===1041 && (!/^[GLR]+$/.test(a[0]) || a[0].length>100)) fail('instructions uses G, L and R (1 to 100 characters).');
    if(n===6 && (!/^[A-Za-z,.]+$/.test(a[0]) || a[0].length>1000 || a[1]<1 || a[1]>1000)) fail('s uses letters, commas and periods (1 to 1000 characters); 1 <= numRows <= 1000.');
    if(n===2028 && (!a[0].length || a[0].some((x:any)=>x<1||x>6) || a[1]<1 || a[1]>6 || a[2]<1 || a[2]>1e5)) fail('rolls holds values 1 to 6; 1 <= mean <= 6; n >= 1.');
    if(n===1470 && (a[1]<1 || a[1]>500 || a[0].length!==2*a[1] || a[0].some((x:any)=>x<1||x>1000))) fail('nums has 2n values in [1, 1000]; 1 <= n <= 500.');
    if(n===989 && (!a[0].length || a[0].some((x:any)=>x<0||x>9) || a[0].length>1&&a[0][0]===0 || a[1]<1 || a[1]>10000)) fail('num is digits without leading zeros; 1 <= k <= 10^4.');
    if(n===120 && (!a[0].length || a[0].length>200 || a[0].some((r:any,i:number)=>!Array.isArray(r)||r.length!==i+1||r.some((x:any)=>x<-1e4||x>1e4)))) fail('Row r of triangle has r + 1 values in [-10^4, 10^4]; 1 to 200 rows.');
    if(n===740 && (!a[0].length || a[0].length>2e4 || a[0].some((x:any)=>x<1||x>1e4))) fail('nums has 1 to 2 × 10^4 values in [1, 10^4].');
    if(n===256 && (!a[0].length || a[0].length>100 || a[0].some((r:any)=>!Array.isArray(r)||r.length!==3||r.some((x:any)=>x<1||x>20)))) fail('costs has 1 to 100 rows of three prices in [1, 20].');
    if(n===2369 && (a[0].length<2 || a[0].some((x:any)=>x<1||x>1e6))) fail('nums has at least 2 values in [1, 10^6].');
    if([1856,1964].includes(n) && (!a[0].length || a[0].some((x:any)=>x<1||x>1e7))) fail('Values are in [1, 10^7].');
    if(n===983 && (!a[0].length || a[0].some((x:any,i:number)=>x<1||x>365||i&&x<=a[0][i-1]) || a[1].length!==3 || a[1].some((x:any)=>x<1||x>1000))) fail('days are strictly increasing in [1, 365]; costs has three prices in [1, 1000].');
    if(n===673 && (!a[0].length || a[0].length>2000 || a[0].some((x:any)=>x<-1e6||x>1e6))) fail('nums has 1 to 2000 values in [-10^6, 10^6].');
    if(n===691 && (!a[0].length || a[0].length>50 || a[0].some((w:any)=>!/^[a-z]{1,10}$/.test(w)) || !/^[a-z]{1,15}$/.test(a[1]))) fail('stickers are 1 to 50 words of 1 to 10 lowercase letters; target has 1 to 15 lowercase letters.');
    if(n===1035 && (!a[0].length || !a[1].length || a[0].length>500 || a[1].length>500 || [...a[0],...a[1]].some((x:any)=>x<1||x>2000))) fail('Both arrays have 1 to 500 values in [1, 2000].');
    if(n===2140 && (!a[0].length || a[0].some((q:any)=>!Array.isArray(q)||q.length!==2||q.some((x:any)=>x<1||x>1e5)))) fail('Each question is [points, brainpower] with values in [1, 10^5].');
    if(n===2466 && (a[0]<1 || a[1]<a[0] || a[1]>1e5 || a[2]<1 || a[3]<1 || a[2]>a[0] || a[3]>a[0])) fail('Require 1 <= low <= high <= 10^5 and 1 <= zero, one <= low.');
    if(n===837 && (a[1]<0 || a[0]<a[1] || a[0]>1e4 || a[2]<1 || a[2]>1e4)) fail('Require 0 <= k <= n <= 10^4 and 1 <= maxPts <= 10^4.');
    if(n===1626 && (!a[0].length || a[0].length!==a[1].length || a[0].length>1000 || a[0].some((x:any)=>x<1||x>1e6) || a[1].some((x:any)=>x<1||x>1000))) fail('scores and ages have the same length; scores in [1, 10^6], ages in [1, 1000].');
    if(n===472 && (!a[0].length || a[0].length>1e4 || a[0].some((w:any)=>!/^[a-z]{1,30}$/.test(w)) || !unique(a[0]))) fail('words are distinct, 1 to 30 lowercase letters each.');
    if(n===1799 && (a[0].length<2 || a[0].length>14 || a[0].length%2 || a[0].some((x:any)=>x<1||x>1e6))) fail('nums has an even count of 2 to 14 values in [1, 10^6].');
    if(n===516 && !/^[a-z]{1,1000}$/.test(a[0])) fail('s has 1 to 1000 lowercase letters.');
    if(n===221 && (!a[0].length || a[0].length>300 || !a[0][0].length || a[0][0].length>300 || a[0].some((r:any)=>r.length!==a[0][0].length||r.some((x:any)=>x!=='0'&&x!=='1')))) fail('matrix is a rectangle up to 300 × 300 of "0" and "1".');
    if(n===474 && (!a[0].length || a[0].length>600 || a[0].some((x:any)=>!/^[01]{1,100}$/.test(x)) || a[1]<1 || a[1]>100 || a[2]<1 || a[2]>100)) fail('strs are 1 to 600 binary strings of length 1 to 100; 1 <= m, n <= 100.');
    if(n===1911 && (!a[0].length || a[0].some((x:any)=>x<1||x>1e5))) fail('nums has values in [1, 10^5].');
    if(n===1866 && (a[1]<1 || a[0]<a[1] || a[0]>1000)) fail('Require 1 <= k <= n <= 1000.');
    if(n===926 && !/^[01]+$/.test(a[0])) fail('s is a nonempty binary string.');
    if(n===2218 && (!a[0].length || a[0].some((p:any)=>!Array.isArray(p)||!p.length||p.some((x:any)=>x<1||x>1e5)) || a[1]<1 || a[1]>a[0].reduce((t:number,p:any)=>t+p.length,0))) fail('Piles are nonempty with values in [1, 10^5]; 1 <= k <= total coins.');
    if(n===920 && (a[2]<0 || a[2]>=a[0] || a[0]>a[1] || a[1]>100)) fail('Require 0 <= k < n <= goal <= 100.');
    if(n===1639 && (!a[0].length || a[0].length>1000 || a[0].some((w:any)=>!/^[a-z]{1,1000}$/.test(w)||w.length!==a[0][0].length) || !/^[a-z]{1,1000}$/.test(a[1]))) fail('words have the same length of 1 to 1000 lowercase letters; target has 1 to 1000 lowercase letters.');
    if(n===879 && (a[0]<1 || a[0]>100 || a[1]<0 || a[1]>100 || !a[2].length || a[2].length!==a[3].length || a[2].length>100 || a[2].some((x:any)=>x<1||x>100) || a[3].some((x:any)=>x<0||x>100))) fail('1 <= n <= 100, 0 <= minProfit <= 100, group and profit have the same length with group in [1, 100] and profit in [0, 100].');
    if(n===1547 && (a[0]<2 || a[0]>1e6 || !a[1].length || a[1].length>Math.min(a[0]-1,100) || a[1].some((x:any)=>x<1||x>=a[0]) || !unique(a[1]))) fail('cuts are distinct positions in [1, n - 1].');
    if([93,1849].includes(n) && !/^[0-9]{1,20}$/.test(a[0])) fail('s has 1 to 20 digits.');
    if(n===1980 && (!a[0].length || a[0].length>16 || a[0].some((x:any)=>typeof x!=='string'||x.length!==a[0].length||!/^[01]+$/.test(x)) || !unique(a[0]))) fail('nums holds n distinct binary strings of length n (1 <= n <= 16).');
    if(n===1239 && (!a[0].length || a[0].length>16 || a[0].some((x:any)=>!/^[a-z]{1,26}$/.test(x)))) fail('arr has 1 to 16 strings of 1 to 26 lowercase letters.');
    if(n===1514 && (a[0]<2 || a[0]>1e4 || a[1].length!==a[2].length || a[1].some((e:any)=>!Array.isArray(e)||e.length!==2||e.some((x:any)=>x<0||x>=a[0])||e[0]===e[1]) || new Set(a[1].map((e:any)=>Math.min(e[0],e[1])+','+Math.max(e[0],e[1]))).size!==a[1].length || a[2].some((p:any)=>typeof p!=='number'||p<0||p>1) || a[3]<0 || a[3]>=a[0] || a[4]<0 || a[4]>=a[0] || a[3]===a[4])) fail('Use distinct edges between different nodes, probabilities in [0, 1], and different start and end nodes.');
    if(n===2421) { const size=a[0].length, root=Array.from({length:size},(_,k)=>k), find=(x:number):number=>root[x]===x?x:(root[x]=find(root[x])); if (!size || size>3e4 || a[0].some((x:any)=>x<0||x>1e5) || a[1].length!==size-1 || a[1].some((e:any)=>!Array.isArray(e)||e.length!==2||e.some((x:any)=>x<0||x>=size)||e[0]===e[1])) fail('vals has 1 to 3 × 10^4 values in [0, 10^5]; edges are n - 1 pairs forming a tree.'); for (const [x,y] of a[1]) { if (find(x)===find(y)) fail('edges must form a tree.'); root[find(x)]=find(y); } }
    if(n===1579 && (a[0]<1 || a[0]>1e5 || !a[1].length || a[1].some((e:any)=>!Array.isArray(e)||e.length!==3||![1,2,3].includes(e[0])||e[1]<1||e[2]>a[0]||e[1]>=e[2]) || new Set(a[1].map((e:any)=>e.join())).size!==a[1].length)) fail('Each edge is a distinct [type 1-3, a, b] with 1 <= a < b <= n.');
    if(n===1675 && (a[0].length<2 || a[0].some((x:any)=>x<1||x>1e9))) fail('nums has at least 2 values in [1, 10^9].');
    if(n===2542 && (!a[0].length || a[0].length!==a[1].length || [...a[0],...a[1]].some((x:any)=>x<0||x>1e5) || a[2]<1 || a[2]>a[0].length)) fail('nums1 and nums2 have the same length with values in [0, 10^5]; 1 <= k <= n.');
    if(n===1882 && (!a[0].length || !a[1].length || a[0].some((x:any)=>x<0||x>2e5) || a[1].some((x:any)=>x<1||x>2e5))) fail('servers are in [0, 2 × 10^5]; tasks are in [1, 2 × 10^5].');
    if(n===1985 && (!a[0].length || a[0].some((x:any)=>typeof x!=='string'||!/^(0|[1-9][0-9]{0,99})$/.test(x)) || a[1]<1 || a[1]>a[0].length)) fail('nums are integers without leading zeros (up to 100 digits); 1 <= k <= nums.length.');
    if(n===1383 && (a[0]<1 || a[1].length!==a[0] || a[2].length!==a[0] || a[1].some((x:any)=>x<1||x>1e5) || a[2].some((x:any)=>x<1||x>1e8) || a[3]<1 || a[3]>a[0])) fail('speed and efficiency have n values (speed in [1, 10^5], efficiency in [1, 10^8]); 1 <= k <= n.');
    const binaryGrid=(g:any,limit:number,square=false)=>Array.isArray(g)&&g.length>0&&g.length<=limit&&Array.isArray(g[0])&&g[0].length>0&&g[0].length<=limit&&g.every((row:any)=>Array.isArray(row)&&row.length===g[0].length&&row.every((x:any)=>x===0||x===1))&&(!square||g.length===g[0].length);
    const isTree=(size:number,list:any)=>{ if (!Array.isArray(list)||list.length!==size-1) return false; const root=Array.from({length:size},(_,k)=>k), find=(x:number):number=>root[x]===x?x:(root[x]=find(root[x])); for (const e of list) { if (!Array.isArray(e)||e.length<2||e[0]<0||e[1]<0||e[0]>=size||e[1]>=size||e[0]===e[1]||find(e[0])===find(e[1])) return false; root[find(e[0])]=find(e[1]); } return true; };
    if(n===1905 && (!binaryGrid(a[0],500) || !binaryGrid(a[1],500) || a[0].length!==a[1].length || a[0][0].length!==a[1][0].length)) fail('grid1 and grid2 are binary grids of the same size (up to 500 × 500).');
    if([1254,1020].includes(n) && !binaryGrid(a[0],500)) fail('grid is a binary grid up to 500 × 500.');
    if([1091,1162].includes(n) && !binaryGrid(a[0],100,true)) fail('grid is a square binary grid up to 100 × 100.');
    if(n===934) { if (!binaryGrid(a[0],100,true) || a[0].length<2) fail('grid is a square binary grid of size 2 to 100.'); const g=a[0], size=g.length, seen=g.map((row:any)=>row.map(()=>false)); let islands=0; for (let r=0;r<size;r++) for (let c=0;c<size;c++) { if (g[r][c]!==1||seen[r][c]) continue; islands++; const st=[[r,c]]; seen[r][c]=true; while (st.length) { const [y,x]=st.pop()!; for (const [dy,dx] of [[1,0],[-1,0],[0,1],[0,-1]]) { const ny=y+dy, nx=x+dx; if (ny>=0&&ny<size&&nx>=0&&nx<size&&g[ny][nx]===1&&!seen[ny][nx]) { seen[ny][nx]=true; st.push([ny,nx]); } } } } if (islands!==2) fail('grid must contain exactly two islands.'); }
    if(n===1466 && (a[0]<2 || a[0]>5e4 || !isTree(a[0],a[1]))) fail('connections are n - 1 roads forming a tree over cities 0 to n - 1 (2 <= n <= 5 × 10^4).');
    if(n===909) { const b=a[0], size=b.length; if (size<2 || size>20 || b.some((row:any)=>!Array.isArray(row)||row.length!==size||row.some((x:any)=>x!==-1&&(x<1||x>size*size))) || b[size-1][0]!==-1 || b[0][size%2?size-1:0]!==-1) fail('board is n × n (2 to 20) with -1 or targets in [1, n²], and squares 1 and n² have no snake or ladder.'); }
    if(n===802 && (!a[0].length || a[0].length>1e4 || a[0].some((e:any)=>!Array.isArray(e)||e.some((x:any,i:number)=>x<0||x>=a[0].length||i&&x<=e[i-1])))) fail('graph[i] lists nodes in [0, n - 1] in strictly increasing order.');
    if(n===1958 && (a[0].length!==8 || a[0].some((row:any)=>!Array.isArray(row)||row.length!==8||row.some((x:any)=>!['.','W','B'].includes(x))) || a[1]<0 || a[1]>7 || a[2]<0 || a[2]>7 || a[0][a[1]][a[2]]!=='.' || !['B','W'].includes(a[3]))) fail('board is 8 × 8 of ".", "W", "B"; the move is on an empty cell; color is "B" or "W".');
    if(n===2359 && (a[0].length<2 || a[0].some((x:any,i:number)=>x!==-1&&(x<0||x>=a[0].length||x===i)) || a[1]<0 || a[1]>=a[0].length || a[2]<0 || a[2]>=a[0].length)) fail('edges[i] is -1 or another node; node1 and node2 are in range.');
    if(n===1129 && (a[0]<1 || a[0]>100 || [...a[1],...a[2]].some((e:any)=>!Array.isArray(e)||e.length!==2||e.some((x:any)=>x<0||x>=a[0])))) fail('1 <= n <= 100; edges are pairs of nodes in [0, n - 1].');
    if(n===2477 && (a[0].length>1e5 || !isTree(a[0].length+1,a[0]) || a[1]<1 || a[1]>1e5)) fail('roads form a tree over cities 0 to n - 1; 1 <= seats <= 10^5.');
    if(n===2492) { const size=a[0]; if (size<2 || size>1e5 || !a[1].length || a[1].some((e:any)=>!Array.isArray(e)||e.length!==3||e[0]<1||e[1]<1||e[0]>size||e[1]>size||e[0]===e[1]||e[2]<1||e[2]>1e4) || new Set(a[1].map((e:any)=>Math.min(e[0],e[1])+','+Math.max(e[0],e[1]))).size!==a[1].length) fail('roads are distinct [a, b, distance] with a != b in [1, n] and distance in [1, 10^4].'); const root=Array.from({length:size+1},(_,k)=>k), find=(x:number):number=>root[x]===x?x:(root[x]=find(root[x])); for (const e of a[1]) root[find(e[0])]=find(e[1]); if (find(1)!==find(size)) fail('Cities 1 and n must be connected.'); }
    if(n===1557) { const size=a[0]; if (size<2 || size>1e5 || a[1].some((e:any)=>!Array.isArray(e)||e.length!==2||e.some((x:any)=>x<0||x>=size)||e[0]===e[1]) || new Set(a[1].map((e:any)=>e.join())).size!==a[1].length) fail('edges are distinct pairs of different nodes in [0, n - 1].'); const indeg=new Array(size).fill(0), out:number[][]=Array.from({length:size},()=>[]); for (const [x,y] of a[1]) { out[x].push(y); indeg[y]++; } const queue=[...Array(size).keys()].filter(k=>!indeg[k]); for (let h=0;h<queue.length;h++) for (const y of out[queue[h]]) if (!--indeg[y]) queue.push(y); if (queue.length!==size) fail('The graph must be acyclic.'); }
    if(n===2101 && (!a[0].length || a[0].length>100 || a[0].some((b:any)=>!Array.isArray(b)||b.length!==3||b.some((x:any)=>x<1||x>1e5)))) fail('bombs are 1 to 100 triples [x, y, r] with values in [1, 10^5].');
    if(n===1857 && (!/^[a-z]{1,100000}$/.test(a[0]) || a[1].some((e:any)=>!Array.isArray(e)||e.length!==2||e.some((x:any)=>x<0||x>=a[0].length)))) fail('colors is lowercase; edges are pairs of nodes in [0, n - 1].');
    if([234,876,1721,2130,147].includes(n) && !a[0].length) fail('The list must be nonempty.');
    if([234,203,83,876,2130,1721,24,148,86,61,147,725].includes(n) && a[0].length>5e4) fail('Lists have at most 5 × 10^4 nodes.');
    if(n===234 && a[0].some((x:any)=>x<0||x>9)) fail('Node values are in [0, 9].');
    if(n===203 && (a[0].some((x:any)=>x<1||x>50) || a[1]<0 || a[1]>50)) fail('Node values are in [1, 50] and val is in [0, 50].');
    if(n===83 && (a[0].some((x:any)=>x<-100||x>100) || !sorted(a[0]))) fail('The list is sorted with values in [-100, 100].');
    if(n===2130 && (a[0].length%2 || a[0].some((x:any)=>x<1||x>1e5))) fail('The list has an even number of nodes with values in [1, 10^5].');
    if(n===1721 && (a[1]<1 || a[1]>a[0].length)) fail('k is between 1 and the list length.');
    if(n===86 && (a[0].some((x:any)=>x<-100||x>100) || a[1]<-200 || a[1]>200)) fail('Node values are in [-100, 100] and x is in [-200, 200].');
    if(n===61 && (a[1]<0 || a[1]>2e9)) fail('k is in [0, 2 × 10^9].');
    if(n===725 && (a[1]<1 || a[1]>50)) fail('k is in [1, 50].');
    if(n===160) { const [la, lb, sa, sb]=a; if (!la.length || !lb.length || !integer(sa) || !integer(sb) || sa<0 || sa>la.length || sb<0 || sb>lb.length || (sa===la.length)!==(sb===lb.length) || JSON.stringify(la.slice(sa))!==JSON.stringify(lb.slice(sb))) fail('listA and listB are nonempty; skipA and skipB mark where their shared tail starts (the tails must hold the same values), or both equal the list lengths for no intersection.'); }
    if(n===116 && (a[0].includes(null) || (a[0].length+1)&a[0].length || a[0].length>4095 || a[0].some((x:any)=>x<-1000||x>1000))) fail('root is a perfect binary tree (2^k - 1 nodes, no nulls) with values in [-1000, 1000].');
    if(n===108 && (!a[0].length || a[0].length>1e4 || a[0].some((x:any,i:number)=>x<-1e4||x>1e4||i&&x<=a[0][i-1]))) fail('nums is strictly increasing with 1 to 10^4 values in [-10^4, 10^4].');
    if(n===112 && (a[1]<-1000 || a[1]>1000 || a[0].some((x:any)=>x!==null&&(x<-1000||x>1000)))) fail('Node values and targetSum are in [-1000, 1000].');
    if(n===129 && a[0].some((x:any)=>x!==null&&(x<0||x>9))) fail('Node values are digits 0 to 9.');
    if([951,652,606,958].includes(n) && a[0].some((x:any)=>x!==null&&(x<-1000||x>1000))) fail('Node values are in [-1000, 1000].');
    if(n===951 && [a[0],a[1]].some((t:any)=>!unique(t.filter((x:any)=>x!==null)))) fail('Each tree has distinct values.');
    if(n===669 && a[1]>a[2]) fail('Require low <= high.');
    if(n===106 && (a[0].length!==a[1].length || !a[0].length || !unique(a[0]) || a[0].some((v:any)=>!a[1].includes(v)) || (()=>{ const at=new Map(a[0].map((v:any,i:number)=>[v,i])); let p=a[1].length-1; const ok=(lo:number,hi:number):boolean=>{ if (lo>hi) return true; const i=at.get(a[1][p--]) as number; if (i<lo||i>hi) return false; return ok(i+1,hi)&&ok(lo,i-1); }; return !ok(0,a[0].length-1)||p!==-1; })())) fail('inorder and postorder must be traversals of the same tree with distinct values.');
    if(n===96 && (a[0]<1 || a[0]>19)) fail('n is in [1, 19].');
    if(n===95 && (a[0]<1 || a[0]>8)) fail('n is in [1, 8].');
    if(n===894 && (a[0]<1 || a[0]>20)) fail('n is in [1, 20].');
    if(n===1443 && (a[0]<1 || a[0]>1e5 || !isTree(a[0],a[1]) || a[2].length!==a[0])) fail('edges form a tree over nodes 0 to n - 1 and hasApple has n values.');
    if(n===1376) { const [size,head,manager,time]=a; let ok=size>=1&&size<=1e5&&integer(head)&&head>=0&&head<size&&manager.length===size&&time.length===size&&manager[head]===-1&&time.every((x:any)=>x>=0&&x<=1000); if (ok) { for (let i=0;i<size&&ok;i++) { if (i!==head && (manager[i]<0||manager[i]>=size)) ok=false; let x=i,steps=0; while (ok && x!==-1) { x=manager[x]; if (++steps>size) ok=false; } } } if (ok) { const boss=new Set(manager); ok=time.every((x:any,i:number)=>boss.has(i)||x===0); } if (!ok) fail('manager forms a tree under headID (manager[headID] = -1), and only managers have a nonzero informTime in [0, 1000].'); }
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
