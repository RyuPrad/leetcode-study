class Solution {
    public boolean isSymmetric(TreeNode root) {
        List<TreeNode[]> queue = new ArrayList<>();
        queue.add(new TreeNode[] {root.left, root.right});
        for (int head = 0; head < queue.size(); head++) {
            TreeNode a = queue.get(head)[0], b = queue.get(head)[1];
            if (a == null && b == null) {
                continue;
            }
            if (a == null || b == null || a.val != b.val) {
                return false;
            }
            queue.add(new TreeNode[] {a.left, b.right});
            queue.add(new TreeNode[] {a.right, b.left});
        }
        return true;
    }
}
