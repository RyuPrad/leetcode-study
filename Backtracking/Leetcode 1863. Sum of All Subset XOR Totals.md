
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Backtracking/sum_of_all_subset_xor_totals_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | input array of numbers |
| `ans` | running sum of every subset's XOR total (the answer) |
| `i` | index of the element this dfs frame decides (take or skip) |
| `xorSoFar` | XOR of all elements taken on the path to the current node |
