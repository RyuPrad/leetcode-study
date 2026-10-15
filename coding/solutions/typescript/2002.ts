function maxProduct(s: string): number {
  const n = s.length, palindromes = new Map<number, number>();
  for (let mask = 1; mask < 1 << n; mask++) {
    let picked = '';
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        picked += s[i];
      }
    }
    if (picked === [...picked].reverse().join('')) {
      palindromes.set(mask, picked.length);
    }
  }
  let res = 0;
  for (const [a, lenA] of palindromes) {
    for (const [b, lenB] of palindromes) {
      if ((a & b) === 0) {
        res = Math.max(res, lenA * lenB);
      }
    }
  }
  return res;
}
