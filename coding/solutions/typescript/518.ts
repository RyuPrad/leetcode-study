function change(amount: number, coins: number[]): number {
  const n = coins.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(amount + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = 1;
  for (let i = 1; i <= n; i++) {
    for (let a = 1; a <= amount; a++) {
      dp[i][a] = dp[i - 1][a];
      if (a >= coins[i - 1]) dp[i][a] += dp[i][a - coins[i - 1]];
    }
  }
  return dp[n][amount];
}
