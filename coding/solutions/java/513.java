class Solution {
    public int findBottomLeftValue(TreeNode root) {
        List<TreeNode> queue = new ArrayList<>();
        queue.add(root);
        TreeNode node = null;
        for (int head = 0; head < queue.size(); head++) {
            node = queue.get(head);
            if (node.right != null) {
                queue.add(node.right);
            }
            if (node.left != null) {
                queue.add(node.left);
            }
        }
        return node.val;
    }
}
