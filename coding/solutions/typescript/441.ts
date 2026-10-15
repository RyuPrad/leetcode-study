function arrangeCoins(n: number): number {
  let left = 1, right = n, res = 0;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const coins = (mid * (mid + 1)) / 2;
    if (coins > n) {
      right = mid - 1;
    } else {
      res = mid;
      left = mid + 1;
    }
  }
  return res;
}
