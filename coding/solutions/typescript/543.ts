function diameterOfBinaryTree(root: TreeNode | null): number {
  let ans = 0;
  function depth(node: TreeNode | null): number {
    if (!node) return 0;
    const left = depth(node.left);
    const right = depth(node.right);
    ans = Math.max(ans, left + right);
    return 1 + Math.max(left, right);
  }
  depth(root);
  return ans;
}
