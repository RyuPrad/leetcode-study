function findTargetSumWays(nums: number[], target: number): number {
  const total = nums.reduce((a, b) => a + b, 0);
  if (Math.abs(target) > total || (total + target) % 2 !== 0) return 0;
  const subsetSum = (total + target) / 2;
  const dp: number[] = new Array(subsetSum + 1).fill(0);
  dp[0] = 1;
  for (const num of nums) {
    for (let s = subsetSum; s >= num; s--) {
      dp[s] += dp[s - num];
    }
  }
  return dp[subsetSum];
}
