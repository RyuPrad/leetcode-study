class Solution {
    public int sumNumbers(TreeNode root) {
        int res = 0;
        Deque<Object[]> stack = new ArrayDeque<>();
        stack.push(new Object[] {root, 0});
        while (!stack.isEmpty()) {
            Object[] top = stack.pop();
            TreeNode node = (TreeNode) top[0];
            int number = (Integer) top[1] * 10 + node.val;
            if (node.left == null && node.right == null) {
                res += number;
            }
            if (node.right != null) {
                stack.push(new Object[] {node.right, number});
            }
            if (node.left != null) {
                stack.push(new Object[] {node.left, number});
            }
        }
        return res;
    }
}
