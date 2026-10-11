function getConcatenation(nums: number[]): number[] {
  const res: number[] = new Array(nums.length * 2);

  for (let i = 0; i < nums.length; i++) {
    res[i] = nums[i];
    res[i + nums.length] = nums[i];
  }

  return res;
}
