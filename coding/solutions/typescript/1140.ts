function stoneGameII(piles: number[]): number {
  const n = piles.length;
  const suffix: number[] = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + piles[i];
  const dp: number[][] = Array.from({ length: n }, () => new Array<number>(n + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let m = 1; m <= n; m++) {
      if (i + 2 * m >= n) {
        dp[i][m] = suffix[i];
      } else {
        let best = 0;
        for (let x = 1; x <= 2 * m; x++) {
          best = Math.max(best, suffix[i] - dp[i + x][Math.max(m, x)]);
        }
        dp[i][m] = best;
      }
    }
  }
  return dp[0][1];
}
