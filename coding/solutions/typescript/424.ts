function characterReplacement(s: string, k: number): number {
  const freq = new Map<string, number>();
  let left = 0;
  let maxFreq = 0;
  let ans = 0;
  for (let right = 0; right < s.length; right++) {
    freq.set(s[right], (freq.get(s[right]) || 0) + 1);
    maxFreq = Math.max(maxFreq, freq.get(s[right])!);
    while ((right - left + 1) - maxFreq > k) {
      freq.set(s[left], freq.get(s[left])! - 1);
      left++;
    }
    ans = Math.max(ans, right - left + 1);
  }
  return ans;
}
