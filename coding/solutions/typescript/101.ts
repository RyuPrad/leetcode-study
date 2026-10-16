function isSymmetric(root: TreeNode | null): boolean {
  const queue: Array<[TreeNode | null, TreeNode | null]> = [[root!.left, root!.right]];
  for (let head = 0; head < queue.length; head++) {
    const [a, b] = queue[head];
    if (!a && !b) {
      continue;
    }
    if (!a || !b || a.val !== b.val) {
      return false;
    }
    queue.push([a.left, b.right], [a.right, b.left]);
  }
  return true;
}
