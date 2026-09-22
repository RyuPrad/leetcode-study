
<iframe
  src="delete_node_in_a_bst_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `root` | root node of the BST (also the recursion's current subtree root) |
| `node` | current node on the search path |
| `key` | value to delete |
| `min` | inorder successor: the smallest node in the right subtree |
| `ans` | the (possibly new) root returned after deletion |
