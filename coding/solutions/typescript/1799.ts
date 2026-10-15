function maxScore(nums: number[]): number {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const m = nums.length, full = (1 << m) - 1;
  const dp: number[] = new Array(full + 1).fill(0);
  for (let mask = 0; mask < full; mask++) {
    const used = [...mask.toString(2)].filter(bit => bit === '1').length;
    if (used % 2 === 1) {
      continue;
    }
    const op = used / 2 + 1;
    for (let i = 0; i < m; i++) {
      if (mask & (1 << i)) {
        continue;
      }
      for (let j = i + 1; j < m; j++) {
        if (mask & (1 << j)) {
          continue;
        }
        const next = mask | (1 << i) | (1 << j);
        dp[next] = Math.max(dp[next], dp[mask] + op * gcd(nums[i], nums[j]));
      }
    }
  }
  return dp[full];
}
