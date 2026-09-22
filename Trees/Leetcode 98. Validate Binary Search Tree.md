
<iframe
  src="validate_binary_search_tree_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `root` | root node of the tree being validated |
| `node` | current node in the `valid` recursion |
| `low` | exclusive lower bound the node must exceed |
| `high` | exclusive upper bound the node must stay under |
| `ans` | boolean result: is this a valid BST |
