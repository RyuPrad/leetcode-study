function maxProfit(prices: number[]): number {
  let left = 0;
  let ans = 0;
  for (let right = 1; right < prices.length; right++) {
    if (prices[right] < prices[left]) {
      left = right;
    } else {
      ans = Math.max(ans, prices[right] - prices[left]);
    }
  }
  return ans;
}
