function lengthOfLongestSubstring(s: string): number {
  const seen = new Set<string>();
  let left = 0;
  let ans = 0;
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }
    seen.add(s[right]);
    ans = Math.max(ans, right - left + 1);
  }
  return ans;
}
