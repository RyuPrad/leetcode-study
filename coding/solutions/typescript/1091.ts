function shortestPathBinaryMatrix(grid: number[][]): number {
  const n = grid.length;
  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) {
    return -1;
  }
  const dist = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  dist[0][0] = 1;
  const queue: number[][] = [[0, 0]];
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    if (r === n - 1 && c === n - 1) {
      return dist[r][c];
    }
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 0 && dist[nr][nc] === 0) {
          dist[nr][nc] = dist[r][c] + 1;
          queue.push([nr, nc]);
        }
      }
    }
  }
  return -1;
}
