class Solution {
    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        List<TreeNode> level = new ArrayList<>();
        if (root != null) level.add(root);
        while (!level.isEmpty()) {
            List<Integer> values = new ArrayList<>();
            for (TreeNode node : level) values.add(node.val);
            if (res.size() % 2 == 1) {
                Collections.reverse(values);
            }
            res.add(values);
            List<TreeNode> next = new ArrayList<>();
            for (TreeNode node : level) {
                if (node.left != null) {
                    next.add(node.left);
                }
                if (node.right != null) {
                    next.add(node.right);
                }
            }
            level = next;
        }
        return res;
    }
}
