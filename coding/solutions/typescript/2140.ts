function mostPoints(questions: number[][]): number {
  const n = questions.length;
  const dp: number[] = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    const [points, skip] = questions[i];
    const solve = points + dp[Math.min(n, i + skip + 1)];
    dp[i] = Math.max(solve, dp[i + 1]);
  }
  return dp[0];
}
