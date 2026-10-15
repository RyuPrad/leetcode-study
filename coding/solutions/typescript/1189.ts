function maxNumberOfBalloons(text: string): number {
  const count = new Map<string, number>();
  for (const c of text) {
    count.set(c, (count.get(c) || 0) + 1);
  }
  const need: Record<string, number> = { b: 1, a: 1, l: 2, o: 2, n: 1 };
  let res = Infinity;
  for (const c in need) {
    res = Math.min(res, Math.floor((count.get(c) || 0) / need[c]));
  }
  return res;
}
