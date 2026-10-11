function subsetXORSum(nums: number[]): number {
  let ans = 0;
  function dfs(i: number, xorSoFar: number): void {
    if (i === nums.length) {
      ans += xorSoFar;
      return;
    }
    dfs(i + 1, xorSoFar ^ nums[i]);
    dfs(i + 1, xorSoFar);
  }
  dfs(0, 0);
  return ans;
}
