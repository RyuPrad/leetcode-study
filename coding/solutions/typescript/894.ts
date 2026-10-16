function allPossibleFBT(n: number): Array<TreeNode | null> {
  const memo = new Map<number, TreeNode[]>([[1, [new TreeNode(0)]]]);
  const build = (k: number): TreeNode[] => {
    if (memo.has(k)) {
      return memo.get(k)!;
    }
    const res: TreeNode[] = [];
    for (let left = 1; left < k; left += 2) {
      const lefts = build(left);
      const rights = build(k - 1 - left);
      for (const l of lefts) {
        for (const r of rights) {
          res.push(new TreeNode(0, l, r));
        }
      }
    }
    memo.set(k, res);
    return res;
  };
  return n % 2 ? build(n) : [];
}
