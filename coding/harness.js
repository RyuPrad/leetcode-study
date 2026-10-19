// This function is serialized into QuickJS. It must not capture host objects.
export function installEnvironment() {
  globalThis.ListNode = class ListNode { constructor(val = 0, next = null) { this.val = val; this.next = next; } };
  globalThis.TreeNode = class TreeNode { constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; } };
  globalThis.Node = class Node {
    constructor(val = 0, second = null, topLeft = null, topRight = null, bottomLeft = null, bottomRight = null) {
      this.val = val; this.next = null; this.random = null; this.left = null; this.right = null;
      this.neighbors = Array.isArray(second) ? second : [];
      this.isLeaf = second; this.topLeft = topLeft; this.topRight = topRight; this.bottomLeft = bottomLeft; this.bottomRight = bottomRight;
    }
  };
  // TypeScript signatures name this class _Node, as LeetCode's do, to avoid the DOM Node type.
  globalThis._Node = globalThis.Node;
}

// Virtual time for events kits (io.events), serialized into QuickJS: timers fire in time order as the host
// advances the clock with __studyTick, Date.now() and performance.now() read the virtual clock, and
// adapters record what happens with kit.trace(text).
export function installVirtualTime() {
  let now = 0, order = 0;
  const timers = new Map();
  globalThis.__studyTrace = [];
  const schedule = (callback, delay, args, repeat) => {
    if (typeof callback !== 'function') throw new TypeError('The timer callback must be a function.');
    const id = ++order, wait = Math.max(0, Number(delay) || 0);
    timers.set(id, { callback, args, at: now + wait, every: repeat ? Math.max(1, wait) : 0, order: id });
    return id;
  };
  globalThis.setTimeout = (callback, delay, ...args) => schedule(callback, delay, args, false);
  globalThis.setInterval = (callback, delay, ...args) => schedule(callback, delay, args, true);
  globalThis.clearTimeout = globalThis.clearInterval = id => { timers.delete(id); };
  globalThis.queueMicrotask = callback => { Promise.resolve().then(callback); };
  Date.now = () => now;
  globalThis.performance = { now: () => now };
  globalThis.__studyNow = () => now;
  // Runs the earliest timer (the first scheduled among equals); false when none is left.
  globalThis.__studyTick = () => {
    let next = null;
    for (const [id, timer] of timers) if (!next || timer.at < next[1].at || timer.at === next[1].at && timer.order < next[1].order) next = [id, timer];
    if (!next) return false;
    const [id, timer] = next;
    now = timer.at;
    if (timer.every) { timer.at += timer.every; timer.order = ++order; } else timers.delete(id);
    timer.callback(...timer.args);
    return true;
  };
}

export function executeCase(number, input, entry, deserializeFn, spec) {
  const clone = value => JSON.parse(JSON.stringify(value));
  const original = JSON.stringify(input);
  const listNodes = values => { const nodes = values.map(v => new ListNode(v)); nodes.forEach((node,i) => node.next = nodes[i+1] || null); return nodes; };
  const toList = values => listNodes(values)[0] || null;
  const fromList = head => { const values = [], seen = new Set(); while (head) { if (seen.has(head) || values.length > 10000) throw new Error('Output list contains a cycle or is too large.'); seen.add(head); values.push(head.val); head = head.next; } return values; };
  const toTree = values => { if (!values.length || values[0] === null) return null; const root = new TreeNode(values[0]), queue = [root]; let i = 1; for (let q = 0; q < queue.length && i < values.length; q++) for (const key of ['left','right']) { if (i < values.length && values[i] !== null) { queue[q][key] = new TreeNode(values[i]); queue.push(queue[q][key]); } i++; } return root; };
  // shared allows one subtree object to appear more than once (894 builds trees from shared subtrees).
  const fromTree = (root, shared = false) => { const out = [], queue = [root], seen = new Set(); for (let q = 0; q < queue.length; q++) { const node = queue[q]; if (!node) { out.push(null); continue; } if (!shared && seen.has(node) || queue.length > 20000) throw new Error('Output tree contains a cycle, shared node, or is too large.'); seen.add(node); out.push(node.val); queue.push(node.left, node.right); } while (out.at(-1) === null) out.pop(); return out; };
  const findNode = (node, val) => !node ? null : node.val === val ? node : findNode(node.left, val) || findNode(node.right, val);
  // Generated kits describe their arguments by type (coding/kit-spec.ts) instead of by number.
  if (spec) {
    const lists = ['ListNode[]', 'List<ListNode>'], trees = ['TreeNode[]', 'List<TreeNode>'];
    const toValue = (type, value) => type === 'ListNode' ? toList(value) : type === 'TreeNode' ? toTree(value) : lists.includes(type) ? value.map(toList) : trees.includes(type) ? value.map(toTree) : value;
    const toJson = (type, value) => {
      if (type === 'ListNode') return fromList(value);
      if (type === 'TreeNode') return fromTree(value);
      if (lists.includes(type) || trees.includes(type)) { if (!Array.isArray(value)) throw new Error(`Return an array of ${lists.includes(type) ? 'list heads' : 'tree roots'}.`); return value.map(item => lists.includes(type) ? fromList(item) : fromTree(item)); }
      return value === undefined ? value : clone(value);
    };
    if (spec.seed !== undefined) { let seed = spec.seed; Math.random = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }; }
    const trace = text => { if (globalThis.__studyTrace && globalThis.__studyTrace.length < 500) globalThis.__studyTrace.push({ t: globalThis.__studyNow ? globalThis.__studyNow() : 0, text: String(text).slice(0, 300) }); };
    if (spec.adapter) return globalThis.__studyAdapter(clone(input), entry, { ListNode, TreeNode, Node, clone, listNodes, toList, fromList, toTree, fromTree, findNode, trace });
    if (spec.kind === 'design') {
      const [ops, args] = input, obj = new entry(...args[0].map((value, i) => toValue(spec.ctor[i], clone(value)))), result = [null];
      for (let i = 1; i < ops.length; i++) {
        const method = spec.methods[ops[i]];
        if (!method || typeof obj[ops[i]] !== 'function') throw new Error(`${ops[i]} is not a method of ${entry.name}.`);
        const value = obj[ops[i]](...args[i].map((arg, j) => toValue(method.params[j], clone(arg))));
        result.push(method.returns === 'void' || value === undefined ? null : toJson(method.returns, value));
      }
      return result;
    }
    const args = clone(input).map((value, i) => toValue(spec.params[i], value)), result = entry(...args);
    if (spec.mutates !== undefined) {
      const changed = args[spec.mutates];
      if (!spec.prefix) return toJson(spec.params[spec.mutates], changed);
      if (!Number.isInteger(result) || result < 0 || result > changed.length) throw new Error('Return the number of retained elements.');
      return { length: result, values: changed.slice(0, result) };
    }
    if (result === undefined) throw new Error('The solution did not return a value.');
    return toJson(spec.returns, result);
  }
  const trees = [94,98,101,102,103,104,110,112,124,129,144,145,199,226,230,235,297,337,437,450,513,538,543,572,606,652,662,669,700,701,783,958,1325,1448];
  const lists = [19,24,25,61,83,86,92,143,147,148,203,206,234,725,876,1721,2130,2807];
  const design = [146,155,173,208,211,225,232,295,303,304,352,355,380,460,622,703,705,706,707,895,901,933,981,1396,1472,1603,1845,1993,2013];
  if (design.includes(number)) {
    // RandomizedSet draws from a fixed sequence so the reference result is reproducible.
    if (number === 380) { let seed = 42; Math.random = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }; }
    // BSTIterator receives the tree built from its level-order argument.
    const [ops, args] = input, obj = new entry(...(number === 173 ? [toTree(args[0][0])] : args[0])), result = [null];
    for (let i = 1; i < ops.length; i++) {
      const method=ops[i], value=obj[method](...args[i]);
      const isVoid=number!==380&&['push','insert','addWord','addNum','postTweet','follow','unfollow','put','set','remove','unreserve','addAtHead','addAtTail','addAtIndex','deleteAtIndex','visit'].includes(method) || method==='add'&&[705,2013].includes(number) || method==='pop'&&number===155;
      result.push(isVoid || value===undefined ? null : clone(value));
    }
    return result;
  }
  if (number === 535) {
    const codec = new entry(), shortUrl = codec.encode(input[0]);
    if (typeof shortUrl !== 'string') throw new Error('encode must return a string.');
    return codec.decode(shortUrl);
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
  // 160 joins list B's first skipB nodes to list A's node at skipA; the answer is that node itself.
  if (number === 160) {
    const [a, b, skipA, skipB] = input, nodesA = listNodes(a), nodesB = listNodes(b.slice(0, skipB)), shared = nodesA[skipA] || null;
    if (nodesB.length) nodesB.at(-1).next = shared;
    const chainB = [...nodesB, ...nodesA.slice(skipA)], result = entry(nodesA[0] || null, nodesB[0] || shared);
    const intact = (chain, values) => chain.every((node, i) => node.val === values[i] && node.next === (chain[i + 1] || null));
    if (!intact(nodesA, a) || !intact(chainB, b)) throw new Error('The lists must keep their original structure.');
    if (result !== null && result !== shared) throw new Error('Return the first node shared by both lists.');
    return result === null ? null : result.val;
  }
  // 116 builds a perfect tree of Node objects; each level's next chain is written out and ended with #, as LeetCode prints it.
  if (number === 116) {
    const values = input[0], nodes = values.map(v => new Node(v));
    nodes.forEach((node, i) => { node.left = nodes[2 * i + 1] || null; node.right = nodes[2 * i + 2] || null; });
    const root = entry(nodes[0] || null), out = [];
    if (root !== (nodes[0] || null)) throw new Error('Return the root of the input tree.');
    if (nodes.some((node, i) => node.val !== values[i] || node.left !== (nodes[2 * i + 1] || null) || node.right !== (nodes[2 * i + 2] || null))) throw new Error('The tree must keep its structure.');
    for (let first = 0; first < nodes.length; first = 2 * first + 1) {
      let count = 0;
      for (let node = nodes[first]; node; node = node.next) { if (++count > nodes.length) throw new Error('next pointers form a cycle.'); out.push(node.val); }
      out.push('#');
    }
    return out;
  }
  if (number === 374) { globalThis.guess = value => value === input[1] ? 0 : value < input[1] ? 1 : -1; return entry(input[0]); }
  if (number === 1095) { let calls = 0; const values = input[1]; return entry(input[0], Object.freeze({ length: () => values.length, get: i => { if (++calls > 100) throw new Error('MountainArray.get exceeded 100 calls.'); if (!Number.isInteger(i) || i < 0 || i >= values.length) throw new Error('MountainArray index out of range.'); return values[i]; } })); }
  const args = clone(input);
  if (trees.includes(number)) args[0] = toTree(args[0]);
  if ([100,617,951].includes(number)) { args[0] = toTree(args[0]); args[1] = toTree(args[1]); }
  if (number === 572) args[1] = toTree(args[1]);
  if (number === 235) { args[1] = findNode(args[0], args[1]); args[2] = findNode(args[0], args[2]); }
  if (lists.includes(number)) args[0] = toList(args[0]);
  if (number === 2 || number === 21) { args[0] = toList(args[0]); args[1] = toList(args[1]); }
  if (number === 23) args[0] = args[0].map(toList);
  if (number === 297) { const text = entry(args[0]); if (typeof text !== 'string') throw new Error('serialize must return a string.'); return fromTree(deserializeFn(text)); }
  const result = entry(...args);
  if ([2,19,21,23,24,25,61,83,86,92,147,148,203,206,876,1721,2807].includes(number)) return fromList(result);
  if (number === 725) { if (!Array.isArray(result)) throw new Error('Return an array of list heads.'); return result.map(fromList); }
  if (number === 143) return fromList(args[0]);
  if ([105,106,108,226,450,538,617,669,700,701,1325].includes(number)) return fromTree(result);
  if ([95,652,894].includes(number)) { if (!Array.isArray(result)) throw new Error('Return an array of tree roots.'); return result.map(root => fromTree(root, number === 894)); }
  if (number === 235) { if (!result || result !== findNode(args[0], result.val)) throw new Error('Return an ancestor node from the input tree.'); return result.val; }
  if ([26,27,80].includes(number)) { if (!Number.isInteger(result) || result < 0 || result > input[0].length) throw new Error('Return the number of retained elements.'); return { length: result, values: args[0].slice(0,result) }; }
  if ([48,73,75,88,130,189,280,283,286,344].includes(number)) return args[0];
  if (number === 427) {
    const size = input[0].length, grid = Array.from({length:size}, () => Array(size).fill(0)), seen = new Set();
    function fill(node, r, c, n) { if (!node || seen.has(node) || n < 1) throw new Error('Invalid quad tree.'); seen.add(node); if (node.isLeaf) { if (![true,false,0,1].includes(node.val)) throw new Error('Invalid quad value.'); for (let i=r;i<r+n;i++) for (let j=c;j<c+n;j++) grid[i][j] = Number(node.val); } else { for (const [key,dr,dc] of [['topLeft',0,0],['topRight',0,n/2],['bottomLeft',n/2,0],['bottomRight',n/2,n/2]]) fill(node[key],r+dr,c+dc,n/2); } }
    fill(result,0,0,size); return grid;
  }
  if (JSON.stringify(input) !== original) throw new Error('Invalid harness input mutation.');
  if (result === undefined) throw new Error('The solution did not return a value.');
  return result;
}
