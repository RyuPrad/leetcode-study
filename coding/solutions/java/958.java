class Solution {
    public boolean isCompleteTree(TreeNode root) {
        List<TreeNode> queue = new ArrayList<>();
        queue.add(root);
        boolean seenNull = false;
        for (int head = 0; head < queue.size(); head++) {
            TreeNode node = queue.get(head);
            if (node == null) {
                seenNull = true;
            } else {
                if (seenNull) {
                    return false;
                }
                queue.add(node.left);
                queue.add(node.right);
            }
        }
        return true;
    }
}
