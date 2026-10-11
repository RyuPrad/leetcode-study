function searchBST(root: TreeNode | null, val: number): TreeNode | null {
  let curr = root;
  while (curr !== null) {
    if (curr.val === val) {
      return curr;
    }
    if (val < curr.val) {
      curr = curr.left;
    } else {
      curr = curr.right;
    }
  }
  return null;
}
