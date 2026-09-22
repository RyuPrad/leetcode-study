import fs from 'node:fs';
import path from 'node:path';
import { ROOT, TOPICS, collectCatalog } from './content.mjs';
// One-time, idempotent migration. Preserve originals before changing any source.
const catalog = collectCatalog(ROOT, { allowAbsolute: true });
const baseline = path.join(ROOT, '.baseline/content');
if (!fs.existsSync(baseline)) {
  fs.mkdirSync(baseline, { recursive: true });
  for (const topic of TOPICS) fs.cpSync(path.join(ROOT, topic), path.join(baseline, topic), { recursive: true });
}
for (const entry of catalog.entries) {
  const file = path.join(ROOT, entry.notePath);
  const original = fs.readFileSync(file, 'utf8');
  const next = original.replace(/(<iframe\b[\s\S]*?\bsrc\s*=\s*["'])([^"']+)(["'])/gi, (_all, prefix, src, quote) => `${prefix}${encodeURIComponent(decodeURIComponent(src.replace(/\\/g, '/').split('/').at(-1)))}${quote}`);
  if (next !== original) fs.writeFileSync(file, next);
}
for (const file of catalog.visualizers) {
  const full = path.join(ROOT, file);
  let html = fs.readFileSync(full, 'utf8');
  if (!html.includes('../visualizer-ui/workspace.js')) {
    html = html.replace('</head>', '  <link rel="stylesheet" href="../visualizer-ui/workspace.css" />\n  <script defer src="../visualizer-ui/workspace.js"></script>\n</head>');
    fs.writeFileSync(full, html);
  }
}
console.log(`Migrated ${catalog.visualizers.length} visualizers and their note references.`);
