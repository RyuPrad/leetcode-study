function minWindow(s: string, t: string): string {
  const need: Record<string, number> = {};
  for (const c of t) need[c] = (need[c] || 0) + 1;
  const needCount = Object.keys(need).length;
  const window: Record<string, number> = {};
  let have = 0, left = 0;
  let resLen = Infinity, resStart = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    window[c] = (window[c] || 0) + 1;
    if (need[c] !== undefined && window[c] === need[c]) have++;
    while (have === needCount) {
      if (right - left + 1 < resLen) {
        resLen = right - left + 1; resStart = left;
      }
      const d = s[left];
      window[d]--;
      if (need[d] !== undefined && window[d] < need[d]) have--;
      left++;
    }
  }
  return resLen === Infinity ? "" : s.substring(resStart, resStart + resLen);
}
