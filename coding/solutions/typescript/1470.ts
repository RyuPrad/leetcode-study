function shuffle(nums: number[], n: number): number[] {
  for (let i = 0; i < n; i++) {
    nums[i] = (nums[i] << 10) | nums[n + i];
  }
  let j = 2 * n - 1;
  for (let i = n - 1; i >= 0; i--) {
    const y = nums[i] & 1023;
    const x = nums[i] >> 10;
    nums[j] = y;
    nums[j - 1] = x;
    j -= 2;
  }
  return nums;
}
