function maxPoints(points: number[][]): number {
  let res = 1;
  for (let i = 0; i < points.length; i++) {
    const count = new Map<number, number>();
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[j][0] - points[i][0], dy = points[j][1] - points[i][1];
      const slope = dx === 0 ? Infinity : dy === 0 ? 0 : dy / dx;
      count.set(slope, (count.get(slope) || 1) + 1);
      res = Math.max(res, count.get(slope)!);
    }
  }
  return res;
}
