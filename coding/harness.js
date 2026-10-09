// This function is serialized into QuickJS. It must not capture host objects.
export function installEnvironment() {
  globalThis.ListNode = class ListNode { constructor(val = 0, next = null) { this.val = val; this.next = next; } };
  globalThis.TreeNode = class TreeNode { constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; } };
  globalThis.Node = class Node {
    constructor(val = 0, second = null, topLeft = null, topRight = null, bottomLeft = null, bottomRight = null) {
      this.val = val; this.next = null; this.random = null;
      this.neighbors = Array.isArray(second) ? second : [];
      this.isLeaf = second; this.topLeft = topLeft; this.topRight = topRight; this.bottomLeft = bottomLeft; this.bottomRight = bottomRight;
    }
  };
}

export function executeCase(number, input, entry, deserializeFn) {
  const clone = value => JSON.parse(JSON.stringify(value));
  const original = JSON.stringify(input);
  const listNodes = values => { const nodes = values.map(v => new ListNode(v)); nodes.forEach((node,i) => node.next = nodes[i+1] || null); return nodes; };
  const toList = values => listNodes(values)[0] || null;
  const fromList = head => { const values = [], seen = new Set(); while (head) { if (seen.has(head) || values.length > 10000) throw new Error('Output list contains a cycle or is too large.'); seen.add(head); values.push(head.val); head = head.next; } return values; };
  const toTree = values => { if (!values.length || values[0] === null) return null; const root = new TreeNode(values[0]), queue = [root]; let i = 1; for (let q = 0; q < queue.length && i < values.length; q++) for (const key of ['left','right']) { if (i < values.length && values[i] !== null) { queue[q][key] = new TreeNode(values[i]); queue.push(queue[q][key]); } i++; } return root; };
  const fromTree = root => { const out = [], queue = [root], seen = new Set(); for (let q = 0; q < queue.length; q++) { const node = queue[q]; if (!node) { out.push(null); continue; } if (seen.has(node) || queue.length > 20000) throw new Error('Output tree contains a cycle, shared node, or is too large.'); seen.add(node); out.push(node.val); queue.push(node.left, node.right); } while (out.at(-1) === null) out.pop(); return out; };
  const findNode = (node, val) => !node ? null : node.val === val ? node : findNode(node.left, val) || findNode(node.right, val);
  const trees = [94,98,102,104,110,124,144,145,199,226,230,235,297,337,437,450,543,572,700,701,1325,1448];
  const lists = [19,25,92,143,206,2807];
  const design = [146,155,208,211,225,232,295,304,355,460,622,703,705,706,895,901,933,981,2013];
  if (design.includes(number)) {
    const [ops, args] = input, obj = new entry(...args[0]), result = [null];
    for (let i = 1; i < ops.length; i++) {
      const method=ops[i], value=obj[method](...args[i]);
      const isVoid=['push','insert','addWord','addNum','postTweet','follow','unfollow','put','set','remove'].includes(method) || method==='add'&&[705,2013].includes(number) || method==='pop'&&number===155;
      result.push(isVoid || value===undefined ? null : clone(value));
    }
    return result;
  }
  if (number === 271) {
    const encoded = new entry().encode(clone(input[0]));
    if (typeof encoded !== 'string') throw new Error('encode must return a string.');
    return new entry().decode(encoded);
  }
  if (number === 133) {
    const nodes = input[0].map((_,i) => new Node(i+1));
    nodes.forEach((node,i) => node.neighbors = input[0][i].map(v => nodes[v-1]));
    const output = entry(nodes[0] || null), seen = new Set(), queue = output ? [output] : [], rows = [];
    for (let i = 0; i < queue.length; i++) { const node = queue[i]; if (seen.has(node)) continue; if (nodes.includes(node)) throw new Error('Return a deep copy, not an input node.'); if (seen.size > 1000 || !Number.isInteger(node.val) || node.val < 1 || node.val > input[0].length) throw new Error('Invalid graph node.'); seen.add(node); if (rows[node.val-1]) throw new Error('Duplicate graph node value.'); rows[node.val-1] = node.neighbors.map(n => n.val).sort((a,b) => a-b); queue.push(...node.neighbors); }
    if (nodes.some((node,i) => node.val !== i+1 || JSON.stringify(node.neighbors.map(n => n.val)) !== JSON.stringify(input[0][i]))) throw new Error('The input graph was modified.');
    return rows;
  }
  if (number === 138) {
    const nodes = input[0].map(pair => new Node(pair[0]));
    nodes.forEach((node,i) => { node.next = nodes[i+1] || null; node.random = input[0][i][1] === null ? null : nodes[input[0][i][1]]; });
    let head = entry(nodes[0] || null); const out = [], seen = new Set();
    while (head) { if (seen.has(head) || out.length > 10000) throw new Error('Invalid output list.'); if (nodes.includes(head)) throw new Error('Return a deep copy, not an input node.'); seen.add(head); out.push(head); head = head.next; }
    if (nodes.some((node,i) => node.val !== input[0][i][0] || node.next !== (nodes[i+1] || null) || node.random !== (input[0][i][1] === null ? null : nodes[input[0][i][1]]))) throw new Error('The input list was modified.');
    return out.map(node => { if (node.random && !seen.has(node.random)) throw new Error('random must point into the copied list.'); return [node.val, node.random ? out.indexOf(node.random) : null]; });
  }
  if (number === 141) { const nodes = listNodes(input[0]); if (nodes.length && input[1] >= 0) nodes.at(-1).next = nodes[input[1]]; return entry(nodes[0] || null); }
  if (number === 374) { globalThis.guess = value => value === input[1] ? 0 : value < input[1] ? 1 : -1; return entry(input[0]); }
  if (number === 1095) { let calls = 0; const values = input[1]; return entry(input[0], Object.freeze({ length: () => values.length, get: i => { if (++calls > 100) throw new Error('MountainArray.get exceeded 100 calls.'); if (!Number.isInteger(i) || i < 0 || i >= values.length) throw new Error('MountainArray index out of range.'); return values[i]; } })); }
  const args = clone(input);
  if (trees.includes(number)) args[0] = toTree(args[0]);
  if (number === 100) { args[0] = toTree(args[0]); args[1] = toTree(args[1]); }
  if (number === 572) args[1] = toTree(args[1]);
  if (number === 235) { args[1] = findNode(args[0], args[1]); args[2] = findNode(args[0], args[2]); }
  if (lists.includes(number)) args[0] = toList(args[0]);
  if (number === 2 || number === 21) { args[0] = toList(args[0]); args[1] = toList(args[1]); }
  if (number === 23) args[0] = args[0].map(toList);
  if (number === 297) { const text = entry(args[0]); if (typeof text !== 'string') throw new Error('serialize must return a string.'); return fromTree(deserializeFn(text)); }
  const result = entry(...args);
  if ([2,19,21,23,25,92,206,2807].includes(number)) return fromList(result);
  if (number === 143) return fromList(args[0]);
  if ([105,226,450,700,701,1325].includes(number)) return fromTree(result);
  if (number === 235) { if (!result || result !== findNode(args[0], result.val)) throw new Error('Return an ancestor node from the input tree.'); return result.val; }
  if ([26,27].includes(number)) { if (!Number.isInteger(result) || result < 0 || result > input[0].length) throw new Error('Return the number of retained elements.'); return { length: result, values: args[0].slice(0,result) }; }
  if ([48,73,75,88,130,189,286,344].includes(number)) return args[0];
  if (number === 427) {
    const size = input[0].length, grid = Array.from({length:size}, () => Array(size).fill(0)), seen = new Set();
    function fill(node, r, c, n) { if (!node || seen.has(node) || n < 1) throw new Error('Invalid quad tree.'); seen.add(node); if (node.isLeaf) { if (![true,false,0,1].includes(node.val)) throw new Error('Invalid quad value.'); for (let i=r;i<r+n;i++) for (let j=c;j<c+n;j++) grid[i][j] = Number(node.val); } else { for (const [key,dr,dc] of [['topLeft',0,0],['topRight',0,n/2],['bottomLeft',n/2,0],['bottomRight',n/2,n/2]]) fill(node[key],r+dr,c+dc,n/2); } }
    fill(result,0,0,size); return grid;
  }
  if (JSON.stringify(input) !== original) throw new Error('Invalid harness input mutation.');
  if (result === undefined) throw new Error('The solution did not return a value.');
  return result;
}
