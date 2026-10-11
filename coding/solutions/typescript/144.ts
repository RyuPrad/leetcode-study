function preorderTraversal(root: TreeNode | null): number[] {
  const res: number[] = [];
  function dfs(node: TreeNode | null): void {
    if (!node) return;
    res.push(node.val);
    dfs(node.left);
    dfs(node.right);
  }
  dfs(root);
  return res;
}
