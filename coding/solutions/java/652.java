class Solution {
    private final Map<String, Integer> ids = new HashMap<>();
    private final Map<Integer, Integer> count = new HashMap<>();
    private final List<TreeNode> res = new ArrayList<>();

    public List<TreeNode> findDuplicateSubtrees(TreeNode root) {
        visit(root);
        return res;
    }

    private int visit(TreeNode node) {
        if (node == null) {
            return 0;
        }
        int left = visit(node.left);
        int right = visit(node.right);
        String key = node.val + "," + left + "," + right;
        if (!ids.containsKey(key)) {
            ids.put(key, ids.size() + 1);
        }
        int id = ids.get(key);
        count.put(id, count.getOrDefault(id, 0) + 1);
        if (count.get(id) == 2) {
            res.add(node);
        }
        return id;
    }
}
