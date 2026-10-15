function numWays(words: string[], target: string): number {
  const MOD = 1000000007;
  const len = words[0].length, m = target.length;
  const count = Array.from({ length: len }, () => new Array<number>(26).fill(0));
  for (const word of words) {
    for (let c = 0; c < len; c++) {
      count[c][word.charCodeAt(c) - 97]++;
    }
  }
  const dp: number[] = new Array(m + 1).fill(0);
  dp[0] = 1;
  for (let c = 0; c < len; c++) {
    for (let t = Math.min(m, c + 1); t >= 1; t--) {
      const ways = count[c][target.charCodeAt(t - 1) - 97];
      dp[t] = (dp[t] + dp[t - 1] * ways) % MOD;
    }
  }
  return dp[m];
}
