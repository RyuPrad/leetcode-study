function minimizeArrayValue(nums: number[]): number {
  let prefix = 0, res = 0;
  for (let i = 0; i < nums.length; i++) {
    prefix += nums[i];
    res = Math.max(res, Math.ceil(prefix / (i + 1)));
  }
  return res;
}
