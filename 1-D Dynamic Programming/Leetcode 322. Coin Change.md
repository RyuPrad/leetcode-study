
<iframe
  src="coin_change_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `coins` | The available coin denominations. Each coin can be used unlimited times (unbounded knapsack). |
| `amount` | The target total we want to make with the fewest coins. |
| `dp` | `dp[k]` = the minimum number of coins that sum to amount `k`. Length `amount + 1`, filled with `Infinity` (unreachable) except `dp[0] = 0`. |
| `a` | The outer-loop amount currently being solved, from `1` to `amount`. |
| `coin` | The inner-loop candidate coin. Only usable when `coin <= a`; it reads `dp[a - coin]` and proposes `dp[a - coin] + 1`. |
| `ans` | The result: `dp[amount]`, or `-1` if it is still `Infinity` (the amount cannot be formed). |
