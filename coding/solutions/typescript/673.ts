function findNumberOfLIS(nums: number[]): number {
  const n = nums.length;
  const length: number[] = new Array(n).fill(1);
  const count: number[] = new Array(n).fill(1);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] >= nums[i]) {
        continue;
      }
      if (length[j] + 1 > length[i]) {
        length[i] = length[j] + 1;
        count[i] = count[j];
      } else if (length[j] + 1 === length[i]) {
        count[i] += count[j];
      }
    }
  }
  const longest = Math.max(...length);
  let res = 0;
  for (let i = 0; i < n; i++) {
    if (length[i] === longest) {
      res += count[i];
    }
  }
  return res;
}
