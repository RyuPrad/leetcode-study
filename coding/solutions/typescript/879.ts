function profitableSchemes(n: number, minProfit: number, group: number[], profit: number[]): number {
  const MOD = 1000000007;
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(minProfit + 1).fill(0));
  dp[0][0] = 1;
  for (let c = 0; c < group.length; c++) {
    const g = group[c], p = profit[c];
    for (let members = n; members >= g; members--) {
      for (let earned = minProfit; earned >= 0; earned--) {
        const capped = Math.min(minProfit, earned + p);
        dp[members][capped] = (dp[members][capped] + dp[members - g][earned]) % MOD;
      }
    }
  }
  let res = 0;
  for (let members = 0; members <= n; members++) {
    res = (res + dp[members][minProfit]) % MOD;
  }
  return res;
}
