function numMusicPlaylists(n: number, goal: number, k: number): number {
  const MOD = 1000000007;
  const dp = Array.from({ length: goal + 1 }, () => new Array<number>(n + 1).fill(0));
  dp[0][0] = 1;
  for (let i = 1; i <= goal; i++) {
    for (let j = 1; j <= Math.min(i, n); j++) {
      const fresh = dp[i - 1][j - 1] * (n - j + 1);
      const replay = dp[i - 1][j] * Math.max(j - k, 0);
      dp[i][j] = (fresh + replay) % MOD;
    }
  }
  return dp[goal][n];
}
