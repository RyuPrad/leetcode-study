class Solution {
    public List<TreeNode> generateTrees(int n) {
        return build(1, n);
    }

    private List<TreeNode> build(int lo, int hi) {
        List<TreeNode> res = new ArrayList<>();
        if (lo > hi) {
            res.add(null);
            return res;
        }
        for (int root = lo; root <= hi; root++) {
            List<TreeNode> lefts = build(lo, root - 1);
            List<TreeNode> rights = build(root + 1, hi);
            for (TreeNode left : lefts) {
                for (TreeNode right : rights) {
                    res.add(new TreeNode(root, left, right));
                }
            }
        }
        return res;
    }
}
