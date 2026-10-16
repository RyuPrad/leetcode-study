function flipEquiv(root1: TreeNode | null, root2: TreeNode | null): boolean {
  if (!root1 || !root2) {
    return root1 === root2;
  }
  if (root1.val !== root2.val) {
    return false;
  }
  const same = flipEquiv(root1.left, root2.left) && flipEquiv(root1.right, root2.right);
  if (same) {
    return true;
  }
  return flipEquiv(root1.left, root2.right) && flipEquiv(root1.right, root2.left);
}
