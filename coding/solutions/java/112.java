class Solution {
    public boolean hasPathSum(TreeNode root, int targetSum) {
        if (root == null) {
            return false;
        }
        Deque<Object[]> stack = new ArrayDeque<>();
        stack.push(new Object[] {root, root.val});
        while (!stack.isEmpty()) {
            Object[] top = stack.pop();
            TreeNode node = (TreeNode) top[0];
            int sum = (Integer) top[1];
            if (node.left == null && node.right == null && sum == targetSum) {
                return true;
            }
            if (node.right != null) {
                stack.push(new Object[] {node.right, sum + node.right.val});
            }
            if (node.left != null) {
                stack.push(new Object[] {node.left, sum + node.left.val});
            }
        }
        return false;
    }
}
