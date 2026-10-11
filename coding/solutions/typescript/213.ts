function rob(nums: number[]): number {
  const n = nums.length;
  if (n === 1) return nums[0];
  const robLine = (arr: number[]): number => {
    let prev = 0, curr = 0;
    for (const x of arr) {
      const next = Math.max(curr, prev + x);
      prev = curr;
      curr = next;
    }
    return curr;
  };
  return Math.max(robLine(nums.slice(0, n - 1)), robLine(nums.slice(1)));
}
