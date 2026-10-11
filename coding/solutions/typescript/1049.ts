function lastStoneWeightII(stones: number[]): number {
  const total = stones.reduce((a, b) => a + b, 0);
  const target = Math.floor(total / 2);
  const dp: number[] = new Array(target + 1).fill(0);
  for (const stone of stones) {
    for (let j = target; j >= stone; j--) {
      dp[j] = Math.max(dp[j], dp[j - stone] + stone);
    }
  }
  return total - 2 * dp[target];
}
