function minimumDifference(nums: number[], k: number): number {
  nums.sort((a, b) => a - b);
  let res = Infinity;
  for (let left = 0; left + k - 1 < nums.length; left++) {
    const right = left + k - 1;
    res = Math.min(res, nums[right] - nums[left]);
  }
  return res;
}
