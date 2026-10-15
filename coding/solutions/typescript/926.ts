function minFlipsMonoIncr(s: string): number {
  let ones = 0, res = 0;
  for (const ch of s) {
    if (ch === '1') {
      ones++;
    } else {
      res = Math.min(res + 1, ones);
    }
  }
  return res;
}
