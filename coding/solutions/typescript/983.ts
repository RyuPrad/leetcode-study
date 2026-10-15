function mincostTickets(days: number[], costs: number[]): number {
  const last = days[days.length - 1];
  const travel = new Set(days);
  const dp: number[] = new Array(last + 1).fill(0);
  for (let d = 1; d <= last; d++) {
    if (!travel.has(d)) {
      dp[d] = dp[d - 1];
      continue;
    }
    const day = dp[d - 1] + costs[0];
    const week = dp[Math.max(0, d - 7)] + costs[1];
    const month = dp[Math.max(0, d - 30)] + costs[2];
    dp[d] = Math.min(day, week, month);
  }
  return dp[last];
}
