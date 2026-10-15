function hasAllCodes(s: string, k: number): boolean {
  const codes = new Set<string>();
  for (let i = 0; i + k <= s.length; i++) {
    codes.add(s.slice(i, i + k));
  }
  return codes.size === 1 << k;
}
