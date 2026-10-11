import os from 'node:os';
// How many pages or processes a suite runs at once. STUDY_TEST_WORKERS wins; otherwise as many
// as the cores and free memory allow, leaving two cores for the system.
export function workers({ perWorkerMB = 400, max = 16 } = {}) {
  const forced = Number(process.env.STUDY_TEST_WORKERS);
  if (Number.isInteger(forced) && forced > 0) return forced;
  const byMemory = Math.floor(os.freemem() / 1048576 / perWorkerMB);
  return Math.max(1, Math.min(os.cpus().length - 2, byMemory, max));
}
