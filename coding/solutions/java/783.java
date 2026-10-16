class Solution {
    public int minDiffInBST(TreeNode root) {
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode node = root;
        Integer prev = null;
        int res = Integer.MAX_VALUE;
        while (node != null || !stack.isEmpty()) {
            while (node != null) {
                stack.push(node);
                node = node.left;
            }
            node = stack.pop();
            if (prev != null) {
                res = Math.min(res, node.val - prev);
            }
            prev = node.val;
            node = node.right;
        }
        return res;
    }
}
