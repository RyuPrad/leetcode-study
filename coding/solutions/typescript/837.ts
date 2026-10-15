function new21Game(n: number, k: number, maxPts: number): number {
  if (k === 0 || n >= k + maxPts - 1) {
    return 1;
  }
  const dp: number[] = new Array(n + 1).fill(0);
  dp[0] = 1;
  let window = 1, res = 0;
  for (let i = 1; i <= n; i++) {
    dp[i] = window / maxPts;
    if (i < k) {
      window += dp[i];
    } else {
      res += dp[i];
    }
    if (i - maxPts >= 0 && i - maxPts < k) {
      window -= dp[i - maxPts];
    }
  }
  return res;
}
