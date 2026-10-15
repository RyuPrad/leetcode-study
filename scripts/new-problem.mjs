// Authoring aid for problems added after the original library. Applies a problem module to the
// maintained sources: coding/problems.json (base definition and JavaScript starter),
// coding/statements.mjs, coding/signatures.mjs, coding/cases.mjs, coding/difficulty.json,
// coding/solutions/{typescript,java,c}, visualizer-ui/lesson-notes.txt and the topic note.
// Run `npx tsx scripts/author-coding.ts` afterwards to fill expected results and test cases.
//   node scripts/new-problem.mjs <problem-module.mjs> [...more]
// A module default-exports { number, title, topic, difficulty, visualizer, variables: [[name, meaning]],
// why, statement, signature (Java notation, or signatureCode for design/codec), entry, kind,
// parameters, methods?, reference, examples: [input], cases (body of `case n:` in extraCase),
// solutions: { typescript, java, c } }.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './content.mjs';

const file = name => path.join(ROOT, name);
const read = name => fs.readFileSync(file(name), 'utf8');
const write = (name, text) => fs.writeFileSync(file(name), text);
const todo = '    // Write your code here.\n    throw new Error("Not implemented");';

export function starter(p) {
  if (p.kind === 'function') return `function ${p.entry}(${p.parameters.join(', ')}) {\n  // Write your code here.\n  throw new Error("Not implemented");\n}\n`;
  const members = Object.entries(p.methods).map(([name, params]) => name === 'constructor'
    ? `  constructor(${params.join(', ')}) {\n    // Write your code here.\n    \n  }`
    : `  ${name}(${params.join(', ')}) {\n${todo}\n  }`);
  return `class ${p.entry} {\n${members.join('\n\n')}\n}\n`;
}

function insertNumbered(lines, number, line, numberOf) {
  const at = lines.findIndex(l => { const n = numberOf(l); return n !== null && n > number; });
  const existing = lines.findIndex(l => numberOf(l) === number);
  if (existing >= 0) { lines[existing] = line; return lines; }
  if (at >= 0) lines.splice(at, 0, line); else { const last = lines.findLastIndex(l => numberOf(l) !== null); lines.splice(last + 1, 0, line); }
  return lines;
}

export function apply(p) {
  for (const key of ['number', 'title', 'topic', 'difficulty', 'visualizer', 'variables', 'why', 'statement', 'entry', 'kind', 'parameters', 'reference', 'examples', 'cases', 'solutions'])
    if (p[key] === undefined) throw Error(`${p.number ?? '?'}: missing ${key}`);
  if (!['Easy', 'Medium', 'Hard'].includes(p.difficulty)) throw Error(`${p.number}: invalid difficulty`);
  if (p.why.length < 40) throw Error(`${p.number}: the lesson note must explain why the algorithm works`);
  const n = p.number;

  // coding/problems.json
  const problems = JSON.parse(read('coding/problems.json')).filter(q => q.number !== n);
  problems.push({ id: `leetcode:${n}`, number: n, title: p.title, description: p.statement, constraints: [], entry: p.entry, kind: p.kind, parameters: p.parameters, ...(p.methods ? { methods: p.methods } : {}), reference: p.reference.trim(), starter: starter(p), examples: p.examples.map((input, i) => ({ name: `Example ${i + 1}`, input })), tests: [] });
  problems.sort((a, b) => a.number - b.number);
  write('coding/problems.json', JSON.stringify(problems, null, 2) + '\n');

  // coding/statements.mjs: one "n|statement" line inside the template literal, in number order.
  if (/[`\n]|\$\{/.test(p.statement)) throw Error(`${n}: statements are one line without backticks`);
  const statements = read('coding/statements.mjs').split('\n');
  write('coding/statements.mjs', insertNumbered(statements, n, `${n}|${p.statement}`, l => /^\d+\|/.test(l) ? Number(l.split('|')[0]) : null).join('\n'));

  // coding/signatures.mjs
  const signature = p.signatureCode || `'${p.signature}'`;
  let signatures = read('coding/signatures.mjs').split('\n');
  const entryOf = l => { const m = l.match(/^  (\d+): /); return m ? Number(m[1]) : null; };
  signatures = signatures.map(l => entryOf(l) !== null && !l.endsWith(',') ? l + ',' : l);
  signatures = insertNumbered(signatures, n, `  ${n}: ${signature},`, entryOf);
  const lastEntry = signatures.findLastIndex(l => entryOf(l) !== null);
  signatures[lastEntry] = signatures[lastEntry].replace(/,$/, '');
  write('coding/signatures.mjs', signatures.join('\n'));

  // coding/cases.mjs: a case before the default branch.
  let cases = read('coding/cases.mjs');
  cases = cases.replace(new RegExp(`\\n    case ${n}:(?:(?!\\n    (?:case|default)).)*`, 's'), '');
  const body = p.cases.trim().startsWith('{') ? p.cases.trim() : `return ${p.cases.trim().replace(/^return\s+/, '').replace(/;$/, '')};`;
  cases = cases.replace('\n    default:throw new Error(`Missing authored cases for ${n}`);', `\n    case ${n}:${body}\n    default:throw new Error(\`Missing authored cases for \${n}\`);`);
  write('coding/cases.mjs', cases);

  // coding/difficulty.json
  const difficulty = JSON.parse(read('coding/difficulty.json')); difficulty[n] = p.difficulty;
  write('coding/difficulty.json', '{\n' + Object.keys(difficulty).map(Number).sort((a, b) => a - b).map(k => `  "${k}": "${difficulty[k]}"`).join(',\n') + '\n}\n');

  // coding/solutions
  for (const [language, ext] of [['typescript', 'ts'], ['java', 'java'], ['c', 'c']]) {
    if (!p.solutions[language]) throw Error(`${n}: missing ${language} solution`);
    write(`coding/solutions/${language}/${n}.${ext}`, p.solutions[language].replace(/^\n+/, '').replace(/\s+$/, '') + '\n');
  }

  // visualizer-ui/lesson-notes.txt
  const notes = read('visualizer-ui/lesson-notes.txt').replace(/\s+$/, '').split('\n').filter(l => !l.startsWith(`${n}|`));
  notes.push(`${n}|${p.why}`);
  write('visualizer-ui/lesson-notes.txt', notes.join('\n') + '\n');

  // The topic note: the visualizer embed and its variable guide.
  const note = `<iframe\n  src="${p.visualizer}"\n  width="100%"\n  height="800px"\n  frameborder="0"\n  allow="fullscreen"\n  allowfullscreen>\n</iframe>\n\n## Variable Pattern\n\n| Name | Meaning |\n|---|---|\n${p.variables.map(([name, meaning]) => `| ${name} | ${meaning} |`).join('\n')}\n`;
  write(`${p.topic}/Leetcode ${n}. ${p.title.replace(/[\\/:*?"<>|]/g, '')}.md`, note);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))) {
  for (const module of process.argv.slice(2)) {
    const spec = (await import(pathToFileURL(path.resolve(module)).href)).default;
    for (const p of [].concat(spec.problem || spec)) { apply(p); console.log(`Applied ${p.number}. ${p.title}`); }
  }
}
