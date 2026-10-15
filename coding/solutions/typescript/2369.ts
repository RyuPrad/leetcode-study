function validPartition(nums: number[]): boolean {
  const n = nums.length;
  const dp: boolean[] = new Array(n + 1).fill(false);
  dp[0] = true;
  for (let i = 2; i <= n; i++) {
    const a = nums[i - 1], b = nums[i - 2];
    if (a === b && dp[i - 2]) {
      dp[i] = true;
    }
    if (i >= 3 && dp[i - 3]) {
      const c = nums[i - 3];
      if ((a === b && b === c) || (a === b + 1 && b === c + 1)) {
        dp[i] = true;
      }
    }
  }
  return dp[n];
}
