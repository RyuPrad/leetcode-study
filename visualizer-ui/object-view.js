/* Pure snapshot capture and nested object presentation, shared by reference pages and React. */
(() => {
  const own = Object.getOwnPropertyDescriptors, isArray = Array.isArray;
  const mapEntries = Map.prototype.entries, setValues = Set.prototype.values, apply = Reflect.apply;
  const mapSize = Object.getOwnPropertyDescriptor(Map.prototype, 'size').get, setSize = Object.getOwnPropertyDescriptor(Set.prototype, 'size').get;
  const containers = new WeakMap(), preferences = new WeakMap(), sentinels = new WeakSet();
  const location = { line: 1, column: 1, endLine: 1, endColumn: 1 };
  const special = text => { const value = { special: text }; sentinels.add(value); return value; };
  function capture(roots, options = {}) {
    const objects = [], seen = new WeakMap(), ids = new Map(), symbols = new Map();
    let serial = 0, bytes = 0, truncated = false;
    const maxEntries = options.maxEntries ?? 2000, maxObjects = options.maxObjects ?? 2000;
    function value(input, path, depth = 0) {
      bytes += 16;
      if (input === null || typeof input === 'boolean') return input;
      if (typeof input === 'number') return Number.isFinite(input) ? input : special(String(input));
      if (typeof input === 'string') { const limit = options.maxStringLength ?? 8192; bytes += Math.min(input.length, limit) * 2; if (input.length > limit) { truncated = true; return `${input.slice(0, limit)}…`; } return input; }
      if (typeof input === 'undefined') return special('undefined');
      if (typeof input === 'bigint') return special(`${input}n`);
      if (typeof input === 'symbol') return special(String(input));
      if (sentinels.has(input)) return { special: input.special };
      if (seen.has(input)) return { ref: seen.get(input) };
      if (objects.length >= maxObjects || depth > (options.maxDepth ?? 24) || bytes > (options.maxBytes ?? 500000)) { truncated = true; return special('… snapshot limit'); }
      let id = options.idOf?.(input, path);
      if (typeof id !== 'string' || !id || ids.has(id)) { do { id = `object-${++serial}`; } while (ids.has(id)); }
      seen.set(input, id); ids.set(id, input);
      const object = { id, kind: 'object', label: 'Object', entries: [] }; objects.push(object);
      let descriptors;
      try { descriptors = own(input); } catch { object.truncated = true; truncated = true; return { ref: id }; }
      if (typeof input === 'function') { const name = descriptors.name?.value; object.kind = 'function'; object.label = typeof name === 'string' ? name : 'Function'; return { ref: id }; }
      let iterator;
      try { iterator = apply(mapEntries, input, []); object.kind = 'map'; } catch { try { iterator = apply(setValues, input, []); object.kind = 'set'; } catch { /* ordinary data */ } }
      if (iterator) {
        object.label = object.kind === 'map' ? 'Map' : 'Set'; let index = 0;
        for (const item of iterator) {
          if (index >= maxEntries || bytes > (options.maxBytes ?? 500000)) { object.truncated = true; truncated = true; break; }
          const key = object.kind === 'map' ? item[0] : index, child = object.kind === 'map' ? item[1] : item;
          const keyValue = object.kind === 'map' ? value(key, `${path}.key${index}`, depth + 1) : undefined;
          if (typeof key === 'symbol' && !symbols.has(key)) symbols.set(key, `symbol-${symbols.size + 1}`);
          object.entries.push({ key: object.kind === 'map' ? typeof key === 'symbol' ? symbols.get(key) : `${typeof key}:${typeof key === 'object' && key !== null || typeof key === 'function' ? keyValue.ref || keyValue.special : String(key)}` : String(index), ...(keyValue === undefined ? {} : { keyValue }), value: value(child, `${path}[${index}]`, depth + 1) }); index++;
        }
        object.size = apply(object.kind === 'map' ? mapSize : setSize, input, []); return { ref: id };
      }
      object.kind = isArray(input) ? 'array' : descriptors.val && descriptors.next ? 'list' : descriptors.val && descriptors.left && descriptors.right ? 'tree' : descriptors.neighbors ? 'graph' : 'object';
      object.label = object.kind === 'array' ? 'Array' : object.kind === 'list' ? 'List node' : object.kind === 'tree' ? 'Tree node' : object.kind === 'graph' ? 'Graph node' : 'Object';
      if (object.kind === 'array') object.size = descriptors.length.value;
      let count = 0;
      for (const key of Reflect.ownKeys(descriptors)) {
        const descriptor = descriptors[key];
        if (key === 'length' && object.kind === 'array' || !descriptor.enumerable && !options.includeNonEnumerable) continue;
        if (count++ >= maxEntries || bytes > (options.maxBytes ?? 500000)) { object.truncated = true; truncated = true; break; }
        const name = typeof key === 'symbol' ? String(key) : key; bytes += name.length * 2;
        object.entries.push({ key: name, value: 'value' in descriptor ? value(descriptor.value, `${path}.${name}`, depth + 1) : special('accessor (not invoked)') });
      }
      return { ref: id };
    }
    let variables;
    if (isArray(roots)) variables = roots.map(root => ({ id: root.id || root.name, name: root.name, scope: root.scope || 'Local', value: value(root.value, root.name) }));
    else { const descriptors = own(roots); variables = Reflect.ownKeys(descriptors).filter(key => descriptors[key].enumerable).map(key => { const descriptor = descriptors[key], name = String(key); return { id: name, name, scope: 'Local', value: 'value' in descriptor ? value(descriptor.value, name) : special('accessor (not invoked)') }; }); }
    return { stack: [{ id: options.frameId ?? 0, name: options.frameName || 'Reference solution', location: options.location || location, variables }], objects, ...(truncated ? { truncated: true } : {}) };
  }
  const text = value => value === undefined ? 'not present' : value === null ? 'null' : typeof value === 'string' ? JSON.stringify(value) : typeof value === 'object' ? 'special' in value ? value.special : value.ref : String(value);
  const palette = ['#569cd6', '#c586c0', '#6a9955', '#d7ba7d', '#4ec9b0', '#ce9178', '#e06c75', '#b5cea8'];
  function color(name) {
    const known = {list1:'#569cd6', list2:'#c586c0', dummy:'#6a9955', tail:'#d7ba7d'};
    if (Object.hasOwn(known, name)) return known[name];
    let hash = 2166136261; for (let index = 0; index < name.length; index++) hash = Math.imul(hash ^ name.charCodeAt(index), 16777619);
    return palette[(hash >>> 0) % palette.length];
  }
  function format(frame, options = {}) {
    const byId = new Map(frame.objects.map(object => [object.id, object])), first = new Map(); let aliases = new Map();
    const collapsed = options.collapsed || new Set(), expanded = options.expanded || new Set();
    const before = new Map((options.previousFrame?.stack || []).flatMap(call => call.variables.map(variable => [`${call.id}:${variable.id}`, variable.value])));
    const beforeObjects = new Map((options.previousFrame?.objects || []).map(object => [object.id, new Map(object.entries.map(entry => [entry.key, entry.value]))]));
    const changes = frame.changes || [], reads = frame.reads || [];
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    function node(value, path, depth, ancestors, rootName) {
      if (!value || typeof value !== 'object' || !('ref' in value)) return { kind: 'scalar', text: text(value), token: value === null ? 'null' : typeof value === 'object' || value === undefined ? 'special' : typeof value, path };
      const object = byId.get(value.ref);
      if (!object) return { kind: 'scalar', token: 'special', text: 'unavailable in snapshot', objectId: value.ref, path };
      if (object.kind === 'function') return { kind: 'scalar', token: 'function', text: `[Function ${object.label}]`, path };
      if (first.has(object.id)) return { kind: 'reference', objectId: object.id, text: ancestors.has(object.id) ? '↩ circular reference' : '↗ shared reference', target: first.get(object.id), path };
      first.set(object.id, path);
      const closed = collapsed.has(path) || depth >= (options.depthLimit ?? 6) && !expanded.has(path);
      const limit = expanded.has(path) ? object.entries.length : options.entryLimit ?? 50;
      const result = { kind: 'object', path, depth, objectId: object.id, type: object.kind, label: object.label, size: object.size, aliases: (aliases.get(object.id) || []).filter(alias => alias.name !== rootName), collapsed: closed, entries: [], remaining: Math.max(0, object.entries.length - limit), truncated: !!object.truncated };
      if (!closed) {
        const nextAncestors = new Set(ancestors); nextAncestors.add(object.id);
        result.entries = object.entries.slice(0, limit).map((entry, index) => ({ key: entry.key, ...(entry.keyValue === undefined ? {} : { keyValue: node(entry.keyValue, `${path}/key-${index}`, depth + 1, nextAncestors, rootName) }), value: node(entry.value, `${path}/${encodeURIComponent(entry.key)}`, depth + 1, nextAncestors, rootName), changed: changes.some(change => change.objectId === object.id && change.key === entry.key) || !!beforeObjects.get(object.id) && !equal(beforeObjects.get(object.id).get(entry.key), entry.value), read: reads.some(read => read.objectId === object.id && read.key === entry.key) }));
      }
      return result;
    }
    const frames = [...frame.stack].reverse().map(call => {
      const scopes = new Map();
      aliases = new Map();
      for (const variable of call.variables) if (variable.value && typeof variable.value === 'object' && 'ref' in variable.value && byId.get(variable.value.ref)?.kind !== 'function') {
        const names = aliases.get(variable.value.ref) || [];
        if (!names.some(alias => alias.name === variable.name)) names.push({name:variable.name, color:color(variable.name)});
        aliases.set(variable.value.ref, names);
      }
      for (const variable of call.variables) {
        const value = variable.value, object = value && typeof value === 'object' && 'ref' in value ? byId.get(value.ref) : undefined;
        if (object?.kind === 'function' || value && typeof value === 'object' && 'special' in value && value.special === 'global object') continue;
        if (!scopes.has(variable.scope)) scopes.set(variable.scope, []);
        // Every variable gets a complete root view; aliases within that view stay references.
        first.clear();
        scopes.get(variable.scope).push({ id: variable.id, name: variable.name, color: color(variable.name), changed: options.previousFrame ? !equal(before.get(`${call.id}:${variable.id}`), value) : changes.some(change => !change.objectId && change.name === variable.name), value: node(value, `frame-${call.id}/${encodeURIComponent(variable.id)}`, 0, new Set(), variable.name) });
      }
      return { id: call.id, name: call.name, location: call.location, scopes: [...scopes].map(([name, variables]) => ({ name, variables })) };
    });
    return { frames, truncated: !!frame.truncated };
  }
  const make = (tag, className, content) => { const element = document.createElement(tag); if (className) element.className = className; if (content !== undefined) element.textContent = content; return element; };
  const selectionKey = (frameId, variableId) => JSON.stringify([frameId, variableId]);
  function rememberScroll(container, state) {
    for (const body of container.querySelectorAll('[data-object-scroll-key]')) if (body.getClientRects().length&&!(body.dataset.objectScrollMode!=='focused'&&state.pendingGridRestore?.has(body.dataset.objectScrollKey))) (body.dataset.objectScrollMode==='focused'?state.focusScrolls:state.scrolls).set(body.dataset.objectScrollKey, {top:body.scrollTop,left:body.scrollLeft});
  }
  function restoreGridScroll(container,state,settled=false){
    if(!state.pendingGridRestore?.size){state.restoreObserver?.disconnect();state.restoreObserver=null;return;}
    if(state.focus)return;
    const viewport=state.pendingViewport;
    if(viewport&&Math.abs(innerWidth-viewport.focusWidth)<1&&Math.abs(innerHeight-viewport.focusHeight)<1&&(Math.abs(viewport.width-viewport.focusWidth)>1||Math.abs(viewport.height-viewport.focusHeight)>1))return;
    for(const body of container.querySelectorAll('[data-object-scroll-mode="grid"]')){
      const key=body.dataset.objectScrollKey,saved=state.pendingGridRestore.get(key);if(!saved||!body.getClientRects().length)continue;
      const layout=[innerWidth,innerHeight,body.clientWidth,body.clientHeight].join(':');
      if(saved.layout!==layout){saved.layout=layout;saved.stable=0;}
      else if(settled)saved.stable=(saved.stable||0)+1;
      // A host may still be leaving fullscreen. Keep the desired position until
      // the normal-sized body has enough scroll range to represent it.
      if(saved.top>body.scrollHeight-body.clientHeight+1||saved.left>body.scrollWidth-body.clientWidth+1)continue;
      body.scrollTop=saved.top;body.scrollLeft=saved.left;
      if(saved.stable>=2)state.pendingGridRestore.delete(key);
    }
    if(!state.pendingGridRestore.size){state.restoreObserver?.disconnect();state.restoreObserver=null;}
    else if(!state.restoreFrame&&(state.restoreTicks||0)<12)state.restoreFrame=requestAnimationFrame(()=>{state.restoreFrame=0;state.restoreTicks=(state.restoreTicks||0)+1;restoreGridScroll(container,state,true);});
  }
  function reset(container) {
    const state=containers.get(container);
    state?.restoreObserver?.disconnect();
    if(state?.restoreFrame)cancelAnimationFrame(state.restoreFrame);
    if(state?.focus)state.onFocusChange?.(null);
    containers.delete(container);
  }
  function render(container, frame, options = {}) {
    const active=document.activeElement,activeCard=container.contains(active)?active.closest('.study-object-card'):null;
    const activeKey=activeCard?selectionKey(Number(activeCard.dataset.frameId),activeCard.dataset.variableId):null;
    const activePath=active?.classList.contains('study-object-toggle')||active?.classList.contains('study-object-more')?active.closest('[data-object-path]')?.dataset.objectPath:null;
    const activeReference=active?.dataset.objectReferencePath;
    const activeBody=active?.classList.contains('study-object-body')&&activeKey;
    let state = containers.get(container);
    state?.restoreObserver?.disconnect();if(state)state.restoreObserver=null;
    if(state?.restoreFrame){cancelAnimationFrame(state.restoreFrame);state.restoreFrame=0;}
    if (state&&!state.changingFocus) rememberScroll(container,state);
    if (!state || options.runId !== state.runId) {
      if(state?.focus)state.onFocusChange?.(null);
      state = { runId: options.runId, collapsed: new Set(), expanded: new Set(), scrolls:new Map(), focusScrolls:new Map(), pendingGridRestore:new Map(),restoreObserver:null,focus:null, focusedName:'', fontSize:preferences.get(container)?.fontSize ?? 16 };
      containers.set(container, state);
    }
    state.onFocusChange=options.onFocusChange;
    const model = format(frame, { ...options, collapsed: state.collapsed, expanded: state.expanded });
    function redraw() { render(container, frame, options); }
    function focus(selection,name='') {
      rememberScroll(container,state);
      if(selection&&!state.focus)state.normalViewport={width:innerWidth,height:innerHeight};
      const previous=state.focus;state.focus=selection;if(name)state.focusedName=name;
      if(previous&&!selection){state.pendingGridRestore=new Map([...state.scrolls].map(([key,value])=>[key,{...value}]));state.restoreTicks=0;state.pendingViewport={...state.normalViewport,focusWidth:innerWidth,focusHeight:innerHeight};}
      if(selection){const key=selectionKey(selection.frameId,selection.variableId);if(!state.focusScrolls.has(key))state.focusScrolls.set(key,{...(state.scrolls.get(key)||{top:0,left:0})});}
      // The host can resize the old grid synchronously while entering/leaving
      // focus. Its temporarily clamped scroll offsets must not replace the
      // reading positions captured before that layout change.
      state.changingFocus=true;
      try { options.onFocusChange?.(selection);redraw(); }
      finally { state.changingFocus=false; }
      if(selection)container.querySelector('.study-object-back')?.focus({preventScroll:true});
      else if(previous)[...container.querySelectorAll('.study-object-card')].find(card=>Number(card.dataset.frameId)===previous.frameId&&card.dataset.variableId===previous.variableId)?.querySelector('.study-object-expand')?.focus({preventScroll:true});
    }
    function reveal(path) {
      const parts = path.split('/');
      for (let index = 1; index <= parts.length; index++) { const ancestor = parts.slice(0, index).join('/'); state.collapsed.delete(ancestor); state.expanded.add(ancestor); }
      redraw();
      const target=[...container.querySelectorAll('[data-object-path]')].find(element => element.dataset.objectPath === path),body=target?.closest('.study-object-body');
      if(target&&body){const point=target.getBoundingClientRect(),bounds=body.getBoundingClientRect();body.scrollTop+=point.top-bounds.top;body.scrollLeft+=Math.min(0,point.left-bounds.left);target.querySelector('.study-object-toggle')?.focus({preventScroll:true});}
    }
    function draw(value) {
      if (value.kind === 'scalar') { const scalar = make('span', `study-object-scalar ${value.token}`, value.text); if (value.objectId) scalar.title = value.objectId; return scalar; }
      if (value.kind === 'reference') { const button = make('button', 'study-object-reference', value.text); button.dataset.objectReferencePath=value.path; button.title = value.objectId; button.setAttribute('aria-label', `Inspect ${value.text}: ${value.objectId}`); button.onclick = () => reveal(value.target); return button; }
      const block = make('span', 'study-object-value'); block.dataset.objectPath = value.path; block.dataset.objectId = value.objectId;
      const toggle = make('button', 'study-object-toggle', `${value.collapsed ? '▸' : '▾'} ${value.type === 'array' ? '[' : value.type === 'map' ? 'Map {' : value.type === 'set' ? 'Set {' : '{'}`); toggle.setAttribute('aria-expanded', String(!value.collapsed)); toggle.setAttribute('aria-label', `${value.collapsed ? 'Expand' : 'Collapse'} ${value.objectId}`);
      toggle.title = `${value.label} · ${value.objectId}${value.size === undefined ? '' : ` · ${value.size} items`}`;
      toggle.onclick = () => { if (value.collapsed) { state.collapsed.delete(value.path); state.expanded.add(value.path); } else state.collapsed.add(value.path); redraw(); };
      block.append(toggle);
      for (const alias of value.aliases) { const marker = make('span', 'study-object-alias', `← ${alias.name}`); marker.dataset.alias = alias.name; marker.style.setProperty('--study-object-accent', alias.color); marker.title = `${alias.name} references ${value.objectId}`; block.append(make('span', '', ' '), marker); }
      if (!value.collapsed) {
        const entries = make('span', 'study-object-entries');
        for (const entry of value.entries) {
          const row = make('span', `study-object-entry${entry.changed ? ' changed' : entry.read ? ' read' : ''}`); row.dataset.objectId = value.objectId; row.dataset.entry = entry.key; row.append(make('span', '', `\n${'  '.repeat(value.depth + 1)}`));
          if (value.type === 'array') row.append(make('span', 'study-object-index', `/* [${entry.key}] */ `));
          else if (value.type !== 'set') row.append(entry.keyValue ? draw(entry.keyValue) : make('span', 'study-object-key', /^[A-Za-z_$][\w$]*$/.test(entry.key) || /^\d+$/.test(entry.key) ? entry.key : JSON.stringify(entry.key)), make('span', '', value.type === 'map' ? ' => ' : ': '));
          row.append(draw(entry.value), make('span', '', ',')); entries.append(row);
        }
        if (value.remaining) { const more = make('button', 'study-object-more', `\n${'  '.repeat(value.depth + 1)}Show ${value.remaining} more entries`); more.onclick = () => { state.expanded.add(value.path); redraw(); }; entries.append(more); }
        if (value.truncated) entries.append(make('span', 'study-object-omitted', `\n${'  '.repeat(value.depth + 1)}… additional entries omitted from snapshot`));
        block.append(entries);
      } else block.append(make('span', 'study-object-omitted', ' … '));
      block.append(make('span', 'study-object-close', `${value.collapsed ? '' : `\n${'  '.repeat(value.depth)}`}${value.type === 'array' ? ']' : '}'}`)); return block;
    }
    container.classList.add('study-object-view');
    container.dataset.objectViewMode = options.mode || 'code';container.dataset.objectFocused=String(!!state.focus);
    container.style.setProperty('--study-object-font-size',`${state.fontSize}px`);
    if (frame.index !== undefined) container.dataset.objectViewIndex = String(frame.index);
    container.replaceChildren();
    const toolbar=make('div','study-object-toolbar'),fontControls=make('div','study-object-font-controls');
    if(state.focus){const back=make('button','study-object-back','Back to objects');back.type='button';back.onclick=()=>focus(null);toolbar.append(back);}
    const smaller=make('button','study-object-font-smaller','A−'),larger=make('button','study-object-font-larger','A+'),fontLabel=make('output','study-object-font-size',`${state.fontSize}px`);
    smaller.type=larger.type='button';smaller.setAttribute('aria-label','Decrease Object View text size');larger.setAttribute('aria-label','Increase Object View text size');fontLabel.setAttribute('aria-label','Object View text size');
    smaller.disabled=state.fontSize<=14;larger.disabled=state.fontSize>=24;
    const resizeText=amount=>{state.fontSize=Math.max(14,Math.min(24,state.fontSize+amount));preferences.set(container,{fontSize:state.fontSize});redraw();const preferred=container.querySelector(amount<0?'.study-object-font-smaller':'.study-object-font-larger');(preferred.disabled?container.querySelector(amount<0?'.study-object-font-larger':'.study-object-font-smaller'):preferred)?.focus({preventScroll:true});};
    smaller.onclick=()=>resizeText(-2);larger.onclick=()=>resizeText(2);fontControls.append(smaller,fontLabel,larger);toolbar.append(fontControls);container.append(toolbar);
    container.onkeydown=event=>{if(event.key==='Escape'&&state.focus){event.preventDefault();event.stopPropagation();focus(null);}};
    let focusedFound=false;
    for (const call of model.frames) {
      const section = make('section', 'study-object-frame'); section.dataset.stackFrame = section.dataset.frameId = String(call.id);
      if (options.mode !== 'reference'&&!state.focus) section.append(make('h3', '', `${call.name} · call ${call.id} · line ${call.location.line}`));
      for (const scope of call.scopes) {
        const group = make('section', 'study-object-scope'), grid = make('div', 'study-object-card-grid');
        if (options.mode !== 'reference'&&!state.focus) group.append(make('h4', '', scope.name));
        for (const variable of scope.variables) {
          if(state.focus&&(state.focus.frameId!==call.id||state.focus.variableId!==variable.id))continue;
          if(state.focus){focusedFound=true;state.focusedName=variable.name;container.append(make('p','study-object-focus-context',options.mode==='reference'?`${variable.name} · line ${call.location.line}`:`${variable.name} · ${call.name} · ${scope.name} · line ${call.location.line}`));}
          const key=selectionKey(call.id,variable.id),card = make('section', `study-object-root study-object-card${variable.changed ? ' changed' : ''}`);
          card.dataset.variableId = variable.id; card.dataset.frameId = String(call.id); card.style.setProperty('--study-object-accent', variable.color);
          const header=make('header','study-object-card-header'),badge = make('div', 'study-object-variable', `${variable.name} =`), body = make('div', 'study-object-body');
          header.append(badge);
          if(!state.focus){const expand=make('button','study-object-expand','Expand');expand.type='button';expand.setAttribute('aria-label',`Expand ${variable.name}`);expand.onclick=()=>focus({frameId:call.id,variableId:variable.id},variable.name);header.append(expand);}
          body.tabIndex=0;body.setAttribute('role','region');body.setAttribute('aria-label',`${variable.name} value`);body.dataset.objectScrollKey=key;body.dataset.objectScrollMode=state.focus?'focused':'grid';
          body.append(draw(variable.value));card.append(header,body);grid.append(card);
          const scrollMap=state.focus?state.focusScrolls:state.scrolls;
          body.addEventListener('scroll',()=>{if(body.isConnected&&!state.changingFocus&&(body.dataset.objectScrollMode==='focused'||!state.pendingGridRestore.has(key)))scrollMap.set(key,{top:body.scrollTop,left:body.scrollLeft});},{passive:true});
          const takeScrollControl=()=>{if(state.pendingGridRestore.delete(key)){scrollMap.set(key,{top:body.scrollTop,left:body.scrollLeft});restoreGridScroll(container,state);}};
          body.addEventListener('wheel',takeScrollControl,{passive:true});
          body.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)){takeScrollControl();event.stopPropagation();}});
        }
        if(grid.children.length){group.append(grid);section.append(group);}
      }
      if(section.querySelector('.study-object-card'))container.append(section);
    }
    if(state.focus&&!focusedFound){container.append(make('p','study-object-focus-context',state.focusedName||state.focus.variableId));container.append(make('p','study-object-out-of-scope',`${state.focusedName||state.focus.variableId} is out of scope at this recorded state. Use Back to objects or review an earlier state.`));}
    if (model.truncated) container.append(make('p', 'study-object-omitted', 'Some values were omitted from this snapshot.'));
    for(const body of container.querySelectorAll('[data-object-scroll-key]')){const saved=(state.focus?state.focusScrolls:state.scrolls).get(body.dataset.objectScrollKey);if(saved){body.scrollTop=saved.top;body.scrollLeft=saved.left;}}
    restoreGridScroll(container,state);
    if(!state.focus&&state.pendingGridRestore.size){state.restoreObserver=new ResizeObserver(()=>{state.restoreTicks=0;restoreGridScroll(container,state);});for(const body of container.querySelectorAll('[data-object-scroll-mode="grid"]'))state.restoreObserver.observe(body);}
    const activeRoot=activeKey?[...container.querySelectorAll('.study-object-card')].find(card=>selectionKey(Number(card.dataset.frameId),card.dataset.variableId)===activeKey):null;
    const restored=activePath?[...activeRoot?.querySelectorAll('[data-object-path]')||[]].find(value=>value.dataset.objectPath===activePath)?.querySelector('.study-object-toggle'):activeReference?[...activeRoot?.querySelectorAll('[data-object-reference-path]')||[]].find(value=>value.dataset.objectReferencePath===activeReference):activeBody?activeRoot?.querySelector('.study-object-body'):null;
    restored?.focus({preventScroll:true});
    return model;
  }
  globalThis.StudyObjectView = { capture, format, render, special, reset };
})();
