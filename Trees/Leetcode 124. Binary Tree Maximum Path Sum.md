
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Trees/binary_tree_maximum_path_sum_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `root` | root node of the binary tree |
| `node` | current node in the `gain` recursion |
| `left` | best downward gain from the left child, clamped to `0` |
| `right` | best downward gain from the right child, clamped to `0` |
| `ans` | global maximum path sum seen so far (best `node.val + left + right`) |
