function characterReplacement(s: string, k: number): number {
  const freq: Record<string, number> = {};
  let left = 0;
  let maxFreq = 0;
  let ans = 0;
  for (let right = 0; right < s.length; right++) {
    freq[s[right]] = (freq[s[right]] || 0) + 1;
    maxFreq = Math.max(maxFreq, freq[s[right]]);
    while ((right - left + 1) - maxFreq > k) {
      freq[s[left]]--;
      left++;
    }
    ans = Math.max(ans, right - left + 1);
  }
  return ans;
}
