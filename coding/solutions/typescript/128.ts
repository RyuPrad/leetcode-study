function longestConsecutive(nums: number[]): number {
  const seen = new Set(nums);
  let ans = 0;
  for (const num of seen) {
    if (!seen.has(num - 1)) {
      let curr = num;
      let length = 1;
      while (seen.has(curr + 1)) {
        curr++;
        length++;
      }
      ans = Math.max(ans, length);
    }
  }
  return ans;
}
