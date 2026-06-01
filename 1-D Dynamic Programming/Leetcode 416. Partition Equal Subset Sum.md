
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/1-D%20Dynamic%20Programming/partition_equal_subset_sum_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | The input array of positive integers we try to split into two equal-sum halves. |
| `total` | Sum of every element in `nums`. If it is odd, an equal split is impossible. |
| `target` | `total / 2` — the subset sum each half must reach. |
| `dp` | Boolean array of length `target + 1`; `dp[c]` is `true` when some subset of `nums` sums to capacity `c`. Reused as the 1-D rolling row of the 0/1 knapsack. |
| `num` | The current number from `nums` being considered for inclusion in a subset. |
| `i` | Capacity index, swept **downward** from `target` to `num` so each `num` is used at most once. `dp[i]` becomes `true` whenever `dp[i - num]` is already `true`. |
| `ans` | Final result `dp[target]` — `true` if the array can be partitioned into two equal-sum subsets, else `false`. |
