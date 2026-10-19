import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const TOPICS = ['Array & Hashing', 'Two Pointers', 'Sliding Window', 'Stack', 'Binary Search', 'LinkedList', 'Trees', 'BST', 'Tries', 'Heap', 'Backtracking', 'Graphs', 'Advanced Graphs', '1-D Dynamic Programming', '2-D Dynamic Programming', 'Greedy', 'Intervals', 'Math & Geometry', 'Bit Manipulation', 'Queue'];
const REFERENCES = ['Leetcode Cheatsheet.md', 'Variable Naming Guide.md'];
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const iframe = /<iframe\b[\s\S]*?<\/iframe\s*>/gi;
// The bundled note ends with the reference solution in every language. Maintained notes stay
// unchanged; JavaScript comes from coding/problems.json and the rest from coding/solutions.
const SOLUTION_LANGUAGES = [['JavaScript', 'js', null], ['TypeScript', 'ts', 'typescript'], ['Java', 'java', 'java'], ['C', 'c', 'c']];
function solutionsSection(root, number, references, errors) {
  const blocks = [];
  for (const [label, fence, folder] of SOLUTION_LANGUAGES) {
    let code = folder ? null : references.get(number);
    if (folder) {
      const file = path.join(root, 'coding', 'solutions', folder, `${number}.${fence}`);
      if (fs.existsSync(file)) code = fs.readFileSync(file, 'utf8');
    }
    if (!code) { errors.push(`Missing ${label} solution for problem ${number}`); continue; }
    blocks.push(`### ${label}\n\n\`\`\`${fence}\n${code.trim()}\n\`\`\``);
  }
  return `\n\n## Solutions\n\n${blocks.join('\n\n')}`;
}
const TECHNIQUES_PATH = 'visualizer-ui/solution-techniques.json';
const TECHNIQUE_KINDS = new Set(['algorithm', 'technique', 'data-structure']);

// Curated against the bundled implementations, rather than guessed from topic names.
export function validateSolutionTechniques(metadata, problemIds) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) throw new Error('Solution techniques must be an object keyed by problem ID.');
  const ids = new Set(problemIds), errors = [], result = {};
  for (const id of ids) if (!Object.hasOwn(metadata, id)) errors.push(`Missing solution techniques for ${id}`);
  for (const [id, methods] of Object.entries(metadata)) {
    if (!ids.has(id)) { errors.push(`Unknown solution techniques problem ID: ${id}`); continue; }
    if (!Array.isArray(methods) || methods.length === 0) { errors.push(`Solution techniques for ${id} must be a nonempty array`); continue; }
    const names = new Set();
    result[id] = [];
    for (const [index, method] of methods.entries()) {
      const location = `${id} solution technique ${index + 1}`;
      if (!method || typeof method !== 'object' || Array.isArray(method)) { errors.push(`Invalid ${location}`); continue; }
      if (Object.keys(method).some(key => !['name', 'kind', 'role'].includes(key))) errors.push(`Unexpected field in ${location}`);
      const name = typeof method.name === 'string' ? method.name.trim() : '';
      const role = typeof method.role === 'string' ? method.role.trim() : '';
      if (!name) errors.push(`Missing name in ${location}`);
      if (!role) errors.push(`Missing role in ${location}`);
      if (!TECHNIQUE_KINDS.has(method.kind)) errors.push(`Invalid kind in ${location}: ${String(method.kind)}`);
      const normalizedName = name.toLowerCase();
      if (names.has(normalizedName)) errors.push(`Duplicate solution technique "${name}" for ${id}`);
      names.add(normalizedName);
      result[id].push({ name, kind: method.kind, role });
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return result;
}

export function collectCatalog(root = ROOT, { allowAbsolute = false } = {}) {
  const entries = [], visualizers = [], errors = [];
  const problemsFile = path.join(root, 'coding', 'problems.json');
  // Historical comparison checkouts predate the coding workspace and have no solutions.
  const references = fs.existsSync(path.join(root, 'coding', 'solutions')) && fs.existsSync(problemsFile)
    ? new Map(JSON.parse(fs.readFileSync(problemsFile, 'utf8')).map(p => [p.number, p.reference])) : null;
  // LeetCode's official difficulty for each problem; historical checkouts have none.
  const difficultyFile = path.join(root, 'coding', 'difficulty.json');
  const difficulties = fs.existsSync(difficultyFile) ? JSON.parse(fs.readFileSync(difficultyFile, 'utf8')) : null;
  for (const topic of TOPICS) {
    const folder = path.join(root, topic);
    for (const file of fs.readdirSync(folder).sort()) {
      const relative = `${topic}/${file}`;
      if (file.endsWith('.html')) visualizers.push(relative);
      if (!file.endsWith('.md')) continue;
      const match = file.match(/^(?:Leetcode\s+)?(\d+)[.\s]+(.+)\.md$/i);
      if (!match) { errors.push(`Unrecognized note: ${relative}`); continue; }
      const source = fs.readFileSync(path.join(root, relative), 'utf8');
      const embeds = [...source.matchAll(/<iframe\b[\s\S]*?\bsrc\s*=\s*["']([^"']+)["'][\s\S]*?<\/iframe\s*>/gi)];
      if (embeds.length > 1) errors.push(`Multiple visualizers in ${relative}`);
      let visualizerPath;
      if (embeds[0]) {
        const src = embeds[0][1];
        if (!allowAbsolute && /^(?:[a-z]+:|\/|\\)/i.test(src)) errors.push(`Nonportable iframe in ${relative}`);
        let name;
        try { name = decodeURIComponent(src.split(/[?#]/)[0].replace(/\\/g, '/').split('/').at(-1)); }
        catch { errors.push(`Invalid URL in ${relative}`); }
        if (!name || !name.endsWith('.html')) errors.push(`Invalid visualizer in ${relative}`);
        else {
          visualizerPath = `${topic}/${name}`;
          if (!fs.existsSync(path.join(root, visualizerPath))) errors.push(`Missing ${visualizerPath}`);
        }
      }
      const markdown = source.replace(iframe, '').trim();
      const number = Number(match[1]);
      const solutions = references ? solutionsSection(root, number, references, errors) : '';
      const difficulty = difficulties?.[number];
      if (difficulties && !DIFFICULTIES.includes(difficulty)) errors.push(`Missing difficulty for problem ${number}`);
      entries.push({ id: `leetcode:${number}`, number, title: match[2], topic, notePath: relative, markdown: markdown + solutions, searchText: `${match[1]} ${match[2]} ${topic} ${markdown}`.toLowerCase(), ...(difficulty ? { difficulty } : {}), ...(visualizerPath ? { visualizerPath } : {}) });
    }
  }
  for (const file of REFERENCES) {
    const markdown = fs.readFileSync(path.join(root, file), 'utf8').trim();
    entries.push({ id: file.startsWith('Leetcode') ? 'reference:cheatsheet' : 'reference:variables', title: file.replace('.md', ''), topic: 'Reference', notePath: file, markdown, searchText: `${file} ${markdown}`.toLowerCase() });
  }
  try {
    const metadata = JSON.parse(fs.readFileSync(path.join(root, TECHNIQUES_PATH), 'utf8'));
    const techniques = validateSolutionTechniques(metadata, entries.filter(entry => entry.number).map(entry => entry.id));
    for (const entry of entries) {
      if (!entry.number) continue;
      entry.solutionTechniques = techniques[entry.id];
      entry.searchText += ` ${entry.solutionTechniques.map(method => `${method.name} ${method.role}`).join(' ')}`.toLowerCase();
    }
  } catch (error) {
    errors.push(`${TECHNIQUES_PATH}: ${error.message}`);
  }
  const ids = new Set();
  for (const entry of entries) {
    if (ids.has(entry.id)) errors.push(`Duplicate problem ID: ${entry.id}`);
    ids.add(entry.id);
    // Fenced code is never a wiki link, e.g. [[time, id]] in a solution.
    for (const link of entry.markdown.replace(/```[\s\S]*?```/g, '').matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]+)?\]\]/g)) {
      const target = link[1].replace(/\.md$/i, '');
      if (!entries.some(e => e.title === target || e.notePath.replace(/\.md$/i, '') === target || path.basename(e.notePath, '.md') === target)) errors.push(`Unresolved wiki link ${target} in ${entry.notePath}`);
    }
  }
  if (difficulties) for (const number of Object.keys(difficulties)) if (!entries.some(e => e.number === Number(number))) errors.push(`Difficulty listed for unknown problem ${number}`);
  const linked = new Set(entries.map(e => e.visualizerPath).filter(Boolean));
  for (const file of visualizers) if (!linked.has(file)) errors.push(`Unlinked visualizer: ${file}`);
  // Historical checkouts predate the full LeetCode index and its method ladders.
  const indexed = fs.existsSync(path.join(root, INDEX_PATH)) ? collectIndex(root, entries, errors) : null;
  if (errors.length) throw new Error(errors.join('\n'));
  entries.sort((a, b) => (a.number ?? Infinity) - (b.number ?? Infinity) || a.title.localeCompare(b.title));
  return { version: 1, entries, topics: TOPICS, visualizers: visualizers.sort(), ...indexed };
}

// Every LeetCode problem without a bundled study kit is an index entry: its metadata, a link to
// leetcode.com and its solution methods. Each method's ladder runs from easiest to hardest.
export const INDEX_PATH = 'coding/leetcode-index.json';
export const METHODS_PATH = 'coding/solution-methods.json';
export const INDEX_TOPICS = ['Strings', 'Advanced Data Structures', 'Design', 'Divide & Conquer', 'Database', 'JavaScript', 'Concurrency', 'Shell'];
const CATEGORIES = new Set(['algorithms', 'database', 'javascript', 'concurrency', 'shell']);
export const MAX_METHODS = 3;
// Easy before Medium before Hard; within a difficulty, a higher acceptance rate comes first.
export function ladderOrder(a, b) {
  return DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty) || b.acceptance - a.acceptance || a.number - b.number;
}
export function collectIndex(root, entries, errors) {
  const problems = JSON.parse(fs.readFileSync(path.join(root, INDEX_PATH), 'utf8'));
  const { methods: definitions, problems: assigned } = JSON.parse(fs.readFileSync(path.join(root, METHODS_PATH), 'utf8'));
  const methods = new Map(), byNumber = new Map();
  for (const method of definitions) {
    const location = `${METHODS_PATH} method ${method.key}`;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(method.key ?? '')) errors.push(`Invalid key in ${location}`);
    if (methods.has(method.key)) errors.push(`Duplicate method ${method.key}`);
    if (!TECHNIQUE_KINDS.has(method.kind)) errors.push(`Invalid kind in ${location}`);
    if (![...TOPICS, ...INDEX_TOPICS].includes(method.topic)) errors.push(`Unknown topic in ${location}: ${method.topic}`);
    if (!method.name?.trim() || !method.summary?.trim()) errors.push(`Missing name or summary in ${location}`);
    methods.set(method.key, { key: method.key, name: method.name, kind: method.kind, topic: method.topic, summary: method.summary, ladder: [] });
  }
  for (const problem of problems) {
    const location = `${INDEX_PATH} problem ${problem.number}`;
    if (!Number.isInteger(problem.number) || problem.number < 1) { errors.push(`Invalid number in ${location}`); continue; }
    if (byNumber.has(problem.number)) errors.push(`Duplicate problem ${problem.number} in ${INDEX_PATH}`);
    if (!problem.title?.trim() || !/^[a-z0-9-]+$/.test(problem.slug ?? '')) errors.push(`Invalid title or slug in ${location}`);
    if (!DIFFICULTIES.includes(problem.difficulty)) errors.push(`Invalid difficulty in ${location}`);
    if (!(problem.acceptance >= 0 && problem.acceptance <= 100)) errors.push(`Invalid acceptance in ${location}`);
    if (typeof problem.premium !== 'boolean' || !CATEGORIES.has(problem.category) || !Array.isArray(problem.tags)) errors.push(`Invalid premium, category or tags in ${location}`);
    const keys = assigned[problem.number];
    if (!Array.isArray(keys) || keys.length < 1 || keys.length > MAX_METHODS) errors.push(`Problem ${problem.number} needs 1 to ${MAX_METHODS} solution methods`);
    else for (const key of keys) if (!methods.has(key)) errors.push(`Unknown solution method ${key} for problem ${problem.number}`);
    if (Array.isArray(keys) && new Set(keys).size !== keys.length) errors.push(`Duplicate solution method for problem ${problem.number}`);
    byNumber.set(problem.number, problem);
  }
  for (const number of Object.keys(assigned)) if (!byNumber.has(Number(number))) errors.push(`Solution methods listed for unknown problem ${number}`);
  const kits = new Map(entries.filter(entry => entry.number).map(entry => [entry.number, entry]));
  for (const [number, entry] of kits) {
    const problem = byNumber.get(number);
    if (!problem) errors.push(`Study kit ${number} is missing from ${INDEX_PATH}`);
    else if (entry.difficulty && entry.difficulty !== problem.difficulty) errors.push(`Difficulty of ${number} differs from ${INDEX_PATH}`);
  }
  if (errors.length) return null;
  const index = [];
  for (const problem of problems) {
    const keys = assigned[problem.number], names = keys.map(key => methods.get(key).name);
    const details = { slug: problem.slug, acceptance: problem.acceptance, premium: problem.premium, category: problem.category, tags: problem.tags, methods: keys };
    const kit = kits.get(problem.number);
    if (kit) { Object.assign(kit, details); kit.searchText += ` ${names.join(' ')}`.toLowerCase(); continue; }
    const topic = methods.get(keys[0]).topic;
    index.push({ id: `leetcode:${problem.number}`, number: problem.number, title: problem.title, topic, difficulty: problem.difficulty, notePath: '', markdown: '', indexOnly: true, ...details,
      searchText: `${problem.number} ${problem.title} ${topic} ${problem.tags.join(' ')} ${names.join(' ')}`.toLowerCase() });
  }
  for (const problem of [...problems].sort(ladderOrder)) for (const key of assigned[problem.number]) methods.get(key).ladder.push(`leetcode:${problem.number}`);
  const used = new Set([...TOPICS, ...index.map(entry => entry.topic)]);
  return { index, indexTopics: INDEX_TOPICS.filter(topic => used.has(topic)), methods: [...methods.values()].filter(method => method.ladder.length) };
}
export function buildContent(root = ROOT) {
  const catalog = collectCatalog(root);
  const out = path.join(root, 'dist/content');
  fs.mkdirSync(out, { recursive: true });
  for (const file of catalog.visualizers) {
    fs.mkdirSync(path.dirname(path.join(out, file)), { recursive: true });
    fs.copyFileSync(path.join(root, file), path.join(out, file));
  }
  fs.cpSync(path.join(root, 'visualizer-ui'), path.join(out, 'visualizer-ui'), { recursive: true });
  fs.writeFileSync(path.join(out, 'catalog.json'), JSON.stringify(catalog));
  return catalog;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const catalog = collectCatalog();
  console.log(`Validated ${catalog.entries.filter(e => e.number).length} problems, ${catalog.visualizers.length} visualizers, ${catalog.topics.length} topics and 2 reference guides.`);
  if (catalog.index) console.log(`Indexed ${catalog.index.length} more LeetCode problems and ${catalog.methods.length} solution-method ladders.`);
}
