function tree2str(root: TreeNode | null): string {
  if (!root) {
    return '';
  }
  let res = String(root.val);
  if (root.left || root.right) {
    res += '(' + tree2str(root.left) + ')';
  }
  if (root.right) {
    res += '(' + tree2str(root.right) + ')';
  }
  return res;
}
