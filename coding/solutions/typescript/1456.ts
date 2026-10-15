function maxVowels(s: string, k: number): number {
  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
  let count = 0, res = 0;
  for (let right = 0; right < s.length; right++) {
    if (vowels.has(s[right])) {
      count++;
    }
    if (right >= k && vowels.has(s[right - k])) {
      count--;
    }
    res = Math.max(res, count);
  }
  return res;
}
