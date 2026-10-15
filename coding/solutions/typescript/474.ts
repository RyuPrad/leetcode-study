function findMaxForm(strs: string[], m: number, n: number): number {
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (const str of strs) {
    const zeros = [...str].filter(ch => ch === '0').length;
    const ones = str.length - zeros;
    for (let i = m; i >= zeros; i--) {
      for (let j = n; j >= ones; j--) {
        dp[i][j] = Math.max(dp[i][j], dp[i - zeros][j - ones] + 1);
      }
    }
  }
  return dp[m][n];
}
