class Solution {
    public int widthOfBinaryTree(TreeNode root) {
        long res = 0;
        List<Object[]> level = new ArrayList<>();
        level.add(new Object[] {root, 0L});
        while (!level.isEmpty()) {
            long first = (Long) level.get(0)[1];
            res = Math.max(res, (Long) level.get(level.size() - 1)[1] - first + 1);
            List<Object[]> next = new ArrayList<>();
            for (Object[] entry : level) {
                TreeNode node = (TreeNode) entry[0];
                long i = (Long) entry[1] - first;
                if (node.left != null) {
                    next.add(new Object[] {node.left, 2 * i});
                }
                if (node.right != null) {
                    next.add(new Object[] {node.right, 2 * i + 1});
                }
            }
            level = next;
        }
        return (int) res;
    }
}
