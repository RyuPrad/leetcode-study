function maxValueOfCoins(piles: number[][], k: number): number {
  let dp: number[] = new Array(k + 1).fill(0);
  for (const pile of piles) {
    const next = dp.slice();
    let taken = 0;
    for (let t = 1; t <= Math.min(pile.length, k); t++) {
      taken += pile[t - 1];
      for (let used = t; used <= k; used++) {
        next[used] = Math.max(next[used], dp[used - t] + taken);
      }
    }
    dp = next;
  }
  return dp[k];
}
