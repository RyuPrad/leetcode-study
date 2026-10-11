function minEnd(n: number, x: number): number {
  let result = BigInt(x);
  let remaining = BigInt(n - 1);
  let bit = 1n;
  while (remaining > 0n) {
    if ((result & bit) === 0n) {
      if (remaining & 1n) {
        result |= bit;
      }
      remaining >>= 1n;
    }
    bit <<= 1n;
  }
  return Number(result);
}
