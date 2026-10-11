function canPartitionKSubsets(nums: number[], k: number): boolean {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % k !== 0) return false;
  const target = total / k;
  nums.sort((a, b) => b - a);
  if (nums[0] > target) return false;
  const used: boolean[] = new Array(nums.length).fill(false);
  function dfs(start: number, k: number, curSum: number): boolean {
    if (k === 0) return true;
    if (curSum === target) return dfs(0, k - 1, 0);
    for (let i = start; i < nums.length; i++) {
      if (used[i] || curSum + nums[i] > target) continue;
      used[i] = true;
      if (dfs(i + 1, k, curSum + nums[i])) return true;
      used[i] = false;
    }
    return false;
  }
  return dfs(0, k, 0);
}
