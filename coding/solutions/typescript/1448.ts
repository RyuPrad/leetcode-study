function goodNodes(root: TreeNode | null): number {
  let count = 0;
  function dfs(node: TreeNode | null, maxSoFar: number): void {
    if (!node) return;
    if (node.val >= maxSoFar) count++;
    const newMax = Math.max(maxSoFar, node.val);
    dfs(node.left, newMax);
    dfs(node.right, newMax);
  }
  dfs(root, -Infinity);
  return count;
}
