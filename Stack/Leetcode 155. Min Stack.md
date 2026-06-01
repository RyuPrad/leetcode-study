
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Stack/min_stack_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `stack` | the underlying stack; each entry is a `[val, min]` pair |
| `val` | the value being pushed, or read by `top()` |
| `min` | the minimum value at or below an entry, cached so `getMin()` is O(1) |
