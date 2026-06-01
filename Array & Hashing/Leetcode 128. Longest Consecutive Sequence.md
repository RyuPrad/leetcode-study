
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Array%20%26%20Hashing/longest_consecutive_sequence_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | input array of integers |
| seen | Set of all numbers (O(1) membership) |
| num | current number drawn from seen |
| curr | walker that extends the run rightward (curr+1) |
| length | length of the current consecutive run |
| ans | length of the longest consecutive run found |
