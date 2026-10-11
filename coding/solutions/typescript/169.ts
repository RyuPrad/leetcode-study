function majorityElement(nums: number[]): number {
  let count = 0;
  let ans = 0;
  for (const num of nums) {
    if (count === 0) {
      ans = num;
    }
    count += (num === ans) ? 1 : -1;
  }
  return ans;
}
