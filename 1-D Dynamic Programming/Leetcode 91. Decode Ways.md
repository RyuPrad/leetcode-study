
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/1-D%20Dynamic%20Programming/decode_ways_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `s` | The input digit string to decode (each letter A–Z maps to 1–26). |
| `n` | Length of `s`; the dp array has `n + 1` entries. |
| `dp` | `dp[i]` = number of ways to decode the first `i` characters; `dp[0] = dp[1] = 1` are the base cases. |
| `one` | The single digit `s[i-1]` as a number; if it is in `[1, 9]` we add `dp[i-1]`. |
| `two` | The two-digit number `s[i-2..i-1]`; if it is in `[10, 26]` we add `dp[i-2]`. |
| `i` | Loop index over prefixes from `2` to `n`. |
