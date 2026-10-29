function minWindow(s: string, t: string): string {
  const need = new Map<string, number>();
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);
  const needCount = need.size;
  const window = new Map<string, number>();
  let have = 0, left = 0;
  let resLen = Infinity, resStart = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    window.set(c, (window.get(c) || 0) + 1);
    if (need.has(c) && window.get(c) === need.get(c)) have++;
    while (have === needCount) {
      if (right - left + 1 < resLen) {
        resLen = right - left + 1; resStart = left;
      }
      const d = s[left];
      window.set(d, window.get(d)! - 1);
      if (need.has(d) && window.get(d)! < need.get(d)!) have--;
      left++;
    }
  }
  return resLen === Infinity ? "" : s.substring(resStart, resStart + resLen);
}
