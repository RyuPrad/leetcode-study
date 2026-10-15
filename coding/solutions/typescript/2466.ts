function countGoodStrings(low: number, high: number, zero: number, one: number): number {
  const MOD = 1000000007;
  const dp: number[] = new Array(high + 1).fill(0);
  dp[0] = 1;
  let res = 0;
  for (let len = 1; len <= high; len++) {
    if (len >= zero) {
      dp[len] = (dp[len] + dp[len - zero]) % MOD;
    }
    if (len >= one) {
      dp[len] = (dp[len] + dp[len - one]) % MOD;
    }
    if (len >= low) {
      res = (res + dp[len]) % MOD;
    }
  }
  return res;
}
