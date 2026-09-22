
<iframe
  src="longest_increasing_subsequence_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | Input integer array. |
| `n` | Number of elements, `nums.length`. |
| `dp` | `dp[i]` = length of the Longest Increasing Subsequence that **ends** at index `i`; initialized to all `1`. |
| `ans` | Best value seen across the whole `dp` array — the LIS length to return. |
| `i` | Outer-loop index (the element whose `dp[i]` we are computing). |
| `j` | Inner-loop index over earlier elements; if `nums[j] < nums[i]`, element `j` can extend a subsequence into `i`. |
