function minFlips(s: string): number {
  const n = s.length;
  const t = s + s;
  let diff1 = 0, diff2 = 0, res = Infinity;
  for (let right = 0; right < t.length; right++) {
    if (t[right] !== (right % 2 === 0 ? '0' : '1')) diff1++;
    if (t[right] !== (right % 2 === 0 ? '1' : '0')) diff2++;
    if (right >= n) {
      const left = right - n;
      if (t[left] !== (left % 2 === 0 ? '0' : '1')) diff1--;
      if (t[left] !== (left % 2 === 0 ? '1' : '0')) diff2--;
    }
    if (right >= n - 1) {
      res = Math.min(res, diff1, diff2);
    }
  }
  return res;
}
