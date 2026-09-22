
<iframe
  src="extra_characters_in_a_string_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `s` | The input string we are trying to break into dictionary words. |
| `dictionary` | The list of valid words; any substring of `s` matching one is "covered". |
| `root` | Root `TrieNode` of the trie built from every word in `dictionary`. |
| `node` | The current `TrieNode` while inserting a word or while walking `s[i..j]`. |
| `ch` | The current character: `s[j]` during the DP scan (or a letter of a word during insert). |
| `dp` | Suffix DP array of length `n + 1`; `dp[i]` = minimum extra chars for the suffix `s[i..]`. `dp[n] = 0`. |
| `i` | Outer DP index, iterating right → left. `dp[i] = dp[i+1] + 1` is the "skip `s[i]`" default. |
| `j` | Inner index walking forward from `i`; `s[i..j]` is the substring matched against the trie. |
| `ans` | The final answer, `dp[0]` — the minimum number of leftover (extra) characters. |
