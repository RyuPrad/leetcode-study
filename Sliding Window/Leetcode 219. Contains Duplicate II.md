
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Sliding%20Window/contains_duplicate_ii_visualizer.html"
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
| `k` | maximum allowed distance between two equal values |
| `i` | loop index; the right edge of the sliding window |
| `seen` | Set of the values currently inside the window `[i-k, i]` |
| `ans` | boolean answer: `true` if a duplicate exists within distance `k`, else `false` |
