import type { Language } from '../../shared/coding';

/** One displayed line. Only `text` is typed: the indentation is automatic and a trailing comment is shown dimmed. */
export interface TypingLine { indent: number; text: string; comment: string; skip: boolean; }
/** A function or method (a few short members merge into one), dedented, or a whole solution. */
export interface Snippet { label: string; source: string; }

const CODE = 0, STRING = 1, COMMENT = 2;
const REGEX_WORDS = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await']);
const NOT_NAMES = new Set(['if', 'for', 'while', 'switch', 'return', 'function', 'catch', 'sizeof', 'new', 'typeof', 'constructor']);

/** LF line endings, tabs as four-column stops, no trailing whitespace or surrounding blank lines. */
export function normalize(text: string): string {
  return text.replace(/\r\n?/g, '\n').split('\n').map(line => {
    let out = '';
    for (const char of line) out += char === '\t' ? ' '.repeat(4 - out.length % 4) : char;
    return out.trimEnd();
  }).join('\n').replace(/^\n+|\n+$/g, '');
}

/** Classifies each character as code, string (also template text and regex literals) or comment. */
export function lex(source: string, language: Language): Uint8Array {
  const kinds = new Uint8Array(source.length), js = language === 'javascript' || language === 'typescript';
  const templates: number[] = []; // brace depth inside each open `${ … }`
  let i = 0, previous = '', word = '';
  const quoted = (start: number, quote: string) => {
    let j = start + 1;
    while (j < source.length && source[j] !== quote && source[j] !== '\n') j += source[j] === '\\' ? 2 : 1;
    const end = Math.min(source.length, source[j] === quote ? j + 1 : j);
    kinds.fill(STRING, start, end); return end;
  };
  // Template text up to the closing backtick or the next `${`, which opens an expression.
  const template = (start: number) => {
    let j = start;
    while (j < source.length && source[j] !== '`' && !(source[j] === '$' && source[j + 1] === '{')) j += source[j] === '\\' ? 2 : 1;
    if (source[j] === '$') { kinds.fill(STRING, start, j + 2); templates.push(0); return j + 2; }
    const end = Math.min(source.length, j + 1); kinds.fill(STRING, start, end); return end;
  };
  const regex = (start: number) => {
    let j = start + 1, inClass = false;
    for (; j < source.length && source[j] !== '\n'; j++) {
      if (source[j] === '\\') { j++; continue; }
      if (source[j] === '[') inClass = true; else if (source[j] === ']') inClass = false;
      else if (source[j] === '/' && !inClass) break;
    }
    if (source[j] !== '/') return -1;
    j++; while (/[a-z]/i.test(source[j] ?? '')) j++;
    kinds.fill(STRING, start, j); return j;
  };
  while (i < source.length) {
    const char = source[i], next = source[i + 1];
    if (char === '/' && next === '/') { const end = source.indexOf('\n', i); const stop = end < 0 ? source.length : end; kinds.fill(COMMENT, i, stop); i = stop; continue; }
    if (char === '/' && next === '*') { const end = source.indexOf('*/', i + 2); const stop = end < 0 ? source.length : end + 2; kinds.fill(COMMENT, i, stop); i = stop; continue; }
    if (char === '"' || char === "'") { i = quoted(i, char); previous = '"'; word = ''; continue; }
    if (js && char === '`') { kinds[i] = STRING; i = template(i + 1); previous = '"'; word = ''; continue; }
    if (js && char === '/' && (!previous || '(,=:[!&|?{};+-*%<>~^'.includes(previous) || REGEX_WORDS.has(word))) {
      const end = regex(i); if (end > 0) { i = end; previous = '"'; word = ''; continue; }
    }
    if (js && templates.length) {
      if (char === '{') templates[templates.length - 1]++;
      else if (char === '}') {
        if (templates[templates.length - 1] === 0) { templates.pop(); kinds[i] = STRING; i = template(i + 1); previous = '"'; word = ''; continue; }
        templates[templates.length - 1]--;
      }
    }
    if (/[A-Za-z0-9_$]/.test(char)) { let j = i; while (j < source.length && /[A-Za-z0-9_$]/.test(source[j])) j++; word = source.slice(i, j); previous = 'a'; i = j; continue; }
    if (char !== ' ' && char !== '\n') { previous = char; word = ''; }
    i++;
  }
  return kinds;
}

/** Lines of a normalized source. Blank and comment-only lines are skipped; a trailing comment is not typed. */
export function toLines(source: string, language: Language): TypingLine[] {
  const kinds = lex(source, language);
  let offset = 0;
  return source.split('\n').map(raw => {
    const indent = raw.length - raw.trimStart().length;
    let cut = raw.length;
    for (let j = raw.length - 1; j >= indent; j--) {
      if (raw[j] === ' ') continue;
      if (kinds[offset + j] === COMMENT) cut = j; else break;
    }
    const text = raw.slice(indent, cut).trimEnd(), comment = raw.slice(indent + text.length);
    offset += raw.length + 1;
    return { indent, text, comment: text ? comment : comment.trimStart(), skip: !text };
  });
}

interface Item { start: number; end: number; lines: number; name: string; fn: boolean; }
/** Splits a solution into functions and methods. Members of a class (other than LeetCode's `Solution` wrapper) are labelled `Class.method`. */
export function units(text: string, language: Language): Snippet[] {
  const source = normalize(text), raw = source.split('\n'), lines = toLines(source, language), kinds = lex(source, language);
  const code: string[] = []; // each line's code with strings and comments blanked, for brace counting
  let offset = 0;
  for (const line of raw) { let out = ''; for (let j = 0; j < line.length; j++) out += kinds[offset + j] === CODE ? line[j] : ' '; code.push(out); offset += line.length + 1; }
  const header = (start: number, end: number) => { let out = ''; for (let i = start; i <= end && !out.includes('{'); i++) out += ` ${code[i].trim()}`; return out.split('{')[0].trim(); };
  const name = (head: string) => {
    const declared = head.match(/function\s*\*?\s*([A-Za-z_$][\w$]*)\s*[<(]/) ?? head.match(/([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*(?::[^=]+)?=>|[A-Za-z_$][\w$]*\s*=>)/);
    if (declared) return declared[1];
    const call = [...head.matchAll(/([A-Za-z_$][\w$]*)\s*(?:<[\w\s,.?<>[\]]*>)?\s*\(/g)].map(m => m[1]).find(n => !NOT_NAMES.has(n));
    return call ?? (/^constructor\b/.test(head) ? 'constructor' : '');
  };
  // A block without a function: a typedef, struct, class or initialized array.
  const data = (head: string, last: string) => last.match(/^\s*\}\s*([A-Za-z_]\w*)\s*;/)?.[1] ?? head.match(/\b(?:struct|enum|union|class|interface|type)\s+([A-Za-z_$][\w$]*)/)?.[1] ?? head.match(/^(?:(?:public|private|protected|readonly|static)\s+)*([A-Za-z_$][\w$]*)\s*\??:/)?.[1] ?? head.match(/([A-Za-z_$][\w$]*)\s*(?:\[[^\]]*\])*\s*=\s*$/)?.[1] ?? head.replace(/\s+/g, ' ').slice(0, 40);
  // Consecutive statements or blocks whose braces balance, from line `from` up to (not including) `to`.
  const items = (from: number, to: number): Item[] => {
    const found: Item[] = [];
    let start = -1, depth = 0, braces = false, count = 0;
    const close = (end: number) => { const head = header(start, end), fn = braces ? name(head) : ''; found.push({ start, end, lines: count, name: fn || (braces ? data(head, code[end]) : ''), fn: !!fn }); start = -1; };
    for (let i = from; i < to; i++) {
      if (lines[i].skip) continue;
      if (start < 0) { start = i; depth = 0; braces = false; count = 0; }
      count++;
      for (const char of code[i]) { if (char === '{') { depth++; braces = true; } else if (char === '}') depth--; }
      const trimmed = code[i].trim();
      if (depth <= 0 && (braces || trimmed.endsWith(';') || trimmed.startsWith('#'))) close(i);
    }
    if (start >= 0) close(to - 1);
    return found;
  };
  // Top-level declarations form one group; each class (other than a lone wrapper) contributes its members.
  const groups: { items: Item[]; owner: string; top: boolean }[] = [];
  for (const item of items(0, raw.length)) {
    const cls = code[item.start].match(/^\s*(?:export\s+)?(?:(?:public|private|protected|abstract|final|static|default)\s+)*class\s+([A-Za-z_$][\w$]*)/);
    const opens = code[item.start].trim().endsWith('{'), closes = /^\}\s*;?$/.test(code[item.end].trim());
    const members = cls && opens && closes ? items(item.start + 1, item.end) : [];
    if (members.length) groups.push({ items: members, owner: cls![1] === 'Solution' ? '' : cls![1], top: false });
    else if (groups.at(-1)?.top) groups.at(-1)!.items.push(item);
    else groups.push({ items: [item], owner: '', top: true });
  }
  // Short members (fields, one-line methods, a struct) join the next function so every snippet is worth typing.
  const MIN = 4, snippets: Snippet[] = [];
  for (const { items: list, owner } of groups) {
    const merged: Item[][] = [];
    let pending: Item[] = [];
    for (const item of list) {
      pending.push(item);
      if (pending.reduce((sum, p) => sum + p.lines, 0) >= MIN) { merged.push(pending); pending = []; }
    }
    if (pending.length) { if (merged.length) merged[merged.length - 1].push(...pending); else merged.push(pending); }
    for (const group of merged) {
      const start = group[0].start, end = group[group.length - 1].end;
      const fns = group.filter(g => g.fn).map(g => g.name), names = fns.length ? fns : group.map(g => g.name).filter(Boolean);
      const shown = (names.length > 3 ? [...names.slice(0, 3), '…'] : names).join(', ');
      const body = raw.slice(start, end + 1), indent = Math.min(...body.filter(l => l.trim()).map(l => l.length - l.trimStart().length));
      snippets.push({ label: owner ? fns.length ? `${owner}.${shown}` : owner : shown || 'declarations', source: body.map(l => l.slice(indent)).join('\n') });
    }
  }
  return snippets;
}

/** The full solution, normalized, for Whole solution mode. */
export function wholeSolution(text: string): Snippet { return { label: 'Whole solution', source: normalize(text) }; }
