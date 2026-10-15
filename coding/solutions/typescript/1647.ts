function minDeletions(s: string): number {
  const count = new Map<string, number>();
  for (const c of s) {
    count.set(c, (count.get(c) || 0) + 1);
  }
  const used = new Set<number>();
  let res = 0;
  for (let freq of count.values()) {
    while (freq > 0 && used.has(freq)) {
      freq--;
      res++;
    }
    used.add(freq);
  }
  return res;
}
