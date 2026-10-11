function checkValidString(s: string): boolean {
  let low = 0, high = 0;
  for (const ch of s) {
    if (ch === "(") { low++; high++; }
    else if (ch === ")") { low--; high--; }
    else { low--; high++; }
    if (high < 0) return false;
    if (low < 0) low = 0;
  }
  return low === 0;
}
