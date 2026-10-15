/* Shared helpers for the reference visualizers added after the original library.
 * Each page keeps its own reference code rows, algorithm, examples and lesson bridge.
 * The kit records one snapshot per executed instruction and draws the common structures
 * with the identity and pointer-motion attributes the shared walkthrough expects:
 * every row has data-study-motion-scope, every variable label data-study-pointer and its
 * destination data-study-pointer-target (an index or node ID, never a value). */
(() => {
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const tag = (value, id) => { Object.defineProperty(value, '_studyId', { value: id, configurable: true }); return value; };
  const idOf = value => value && typeof value === 'object' ? value._studyId : undefined;

  // Deep copy that keeps node identities (_studyId) and shared references within one snapshot.
  function clone(value, seen = new Map()) {
    if (value === null || typeof value !== 'object') return value;
    if (seen.has(value)) return seen.get(value);
    let copy;
    if (Array.isArray(value)) { copy = []; seen.set(value, copy); value.forEach((item, i) => { copy[i] = clone(item, seen); }); }
    else if (value instanceof Map) { copy = new Map(); seen.set(value, copy); for (const [k, v] of value) copy.set(clone(k, seen), clone(v, seen)); }
    else if (value instanceof Set) { copy = new Set(); seen.set(value, copy); for (const v of value) copy.add(clone(v, seen)); }
    else { copy = Object.create(Object.getPrototypeOf(value)); seen.set(value, copy); for (const key of Object.keys(value)) copy[key] = clone(value[key], seen); }
    if (idOf(value)) tag(copy, value._studyId);
    return copy;
  }

  // JavaScript-like text for the Variables panel and narration.
  function show(value, depth = 0) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') return JSON.stringify(value);
    if (typeof value !== 'object') return String(value);
    if (depth > 3) return '…';
    if ('val' in value && ('next' in value || 'left' in value)) return `node(${show(value.val, depth + 1)})`;
    if (Array.isArray(value)) return `[${value.map(item => show(item, depth + 1)).join(', ')}]`;
    if (value instanceof Map) return `Map(${value.size}) {${[...value].map(([k, v]) => `${show(k, depth + 1)} => ${show(v, depth + 1)}`).join(', ')}}`;
    if (value instanceof Set) return `Set(${value.size}) {${[...value].map(v => show(v, depth + 1)).join(', ')}}`;
    return `{${Object.keys(value).map(key => `${key}: ${show(value[key], depth + 1)}`).join(', ')}}`;
  }

  // Records snapshots. read() returns the scope object holding only the variables whose
  // declarations have executed, so the Object View never shows a variable too early.
  function recorder(steps, read) {
    const trace = [];
    return {
      trace,
      log(row) { trace.push(row); },
      snap(line, phase, narration, extra = {}) {
        const { returned, ...fields } = extra, scope = read(), state = { ...clone(scope), ...fields, trace: trace.map(row => ({ ...row })), executedLine: line, lines: line ? [line] : [], phase, narration, finished: false };
        Object.defineProperty(state, '_names', { value: Object.keys(scope) });
        // The return value is kept apart from the locals.
        if (Object.hasOwn(extra, 'returned')) Object.defineProperty(state, 'returned', { value: clone(returned) });
        steps.push(state);
        return state;
      },
      finish() {
        const last = steps[steps.length - 1]; if (!last) return;
        last.finished = true;
        // The walkthrough's final return caption reads result.
        if (Object.hasOwn(last, 'returned') && !last._names.includes('result')) last.result = last.returned;
      }
    };
  }

  // Object View frame for a snapshot: declared locals in order, then the return value.
  function objectFrame(state, frameName, { roots = null, scope = 'Local', skip = [] } = {}) {
    // scope may be a function of the variable name, e.g. to label an inner helper's locals.
    const scopeOf = typeof scope === 'function' ? scope : () => scope;
    const list = roots || state._names.filter(name => !skip.includes(name)).map(name => ({ name, scope: scopeOf(name), value: state[name] }));
    if (Object.hasOwn(state, 'returned')) list.push({ name: 'return', scope: 'Return value', value: state.returned });
    return StudyObjectView.capture(list, { frameName, idOf });
  }

  const pointerTags = (names, target) => names.length ? `<span class="kit-pointers">${names.map(name => `<span class="pointer" data-study-pointer="${esc(name)}" data-study-pointer-target="${esc(target)}">${esc(name)}</span>`).join('')}</span>` : '';
  const grouped = (pointers, keyOf) => { const out = new Map(); for (const [name, at] of Object.entries(pointers || {})) { const key = keyOf(at); if (key === null || key === undefined) continue; if (!out.has(key)) out.set(key, []); out.get(key).push(name); } return out; };
  const caption = text => text ? `<div class="kit-caption">${esc(text)}</div>` : '';

  // One array row. pointers: { name: index }. A pointer one past the end draws an empty end slot.
  function array(values, { scope, label = '', cls = () => '', pointers = {}, format = show, indices = true } = {}) {
    const at = grouped(pointers, index => Number.isInteger(index) && index >= 0 && index <= values.length ? index : null);
    // Labels and indices sit beside the entity, so moving a pointer never reads as a value change.
    const cell = (value, i, ghost) => `<div class="kit-slot">${pointerTags(at.get(i) || [], `${scope}:${i}`)}<div class="${ghost ? 'kit-ghost' : `kit-cell ${cls(i, value)}`}" data-id="${esc(scope)}:${i}">${ghost ? '' : esc(format(value))}</div>${indices ? `<span class="kit-index">${i}</span>` : ''}</div>`;
    const cells = values.map((value, i) => cell(value, i, false)).join('') + (at.has(values.length) ? cell(undefined, values.length, true) : '');
    return `<div class="kit-array">${caption(label)}<div class="kit-row" data-study-motion-scope="${esc(scope)}">${cells || '<span class="kit-empty">[]</span>'}</div></div>`;
  }

  // A matrix. pointers: { name: [row, col] }.
  function grid(rows, { scope, label = '', cls = () => '', pointers = {}, format = show } = {}) {
    const at = grouped(pointers, p => Array.isArray(p) ? `${p[0]},${p[1]}` : null);
    const width = Math.max(0, ...rows.map(r => r.length));
    const head = `<div class="kit-grid-row"><span class="kit-grid-label"></span>${Array.from({ length: width }, (_, c) => `<span class="kit-grid-label">${c}</span>`).join('')}</div>`;
    const body = rows.map((row, r) => `<div class="kit-grid-row"><span class="kit-grid-label">${r}</span>${row.map((value, c) => `<div class="kit-slot">${pointerTags(at.get(`${r},${c}`) || [], `${scope}:${r},${c}`)}<div class="kit-cell grid-cell ${cls(r, c, value)}" data-id="${esc(scope)}:${r},${c}">${esc(format(value))}</div></div>`).join('')}</div>`).join('');
    return `<div class="kit-array">${caption(label)}<div class="kit-grid" data-study-motion-scope="${esc(scope)}">${head}${body}</div></div>`;
  }

  // Builds tagged tree nodes from a LeetCode level-order array.
  function treeFromLevel(values, prefix = 'tree-node') {
    if (!values.length || values[0] === null) { if (values.length > 1 && values[0] === null) throw Error('Tree values cannot follow a null root.'); return null; }
    let next = 0;
    const node = val => tag({ val, left: null, right: null }, `${prefix}:${next++}`);
    const root = node(values[0]), queue = [root]; let i = 1;
    while (queue.length && i < values.length) { const parent = queue.shift(); for (const side of ['left', 'right']) { if (i >= values.length) break; const value = values[i++]; if (value !== null) { parent[side] = node(value); queue.push(parent[side]); } } }
    if (i < values.length) throw Error('The level-order tree contains values with no parent.');
    return root;
  }
  function levelOrder(root) {
    const out = [], queue = [root];
    for (let i = 0; i < queue.length; i++) { const node = queue[i]; out.push(node ? node.val : null); if (node) queue.push(node.left, node.right); }
    while (out.length && out.at(-1) === null) out.pop();
    return out;
  }

  // A binary tree laid out in order. pointers: { name: node }. Edges are the actual child links.
  function tree(root, { scope, label = '', cls = () => '', pointers = {}, format = node => show(node.val), extra = () => '' } = {}) {
    if (!root) return `<div class="kit-array">${caption(label)}<div class="kit-empty" data-study-motion-scope="${esc(scope)}">null</div></div>`;
    const positions = new Map(); let order = 0, depthMax = 0;
    (function layout(node, depth) { if (!node || positions.has(node)) return; layout(node.left, depth + 1); positions.set(node, { x: 12 + order++ * 60, y: 34 + depth * 78 }); depthMax = Math.max(depthMax, depth); layout(node.right, depth + 1); })(root, 0);
    const at = grouped(pointers, node => idOf(node) || null);
    const width = Math.max(120, order * 60 + 12), height = (depthMax + 1) * 78 + 20;
    let edges = '', nodes = '';
    for (const [node, p] of positions) {
      for (const child of [node.left, node.right]) if (child && positions.has(child)) { const c = positions.get(child); edges += `<line x1="${p.x + 21}" y1="${p.y + 21}" x2="${c.x + 21}" y2="${c.y + 21}" />`; }
      nodes += `<div class="kit-slot tree-slot" style="left:${p.x}px;top:${p.y}px">${pointerTags(at.get(idOf(node)) || [], idOf(node))}<div class="tree-node ${cls(node)}" data-id="${esc(idOf(node))}">${esc(format(node))}</div>${extra(node)}</div>`;
    }
    return `<div class="kit-array">${caption(label)}<div class="tree-canvas" data-study-motion-scope="${esc(scope)}" style="width:${width}px;height:${height}px"><svg class="kit-edges" width="${width}" height="${height}">${edges}</svg>${nodes}</div></div>`;
  }

  // Linked list nodes from values; returns the tagged nodes in creation order.
  function listFromValues(values, prefix = 'list-node') {
    const nodes = values.map((val, i) => tag({ val, next: null }, `${prefix}:${i}`));
    nodes.forEach((node, i) => { node.next = nodes[i + 1] || null; });
    return nodes;
  }
  function listValues(head, limit = 1000) { const out = [], seen = new Set(); while (head && !seen.has(head) && out.length < limit) { seen.add(head); out.push(head.val); head = head.next; } return out; }

  // Draws nodes in the given order. An arrow joins a node to its actual next node when that node
  // follows it; any other next reference is written out, so no arrow is ever implied.
  function list(nodes, { scope, label = '', cls = () => '', pointers = {}, format = node => show(node.val) } = {}) {
    const at = grouped(pointers, node => node === null ? 'null' : idOf(node) || null);
    const parts = nodes.map((node, i) => {
      const following = nodes[i + 1], link = node.next === null ? (i === nodes.length - 1 ? '<span class="kit-link end">→ null</span>' : '<span class="kit-link cut">next: null</span>') : node.next === following ? '<span class="kit-link">→</span>' : `<span class="kit-link jump">next: ${esc(show(node.next.val))}</span>`;
      return `<div class="kit-slot">${pointerTags(at.get(idOf(node)) || [], idOf(node))}<div class="list-node ${cls(node)}" data-id="${esc(idOf(node))}">${esc(format(node))}</div></div>${link}`;
    }).join('');
    const nullSlot = at.has('null') ? `<div class="kit-slot">${pointerTags(at.get('null'), `${scope}:null`)}<div class="kit-ghost list-ghost" data-id="${esc(scope)}:null">null</div></div>` : '';
    return `<div class="kit-array">${caption(label)}<div class="kit-row kit-list" data-study-motion-scope="${esc(scope)}">${parts || '<span class="kit-empty">null</span>'}${nullSlot}</div></div>`;
  }

  // Key/value entries of a Map, Set or plain object.
  function map(entries, { scope, label = '', cls = () => '', format = show, empty = 'empty' } = {}) {
    const items = entries instanceof Map ? [...entries] : entries instanceof Set ? [...entries].map(v => [v, undefined]) : Object.entries(entries || {});
    const body = items.map(([k, v]) => `<div class="map-item ${cls(k, v)}" data-id="${esc(scope)}:${esc(String(k))}"><span class="kit-key">${esc(format(k))}</span>${v === undefined ? '' : `<span class="kit-arrow">→</span><span class="kit-value">${esc(format(v))}</span>`}</div>`).join('');
    return `<div class="kit-array">${caption(label)}<div class="kit-map" data-study-motion-scope="${esc(scope)}">${body || `<span class="kit-empty">${esc(empty)}</span>`}</div></div>`;
  }

  // A stack drawn bottom to top, with the top marked.
  function stack(values, { scope, label = '', cls = () => '', format = show } = {}) {
    const items = values.map((value, i) => `<div class="kit-slot stack-slot"><span class="kit-index">${i}</span><div class="stack-item ${cls(i, value)}" data-id="${esc(scope)}:${i}">${esc(format(value))}</div>${i === values.length - 1 ? pointerTags(['top'], `${scope}:${i}`) : ''}</div>`).join('');
    return `<div class="kit-array">${caption(label)}<div class="kit-stack" data-study-motion-scope="${esc(scope)}">${items || '<span class="kit-empty">empty</span>'}</div></div>`;
  }

  const variables = (state, names = state._names) => names.map(name => `${name} = ${show(state[name])}`).join('\n');
  const table = rows => `<table><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

  // Shared controls, code highlight, narration, variables, result and trace for a snapshot.
  function render(state, index, count, { visual = '', variablesText = variables(state), result = '', trace = state.trace.map(row => Object.values(row)) } = {}) {
    document.getElementById('btn-prev').disabled = index === 0;
    const next = document.getElementById('btn-next'); next.disabled = index === count - 1; next.textContent = state.finished ? 'Finished!' : 'Step Over';
    document.querySelectorAll('.code-line').forEach(line => line.classList.toggle('active', line.id === 'line-' + state.executedLine));
    document.getElementById('narration-ui').textContent = state.narration;
    document.getElementById('visual-ui').innerHTML = visual;
    document.getElementById('console-ui').textContent = variablesText;
    document.getElementById('final-ui').textContent = result;
    document.getElementById('trace-ui').innerHTML = table(trace);
  }

  // Custom input parsing shared by the pages.
  function parseArray(text, { min = 0, max = 200, integer = true, low = -1e9, high = 1e9, name = 'Array' } = {}) {
    let value; try { value = JSON.parse(text.trim()); } catch { throw Error(`${name} must be a JSON array, e.g. [1,2,3].`); }
    if (!Array.isArray(value) || value.length < min || value.length > max) throw Error(`${name} needs ${min} to ${max} items.`);
    if (integer && value.some(v => !Number.isSafeInteger(v) || v < low || v > high)) throw Error(`${name} values must be integers in [${low}, ${high}].`);
    return value;
  }
  function parseInteger(text, { low = -1e9, high = 1e9, name = 'Value' } = {}) {
    const value = Number(text.trim()); if (!text.trim() || !Number.isSafeInteger(value) || value < low || value > high) throw Error(`${name} must be an integer in [${low}, ${high}].`); return value;
  }
  function parseString(text, { min = 0, max = 60, pattern = /^[a-z]*$/, name = 'String', hint = 'lowercase letters' } = {}) {
    let value = text.trim(); if (/^".*"$/.test(value)) { try { value = JSON.parse(value); } catch { /* keep raw */ } }
    if (value.length < min || value.length > max || !pattern.test(value)) throw Error(`${name} needs ${min} to ${max} ${hint}.`); return value;
  }
  const parts = (text, count, example) => { const pieces = text.split('|').map(piece => piece.trim()); if (pieces.length !== count) throw Error(`Use ${count} parts separated by |, e.g. ${example}`); return pieces; };

  globalThis.StudyKit = { esc, tag, idOf, clone, show, recorder, objectFrame, array, grid, treeFromLevel, levelOrder, tree, listFromValues, listValues, list, map, stack, variables, table, render, parseArray, parseInteger, parseString, parts };
})();
