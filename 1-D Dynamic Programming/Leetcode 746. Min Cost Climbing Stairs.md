
<iframe
  src="min_cost_climbing_stairs_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `cost` | Input array; `cost[i]` is the price paid to step off stair `i`. |
| `n` | `cost.length` — the number of stairs. The "top" is index `n`, one past the last stair. |
| `dp` | Array of length `n + 1` where `dp[i]` is the minimum cost to reach step `i`. `dp[0]` and `dp[1]` are `0` (you may start on either of the first two stairs for free). |
| `i` | Loop index, from `2` to `n`, marking the step whose minimum cost is being computed via `dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])`. |
