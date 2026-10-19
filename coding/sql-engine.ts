// SQL problems run in SQLite (sql.js, WebAssembly) on a fresh in-memory database per case. LeetCode's
// problems are written for MySQL, so common MySQL functions are added, MySQL-only syntax is rewritten
// (rewriteMysql), text columns compare without case as MySQL's default collation does, and results
// compare as tables of values. No network, file system or host code is reachable.
import type { SqlJsStatic, Database } from 'sql.js';
import type { Json } from '../shared/coding';

/** A table's columns in order, each [name, type]; types are SQL type names such as INT or VARCHAR. */
export type SqlSchema = Record<string, [string, string][]>;
/** One case: every table's rows, in column order. */
export type SqlTables = Record<string, Json[][]>;
export interface SqlResult { columns: string[]; rows: Json[][]; }

const pad = (n: number, width = 2) => String(n).padStart(width, '0');
/** A DATE ('2020-01-31'), DATETIME ('2020-01-31 10:00:00') or TIME ('10:00:00') value as a UTC Date, or null. */
const date = (value: unknown) => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim(), d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00Z` : /^\d{1,2}:\d{2}(:\d{2})?$/.test(text) ? `1970-01-01T${text.padStart(8, '0')}Z` : text.replace(' ', 'T') + (/Z|[+-]\d{2}:?\d{2}$/.test(text) ? '' : 'Z'));
  return Number.isNaN(d.getTime()) ? null : d;
};
const day = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const clock = (d: Date) => `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const UNITS = 'MICROSECOND|SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|QUARTER|YEAR';
function shift(value: unknown, spec: unknown, sign: number) {
  const d = date(value), match = new RegExp(`^\\s*(-?\\d+)\\s+(${UNITS})S?\\s*$`, 'i').exec(String(spec));
  if (!d || !match) return null;
  const n = Number(match[1]) * sign, unit = match[2].toUpperCase();
  if (unit === 'DAY' || unit === 'WEEK') d.setUTCDate(d.getUTCDate() + (unit === 'WEEK' ? 7 * n : n));
  else if (unit === 'MONTH' || unit === 'QUARTER' || unit === 'YEAR') {
    // MySQL keeps the day of the month, moved back to the month's last day when it is too large.
    const months = d.getUTCMonth() + n * (unit === 'YEAR' ? 12 : unit === 'QUARTER' ? 3 : 1), target = new Date(Date.UTC(d.getUTCFullYear(), months, 1));
    d.setUTCFullYear(target.getUTCFullYear(), target.getUTCMonth(), Math.min(d.getUTCDate(), new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()));
  } else d.setTime(d.getTime() + n * ({ HOUR: 3600000, MINUTE: 60000, SECOND: 1000, MICROSECOND: 0.001 } as Record<string, number>)[unit]);
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value).trim()) && !['HOUR', 'MINUTE', 'SECOND', 'MICROSECOND'].includes(unit) ? day(d) : `${day(d)} ${clock(d)}`;
}
function format(value: unknown, pattern: unknown) {
  const d = date(value); if (!d) return null;
  const hour12 = d.getUTCHours() % 12 || 12, yday = Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000) + 1;
  return String(pattern).replace(/%([a-zA-Z%])/g, (_, f: string) => ({ Y: String(d.getUTCFullYear()), y: pad(d.getUTCFullYear() % 100), m: pad(d.getUTCMonth() + 1), c: String(d.getUTCMonth() + 1), d: pad(d.getUTCDate()), e: String(d.getUTCDate()),
    H: pad(d.getUTCHours()), k: String(d.getUTCHours()), h: pad(hour12), I: pad(hour12), l: String(hour12), i: pad(d.getUTCMinutes()), s: pad(d.getUTCSeconds()), S: pad(d.getUTCSeconds()), p: d.getUTCHours() < 12 ? 'AM' : 'PM',
    M: MONTHS[d.getUTCMonth()], b: MONTHS[d.getUTCMonth()].slice(0, 3), W: DAYS[d.getUTCDay()], a: DAYS[d.getUTCDay()].slice(0, 3), j: pad(yday, 3), w: String(d.getUTCDay()), T: clock(d), '%': '%' } as Record<string, string>)[f] ?? f);
}
/** MySQL's STR_TO_DATE for the common numeric and month-name formats. */
function parseDate(text: unknown, pattern: unknown) {
  if (text === null || pattern === null) return null;
  const parts: Record<string, number> = { Y: 1970, m: 1, d: 1, H: 0, i: 0, s: 0 }, names: string[] = [];
  // Like MySQL, spaces in the text are not required to line up with the format exactly.
  const regex = String(pattern).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*').replace(/%([a-zA-Z])/g, (_, f: string) => {
    names.push(f); return f === 'M' || f === 'b' ? '\\s*([A-Za-z]+)' : f === 'p' ? '\\s*(AM|PM)' : '\\s*(\\d{1,4})';
  });
  const match = new RegExp(`^${regex}`, 'i').exec(String(text).trim());
  if (!match) return null;
  let pm = false;
  names.forEach((f, i) => {
    const v = match[i + 1];
    if (f === 'M' || f === 'b') parts.m = MONTHS.findIndex(m => m.toLowerCase().startsWith(v.toLowerCase().slice(0, 3))) + 1;
    else if (f === 'p') pm = v.toUpperCase() === 'PM';
    else if (f === 'y') parts.Y = 2000 + Number(v) - (Number(v) >= 70 ? 100 : 0);
    else parts[{ Y: 'Y', m: 'm', c: 'm', d: 'd', e: 'd', H: 'H', k: 'H', h: 'H', I: 'H', l: 'H', i: 'i', s: 's', S: 's' }[f] ?? f] = Number(v);
  });
  if (pm && parts.H < 12) parts.H += 12;
  if (!parts.m) return null;
  const hasTime = names.some(f => 'HkhIlisSp'.includes(f));
  return `${pad(parts.Y, 4)}-${pad(parts.m)}-${pad(parts.d)}${hasTime ? ` ${pad(parts.H)}:${pad(parts.i)}:${pad(parts.s)}` : ''}`;
}
const seconds = (value: unknown) => { const m = /^(-)?(\d+):(\d{2})(?::(\d{2}))?/.exec(String(value ?? '').trim().replace(/^\d{4}-\d{2}-\d{2}[ T]/, '')); return m ? (m[1] ? -1 : 1) * (Number(m[2]) * 3600 + Number(m[3]) * 60 + Number(m[4] ?? 0)) : null; };
const duration = (total: number) => `${total < 0 ? '-' : ''}${pad(Math.floor(Math.abs(total) / 3600))}:${pad(Math.floor(Math.abs(total) % 3600 / 60))}:${pad(Math.abs(total) % 60)}`;
/** MySQL's regular expressions: case-insensitive unless asked otherwise, with POSIX classes. */
const regexCache = new Map<string, RegExp>();
function mysqlRegex(pattern: unknown, flags = 'i') {
  const key = `${flags}/${String(pattern)}`;
  let regex = regexCache.get(key);
  if (!regex) {
    const classes: Record<string, string> = { alpha: 'A-Za-z', digit: '0-9', alnum: 'A-Za-z0-9', upper: 'A-Z', lower: 'a-z', space: '\\s', punct: '!-\\/:-@\\[-`{-~', xdigit: '0-9A-Fa-f', blank: ' \\t', word: '\\w' };
    regex = new RegExp(String(pattern).replace(/\[\[:<:\]\]/g, '\\b').replace(/\[\[:>:\]\]/g, '\\b').replace(/\[:(\w+):\]/g, (m, name: string) => classes[name] ?? m), flags);
    if (regexCache.size > 200) regexCache.clear();
    regexCache.set(key, regex);
  }
  return regex;
}
const regexFlags = (flags: unknown) => { let i = true, extra = ''; for (const f of String(flags ?? '')) { if (f === 'c') i = false; else if (f === 'i') i = true; else if (f === 'm') extra += 'm'; else if (f === 'n') extra += 's'; } return (i ? 'i' : '') + extra; };
const text = (v: unknown) => typeof v === 'number' && !Number.isInteger(v) ? String(Math.round(v * 1e10) / 1e10) : String(v);
const nullish = (args: unknown[]) => args.some(a => a === null || a === undefined);
/** MySQL functions LeetCode's SQL problems commonly use, defined in SQLite. */
function addMysqlFunctions(db: Database) {
  // sql.js registers a function with its JavaScript length as the argument count; -1 takes any number.
  const fn = (name: string, body: (...args: any[]) => unknown) => db.create_function(name, Object.defineProperty((...args: unknown[]) => body(...args), 'length', { value: -1 }) as any);
  const strict = (name: string, body: (...args: any[]) => unknown) => fn(name, (...args: unknown[]) => nullish(args) ? null : body(...args));
  fn('IF', (c, a, b) => c && Number(c) !== 0 ? a : b);
  strict('DATEDIFF', (a, b) => { const x = date(a), y = date(b); return x && y ? Math.round((Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()) - Date.UTC(y.getUTCFullYear(), y.getUTCMonth(), y.getUTCDate())) / 86400000) : null; });
  strict('DATE_ADD', (d, spec) => typeof spec === 'number' ? shift(d, `${spec} DAY`, 1) : shift(d, spec, 1)); strict('ADDDATE', (d, spec) => typeof spec === 'number' ? shift(d, `${spec} DAY`, 1) : shift(d, spec, 1));
  strict('DATE_SUB', (d, spec) => typeof spec === 'number' ? shift(d, `${spec} DAY`, -1) : shift(d, spec, -1)); strict('SUBDATE', (d, spec) => typeof spec === 'number' ? shift(d, `${spec} DAY`, -1) : shift(d, spec, -1));
  strict('DATE_FORMAT', format); strict('TIME_FORMAT', format); strict('STR_TO_DATE', parseDate);
  for (const [name, part] of [['YEAR', (d: Date) => d.getUTCFullYear()], ['MONTH', (d: Date) => d.getUTCMonth() + 1], ['DAY', (d: Date) => d.getUTCDate()], ['DAYOFMONTH', (d: Date) => d.getUTCDate()], ['DAYOFWEEK', (d: Date) => d.getUTCDay() + 1], ['WEEKDAY', (d: Date) => (d.getUTCDay() + 6) % 7],
    ['DAYOFYEAR', (d: Date) => Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000) + 1], ['QUARTER', (d: Date) => Math.floor(d.getUTCMonth() / 3) + 1],
    ['HOUR', (d: Date) => d.getUTCHours()], ['MINUTE', (d: Date) => d.getUTCMinutes()], ['SECOND', (d: Date) => d.getUTCSeconds()], ['UNIX_TIMESTAMP', (d: Date) => Math.floor(d.getTime() / 1000)],
    ['DAYNAME', (d: Date) => DAYS[d.getUTCDay()]], ['MONTHNAME', (d: Date) => MONTHS[d.getUTCMonth()]], ['LAST_DAY', (d: Date) => day(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)))],
    ['DATE', (d: Date) => day(d)], ['TIME', (d: Date) => clock(d)], ['TO_DAYS', (d: Date) => Math.floor(d.getTime() / 86400000) + 719528],
    // WEEK(date) in MySQL's default mode 0: weeks start on Sunday and days before the year's first Sunday are week 0.
    ['WEEK', (d: Date) => { const jan1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)), yday = Math.floor((d.getTime() - jan1.getTime()) / 86400000) + 1; return Math.floor((yday - 1 - (7 - jan1.getUTCDay()) % 7) / 7) + 1; }],
    ['WEEKOFYEAR', (d: Date) => { const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 3 - (d.getUTCDay() + 6) % 7)); return 1 + Math.round(((t.getTime() - Date.UTC(t.getUTCFullYear(), 0, 4)) / 86400000 - 3 + (new Date(Date.UTC(t.getUTCFullYear(), 0, 4)).getUTCDay() + 6) % 7) / 7); }]] as const)
    fn(name, v => { const d = date(v); return d ? part(d) : null; });
  strict('TIMESTAMPDIFF', (unit, a, b) => { const x = date(a), y = date(b); if (!x || !y) return null; const s = (y.getTime() - x.getTime()) / 1000, u = String(unit).toUpperCase(); return Math.trunc(s / ({ SECOND: 1, MINUTE: 60, HOUR: 3600, DAY: 86400, WEEK: 604800 } as Record<string, number>)[u] || (u === 'MONTH' ? (y.getUTCFullYear() - x.getUTCFullYear()) * 12 + y.getUTCMonth() - x.getUTCMonth() - (y.getUTCDate() < x.getUTCDate() ? 1 : 0) : u === 'YEAR' ? y.getUTCFullYear() - x.getUTCFullYear() - (y.getUTCMonth() * 100 + y.getUTCDate() < x.getUTCMonth() * 100 + x.getUTCDate() ? 1 : 0) : NaN)); });
  strict('TIME_TO_SEC', seconds); strict('SEC_TO_TIME', n => duration(Math.trunc(Number(n))));
  strict('TIMEDIFF', (a, b) => { const x = seconds(a), y = seconds(b), dx = date(a), dy = date(b); return /^\d{4}-/.test(String(a)) && dx && dy ? duration(Math.round((dx.getTime() - dy.getTime()) / 1000)) : x === null || y === null ? null : duration(x - y); });
  fn('NOW', () => '2020-01-01 00:00:00'); fn('CURDATE', () => '2020-01-01'); fn('CURRENT_DATE', () => '2020-01-01');
  // Strings. CONCAT is NULL when any part is NULL, unlike SQLite's.
  strict('CONCAT', (...parts) => parts.map(text).join('')); fn('CONCAT_WS', (sep, ...parts) => sep === null ? null : parts.filter(p => p !== null).map(text).join(String(sep)));
  strict('LEFT', (s, n) => String(s).slice(0, Math.max(0, Number(n)))); strict('RIGHT', (s, n) => Number(n) > 0 ? String(s).slice(-Number(n)) : '');
  strict('MID', (s, p, n) => String(s).substr(Number(p) > 0 ? Number(p) - 1 : String(s).length + Number(p), Number(n)));
  strict('LOCATE', (needle, hay, from = 1) => String(hay).indexOf(String(needle), Math.max(0, Number(from) - 1)) + 1);
  strict('LPAD', (s, n, p) => String(s).padStart(Number(n), String(p)).slice(0, Number(n))); strict('RPAD', (s, n, p) => String(s).padEnd(Number(n), String(p)).slice(0, Number(n)));
  strict('CHAR_LENGTH', s => [...String(s)].length); strict('CHARACTER_LENGTH', s => [...String(s)].length);
  strict('REVERSE', s => [...String(s)].reverse().join('')); strict('REPEAT', (s, n) => String(s).repeat(Math.max(0, Number(n)))); strict('SPACE', n => ' '.repeat(Math.max(0, Number(n))));
  strict('LCASE', s => String(s).toLowerCase()); strict('UCASE', s => String(s).toUpperCase()); strict('ASCII', s => String(s).charCodeAt(0) || 0);
  strict('SUBSTRING_INDEX', (s, delim, count) => { const parts = String(s).split(String(delim)), n = Number(count); return n >= 0 ? parts.slice(0, n).join(String(delim)) : parts.slice(n).join(String(delim)); });
  fn('FIND_IN_SET', (s, list) => s === null || list === null ? null : String(list).split(',').indexOf(String(s)) + 1);
  fn('FIELD', (s, ...list) => s === null ? 0 : list.findIndex(v => v !== null && String(v) === String(s)) + 1);
  strict('FORMAT', (x, d) => Number(x).toLocaleString('en-US', { minimumFractionDigits: Number(d), maximumFractionDigits: Number(d) }));
  strict('BIN', n => Math.trunc(Number(n)).toString(2));
  fn('REGEXP_LIKE', (s, p, flags) => s === null || p === null ? null : mysqlRegex(p, regexFlags(flags)).test(String(s)) ? 1 : 0);
  strict('REGEXP_REPLACE', (s, p, r) => String(s).replace(new RegExp(mysqlRegex(p).source, 'gi'), String(r).replace(/\\(\d)/g, '$$$1')));
  strict('REGEXP_SUBSTR', (s, p) => mysqlRegex(p).exec(String(s))?.[0] ?? null);
  strict('REGEXP_INSTR', (s, p) => (mysqlRegex(p).exec(String(s))?.index ?? -1) + 1);
  // REGEXP as an operator: SQLite calls regexp(pattern, value).
  fn('REGEXP', (pattern, value) => value === null || pattern === null ? null : mysqlRegex(pattern).test(String(value)) ? 1 : 0);
  // Numbers.
  fn('MYSQL_ISNULL', v => v === null ? 1 : 0);
  strict('LEAST', (...args) => args.reduce((a, b) => (typeof a === 'number' && typeof b === 'number' ? b < a : String(b) < String(a)) ? b : a));
  strict('GREATEST', (...args) => args.reduce((a, b) => (typeof a === 'number' && typeof b === 'number' ? b > a : String(b) > String(a)) ? b : a));
  strict('POW', (a, b) => Math.pow(a, b)); strict('POWER', (a, b) => Math.pow(a, b)); strict('SQRT', a => a < 0 ? null : Math.sqrt(a)); strict('EXP', a => Math.exp(a));
  strict('LN', a => a > 0 ? Math.log(a) : null); strict('LOG2', a => a > 0 ? Math.log2(a) : null); strict('LOG10', a => a > 0 ? Math.log10(a) : null);
  fn('LOG', (a, b) => b === undefined ? (a > 0 ? Math.log(a) : null) : a === null || b === null || a <= 0 || a === 1 || b <= 0 ? null : Math.log(b) / Math.log(a));
  strict('FLOOR', a => Math.floor(a)); strict('CEIL', a => Math.ceil(a)); strict('CEILING', a => Math.ceil(a));
  strict('TRUNCATE', (a, d) => Math.trunc(a * 10 ** d) / 10 ** d); strict('MOD', (a, b) => Number(b) === 0 ? null : a % b);
  strict('PI', () => Math.PI); strict('RADIANS', a => a * Math.PI / 180); strict('DEGREES', a => a * 180 / Math.PI);
  for (const name of ['SIN', 'COS', 'TAN', 'ASIN', 'ACOS', 'ATAN'] as const) strict(name, a => Math[name.toLowerCase() as 'sin'](a));
  strict('ATAN2', (y, x) => Math.atan2(y, x)); strict('COT', a => 1 / Math.tan(a)); strict('SIGN', a => Math.sign(a));
}
/** A query's string literals and comments are lifted out first, so the rewrites only see code. */
const ESCAPES: Record<string, string> = { '0': '\0', b: '\b', n: '\n', r: '\r', t: '\t', Z: '\x1a', '%': '\\%', _: '\\_' };
const STRING = '\u0001(\\d+)\u0001';
/**
 * MySQL syntax SQLite does not share: backslash escapes and double-quoted strings, INTERVAL arithmetic,
 * GROUP_CONCAT(... SEPARATOR s), DIV, exact division with /, EXTRACT, CAST(... AS DATE), <=>, || and && as logic.
 * Throws when the text holds more than one statement.
 */
export function rewriteMysql(query: string): string {
  const strings: string[] = [];
  let code = '';
  for (let i = 0; i < query.length;) {
    const c = query[i];
    if (c === "'" || c === '"') {
      let value = '', j = i + 1, closed = false;
      for (; j < query.length; j++) {
        const d = query[j];
        if (d === '\\' && j + 1 < query.length) { const e = query[++j]; value += ESCAPES[e] ?? e; }
        else if (d === c) { if (query[j + 1] === c) { value += c; j++; } else { closed = true; break; } }
        else value += d;
      }
      if (!closed) { code += query.slice(i); break; }
      strings.push(value); code += `\u0001${strings.length - 1}\u0001`; i = j + 1;
    } else if (c === '`') { const j = query.indexOf('`', i + 1), end = j < 0 ? query.length : j + 1; code += query.slice(i, end); i = end; }
    else if ((c === '-' && query[i + 1] === '-' && /\s|$/.test(query[i + 2] ?? '')) || c === '#') { const j = query.indexOf('\n', i); code += ' '; i = j < 0 ? query.length : j; }
    else if (c === '/' && query[i + 1] === '*') { const j = query.indexOf('*/', i + 2); code += ' '; i = j < 0 ? query.length : j + 2; }
    else { code += c; i++; }
  }
  const lift = (value: string) => { strings.push(value); return `\u0001${strings.length - 1}\u0001`; };
  const amount = `(-?\\d+|${STRING})`, unit = `(${UNITS})S?\\b`;
  const spec = (n: string, index: string | undefined, u: string) => lift(`${index !== undefined ? strings[Number(index)].trim() : n} ${u.toUpperCase()}`);
  const operand = `(${STRING}|[\\w.]+\\s*\\((?:[^()]|\\([^()]*\\))*\\)|[\\w.\`]+)`;
  code = code.replace(/;\s*$/, '');
  if (code.includes(';')) throw new Error('Write a single SQL query.');
  code = code
    // MySQL's DELETE alias FROM t alias, ... WHERE ... deletes the matching rows of t.
    .replace(/^\s*DELETE\s+(\w+)\s+FROM\s+([\s\S]+)$/i, (_, alias: string, rest: string) => {
      const table = [...rest.matchAll(new RegExp(`\\b(\\w+)\\s+(?:AS\\s+)?${alias}\\b`, 'gi'))].map(m => m[1]).find(t => !/^(FROM|JOIN|ON|AND|OR|WHERE|AS|INNER|LEFT|RIGHT|CROSS|OUTER|NOT|IN|IS)$/i.test(t)) ?? alias;
      return `DELETE FROM ${table} WHERE rowid IN (SELECT ${alias}.rowid FROM ${rest})`;
    })
    // date + INTERVAL n UNIT and date - INTERVAL n UNIT become DATE_ADD and DATE_SUB.
    .replace(new RegExp(`${operand}\\s*([+-])\\s*INTERVAL\\s+${amount}\\s+${unit}`, 'gi'), (_, value: string, _i: string, sign: string, n: string, index: string | undefined, u: string) => `${sign === '+' ? 'DATE_ADD' : 'DATE_SUB'}(${value}, ${spec(n, index, u)})`)
    .replace(new RegExp(`INTERVAL\\s+${amount}\\s+${unit}\\s*\\+\\s*${operand}`, 'gi'), (_, n: string, index: string | undefined, u: string, value: string) => `DATE_ADD(${value}, ${spec(n, index, u)})`)
    .replace(new RegExp(`\\bINTERVAL\\s+${amount}\\s+${unit}`, 'gi'), (_, n: string, index: string | undefined, u: string) => spec(n, index, u))
    // SQLite takes the separator as the second argument, before any ORDER BY.
    .replace(new RegExp(`\\bGROUP_CONCAT\\s*\\(\\s*(DISTINCT\\s+)?([\\s\\S]*?)\\s+SEPARATOR\\s+${STRING}\\s*\\)`, 'gi'), (_, distinct: string | undefined, body: string, index: string) => {
      const [value, order] = body.split(/\s+ORDER\s+BY\s+/i);
      return `GROUP_CONCAT(${distinct ?? ''}${value}${distinct ? '' : `, \u0001${index}\u0001`}${order ? ` ORDER BY ${order}` : ''})`;
    })
    .replace(new RegExp(`\\bTIMESTAMPDIFF\\s*\\(\\s*(${UNITS})\\s*,`, 'gi'), (_, u: string) => `TIMESTAMPDIFF(${lift(u.toUpperCase())},`)
    .replace(/\bEXTRACT\s*\(\s*(YEAR|QUARTER|MONTH|WEEK|DAY|HOUR|MINUTE|SECOND)\s+FROM\s+/gi, (_, u: string) => `${u.toUpperCase()}(`)
    .replace(/\bCAST\s*\(((?:[^()]|\([^()]*\))*?)\s+AS\s+(DATE|DATETIME|TIME)\s*\)/gi, (_, value: string, type: string) => `${type.toUpperCase() === 'DATE' ? 'DATE' : type.toUpperCase() === 'TIME' ? 'TIME' : 'DATE_FORMAT'}(${value}${type.toUpperCase() === 'DATETIME' ? `, ${lift('%Y-%m-%d %H:%i:%s')}` : ''})`)
    .replace(/\bAS\s+(SIGNED|UNSIGNED)(\s+INTEGER)?\b/gi, 'AS INTEGER')
    .replace(/\bANY_VALUE\s*\(/gi, 'MIN(')
    // ISNULL is an SQLite operator keyword, so MySQL's ISNULL(x) gets another name.
    .replace(/\bISNULL\s*\(/gi, 'MYSQL_ISNULL(')
    .replace(/\bRLIKE\b/gi, 'REGEXP')
    .replace(/<=>/g, ' IS ')
    .replace(/\|\|/g, ' OR ').replace(/&&/g, ' AND ')
    // MySQL's LIKE escapes with a backslash by default; SQLite needs it named.
    .replace(new RegExp(`\\bLIKE\\s+${STRING}`, 'gi'), (m: string, index: string) => strings[Number(index)].includes('\\') ? `${m} ESCAPE ${lift('\\')}` : m)
    // MySQL's / divides exactly (1 / 2 is 0.5); DIV keeps the integer part.
    .replace(new RegExp(`${operand}\\s+DIV\\s+${operand}`, 'gi'), (_, a: string, _i: string, b: string) => `CAST(${a} / ${b} AS INTEGER)`)
    .replace(/\//g, '* 1.0 /');
  return code.replace(new RegExp(STRING, 'g'), (_, index: string) => `'${strings[Number(index)].replace(/'/g, "''")}'`);
}
/** How a MySQL column type is stored: whole numbers, other numbers, or text (dates included), judged by its first word. */
export function columnKind(type: string): 'integer' | 'number' | 'text' {
  const base = type.trim().split(/[\s(]/)[0].toUpperCase();
  return /^(INT|INTEGER|BIGINT|SMALLINT|TINYINT|MEDIUMINT|BOOL|BOOLEAN|BIT)$/.test(base) ? 'integer' : /^(DECIMAL|DEC|NUMERIC|FLOAT|DOUBLE|REAL)$/.test(base) ? 'number' : 'text';
}
const sqliteType = (type: string) => ({ integer: 'INTEGER', number: 'REAL', text: 'TEXT COLLATE NOCASE' })[columnKind(type)];
/** Builds the case's tables, runs one query, and returns its result table or a readable error. */
export function runSql(SQL: SqlJsStatic, schema: SqlSchema, tables: SqlTables, query: string, modifies?: string): { result?: SqlResult; error?: string } {
  const db = new SQL.Database();
  try {
    addMysqlFunctions(db);
    for (const [name, columns] of Object.entries(schema)) {
      db.run(`CREATE TABLE "${name}" (${columns.map(([column, type]) => `"${column}" ${sqliteType(type)}`).join(', ')})`);
      const rows = tables[name] ?? [];
      if (rows.length) { const insert = db.prepare(`INSERT INTO "${name}" VALUES (${columns.map(() => '?').join(', ')})`); for (const row of rows) insert.run(row.map(v => typeof v === 'boolean' ? Number(v) : v) as any); insert.free(); }
    }
    // A prepared statement keeps its column names even when no rows come back.
    const read = (sql: string): SqlResult => {
      const statement = db.prepare(sql), rows: Json[][] = [];
      try { while (statement.step()) rows.push(statement.get() as Json[]); return { columns: statement.getColumnNames(), rows }; }
      finally { statement.free(); }
    };
    const result = read(rewriteMysql(query));
    // An UPDATE or DELETE is judged by the table it changes.
    return { result: modifies ? read(`SELECT * FROM "${modifies}"`) : result };
  } catch (error) { return { error: String(error instanceof Error ? error.message : error).slice(0, 2000) }; }
  finally { db.close(); }
}
/** A cell as compared: numbers (and numeric text, as MySQL prints both alike) to 5 decimal places, booleans as 1 or 0. */
const cell = (v: Json) => { const n = typeof v === 'boolean' ? Number(v) : typeof v === 'string' && /^\s*-?\d+(\.\d+)?\s*$/.test(v) ? Number(v) : v; return typeof n === 'number' ? Math.round(n * 1e5) / 1e5 + 0 : n; };
/** Rows match when their values match: numbers within 1e-5, everything else exactly, in order only when required. */
export function sameTable(actual: SqlResult, expected: SqlResult, ordered: boolean): boolean {
  if (actual.columns.length !== expected.columns.length || actual.rows.length !== expected.rows.length) return false;
  const key = (row: Json[]) => JSON.stringify(row.map(cell));
  const a = actual.rows.map(key), e = expected.rows.map(key);
  return ordered ? a.every((k, i) => k === e[i]) : JSON.stringify([...a].sort()) === JSON.stringify([...e].sort());
}
/** Column names match as MySQL compares them, ignoring case. */
export const sameColumns = (actual: SqlResult, expected: SqlResult) => actual.columns.length === expected.columns.length && actual.columns.every((c, i) => c.toLowerCase() === expected.columns[i].toLowerCase());
/** Why an SQL case is invalid: it must be [tables], with known tables, rows of the right width and typed cells. */
export function sqlInvalid(schema: SqlSchema, input: unknown): string | null {
  if (!Array.isArray(input) || input.length !== 1 || !input[0] || typeof input[0] !== 'object' || Array.isArray(input[0])) return 'Each case is [tables]: one object mapping table names to rows.';
  const tables = input[0] as Record<string, unknown>;
  for (const name of Object.keys(tables)) if (!Object.hasOwn(schema, name)) return `Unknown table ${name}.`;
  let cells = 0;
  for (const [name, columns] of Object.entries(schema)) {
    const rows = tables[name] ?? [];
    if (!Array.isArray(rows) || rows.length > 2000) return `${name} must be a list of at most 2,000 rows.`;
    for (const row of rows) {
      if (!Array.isArray(row) || row.length !== columns.length) return `Each ${name} row has ${columns.length} values: ${columns.map(c => c[0]).join(', ')}.`;
      for (let i = 0; i < row.length; i++) {
        const value = row[i], type = columns[i][1]; cells++;
        if (value === null) continue;
        const kind = columnKind(type);
        if (kind === 'integer' ? !Number.isSafeInteger(value) : kind === 'number' ? typeof value !== 'number' || !Number.isFinite(value) : typeof value !== 'string' || value.length > 1000) return `${name}.${columns[i][0]} must be ${type} or null.`;
      }
    }
  }
  return cells > 20000 ? 'A case can hold at most 20,000 values.' : null;
}
const outcome = (run: { result?: SqlResult; error?: string }) => run.result ? { actual: run.result as unknown as Json } : { error: run.error };
/** Judges a query on each case against the reference query, as engine.judge does for code. */
export function judgeSql(SQL: SqlJsStatic, problem: { schema?: SqlSchema; ordered?: boolean; modifies?: string; reference: string }, source: string, cases: { name: string; input: Json[]; expected?: Json }[]) {
  const start = performance.now(), schema = problem.schema ?? {}, results: any[] = [];
  for (const test of cases) {
    const invalid = source.length > 262144 ? 'Query exceeds 256 KiB.' : sqlInvalid(schema, test.input);
    if (invalid) { results.push({ ...test, verdict: 'Invalid input', error: invalid, logs: [], durationMs: 0 }); continue; }
    const tables = test.input[0] as unknown as SqlTables, reference = runSql(SQL, schema, tables, problem.reference, problem.modifies);
    if (!reference.result) { results.push({ ...test, verdict: 'Invalid input', error: `The reference could not run this case: ${reference.error}`, logs: [], durationMs: 0 }); continue; }
    const t = performance.now(), run = runSql(SQL, schema, tables, source, problem.modifies), durationMs = Math.round((performance.now() - t) * 100) / 100;
    const named = !run.result || sameColumns(run.result, reference.result);
    const verdict = run.error ? (/syntax|incomplete input|unrecognized token|near "|single SQL query/i.test(run.error) ? 'Syntax error' : 'Runtime error') : named && sameTable(run.result!, reference.result, !!problem.ordered && !problem.modifies) ? 'Accepted' : 'Wrong answer';
    results.push({ ...test, ...outcome(run), ...(named ? {} : { error: `The columns must be named ${reference.result.columns.join(', ')}.` }), verdict, expected: reference.result as unknown as Json, logs: [], durationMs });
    if (verdict === 'Syntax error') break;
  }
  return { verdict: results.find(r => r.verdict !== 'Accepted')?.verdict ?? 'Accepted', passed: results.filter(r => r.verdict === 'Accepted').length, total: cases.length, durationMs: Math.round(performance.now() - start), cases: results };
}
/** The reference query's common table expressions, so a walkthrough can show each intermediate table. */
export function cteSteps(query: string): { name: string; sql: string; start: number; end: number }[] {
  const text = query.replace(/;\s*$/, ''), match = /^\s*WITH\s+(RECURSIVE\s+)?/i.exec(text);
  if (!match) return [];
  const steps: { name: string; sql: string; start: number; end: number }[] = [];
  let i = match[0].length;
  while (i < text.length) {
    const head = /^\s*([A-Za-z_]\w*)\s*(\([^)]*\))?\s+AS\s*\(/i.exec(text.slice(i));
    if (!head) break;
    const open = i + head[0].length - 1;
    let depth = 0, j = open, quote = '';
    for (; j < text.length; j++) {
      const c = text[j];
      if (quote) { if (c === quote) quote = ''; continue; }
      if (c === "'" || c === '"' || c === '`') quote = c; else if (c === '(') depth++; else if (c === ')' && --depth === 0) break;
    }
    steps.push({ name: head[1], sql: `${text.slice(0, j + 1)} SELECT * FROM ${head[1]}`, start: i, end: j + 1 });
    i = j + 1;
    const comma = /^\s*,/.exec(text.slice(i));
    if (!comma) break;
    i += comma[0].length;
  }
  return steps;
}
