function countPalindromicSubsequence(s: string): number {
  let res = 0;
  for (const letter of new Set(s)) {
    const first = s.indexOf(letter), last = s.lastIndexOf(letter);
    if (last - first > 1) {
      res += new Set(s.slice(first + 1, last)).size;
    }
  }
  return res;
}
