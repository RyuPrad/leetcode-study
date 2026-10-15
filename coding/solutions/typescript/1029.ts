function twoCitySchedCost(costs: number[][]): number {
  costs.sort((a, b) => (a[0] - a[1]) - (b[0] - b[1]));
  const n = costs.length / 2;
  let res = 0;
  for (let i = 0; i < n; i++) {
    res += costs[i][0] + costs[n + i][1];
  }
  return res;
}
