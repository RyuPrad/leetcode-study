function checkInclusion(s1: string, s2: string): boolean {
  if (s1.length > s2.length) return false;
  const need = new Map<string, number>();
  for (const c of s1) need.set(c, (need.get(c) || 0) + 1);
  const window = new Map<string, number>();
  let left = 0;
  for (let right = 0; right < s2.length; right++) {
    const c = s2[right];
    window.set(c, (window.get(c) || 0) + 1);
    if (right - left + 1 > s1.length) {
      const d = s2[left];
      window.set(d, window.get(d)! - 1);
      if (window.get(d) === 0) window.delete(d);
      left++;
    }
    if (right - left + 1 === s1.length && matches(window, need)) {
      return true;
    }
  }
  return false;
}

function matches(a: Map<string, number>, b: Map<string, number>): boolean {
  return [...b].every(([k, v]) => a.get(k) === v);
}
