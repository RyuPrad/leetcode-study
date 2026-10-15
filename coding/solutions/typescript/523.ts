function checkSubarraySum(nums: number[], k: number): boolean {
  const firstIndex = new Map<number, number>([[0, -1]]);
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum = (sum + nums[i]) % k;
    if (firstIndex.has(sum)) {
      if (i - firstIndex.get(sum)! >= 2) {
        return true;
      }
    } else {
      firstIndex.set(sum, i);
    }
  }
  return false;
}
