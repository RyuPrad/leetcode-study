function checkInclusion(s1: string, s2: string): boolean {
  if (s1.length > s2.length) return false;
  const need: Record<string, number> = {};
  for (const c of s1) need[c] = (need[c] || 0) + 1;
  const window: Record<string, number> = {};
  let left = 0;
  for (let right = 0; right < s2.length; right++) {
    const c = s2[right];
    window[c] = (window[c] || 0) + 1;
    if (right - left + 1 > s1.length) {
      const d = s2[left];
      window[d]--;
      if (window[d] === 0) delete window[d];
      left++;
    }
    if (right - left + 1 === s1.length && matches(window, need)) {
      return true;
    }
  }
  return false;
}

function matches(a: Record<string, number>, b: Record<string, number>): boolean {
  return Object.keys(b).every(k => a[k] === b[k]);
}
