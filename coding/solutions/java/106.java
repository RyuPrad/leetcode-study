class Solution {
    private final Map<Integer, Integer> at = new HashMap<>();
    private int[] postorder;
    private int post;

    public TreeNode buildTree(int[] inorder, int[] postorder) {
        for (int i = 0; i < inorder.length; i++) at.put(inorder[i], i);
        this.postorder = postorder;
        post = postorder.length - 1;
        return build(0, inorder.length - 1);
    }

    private TreeNode build(int lo, int hi) {
        if (lo > hi) {
            return null;
        }
        TreeNode node = new TreeNode(postorder[post--]);
        int mid = at.get(node.val);
        node.right = build(mid + 1, hi);
        node.left = build(lo, mid - 1);
        return node;
    }
}
