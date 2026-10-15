function countOdds(low: number, high: number): number {
  const upToHigh = Math.floor((high + 1) / 2);
  const belowLow = Math.floor(low / 2);
  return upToHigh - belowLow;
}
