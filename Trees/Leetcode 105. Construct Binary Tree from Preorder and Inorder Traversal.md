
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Trees/construct_binary_tree_from_preorder_and_inorder_traversal_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `preorder` | preorder traversal array; its first element is always the current subtree's root |
| `inorder` | inorder traversal array; the root splits it into left and right subtrees |
| `root` | the `TreeNode` being constructed for the current call |
| `rootVal` | `preorder[0]`, the value of the current subtree root |
| `mid` | index of `rootVal` inside `inorder`; everything left of it is the left subtree, right of it the right subtree |
