<iframe
  src="operations_on_tree_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| this.parent | parent of each node (-1 for the root) |
| this.locked | user who locked each node (0 = unlocked) |
| this.children | children of each node |
| num | node the operation is about |
| user | user asking |
| node | ancestor or descendant being checked |
| found | true once a locked descendant was unlocked |
| stack | descendants still to check |
