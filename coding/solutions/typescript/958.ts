function isCompleteTree(root: TreeNode | null): boolean {
  const queue: Array<TreeNode | null> = [root];
  let seenNull = false;
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    if (!node) {
      seenNull = true;
    } else {
      if (seenNull) {
        return false;
      }
      queue.push(node.left, node.right);
    }
  }
  return true;
}
