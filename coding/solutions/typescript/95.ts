function generateTrees(n: number): Array<TreeNode | null> {
  const build = (lo: number, hi: number): Array<TreeNode | null> => {
    if (lo > hi) {
      return [null];
    }
    const res: Array<TreeNode | null> = [];
    for (let root = lo; root <= hi; root++) {
      const lefts = build(lo, root - 1);
      const rights = build(root + 1, hi);
      for (const left of lefts) {
        for (const right of rights) {
          res.push(new TreeNode(root, left, right));
        }
      }
    }
    return res;
  };
  return build(1, n);
}
