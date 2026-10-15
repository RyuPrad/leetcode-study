<iframe
  src="profitable_schemes_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | members available |
| minProfit | profit a scheme must reach |
| group | members each crime needs |
| profit | profit each crime makes |
| MOD | 10^9 + 7 |
| dp | dp[members][earned] = schemes using exactly that many members with that profit (capped at minProfit) |
| c | crime being considered |
| g | members it needs |
| p | profit it makes |
| members | members used after adding the crime |
| earned | profit before adding the crime |
| capped | profit after adding it, capped at minProfit |
| res | profitable schemes counted |
