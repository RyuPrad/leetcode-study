
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Graphs/verifying_an_alien_dictionary_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `words` | The list of words to verify. They are sorted iff every adjacent pair is in order. |
| `order` | The alien alphabet as a permutation of the 26 letters; earlier = smaller. |
| `rank` | Object mapping each letter to its index in `order`, so comparisons become integer comparisons (`rank[w1[j]]` vs `rank[w2[j]]`). |
| `i` | Outer index; compares the pair `words[i]` and `words[i + 1]`. |
| `j` | Inner index walking both words character by character until they differ or one ends. |
| `w1` | The earlier word in the current pair, `words[i]`. |
| `w2` | The later word in the current pair, `words[i + 1]`. |
| `ans` | The returned value: `true` if all adjacent pairs are correctly ordered, else `false` (a bigger-ranked first-difference, or `w2` being a strict prefix of `w1`). |
