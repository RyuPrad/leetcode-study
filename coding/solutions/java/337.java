class Solution {
    public int rob(TreeNode root) {
        int[] res = dfs(root);
        return Math.max(res[0], res[1]);
    }

    private int[] dfs(TreeNode node) {
        if (node == null) return new int[] { 0, 0 };
        int[] left = dfs(node.left);
        int[] right = dfs(node.right);
        int withRoot = node.val + left[1] + right[1];
        int withoutRoot = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);
        return new int[] { withRoot, withoutRoot };
    }
}
