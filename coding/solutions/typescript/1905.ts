function countSubIslands(grid1: number[][], grid2: number[][]): number {
  const m = grid2.length, n = grid2[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let res = 0;
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid2[r][c] !== 1) {
        continue;
      }
      let sub = true;
      const stack: number[][] = [[r, c]];
      grid2[r][c] = 0;
      while (stack.length) {
        const [y, x] = stack.pop()!;
        if (grid1[y][x] === 0) {
          sub = false;
        }
        for (const [dy, dx] of dirs) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < m && nx >= 0 && nx < n && grid2[ny][nx] === 1) {
            grid2[ny][nx] = 0;
            stack.push([ny, nx]);
          }
        }
      }
      if (sub) {
        res++;
      }
    }
  }
  return res;
}
