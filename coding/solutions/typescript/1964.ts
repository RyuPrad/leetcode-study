function longestObstacleCourseAtEachPosition(obstacles: number[]): number[] {
  const tails: number[] = [];
  const res: number[] = [];
  for (const height of obstacles) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] <= height) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    tails[lo] = height;
    res.push(lo + 1);
  }
  return res;
}
