
<iframe
  src="binary_tree_right_side_view_visualizer.html"
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
| `res` | output array: the rightmost value of each level (the right side view) |
| `queue` | BFS queue holding exactly one level of nodes at a time |
| `node` | current node dequeued from the front of `queue` |
