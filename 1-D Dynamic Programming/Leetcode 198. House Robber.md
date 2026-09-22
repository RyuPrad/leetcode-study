
<iframe
  src="house_robber_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | Input array; `nums[i]` is the loot stored in house `i`. Adjacent houses cannot both be robbed. |
| `n` | `nums.length` — the number of houses. If `n === 1`, the function returns `nums[0]` directly. |
| `dp` | Array of length `n` where `dp[i]` is the maximum loot obtainable from houses `0..i`. Base cases `dp[0] = nums[0]` and `dp[1] = max(nums[0], nums[1])`. |
| `i` | Loop index, from `2` to `n - 1`, marking the house currently being decided via `dp[i] = max(dp[i-1], dp[i-2] + nums[i])` — skip house `i`, or rob it and add the best from two houses back. |
