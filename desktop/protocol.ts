import path from 'node:path';
import fs from 'node:fs';
import type { Catalog } from '../shared/types';
export function assetPath(urlString: string, root: string, catalog: Catalog): string | null {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'study:' || url.username || url.password || url.port) return null;
    const relative = decodeURIComponent(url.pathname).replace(/^\//, '');
    if (!relative || relative.includes('\\') || relative.includes('\0') || relative.split('/').some(s => s === '..' || s === '.')) return null;
    if (url.hostname === 'content') {
      if (!catalog.visualizers.includes(relative) && !['visualizer-ui/panel-layout.js', 'visualizer-ui/panel-layout.css', 'visualizer-ui/workspace.js', 'visualizer-ui/workspace.css', 'visualizer-ui/numeric-input.js', 'visualizer-ui/learning.js', 'visualizer-ui/learning.css', 'visualizer-ui/object-view.js', 'visualizer-ui/object-view.css', 'visualizer-ui/object-state.js', 'visualizer-ui/operations.js', 'visualizer-ui/operation-rules.js', 'visualizer-ui/guided-core.js', 'visualizer-ui/guided.js', 'visualizer-ui/guided.css', 'visualizer-ui/guided-lessons.js'].includes(relative)) return null;
      return path.join(root, 'content', relative);
    }
    if (url.hostname === 'app' && (relative === 'index.html' || /^assets\/[a-zA-Z0-9_.-]+$/.test(relative))) {
      const file = path.join(root, 'renderer', relative);
      return fs.existsSync(file) ? file : null;
    }
    return null;
  } catch { return null; }
}
export const rendererPolicy = "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src study://content; base-uri 'none'; object-src 'none'";
export const contentPolicy = "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; frame-src 'none'; base-uri 'none'; object-src 'none'";
