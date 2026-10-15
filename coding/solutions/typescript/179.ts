function largestNumber(nums: number[]): string {
  const strs = nums.map(String);
  strs.sort((a, b) => (a + b > b + a ? -1 : a + b < b + a ? 1 : 0));
  const res = strs.join('');
  return res[0] === '0' ? '0' : res;
}
