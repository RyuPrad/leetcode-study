function countVowelPermutation(n: number): number {
  const MOD = 1000000007;
  let a = 1, e = 1, i = 1, o = 1, u = 1;
  for (let len = 2; len <= n; len++) {
    const na = (e + i + u) % MOD;
    const ne = (a + i) % MOD;
    const ni = (e + o) % MOD;
    const no = i;
    const nu = (i + o) % MOD;
    [a, e, i, o, u] = [na, ne, ni, no, nu];
  }
  return (a + e + i + o + u) % MOD;
}
