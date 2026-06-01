
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Trees/maximum_depth_of_binary_tree_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `root` | tree root node passed into `maxDepth` |
| `node` | current node in the recursion |
| `depth` | depth returned for the current node: `1 + max(left, right)` |
| `ans` | final answer: the maximum depth of the whole tree |
