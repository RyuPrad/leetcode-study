
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/1-D%20Dynamic%20Programming/word_break_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `s` | The input string we try to segment into dictionary words. |
| `wordDict` | The list of allowed words. |
| `words` | A `Set` built from `wordDict` for O(1) membership checks. |
| `n` | Length of `s`; the dp array has `n + 1` entries. |
| `dp` | `dp[i]` = `true` if the first `i` characters can be split into dictionary words; `dp[0] = true` is the base case. |
| `i` | Outer loop index — the end of the prefix being resolved. |
| `j` | Inner loop split point; a hit needs `dp[j]` true and `s[j..i]` in the dictionary. |
| `ans` | The returned value `dp[n]` — whether the whole string can be segmented. |
