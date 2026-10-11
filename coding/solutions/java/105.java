class Solution {
    public TreeNode buildTree(int[] preorder, int[] inorder) {
        return build(preorder, 0, inorder, 0, preorder.length);
    }

    private TreeNode build(int[] preorder, int preStart, int[] inorder, int inStart, int length) {
        if (length == 0) return null;
        int rootVal = preorder[preStart];
        TreeNode root = new TreeNode(rootVal);
        int mid = 0;
        while (inorder[inStart + mid] != rootVal) mid++;
        root.left = build(preorder, preStart + 1, inorder, inStart, mid);
        root.right = build(preorder, preStart + mid + 1, inorder, inStart + mid + 1, length - mid - 1);
        return root;
    }
}
