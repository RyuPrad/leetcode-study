<iframe
  src="construct_binary_tree_from_inorder_and_postorder_traversal_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| inorder | in-order traversal |
| postorder | post-order traversal |
| at | value → its index in inorder |
| post | index of the next root, read from the end of postorder |
| lo | first inorder index of this subtree |
| hi | last inorder index of this subtree |
| node | root of this subtree |
| mid | index of node in inorder |
