function hasPathSum(root: TreeNode | null, targetSum: number): boolean {
  if (!root) {
    return false;
  }
  const stack: Array<[TreeNode, number]> = [[root, root.val]];
  while (stack.length) {
    const [node, sum] = stack.pop()!;
    if (!node.left && !node.right && sum === targetSum) {
      return true;
    }
    if (node.right) {
      stack.push([node.right, sum + node.right.val]);
    }
    if (node.left) {
      stack.push([node.left, sum + node.left.val]);
    }
  }
  return false;
}
