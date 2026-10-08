import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const TOPICS = ['Array & Hashing', 'Two Pointers', 'Sliding Window', 'Stack', 'Binary Search', 'LinkedList', 'Trees', 'BST', 'Tries', 'Heap', 'Backtracking', 'Graphs', 'Advanced Graphs', '1-D Dynamic Programming', '2-D Dynamic Programming', 'Greedy', 'Intervals', 'Math & Geometry', 'Bit Manipulation', 'Queue'];
const REFERENCES = ['Leetcode Cheatsheet.md', 'Variable Naming Guide.md'];
const iframe = /<iframe\b[\s\S]*?<\/iframe\s*>/gi;
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
      entries.push({ id: `leetcode:${Number(match[1])}`, number: Number(match[1]), title: match[2], topic, notePath: relative, markdown, searchText: `${match[1]} ${match[2]} ${topic} ${markdown}`.toLowerCase(), ...(visualizerPath ? { visualizerPath } : {}) });
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
    for (const link of entry.markdown.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]+)?\]\]/g)) {
      const target = link[1].replace(/\.md$/i, '');
      if (!entries.some(e => e.title === target || e.notePath.replace(/\.md$/i, '') === target || path.basename(e.notePath, '.md') === target)) errors.push(`Unresolved wiki link ${target} in ${entry.notePath}`);
    }
  }
  const linked = new Set(entries.map(e => e.visualizerPath).filter(Boolean));
  for (const file of visualizers) if (!linked.has(file)) errors.push(`Unlinked visualizer: ${file}`);
  if (errors.length) throw new Error(errors.join('\n'));
  entries.sort((a, b) => (a.number ?? Infinity) - (b.number ?? Infinity) || a.title.localeCompare(b.title));
  return { version: 1, entries, topics: TOPICS, visualizers: visualizers.sort() };
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
}
