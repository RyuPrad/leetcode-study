function tribonacci(n: number): number {
  if (n === 0) return 0;
  if (n <= 2) return 1;
  const dp: number[] = new Array(n + 1).fill(0);
  dp[0] = 0;
  dp[1] = 1;
  dp[2] = 1;
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2] + dp[i - 3];
  }
  return dp[n];
}
