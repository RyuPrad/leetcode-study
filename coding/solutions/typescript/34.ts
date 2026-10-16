function searchRange(nums: number[], target: number): number[] {
  let left = 0;
  let right = nums.length;
  // Lower bound: first index whose value is at least target.
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  const first = left;
  left = 0;
  right = nums.length;
  // Upper bound: first index whose value is greater than target.
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] <= target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  const afterLast = left;
  if (first === nums.length || nums[first] !== target) {
    return [-1, -1];
  }
  return [first, afterLast - 1];
}
