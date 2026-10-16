<iframe
  src="unique_binary_search_trees_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | values 1 to n |
| lo | smallest value of this range |
| hi | largest value of this range |
| res | every tree on the values lo to hi |
| root | value placed at the root |
| lefts | every left subtree (values lo to root - 1) |
| rights | every right subtree (values root + 1 to hi) |
| left | left subtree being combined |
| right | right subtree being combined |
