function rearrangeArray(nums: number[]): number[] {
  nums.sort((a, b) => a - b);
  const res: number[] = [];
  let left = 0, right = nums.length - 1;
  while (res.length < nums.length) {
    res.push(nums[left]);
    left++;
    if (left <= right) {
      res.push(nums[right]);
      right--;
    }
  }
  return res;
}
