// Downloads the pinned Java and C toolchains that the installer ships for offline Java/C
// solutions, verifies their SHA-256, and prepares toolchains/java and toolchains/c.
// Windows only: it uses the system tar.exe for zip archives and the JDK's jlink.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from './content.mjs';

const TOOLCHAINS = path.join(ROOT, 'toolchains');
const DOWNLOADS = path.join(TOOLCHAINS, '.downloads');
// Eclipse Temurin JDK 21 LTS; trimmed with jlink to the runtime and the compiler API.
const java = {
  version: '21.0.12.1+1',
  file: 'OpenJDK21U-jdk_x64_windows_hotspot_21.0.12.1_1.zip',
  url: 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jdk_x64_windows_hotspot_21.0.12.1_1.zip',
  sha256: 'f9d6e191ab098c0d416e7d588a24420a8621cd2f4720dab2459b8b7b2d2d8b4e',
  root: 'jdk-21.0.12.1+1'
};
// Tiny C Compiler, the latest official Windows x64 release, plus uthash as LeetCode provides it.
const c = {
  version: '0.9.27+uthash-2.3.0',
  file: 'tcc-0.9.27-win64-bin.zip',
  url: 'https://download.savannah.gnu.org/releases/tinycc/tcc-0.9.27-win64-bin.zip',
  sha256: '34a721949a2583fdff725312da092fa0f5f1f284b702e6f811c6954714faabb2',
  root: 'tcc'
};
const uthash = {
  file: 'uthash-2.3.0.h',
  url: 'https://raw.githubusercontent.com/troydhanson/uthash/v2.3.0/src/uthash.h',
  sha256: '344175d0ae3d0d7651887f932fc224f6d133559f0fc83ee73fe641697d77211a'
};

const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', windowsHide: true });
  if (result.status !== 0) throw new Error(`${path.basename(command)} failed with exit code ${result.status}.`);
}
async function download({ file, url, sha256: expected }) {
  const target = path.join(DOWNLOADS, file);
  if (fs.existsSync(target) && sha256(target) === expected) return target;
  console.log(`Downloading ${url}`);
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
  const temp = `${target}.partial`;
  fs.writeFileSync(temp, Buffer.from(await response.arrayBuffer()));
  const actual = sha256(temp);
  if (actual !== expected) { fs.rmSync(temp, { force: true }); throw new Error(`Checksum mismatch for ${file}: expected ${expected}, received ${actual}.`); }
  fs.renameSync(temp, target);
  return target;
}
function extract(archive) {
  const work = fs.mkdtempSync(path.join(TOOLCHAINS, '.work-'));
  run(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe'), ['-xf', archive, '-C', work]);
  return work;
}
const current = (name, version) => { try { return fs.readFileSync(path.join(TOOLCHAINS, name, '.version'), 'utf8') === version; } catch { return false; } };

if (process.platform !== 'win32') throw new Error('Toolchains are prepared on Windows, the only packaged platform.');
fs.mkdirSync(DOWNLOADS, { recursive: true });

if (!current('java', java.version)) {
  const work = extract(await download(java)), output = path.join(TOOLCHAINS, 'java');
  try {
    fs.rmSync(output, { recursive: true, force: true });
    run(path.join(work, java.root, 'bin', 'jlink.exe'), ['--add-modules', 'java.base,jdk.compiler', '--strip-debug', '--no-man-pages', '--no-header-files', '--compress=zip-6', '--output', output]);
    fs.writeFileSync(path.join(output, '.version'), java.version);
  } finally { fs.rmSync(work, { recursive: true, force: true }); }
  console.log(`Java ${java.version} prepared in toolchains/java`);
}

if (!current('c', c.version)) {
  const archive = await download(c), header = await download(uthash), work = extract(archive), output = path.join(TOOLCHAINS, 'c');
  try {
    fs.rmSync(output, { recursive: true, force: true });
    fs.renameSync(path.join(work, c.root), output);
    // Examples, docs and the 32-bit cross compiler are not shipped; tcc.exe needs libtcc.dll.
    for (const unused of ['examples', 'doc', 'i386-win32-tcc.exe', 'libtcc', 'lib/libtcc1-32.a']) fs.rmSync(path.join(output, unused), { recursive: true, force: true });
    fs.copyFileSync(header, path.join(output, 'include', 'uthash.h'));
    fs.writeFileSync(path.join(output, '.version'), c.version);
  } finally { fs.rmSync(work, { recursive: true, force: true }); }
  console.log(`C ${c.version} prepared in toolchains/c`);
}
