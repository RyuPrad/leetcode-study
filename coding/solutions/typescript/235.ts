function lowestCommonAncestor(root: TreeNode | null, p: TreeNode | null, q: TreeNode | null): TreeNode | null {
  let node = root;
  while (node) {
    if (p!.val < node.val && q!.val < node.val) {
      node = node.left;
    } else if (p!.val > node.val && q!.val > node.val) {
      node = node.right;
    } else {
      return node;
    }
  }
  return null;
}
