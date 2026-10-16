function sumNumbers(root: TreeNode | null): number {
  let res = 0;
  const stack: Array<[TreeNode, number]> = [[root!, 0]];
  while (stack.length) {
    const [node, prefix] = stack.pop()!;
    const number = prefix * 10 + node.val;
    if (!node.left && !node.right) {
      res += number;
    }
    if (node.right) {
      stack.push([node.right, number]);
    }
    if (node.left) {
      stack.push([node.left, number]);
    }
  }
  return res;
}
