function shipWithinDays(weights: number[], days: number): number {
  let left = Math.max(...weights);
  let right = weights.reduce((a, b) => a + b, 0);
  let ans = right;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    let need = 1;
    let cur = 0;
    for (const w of weights) {
      if (cur + w > mid) {
        need++;
        cur = 0;
      }
      cur += w;
    }
    if (need <= days) {
      ans = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return ans;
}
