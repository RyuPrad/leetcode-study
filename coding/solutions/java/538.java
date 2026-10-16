class Solution {
    public TreeNode convertBST(TreeNode root) {
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode node = root;
        int sum = 0;
        while (node != null || !stack.isEmpty()) {
            while (node != null) {
                stack.push(node);
                node = node.right;
            }
            node = stack.pop();
            sum += node.val;
            node.val = sum;
            node = node.left;
        }
        return root;
    }
}
