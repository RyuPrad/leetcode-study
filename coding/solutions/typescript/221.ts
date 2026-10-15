function maximalSquare(matrix: string[][]): number {
  const m = matrix.length, n = matrix[0].length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  let side = 0;
  for (let r = 1; r <= m; r++) {
    for (let c = 1; c <= n; c++) {
      if (matrix[r - 1][c - 1] === '1') {
        dp[r][c] = 1 + Math.min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1]);
        side = Math.max(side, dp[r][c]);
      }
    }
  }
  return side * side;
}
