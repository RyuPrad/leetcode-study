function bestTeamScore(scores: number[], ages: number[]): number {
  const players = scores.map((score, i) => [ages[i], score]);
  players.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const dp = players.map(player => player[1]);
  for (let i = 0; i < players.length; i++) {
    for (let j = 0; j < i; j++) {
      if (players[j][1] <= players[i][1]) {
        dp[i] = Math.max(dp[i], dp[j] + players[i][1]);
      }
    }
  }
  return Math.max(...dp);
}
