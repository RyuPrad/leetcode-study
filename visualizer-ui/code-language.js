/* Reference code in the learner's coding language. The JavaScript reference still drives every
   step; each highlight on its lines is mirrored onto the matching line of the chosen solution
   (visualizer-ui/code-maps.json, generated into code-languages.js). */
(() => {
  const LABELS = { javascript: 'JavaScript', typescript: 'TypeScript', java: 'Java', c: 'C' };
  // Classes the visualizer, the walkthrough and the guided lesson put on reference lines.
  const MIRRORED = ['active', 'operation-code', 'guided-code-focus'];
  const KEYWORDS = {
    typescript: 'const let var function return if else for while do break continue new class constructor this of in typeof instanceof interface type extends implements number string boolean void null undefined true false public private readonly static',
    java: 'class public private protected static final void int long double float boolean char byte short new return if else for while do break continue this null true false extends implements interface var',
    c: 'int long double float char bool void struct typedef static const unsigned return if else for while do break continue sizeof NULL true false'
  };
  const params = new URLSearchParams(location.search), embedded = parent !== window;
  const requested = params.get('parentOrigin'), parentOrigin = /^http:\/\/127\.0\.0\.1:\d+$/.test(requested || '') ? requested : 'study://app';
  // The element holding the reference lines; on some pages the panel itself is the code panel.
  const panel = document.querySelector('.study-code'), original = panel?.querySelector('.code-line,.cl')?.parentElement;
  const data = window.studyCodeLanguages?.[window.studyLessonSource?.spec?.number];
  if (!panel || !original || !data) return;
  const make = (tag, cls, text) => { const e = document.createElement(tag); e.className = cls || ''; if (text !== undefined) e.textContent = text; return e; };
  const rows = new Map();
  for (const el of original.querySelectorAll('.code-line,.cl')) { const m = el.id.match(/^(?:line-|l)(\d+)$/); if (m) rows.set(Number(m[1]), el); }

  // Comments, numbers, keywords and calls, using the page's own syntax colours.
  function paint(row, text, words, state) {
    let rest = text;
    const push = (cls, value) => { if (!value) return; if (cls) row.append(make('span', cls, value)); else row.append(value); };
    while (rest) {
      if (state.block) { const end = rest.indexOf('*/'); const cut = end < 0 ? rest.length : end + 2; push('cm', rest.slice(0, cut)); rest = rest.slice(cut); if (end >= 0) state.block = false; continue; }
      const m = rest.match(/\/\/.*|\/\*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b/);
      if (!m) { push('', rest); break; }
      push('', rest.slice(0, m.index));
      const token = m[0];
      if (token === '/*') state.block = true;
      else push(token.startsWith('//') ? 'cm' : /^\d/.test(token) ? 'nm' : /^["'`]/.test(token) ? '' : words.has(token) ? 'kw' : /^\s*\(/.test(rest.slice(m.index + token.length)) ? 'fn' : '', token);
      rest = rest.slice(m.index + (token === '/*' ? 0 : token.length));
    }
  }

  const bar = make('label', 'study-code-language'), select = make('select');
  select.setAttribute('aria-label', 'Reference code language');
  for (const [value, label] of Object.entries(LABELS)) { const o = make('option', '', label); o.value = value; select.append(o); }
  bar.append(make('span', '', 'Language'), select);
  const mirror = make('div', 'study-code-mirror');
  mirror.setAttribute('role', 'region');
  original.classList.add('study-code-original');
  original.before(bar);
  original.after(mirror);
  const built = {};
  let language = 'javascript', lines = [], lastActive = null;

  function build(target) {
    if (built[target]) return built[target];
    const words = new Set(KEYWORDS[target].split(' ')), state = { block: false };
    return built[target] = data[target].lines.map((text, i) => {
      const row = make('div', 'study-mirror-line');
      row.dataset.line = String(i + 1);
      // Blank lines stay empty, as on the original panel; a wrapped line continues four
      // columns past its own indentation.
      if (text.trim()) { paint(row, text, words, state); row.style.setProperty('--hang', `${text.match(/^ */)[0].length + 4}ch`); }
      return row;
    });
  }
  // Keeps the highlighted line visible below the language bar inside the scrolling code panel.
  function reveal(row) {
    const r = row.getBoundingClientRect(), p = panel.getBoundingClientRect(), top = Math.max(p.top, bar.getBoundingClientRect().bottom);
    if (r.top < top || r.bottom > p.bottom) panel.scrollTop += r.top - top - (p.bottom - top) / 3;
  }
  function sync() {
    if (language === 'javascript') return;
    const map = data[language].map;
    for (const cls of MIRRORED) {
      const targets = new Set();
      for (const [n, el] of rows) if (el.classList.contains(cls) && map[n]) targets.add(map[n]);
      lines.forEach((row, i) => row.classList.toggle(cls, targets.has(i + 1)));
    }
    // The highlight the learner sees: the walkthrough's line replaces the current line while
    // the walkthrough is on, and the guided lesson's focus counts too.
    const shown = document.body.classList.contains('walkthrough-enabled') ? 'operation-code' : 'active';
    const active = mirror.querySelector(`.study-mirror-line.${shown},.study-mirror-line.guided-code-focus`);
    if (active && active !== lastActive) reveal(active);
    lastActive = active;
  }
  function set(value, notify = false) {
    if (!LABELS[value] || value === language) return;
    language = value; select.value = value;
    panel.classList.toggle('study-code-translated', value !== 'javascript');
    if (value !== 'javascript') { lines = build(value); mirror.replaceChildren(...lines); mirror.setAttribute('aria-label', `${LABELS[value]} reference code`); lastActive = null; sync(); }
    if (notify) { if (embedded) parent.postMessage({ type: 'study:code-language', language: value }, parentOrigin); else try { localStorage.setItem('study.codeLanguage', value); } catch {} }
    window.dispatchEvent(new Event('study:code-language'));
  }
  // The mapped lines of the chosen language, in order; empty for JavaScript or unmapped lines.
  function mapped(jsLines) {
    if (language === 'javascript') return [];
    const map = data[language].map;
    return [...new Set(jsLines.map(n => map[n]).filter(Boolean))].sort((a, b) => a - b);
  }
  const text = n => data[language].lines[n - 1].trim();
  const squash = value => value.replace(/\s+/g, ' ').trim();

  window.studyCodeLanguage = {
    get language() { return language; },
    set: value => set(value, true),
    lines: mapped,
    // The walkthrough's code for these reference lines, shown in the chosen language.
    expression(jsLines, code) { const targets = mapped(jsLines); return targets.length ? targets.map(text).join(' ') : code; },
    // Guided "Explain the code": swaps the quoted reference lines for the chosen language's.
    basics(cp) {
      const targets = mapped(cp.codeLines);
      if (!targets.length) return null;
      const head = cp.basics.match(/^(?:Reference line|Line)s? [\d, ]+: /);
      if (!head) return null;
      const quoted = squash(cp.codeLines.map(n => rows.get(n)?.textContent ?? '').join(' '));
      let rest = cp.basics.slice(head[0].length);
      const pattern = new RegExp('^\\s*' + quoted.split(' ').map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s*'));
      const match = rest.match(pattern);
      if (!quoted || !match) return null;
      rest = rest.slice(match[0].length).trim();
      const label = `${LABELS[language]} ${targets.length === 1 ? 'line' : 'lines'} ${targets.join(', ')}`;
      return { text: `${label}: ${targets.map(text).join(' ')} ${rest}`, label };
    }
  };

  select.addEventListener('change', () => set(select.value, true));
  new MutationObserver(sync).observe(original, { attributes: true, attributeFilter: ['class'], subtree: true });
  window.addEventListener('message', event => {
    if (embedded && event.source === parent && event.origin === parentOrigin && event.data?.type === 'study:code-language') set(event.data.language);
  });
  if (embedded) parent.postMessage({ type: 'study:code-language-ready' }, parentOrigin);
  else { let saved = params.get('codeLanguage'); try { saved ||= localStorage.getItem('study.codeLanguage'); } catch {} if (saved) set(saved); }
})();
