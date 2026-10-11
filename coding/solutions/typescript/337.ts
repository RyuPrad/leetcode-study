function rob(root: TreeNode | null): number {
  function dfs(node: TreeNode | null): [number, number] {
    if (!node) return [0, 0];
    const left = dfs(node.left);
    const right = dfs(node.right);
    const withRoot = node.val + left[1] + right[1];
    const withoutRoot = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);
    return [withRoot, withoutRoot];
  }
  const res = dfs(root);
  return Math.max(res[0], res[1]);
}
