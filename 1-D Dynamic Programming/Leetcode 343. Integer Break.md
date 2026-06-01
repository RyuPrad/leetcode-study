
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/1-D%20Dynamic%20Programming/integer_break_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | The input integer to break into the sum of at least two positive integers, maximizing their product. |
| `dp` | Array of length `n + 1`; `dp[i]` is the maximum product obtainable by breaking `i` into two or more positive parts. `dp[1] = 1` is the base case. |
| `i` | Outer-loop value 2..n — the number whose best break (`dp[i]`) is currently being computed. |
| `j` | Inner-loop split point 1..i-1. For each `j` we compare `j * (i - j)` (leave `i - j` whole) and `j * dp[i - j]` (break `i - j` further), taking the running max into `dp[i]`. |
