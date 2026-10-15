<iframe
  src="new_21_game_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | the score must end at most n |
| k | Alice draws while her score is below k |
| maxPts | each draw adds 1 to maxPts points, equally likely |
| dp | dp[i] = probability the score is ever exactly i |
| window | sum of dp over the scores that can still draw into i |
| res | probability of stopping with a score of at most n |
| i | score being reached |
