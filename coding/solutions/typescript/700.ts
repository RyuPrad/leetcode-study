function searchBST(root: TreeNode | null, val: number): TreeNode | null {
  while (root && root.val !== val) root = val < root.val ? root.left : root.right;
  return root;
}
