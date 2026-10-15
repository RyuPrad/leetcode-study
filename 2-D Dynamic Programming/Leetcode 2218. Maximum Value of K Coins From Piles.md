<iframe
  src="maximum_value_of_k_coins_from_piles_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| piles | each pile listed from top to bottom |
| k | coins to take |
| dp | dp[used] = best value with that many coins from the piles so far |
| pile | pile being added |
| next | dp after also allowing coins from this pile |
| taken | value of the top t coins of this pile |
| t | coins taken from this pile |
| used | total coins taken |
