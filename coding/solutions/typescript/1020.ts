function numEnclaves(grid: number[][]): number {
  const m = grid.length, n = grid[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const stack: number[][] = [];
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 1 && (r === 0 || r === m - 1 || c === 0 || c === n - 1)) {
        grid[r][c] = 0;
        stack.push([r, c]);
      }
    }
  }
  while (stack.length) {
    const [y, x] = stack.pop()!;
    for (const [dy, dx] of dirs) {
      const ny = y + dy, nx = x + dx;
      if (ny >= 0 && ny < m && nx >= 0 && nx < n && grid[ny][nx] === 1) {
        grid[ny][nx] = 0;
        stack.push([ny, nx]);
      }
    }
  }
  let res = 0;
  for (const row of grid) {
    for (const value of row) {
      res += value;
    }
  }
  return res;
}
