function maxCoins(nums: number[]): number {
  const balloons = [1, ...nums, 1];
  const n = balloons.length;
  const dp: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let len = 2; len < n; len++) {
    for (let left = 0; left + len < n; left++) {
      const right = left + len;
      for (let k = left + 1; k < right; k++) {
        dp[left][right] = Math.max(
          dp[left][right],
          balloons[left] * balloons[k] * balloons[right] + dp[left][k] + dp[k][right]
        );
      }
    }
  }
  return dp[0][n - 1];
}
