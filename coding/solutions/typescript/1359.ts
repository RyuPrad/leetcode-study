function countOrders(n: number): number {
  const MOD = 1000000007;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    const slots = 2 * i - 1;
    res = res * (slots * (slots + 1) / 2) % MOD;
  }
  return res;
}
