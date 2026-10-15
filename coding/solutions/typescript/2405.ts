function partitionString(s: string): number {
  let seen = new Set<string>(), res = 1;
  for (const c of s) {
    if (seen.has(c)) {
      res++;
      seen = new Set();
    }
    seen.add(c);
  }
  return res;
}
