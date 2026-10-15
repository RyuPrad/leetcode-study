function maxScore(cardPoints: number[], k: number): number {
  const n = cardPoints.length;
  let total = 0;
  for (let i = 0; i < k; i++) {
    total += cardPoints[i];
  }
  let res = total;
  for (let i = 0; i < k; i++) {
    total += cardPoints[n - 1 - i] - cardPoints[k - 1 - i];
    res = Math.max(res, total);
  }
  return res;
}
