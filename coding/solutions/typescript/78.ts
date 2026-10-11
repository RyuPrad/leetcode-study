function subsets(nums: number[]): number[][] {
  const res: number[][] = [];
  const path: number[] = [];
  function dfs(i: number): void {
    if (i === nums.length) {
      res.push([...path]);
      return;
    }
    path.push(nums[i]);
    dfs(i + 1);
    path.pop();
    dfs(i + 1);
  }
  dfs(0);
  return res;
}
