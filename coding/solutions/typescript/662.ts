function widthOfBinaryTree(root: TreeNode | null): number {
  let res = 0;
  let level: Array<[TreeNode, number]> = [[root!, 0]];
  while (level.length) {
    const first = level[0][1];
    res = Math.max(res, level[level.length - 1][1] - first + 1);
    const next: Array<[TreeNode, number]> = [];
    for (const [node, index] of level) {
      const i = index - first;
      if (node.left) {
        next.push([node.left, 2 * i]);
      }
      if (node.right) {
        next.push([node.right, 2 * i + 1]);
      }
    }
    level = next;
  }
  return res;
}
