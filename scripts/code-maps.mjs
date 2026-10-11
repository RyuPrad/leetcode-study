// Line maps from each visualizer's JavaScript reference to the TypeScript, Java and C
// solutions in coding/solutions. The Visualizer and Learn tabs use them to highlight the
// matching line when a learner reads another language. `visualizer-ui/code-maps.json` is
// the reviewed, maintained map; this module derives candidates and checks the reviewed map.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, collectCatalog } from './content.mjs';

export const LANGUAGES = { typescript: 'ts', java: 'java', c: 'c' };
const decode = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');

/** The visualizer's code panel, as {lineNumber: text}. */
export function visualizerLines(html) {
  const lines = {};
  for (const m of html.matchAll(/<div\s+id="(?:line-|l)(\d+)"[^>]*class="(?:[^"]*\bcode-line\b[^"]*|cl)"[^>]*>([\s\S]*?)<\/div>/g)) lines[Number(m[1])] = decode(m[2]);
  return lines;
}

// Tokens that identify a statement across languages; types and declaration words are ignored.
const NOISE = new Set(['const', 'let', 'var', 'int', 'long', 'double', 'bool', 'boolean', 'char', 'void', 'string', 'String', 'struct', 'static', 'public', 'private', 'final',
  'new', 'number', 'Integer', 'List', 'ArrayList', 'Map', 'HashMap', 'Set', 'HashSet', 'Deque', 'ArrayDeque', 'function', 'malloc', 'sizeof', 'free', 'calloc', 'this', 'obj', 'unsigned', 'uint32_t', 'NULL', 'null', 'size', 'length']);
const KEYWORDS = new Set(['if', 'else', 'for', 'while', 'return', 'break', 'continue', 'do', 'switch', 'case']);
// The same operation under each language's name.
const SYNONYMS = { MaxHeap: 'Heap', MinHeap: 'Heap', PriorityQueue: 'Heap', offer: 'push', add: 'push', addLast: 'push', append: 'push', poll: 'pop', pollFirst: 'shift', pollLast: 'pop',
  shift: 'shift', isEmpty: 'empty', containsKey: 'has', contains: 'has', HASH_FIND_INT: 'has', HASH_FIND_STR: 'has', put: 'set', HASH_ADD_INT: 'set', HASH_ADD_KEYPTR: 'set',
  getOrDefault: 'get', charAt: 'at', substring: 'slice', equals: '==', strcmp: '==', Math: '', floor: '', abs: 'abs', fabs: 'abs', llabs: 'abs', max: 'max', fmax: 'max', min: 'min', fmin: 'min',
  true: 'true', false: 'false', NULL: 'null', null: 'null', undefined: 'null', None: 'null' };
const isComment = text => /^\s*(\/\/|\/\*|\*)/.test(text);
export function tokens(text) {
  if (isComment(text)) return [];
  const words = (text.replace(/\/\/.*$/, '').match(/[A-Za-z_$][\w$]*|\d+|===|!==|==|!=|<=|>=|\+\+|--|[-+*/%<>]=?|&&|\|\||\^|=/g) ?? [])
    .map(t => t === '===' ? '==' : t === '!==' ? '!=' : t).map(t => t in SYNONYMS ? SYNONYMS[t] : t).filter(t => t && !NOISE.has(t));
  return words;
}
export function similarity(a, b) {
  const ta = tokens(a), tb = tokens(b);
  if (!ta.length || !tb.length) return 0;
  const count = list => list.reduce((m, t) => m.set(t, (m.get(t) ?? 0) + 1), new Map());
  const ca = count(ta), cb = count(tb);
  let shared = 0, total = 0;
  for (const t of new Set([...ca.keys(), ...cb.keys()])) {
    const weight = KEYWORDS.has(t) ? 2 : /^[A-Za-z_$]/.test(t) ? 1.5 : 0.5;
    shared += weight * Math.min(ca.get(t) ?? 0, cb.get(t) ?? 0);
    total += weight * Math.max(ca.get(t) ?? 0, cb.get(t) ?? 0);
  }
  return shared / total;
}
const meaningful = text => tokens(text).length > 0;

// ---- Functions --------------------------------------------------------------------------
const CONTROL = new Set(['if', 'for', 'while', 'switch', 'catch', 'return', 'else', 'do', 'sizeof', 'new']);
/** The function a header line opens, or null. */
export function functionName(text) {
  const t = text.replace(/\/\/.*$/, '').trim();
  let m = t.match(/^(?:export\s+)?(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(/)
    ?? t.match(/^(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function\b|\([^)]*\)\s*(?::[^=]*)?=>|[A-Za-z_$][\w$]*\s*=>)/)
    ?? t.match(/^(?:(?:public|private|protected|static|final|abstract|synchronized|override|async)\s+)*(?:[\w$<>\[\],.?*\s]+?\s+\**)?([A-Za-z_$][\w$]*)\s*\([^;]*\)\s*(?::\s*[^{=]+)?(?:throws\s+[\w.,\s]+)?\{\s*$/);
  if (!m) m = t.match(/^(?:(?:public|private|protected|static)\s+)*([A-Za-z_$][\w$]*)\s*\([^;]*\)\s*(?::\s*[^{]+)?\{/);
  return m && !CONTROL.has(m[1]) ? m[1] : null;
}
const braces = text => {
  const code = text.replace(/\/\/.*$/, '').replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, '""');
  return [...code].reduce((d, ch) => d + (ch === '{' ? 1 : ch === '}' ? -1 : 0), 0);
};
/** Assigns each line to its innermost enclosing function: [{name, lines}], in source order. */
export function functionBlocks(lineAt, numbers) {
  const blocks = [], stack = [{ name: '(top)', depth: 0, lines: [] }];
  blocks.push(stack[0]);
  let depth = 0;
  for (const n of numbers) {
    const text = lineAt(n), name = functionName(text);
    if (name) { const block = { name, depth, lines: [] }; blocks.push(block); stack.push(block); }
    stack[stack.length - 1].lines.push(n);
    depth += braces(text);
    while (stack.length > 1 && depth <= stack[stack.length - 1].depth) stack.pop();
  }
  return blocks;
}
// C design functions put the class before the method (lRUCacheGet); Create is the constructor.
const canonical = name => {
  const c = name.replace(/^[a-z][A-Za-z0-9]*?(Create|Free|[A-Z][a-z0-9]+[A-Za-z0-9]*)$/, (whole, method) => method);
  const base = (c === name ? name : c).replace(/^_+/, '');
  return /^(create|constructor)$/i.test(base) ? 'constructor' : base.charAt(0).toLowerCase() + base.slice(1);
};

/** Monotone alignment of two line lists, maximizing total similarity. */
function alignInOrder(js, jsLines, target, tLines) {
  const n = jsLines.length, m = tLines.length, map = {};
  const score = Array.from({ length: n + 1 }, () => new Float64Array(m + 1)), move = Array.from({ length: n + 1 }, () => new Int8Array(m + 1));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const s = similarity(js[jsLines[i - 1]], target[tLines[j - 1] - 1]);
    const options = [score[i - 1][j], score[i][j - 1], s > 0.12 ? score[i - 1][j - 1] + s : -1];
    const best = Math.max(...options); score[i][j] = best; move[i][j] = options.indexOf(best);
  }
  for (let i = n, j = m; i > 0 && j > 0;) {
    if (move[i][j] === 2) { map[jsLines[i - 1]] = tLines[j - 1]; i--; j--; } else if (move[i][j] === 0) i--; else j--;
  }
  return map;
}

/**
 * Maps each required JavaScript line to a target line. Functions are paired by name (JavaScript
 * nests helpers; Java and C declare them separately), and lines are aligned in order within each
 * pair. A line still unmapped takes its most similar line inside its paired function, then anywhere.
 */
export function align(js, target, required) {
  const jsNums = Object.keys(js).map(Number).sort((a, b) => a - b);
  const tNums = target.map((_, i) => i + 1);
  const jsBlocks = functionBlocks(n => js[n], jsNums), tBlocks = functionBlocks(n => target[n - 1], tNums);
  const useful = list => list.filter(n => required.includes(n));
  const map = {}, pairOf = new Map();
  const used = new Set();
  const firstFunction = jsBlocks.find(b => b.name !== '(top)');
  const fields = (tBlocks.find(t => t.name === '(top)')?.lines ?? []).filter(n => meaningful(target[n - 1]) && !/^\s*(class|typedef|struct|#|import|public class|\}|\/\*|\*)/.test(target[n - 1]));
  for (const block of jsBlocks) {
    let partner = tBlocks.find(t => !used.has(t) && canonical(t.name) === canonical(block.name));
    // The entry function may be wrapped in a class (Java's Solution) or renamed (top-level code).
    if (!partner && block.name === '(top)') partner = tBlocks.find(t => t.name === '(top)');
    if (!partner) continue;
    used.add(partner); pairOf.set(block, partner);
    let pool = partner.lines.filter(n => meaningful(target[n - 1]));
    // State JavaScript declares at the start of the entry function or constructor is a field or
    // global in Java and C; align those declarations as if they followed the header.
    if ((block === firstFunction || canonical(block.name) === 'constructor') && partner.name !== '(top)') pool = [pool[0], ...fields, ...pool.slice(1)];
    Object.assign(map, alignInOrder(js, useful(block.lines), target, pool));
  }
  for (const line of required) {
    if (map[line]) continue;
    const block = jsBlocks.find(b => b.lines.includes(line)), partner = pairOf.get(block);
    const pool = (partner ? partner.lines : tNums).filter(n => meaningful(target[n - 1]));
    let best = 0, bestScore = 0;
    for (const t of pool) { const s = similarity(js[line], target[t - 1]); if (s > bestScore) { bestScore = s; best = t; } }
    if (!best && partner) best = partner.lines.find(n => meaningful(target[n - 1])) ?? 0;
    if (best) map[line] = best;
  }
  return map;
}

/** Everything the maps need: each visualizer's JS lines, the lines that can be highlighted, and the solutions. */
export function sources(root = ROOT) {
  const catalog = collectCatalog(root);
  return catalog.entries.filter(e => e.visualizerPath).map(entry => {
    const js = visualizerLines(fs.readFileSync(path.join(root, entry.visualizerPath), 'utf8'));
    // Every line a visualizer, walkthrough or guided lesson can point at; braces alone carry no statement.
    const required = Object.keys(js).map(Number).filter(l => meaningful(js[l])).sort((a, b) => a - b);
    const solutions = Object.fromEntries(Object.entries(LANGUAGES).map(([language, ext]) =>
      [language, fs.readFileSync(path.join(root, 'coding/solutions', language, `${entry.number}.${ext}`), 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n')]));
    return { id: entry.id, number: entry.number, visualizerPath: entry.visualizerPath, js, required, solutions };
  });
}

// Below this similarity a mapping must be listed in `reviewed`: a person checked it by hand.
export const LOW_SIMILARITY = 0.3;
export function checkMaps(maps, list = sources()) {
  const problems = [];
  for (const s of list) {
    const entry = maps[s.number];
    if (!s.required.length) { problems.push(`${s.number}: no reference lines found in ${s.visualizerPath}`); continue; }
    if (!entry) { problems.push(`${s.number}: no map`); continue; }
    for (const language of Object.keys(LANGUAGES)) {
      const map = entry[language] ?? {}, target = s.solutions[language];
      for (const line of s.required) {
        const to = map[line];
        // 0 records a line with no counterpart in this language (no highlight for that step).
        if (to === 0 && entry.reviewed?.[language]?.includes(line)) continue;
        if (!Number.isInteger(to) || to < 1 || to > target.length || !target[to - 1].trim()) { problems.push(`${s.number} ${language}: line ${line} "${s.js[line].trim()}" has no target`); continue; }
        const reviewed = entry.reviewed?.[language]?.includes(line);
        if (reviewed) continue;
        const own = similarity(s.js[line], target[to - 1]);
        // Trusted without review: similar, and no other highlighted line matches this target better.
        const rival = s.required.find(other => other !== line && similarity(s.js[other], target[to - 1]) > own + 0.001);
        if (own < LOW_SIMILARITY) problems.push(`${s.number} ${language}: line ${line} "${s.js[line].trim()}" -> ${to} "${target[to - 1].trim()}" is unreviewed and dissimilar`);
        else if (rival) problems.push(`${s.number} ${language}: line ${line} "${s.js[line].trim()}" -> ${to} "${target[to - 1].trim()}" is unreviewed; line ${rival} "${s.js[rival].trim()}" matches it better`);
      }
    }
  }
  return problems;
}

/** Writes visualizer-ui/code-languages.js: each language's solution lines and line map, for code-language.js. */
export function buildCodeLanguages(root = ROOT) {
  const maps = JSON.parse(fs.readFileSync(path.join(root, 'visualizer-ui/code-maps.json'), 'utf8'));
  const list = sources(root), problems = checkMaps(maps, list);
  if (problems.length) throw new Error(`Code maps need review (node scripts/code-maps.mjs):\n${problems.join('\n')}`);
  const data = Object.fromEntries(list.map(s => [s.number, Object.fromEntries(Object.keys(LANGUAGES).map(language =>
    [language, { lines: s.solutions[language], map: Object.fromEntries(Object.entries(maps[s.number][language]).filter(([line, to]) => to > 0 && s.required.includes(Number(line)))) }]))]));
  fs.writeFileSync(path.join(root, 'visualizer-ui/code-languages.js'), `/* Generated from coding/solutions and visualizer-ui/code-maps.json. */\nwindow.studyCodeLanguages=${JSON.stringify(data)};\n`);
  return list.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))) {
  const file = path.join(ROOT, 'visualizer-ui/code-maps.json');
  if (process.argv.includes('--author')) {
    // Derive candidates; existing reviewed entries are kept as they are.
    const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    // --refresh=105:java,125:c re-derives those maps (after a solution changes) and clears their review.
    const refresh = (process.argv.find(a => a.startsWith('--refresh='))?.slice(10).split(',') ?? []).map(x => x.split(':'));
    const derive = (s, language) => Object.fromEntries(Object.entries(align(s.js, s.solutions[language], s.required)).filter(([line]) => s.required.includes(Number(line))));
    const out = {};
    for (const s of sources()) {
      out[s.number] = existing[s.number] ?? Object.fromEntries(Object.keys(LANGUAGES).map(language => [language, derive(s, language)]));
      for (const [number, language] of refresh) if (Number(number) === s.number) { out[s.number][language] = derive(s, language); if (out[s.number].reviewed) delete out[s.number].reviewed[language]; }
    }
    fs.writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
    console.log(`Wrote ${Object.keys(out).length} maps.`);
  }
  const problems = checkMaps(JSON.parse(fs.readFileSync(file, 'utf8')));
  for (const p of problems) console.log(p);
  if (!problems.length && process.argv.includes('--build')) buildCodeLanguages();
  console.log(problems.length ? `${problems.length} code map lines need review.` : 'Code maps are complete for every visualizer and language.');
  process.exitCode = problems.length ? 1 : 0;
}
