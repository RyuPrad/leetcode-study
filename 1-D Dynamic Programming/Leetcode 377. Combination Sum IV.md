
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/1-D%20Dynamic%20Programming/combination_sum_iv_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | The numbers we may use, each an unlimited number of times. |
| `target` | The total we want to reach. We count how many ordered sequences sum to it. |
| `dp` | `dp[k]` = the number of ordered combinations of `nums` that sum to `k`. Length `target + 1`, filled with `0` except `dp[0] = 1` (the empty combination). |
| `t` | The outer-loop running total currently being solved, from `1` to `target`. |
| `num` | The inner-loop candidate treated as the LAST element of the sum. When `num <= t`, it adds `dp[t - num]` ways. Because the outer loop is the total, order matters. |
| `ans` | The result: `dp[target]`, the count of ordered combinations summing to `target`. |
