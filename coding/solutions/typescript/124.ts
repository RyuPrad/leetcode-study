function maxPathSum(root: TreeNode | null): number {
  let ans = -Infinity;
  function gain(node: TreeNode | null): number {
    if (!node) return 0;
    const left = Math.max(gain(node.left), 0);
    const right = Math.max(gain(node.right), 0);
    ans = Math.max(ans, node.val + left + right);
    return node.val + Math.max(left, right);
  }
  gain(root);
  return ans;
}
