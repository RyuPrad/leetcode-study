
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/2-D%20Dynamic%20Programming/burst_balloons_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | Input array of balloon values. |
| `balloons` | Padded array `[1, ...nums, 1]` so the boundaries always multiply by 1. |
| `n` | Length of the padded `balloons` array. |
| `dp` | Upper-triangular table; `dp[left][right]` = max coins from bursting every balloon strictly between the open boundaries `left` and `right`. |
| `left` | Left open boundary of the current interval (not burst). |
| `right` | Right open boundary, `right = left + len`. |
| `k` | The **last** balloon burst inside `(left, right)`; scanned `left+1 .. right-1`. |
| `len` | Current interval span (outer loop runs `2..n-1`); the table fills by increasing length. |
| `ans` | Final answer `dp[0][n-1]`. |
