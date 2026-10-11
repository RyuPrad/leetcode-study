function maxProduct(nums: number[]): number {
  let res = nums[0];
  let curMax = nums[0];
  let curMin = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const n = nums[i];
    const tmpMax = Math.max(n, curMax * n, curMin * n);
    curMin = Math.min(n, curMax * n, curMin * n);
    curMax = tmpMax;
    res = Math.max(res, curMax);
  }
  return res;
}
