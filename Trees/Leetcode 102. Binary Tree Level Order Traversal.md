
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Trees/binary_tree_level_order_traversal_visualizer.html"
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
| `res` | output array of levels; one inner array per tree level |
| `queue` | BFS queue of nodes waiting to be processed (front to back) |
| `level` | values collected for the current level being built |
| `node` | node dequeued with `queue.shift()` on this iteration |
