function numOfMinutes(n: number, headID: number, manager: number[], informTime: number[]): number {
  const reports: number[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    if (manager[i] !== -1) {
      reports[manager[i]].push(i);
    }
  }
  const queue: number[][] = [[headID, 0]];
  let res = 0;
  for (let head = 0; head < queue.length; head++) {
    const [id, time] = queue[head];
    res = Math.max(res, time);
    for (const next of reports[id]) {
      queue.push([next, time + informTime[id]]);
    }
  }
  return res;
}
