import { spawnSync } from 'node:child_process';
for (const script of ['node_modules/electron/install.js', 'node_modules/playwright/cli.js']) {
  const result = spawnSync(process.execPath, [script, ...(script.includes('playwright') ? ['install', 'chromium'] : [])], { stdio: 'inherit', windowsHide: true });
  if (result.status !== 0) process.exit(result.status || 1);
}
// Java and C solutions use toolchains bundled into the Windows installer.
if (process.platform === 'win32') {
  const result = spawnSync(process.execPath, ['scripts/fetch-toolchains.mjs'], { stdio: 'inherit', windowsHide: true });
  if (result.status !== 0) process.exit(result.status || 1);
}
