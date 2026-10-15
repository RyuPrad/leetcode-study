function shiftGrid(grid: number[][], k: number): number[][] {
  const m = grid.length, n = grid[0].length, total = m * n;
  const res = Array.from({ length: m }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < total; i++) {
    const target = (i + k) % total;
    res[Math.floor(target / n)][target % n] = grid[Math.floor(i / n)][i % n];
  }
  return res;
}
