function findDuplicateSubtrees(root: TreeNode | null): Array<TreeNode | null> {
  const ids = new Map<string, number>(), count = new Map<number, number>(), res: TreeNode[] = [];
  const visit = (node: TreeNode | null): number => {
    if (!node) {
      return 0;
    }
    const left = visit(node.left);
    const right = visit(node.right);
    const key = node.val + ',' + left + ',' + right;
    if (!ids.has(key)) {
      ids.set(key, ids.size + 1);
    }
    const id = ids.get(key)!;
    count.set(id, (count.get(id) || 0) + 1);
    if (count.get(id) === 2) {
      res.push(node);
    }
    return id;
  };
  visit(root);
  return res;
}
