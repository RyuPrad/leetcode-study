function minCost(costs: number[][]): number {
  let dp = costs[0].slice();
  for (let i = 1; i < costs.length; i++) {
    const red = costs[i][0] + Math.min(dp[1], dp[2]);
    const blue = costs[i][1] + Math.min(dp[0], dp[2]);
    const green = costs[i][2] + Math.min(dp[0], dp[1]);
    dp = [red, blue, green];
  }
  return Math.min(...dp);
}
