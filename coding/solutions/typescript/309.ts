function maxProfit(prices: number[]): number {
  const n = prices.length;
  if (n === 0) return 0;
  const hold: number[] = new Array(n).fill(0);
  const sold: number[] = new Array(n).fill(0);
  const rest: number[] = new Array(n).fill(0);
  hold[0] = -prices[0];
  for (let i = 1; i < n; i++) {
    hold[i] = Math.max(hold[i - 1], rest[i - 1] - prices[i]);
    sold[i] = hold[i - 1] + prices[i];
    rest[i] = Math.max(rest[i - 1], sold[i - 1]);
  }
  return Math.max(sold[n - 1], rest[n - 1]);
}
