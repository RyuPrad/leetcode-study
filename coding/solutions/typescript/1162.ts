function maxDistance(grid: number[][]): number {
  const n = grid.length;
  const dist = grid.map(row => row.map(value => (value === 1 ? 0 : -1)));
  const queue: number[][] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 1) {
        queue.push([r, c]);
      }
    }
  }
  if (queue.length === 0 || queue.length === n * n) {
    return -1;
  }
  let res = 0;
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && dist[nr][nc] === -1) {
        dist[nr][nc] = dist[r][c] + 1;
        res = Math.max(res, dist[nr][nc]);
        queue.push([nr, nc]);
      }
    }
  }
  return res;
}
