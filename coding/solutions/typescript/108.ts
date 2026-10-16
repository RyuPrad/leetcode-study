function sortedArrayToBST(nums: number[]): TreeNode | null {
  const build = (lo: number, hi: number): TreeNode | null => {
    if (lo > hi) {
      return null;
    }
    const mid = Math.floor((lo + hi) / 2);
    const node = new TreeNode(nums[mid]);
    node.left = build(lo, mid - 1);
    node.right = build(mid + 1, hi);
    return node;
  };
  return build(0, nums.length - 1);
}
