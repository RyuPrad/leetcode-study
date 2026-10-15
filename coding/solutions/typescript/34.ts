function searchRange(nums: number[], target: number): number[] {
  const bound = (leftBias: boolean): number => {
    let left = 0, right = nums.length - 1, res = -1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (nums[mid] < target) {
        left = mid + 1;
      } else if (nums[mid] > target) {
        right = mid - 1;
      } else {
        res = mid;
        if (leftBias) {
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      }
    }
    return res;
  };
  const first = bound(true);
  const last = bound(false);
  return [first, last];
}
