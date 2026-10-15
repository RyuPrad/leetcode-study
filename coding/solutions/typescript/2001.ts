function interchangeableRectangles(rectangles: number[][]): number {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const count = new Map<string, number>();
  let res = 0;
  for (const [w, h] of rectangles) {
    const g = gcd(w, h);
    const key = w / g + ':' + h / g;
    res += count.get(key) || 0;
    count.set(key, (count.get(key) || 0) + 1);
  }
  return res;
}
