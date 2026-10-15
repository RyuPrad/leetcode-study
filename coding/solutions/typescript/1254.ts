function closedIsland(grid: number[][]): number {
  const m = grid.length, n = grid[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let res = 0;
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== 0) {
        continue;
      }
      let closed = true;
      const stack: number[][] = [[r, c]];
      grid[r][c] = 1;
      while (stack.length) {
        const [y, x] = stack.pop()!;
        if (y === 0 || y === m - 1 || x === 0 || x === n - 1) {
          closed = false;
        }
        for (const [dy, dx] of dirs) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < m && nx >= 0 && nx < n && grid[ny][nx] === 0) {
            grid[ny][nx] = 1;
            stack.push([ny, nx]);
          }
        }
      }
      if (closed) {
        res++;
      }
    }
  }
  return res;
}
