function removeDuplicates(nums: number[]): number {
  let left = 0;
  for (let right = 0; right < nums.length; right++) {
    if (left < 2 || nums[right] !== nums[left - 2]) {
      nums[left] = nums[right];
      left++;
    }
  }
  return left;
}
