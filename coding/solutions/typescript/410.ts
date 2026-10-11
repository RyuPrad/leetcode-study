function splitArray(nums: number[], k: number): number {
  let left = Math.max(...nums);
  let right = nums.reduce((a, b) => a + b, 0);
  let ans = right;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    let pieces = 1;
    let cur = 0;
    for (const num of nums) {
      if (cur + num > mid) {
        pieces++;
        cur = 0;
      }
      cur += num;
    }
    if (pieces <= k) {
      ans = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return ans;
}
