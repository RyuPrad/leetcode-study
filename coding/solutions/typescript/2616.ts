function minimizeMax(nums: number[], p: number): number {
  nums.sort((a, b) => a - b);
  let left = 0, right = nums[nums.length - 1] - nums[0];
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    let pairs = 0;
    for (let i = 0; i + 1 < nums.length; i++) {
      if (nums[i + 1] - nums[i] <= mid) {
        pairs++;
        i++;
      }
    }
    if (pairs >= p) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  return left;
}
