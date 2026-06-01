
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Bit%20Manipulation/counting_bits_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | Upper bound; we count set bits for every value `0..n` |
| dp | Result array; `dp[i]` is the number of set bits in `i` |
| i | Loop index; `dp[i] = dp[i >> 1] + (i & 1)` reuses the answer for `i` with its lowest bit dropped |
