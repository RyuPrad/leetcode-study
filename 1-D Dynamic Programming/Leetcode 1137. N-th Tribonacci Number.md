
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/1-D%20Dynamic%20Programming/n_th_tribonacci_number_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | The index of the Tribonacci number to return. Base cases: `T(0) = 0`, `T(1) = 1`, `T(2) = 1`. |
| `dp` | Array of length `n + 1` where `dp[i]` is the i-th Tribonacci number. Built only when `n > 2`; otherwise the function returns the base case directly. |
| `i` | Loop index, from `3` to `n`, marking the term currently being computed via `dp[i] = dp[i-1] + dp[i-2] + dp[i-3]` (the sum of the previous three terms). |
