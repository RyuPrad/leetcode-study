function mySqrt(x: number): number {
  let left = 0;
  let right = x;
  let ans = 0;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (mid * mid <= x) {
      ans = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return ans;
}
