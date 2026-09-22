import { build } from 'esbuild';
import { build as viteBuild } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ROOT, buildContent } from './content.mjs';
import { checkLessons } from './check-lessons.mjs';
import { buildGuided } from './check-guided.mjs';
import { buildOperations } from './check-operations.mjs';
import { fileURLToPath } from 'node:url';
export async function buildDesktop() {
  checkLessons();
  buildGuided();
  buildOperations();
  buildContent();
  await build({ entryPoints: ['desktop/main.ts', 'desktop/preload.ts'], outdir: 'dist/desktop', outExtension: { '.js': '.cjs' }, bundle: true, platform: 'node', format: 'cjs', target: 'node24', external: ['electron'], sourcemap: true });
  const png = await sharp(path.join(ROOT, 'build/icon.svg')).resize(256, 256).png().toBuffer();
  fs.writeFileSync(path.join(ROOT, 'dist/icon.png'), png);
  fs.writeFileSync(path.join(ROOT, 'build/icon.png'), png);
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4); header[6] = 0; header[7] = 0; header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12); header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18);
  fs.writeFileSync(path.join(ROOT, 'build/icon.ico'), Buffer.concat([header, png]));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) { await buildDesktop(); await viteBuild(); }
