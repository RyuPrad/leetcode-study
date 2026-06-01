
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Trees/delete_leaves_with_a_given_value_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `root` | current node being processed by `removeLeafNodes` |
| `node` | the active node in the recursion (same as `root` inside a frame) |
| `target` | leaf value to delete |
| `root.left` | left child after its subtree has been pruned (may be `null`) |
| `root.right` | right child after its subtree has been pruned (may be `null`) |
