
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Heap/ipo_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `k` | Maximum number of projects we may complete. |
| `w` | Current capital; grows as we finish projects. |
| `projects` | Pairs `[capital, profit]` sorted ascending by capital. |
| `maxHeap` | Max-heap of profits (compared by profit) for all currently affordable projects. |
| `i` | Pointer into sorted `projects`; admits every project with `capital <= w`. |
| `j` | Round counter from `0` to `k - 1`. |
