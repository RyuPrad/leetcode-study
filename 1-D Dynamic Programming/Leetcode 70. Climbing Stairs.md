
<iframe
  src="climbing_stairs_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | The number of stairs to climb to reach the top. |
| `dp` | Array of length `n + 1` where `dp[i]` is the number of distinct ways to reach step `i`. Base cases `dp[0] = 1` and `dp[1] = 1`. |
| `i` | Loop index, from `2` to `n`, marking the step whose count is currently being computed via `dp[i] = dp[i - 1] + dp[i - 2]`. |
