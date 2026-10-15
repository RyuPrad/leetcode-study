function maximumRemovals(s: string, p: string, removable: number[]): number {
  const isSubsequence = (k: number): boolean => {
    const removed = new Set(removable.slice(0, k));
    let j = 0;
    for (let i = 0; i < s.length && j < p.length; i++) {
      if (!removed.has(i) && s[i] === p[j]) {
        j++;
      }
    }
    return j === p.length;
  };
  let left = 0, right = removable.length;
  while (left < right) {
    const mid = Math.ceil((left + right) / 2);
    if (isSubsequence(mid)) {
      left = mid;
    } else {
      right = mid - 1;
    }
  }
  return left;
}
