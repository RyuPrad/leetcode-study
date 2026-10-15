<iframe
  src="best_team_with_no_conflicts_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| scores | score of each player |
| ages | age of each player |
| players | pairs [age, score], sorted by age then score |
| dp | dp[i] = best team total whose last (oldest, highest) player is players[i] |
| i | player ending the team |
| j | earlier player who could be on the same team |
