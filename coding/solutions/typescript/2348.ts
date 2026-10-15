function zeroFilledSubarray(nums: number[]): number {
  let res = 0, run = 0;
  for (const num of nums) {
    if (num === 0) {
      run++;
      res += run;
    } else {
      run = 0;
    }
  }
  return res;
}
