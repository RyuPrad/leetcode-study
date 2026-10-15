function missingRolls(rolls: number[], mean: number, n: number): number[] {
  const m = rolls.length;
  let missing = mean * (n + m);
  for (const roll of rolls) {
    missing -= roll;
  }
  if (missing < n || missing > 6 * n) {
    return [];
  }
  const res: number[] = new Array(n).fill(Math.floor(missing / n));
  for (let i = 0; i < missing % n; i++) {
    res[i]++;
  }
  return res;
}
