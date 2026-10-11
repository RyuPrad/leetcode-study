function uniquePathsWithObstacles(grid: number[][]): number {
  const m = grid.length, n = grid[0].length;
  const dp: number[][] = Array.from({ length: m }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 1) { dp[i][j] = 0; continue; }
      if (i === 0 && j === 0) { dp[i][j] = 1; continue; }
      if (i > 0) dp[i][j] += dp[i - 1][j];
      if (j > 0) dp[i][j] += dp[i][j - 1];
    }
  }
  return dp[m - 1][n - 1];
}
