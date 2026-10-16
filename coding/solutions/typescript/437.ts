function pathSum(root: TreeNode | null, targetSum: number): number {
  const freq = new Map<number, number>();
  freq.set(0, 1);
  let count = 0;
  function dfs(node: TreeNode | null, sum: number): void {
    if (node === null) {
      return;
    }
    sum += node.val;
    const need = sum - targetSum;
    const matches = freq.get(need) || 0;
    count += matches;
    freq.set(sum, (freq.get(sum) || 0) + 1);
    dfs(node.left, sum);
    dfs(node.right, sum);
    freq.set(sum, freq.get(sum)! - 1);
    if (freq.get(sum) === 0) {
      freq.delete(sum);
    }
    return;
  }
  dfs(root, 0);
  return count;
}
