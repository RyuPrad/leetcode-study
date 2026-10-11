class Solution {
    private final List<Integer> res = new ArrayList<>();

    public List<Integer> preorderTraversal(TreeNode root) {
        dfs(root);
        return res;
    }

    private void dfs(TreeNode node) {
        if (node == null) return;
        res.add(node.val);
        dfs(node.left);
        dfs(node.right);
    }
}
