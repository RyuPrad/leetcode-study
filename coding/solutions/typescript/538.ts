function convertBST(root: TreeNode | null): TreeNode | null {
  const stack: TreeNode[] = [];
  let node = root, sum = 0;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.right;
    }
    node = stack.pop()!;
    sum += node.val;
    node.val = sum;
    node = node.left;
  }
  return root;
}
