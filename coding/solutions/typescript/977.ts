function sortedSquares(nums: number[]): number[] {
  const res: number[] = new Array(nums.length).fill(0);
  let left = 0, right = nums.length - 1;
  for (let i = nums.length - 1; i >= 0; i--) {
    if (Math.abs(nums[left]) > Math.abs(nums[right])) {
      res[i] = nums[left] * nums[left];
      left++;
    } else {
      res[i] = nums[right] * nums[right];
      right--;
    }
  }
  return res;
}
