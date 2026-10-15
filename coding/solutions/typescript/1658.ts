function minOperations(nums: number[], x: number): number {
  const target = nums.reduce((a, b) => a + b, 0) - x;
  let left = 0, sum = 0, best = -1;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (left <= right && sum > target) {
      sum -= nums[left];
      left++;
    }
    if (sum === target) {
      best = Math.max(best, right - left + 1);
    }
  }
  return best === -1 ? -1 : nums.length - best;
}
