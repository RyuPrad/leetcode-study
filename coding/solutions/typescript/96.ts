function numTrees(n: number): number {
  const dp = new Array<number>(n + 1).fill(0);
  dp[0] = 1;
  for (let nodes = 1; nodes <= n; nodes++) {
    for (let root = 1; root <= nodes; root++) {
      dp[nodes] += dp[root - 1] * dp[nodes - root];
    }
  }
  return dp[n];
}
