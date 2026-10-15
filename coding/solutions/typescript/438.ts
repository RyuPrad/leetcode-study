function findAnagrams(s: string, p: string): number[] {
  const res: number[] = [];
  if (p.length > s.length) {
    return res;
  }
  const need: number[] = new Array(26).fill(0), have: number[] = new Array(26).fill(0);
  for (let i = 0; i < p.length; i++) {
    need[p.charCodeAt(i) - 97]++;
    have[s.charCodeAt(i) - 97]++;
  }
  if (need.join() === have.join()) {
    res.push(0);
  }
  for (let right = p.length; right < s.length; right++) {
    have[s.charCodeAt(right) - 97]++;
    have[s.charCodeAt(right - p.length) - 97]--;
    if (need.join() === have.join()) {
      res.push(right - p.length + 1);
    }
  }
  return res;
}
