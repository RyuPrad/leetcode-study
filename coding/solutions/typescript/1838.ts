function maxFrequency(nums: number[], k: number): number {
  nums.sort((a, b) => a - b);
  let left = 0, total = 0, res = 0;
  for (let right = 0; right < nums.length; right++) {
    total += nums[right];
    while (nums[right] * (right - left + 1) > total + k) {
      total -= nums[left];
      left++;
    }
    res = Math.max(res, right - left + 1);
  }
  return res;
}
