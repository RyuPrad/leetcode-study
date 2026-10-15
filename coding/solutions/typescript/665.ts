function checkPossibility(nums: number[]): boolean {
  let changed = false;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] >= nums[i - 1]) {
      continue;
    }
    if (changed) {
      return false;
    }
    changed = true;
    if (i < 2 || nums[i - 2] <= nums[i]) {
      nums[i - 1] = nums[i];
    } else {
      nums[i] = nums[i - 1];
    }
  }
  return true;
}
