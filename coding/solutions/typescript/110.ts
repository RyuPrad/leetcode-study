function isBalanced(root: TreeNode | null): boolean {
  let balanced = true;
  function height(node: TreeNode | null): number {
    if (!node) return 0;
    const left = height(node.left);
    const right = height(node.right);
    if (Math.abs(left - right) > 1) balanced = false;
    return 1 + Math.max(left, right);
  }
  height(root);
  return balanced;
}
