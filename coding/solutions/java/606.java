class Solution {
    public String tree2str(TreeNode root) {
        if (root == null) {
            return "";
        }
        String res = String.valueOf(root.val);
        if (root.left != null || root.right != null) {
            res += "(" + tree2str(root.left) + ")";
        }
        if (root.right != null) {
            res += "(" + tree2str(root.right) + ")";
        }
        return res;
    }
}
