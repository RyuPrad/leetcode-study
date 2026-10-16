function buildTree(inorder: number[], postorder: number[]): TreeNode | null {
  const at = new Map(inorder.map((value, i) => [value, i]));
  let post = postorder.length - 1;
  const build = (lo: number, hi: number): TreeNode | null => {
    if (lo > hi) {
      return null;
    }
    const node = new TreeNode(postorder[post--]);
    const mid = at.get(node.val)!;
    node.right = build(mid + 1, hi);
    node.left = build(lo, mid - 1);
    return node;
  };
  return build(0, inorder.length - 1);
}
