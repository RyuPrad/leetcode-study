function combinationSum4(nums: number[], target: number): number {
  const dp: number[] = new Array(target + 1).fill(0);
  dp[0] = 1;
  for (let t = 1; t <= target; t++) {
    for (const num of nums) {
      if (num <= t) dp[t] += dp[t - num];
    }
  }
  return dp[target];
}
