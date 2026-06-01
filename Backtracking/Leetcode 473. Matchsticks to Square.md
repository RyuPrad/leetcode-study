
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Backtracking/matchsticks_to_square_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `matchsticks` | input stick lengths, sorted descending before the search |
| `total` | sum of all matchstick lengths |
| `side` | target length of one square side (`total / 4`) |
| `sides` | 4 running bucket sums, one per square side |
| `i` | index of the matchstick currently being placed |
| `j` | which of the 4 sides is being tried for stick `i` |
