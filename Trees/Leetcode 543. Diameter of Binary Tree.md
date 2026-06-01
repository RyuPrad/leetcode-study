
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Trees/diameter_of_binary_tree_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `root` | tree root node passed into `diameterOfBinaryTree` |
| `node` | current node in the `depth` recursion |
| `left` | depth of the current node's left subtree |
| `right` | depth of the current node's right subtree |
| `ans` | running maximum through-path `left + right` (the diameter in edges) |
