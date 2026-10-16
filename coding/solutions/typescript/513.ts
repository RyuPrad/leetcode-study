function findBottomLeftValue(root: TreeNode | null): number {
  const queue: TreeNode[] = [root!];
  let node: TreeNode | null = null;
  for (let head = 0; head < queue.length; head++) {
    node = queue[head];
    if (node.right) {
      queue.push(node.right);
    }
    if (node.left) {
      queue.push(node.left);
    }
  }
  return node!.val;
}
