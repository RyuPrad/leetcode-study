function removeCoveredIntervals(intervals: number[][]): number {
  intervals.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  let res = 0, maxEnd = 0;
  for (const [start, end] of intervals) {
    if (end > maxEnd) {
      res++;
      maxEnd = end;
    }
  }
  return res;
}
