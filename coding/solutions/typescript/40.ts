function combinationSum2(candidates: number[], target: number): number[][] {
  candidates.sort((a, b) => a - b);
  const res: number[][] = [];
  const path: number[] = [];
  function dfs(start: number, remain: number): void {
    if (remain === 0) {
      res.push([...path]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (i > start && candidates[i] === candidates[i - 1]) continue;
      if (candidates[i] > remain) break;
      path.push(candidates[i]);
      dfs(i + 1, remain - candidates[i]);
      path.pop();
    }
  }
  dfs(0, target);
  return res;
}
