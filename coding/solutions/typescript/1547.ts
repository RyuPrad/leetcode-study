function minCost(n: number, cuts: number[]): number {
  const points = [0, ...cuts.sort((a, b) => a - b), n];
  const m = points.length;
  const dp = Array.from({ length: m }, () => new Array<number>(m).fill(0));
  for (let gap = 2; gap < m; gap++) {
    for (let left = 0; left + gap < m; left++) {
      const right = left + gap;
      let best = Infinity;
      for (let mid = left + 1; mid < right; mid++) {
        best = Math.min(best, dp[left][mid] + dp[mid][right]);
      }
      dp[left][right] = best + points[right] - points[left];
    }
  }
  return dp[0][m - 1];
}
