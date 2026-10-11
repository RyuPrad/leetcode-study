function isValidBST(root: TreeNode | null): boolean {
  function valid(node: TreeNode | null, low: number, high: number): boolean {
    if (!node) return true;
    if (node.val <= low || node.val >= high) return false;
    return valid(node.left, low, node.val) &&
           valid(node.right, node.val, high);
  }
  return valid(root, -Infinity, Infinity);
}
