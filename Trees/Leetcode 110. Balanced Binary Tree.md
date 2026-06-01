
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Trees/balanced_binary_tree_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `root` | tree root node passed into `isBalanced` |
| `node` | current node in the `height` recursion |
| `left` | height of the current node's left subtree |
| `right` | height of the current node's right subtree |
| `balanced` | answer flag, set to `false` if any node has `|left - right| > 1` |
