function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;

  const freq: number[] = new Array(26).fill(0);
  const base = 'a'.charCodeAt(0);

  for (let i = 0; i < s.length; i++) {
    freq[s.charCodeAt(i) - base]++;
    freq[t.charCodeAt(i) - base]--;
  }

  for (const n of freq) {
    if (n !== 0) return false;
  }

  return true;
}
