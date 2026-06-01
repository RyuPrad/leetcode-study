
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Trees/kth_smallest_element_in_a_bst_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `root` | root of the binary search tree |
| `k` | which smallest value to find; decremented on each inorder visit until it reaches 0 |
| `stack` | explicit stack holding the path of nodes whose left subtree is being processed |
| `node` | current node; walks left while pushing, then is set to each popped node, then to its right child |
