
<iframe
  src="count_good_nodes_in_binary_tree_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `root` | root of the binary tree |
| `node` | current node visited by the DFS |
| `count` | running count of good nodes found so far |
| `maxSoFar` | largest value seen on the path from `root` down to `node`; a node is good when `node.val >= maxSoFar` |
