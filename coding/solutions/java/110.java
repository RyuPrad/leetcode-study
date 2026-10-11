class Solution {
    private boolean balanced = true;

    public boolean isBalanced(TreeNode root) {
        height(root);
        return balanced;
    }

    private int height(TreeNode node) {
        if (node == null) return 0;
        int left = height(node.left);
        int right = height(node.right);
        if (Math.abs(left - right) > 1) balanced = false;
        return 1 + Math.max(left, right);
    }
}
