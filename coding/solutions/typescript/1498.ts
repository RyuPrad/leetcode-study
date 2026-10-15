function numSubseq(nums: number[], target: number): number {
  const MOD = 1000000007;
  nums.sort((a, b) => a - b);
  const pow: number[] = [1];
  for (let i = 1; i < nums.length; i++) {
    pow.push((pow[i - 1] * 2) % MOD);
  }
  let left = 0, right = nums.length - 1, res = 0;
  while (left <= right) {
    if (nums[left] + nums[right] > target) {
      right--;
    } else {
      res = (res + pow[right - left]) % MOD;
      left++;
    }
  }
  return res;
}
