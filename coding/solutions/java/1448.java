class Solution {
    private int count = 0;

    public int goodNodes(TreeNode root) {
        dfs(root, Integer.MIN_VALUE);
        return count;
    }

    private void dfs(TreeNode node, int maxSoFar) {
        if (node == null) return;
        if (node.val >= maxSoFar) count++;
        int newMax = Math.max(maxSoFar, node.val);
        dfs(node.left, newMax);
        dfs(node.right, newMax);
    }
}
