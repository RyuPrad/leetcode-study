
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Backtracking/palindrome_partitioning_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `s` | the string to partition |
| `res` | list of all valid palindrome partitions |
| `path` | the current partition being built |
| `start` | index where the next piece begins |
| `end` | index of the last character of the prefix being tested |
