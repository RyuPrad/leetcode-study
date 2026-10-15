function findLongestChain(pairs: number[][]): number {
  pairs.sort((a, b) => a[1] - b[1]);
  let res = 0, end = -Infinity;
  for (const [left, right] of pairs) {
    if (left > end) {
      res++;
      end = right;
    }
  }
  return res;
}
