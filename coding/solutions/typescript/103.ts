function zigzagLevelOrder(root: TreeNode | null): number[][] {
  const res: number[][] = [];
  let level: TreeNode[] = root ? [root] : [];
  while (level.length) {
    const values = level.map(node => node.val);
    if (res.length % 2 === 1) {
      values.reverse();
    }
    res.push(values);
    const next: TreeNode[] = [];
    for (const node of level) {
      if (node.left) {
        next.push(node.left);
      }
      if (node.right) {
        next.push(node.right);
      }
    }
    level = next;
  }
  return res;
}
