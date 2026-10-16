function minDiffInBST(root: TreeNode | null): number {
  const stack: TreeNode[] = [];
  let node = root, prev: number | null = null, res = Infinity;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop()!;
    if (prev !== null) {
      res = Math.min(res, node.val - prev);
    }
    prev = node.val;
    node = node.right;
  }
  return res;
}
