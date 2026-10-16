<iframe
  src="all_possible_full_binary_trees_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | number of nodes |
| memo | k → every full binary tree with k nodes |
| k | size this call builds |
| res | trees with k nodes |
| left | nodes in the left subtree (odd) |
| lefts | every full tree with left nodes |
| rights | every full tree with k - 1 - left nodes |
| l | left subtree being combined |
| r | right subtree being combined |
