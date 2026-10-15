function gridGame(grid: number[][]): number {
  const n = grid[0].length;
  let top = grid[0].reduce((a, b) => a + b, 0), bottom = 0, res = Infinity;
  for (let i = 0; i < n; i++) {
    top -= grid[0][i];
    res = Math.min(res, Math.max(top, bottom));
    bottom += grid[1][i];
  }
  return res;
}
