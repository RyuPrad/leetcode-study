static int ans;

static int depth(struct TreeNode* node) {
    if (!node) return 0;
    int left = depth(node->left);
    int right = depth(node->right);
    if (left + right > ans) ans = left + right;
    return 1 + (left > right ? left : right);
}

int diameterOfBinaryTree(struct TreeNode* root) {
    ans = 0;
    depth(root);
    return ans;
}
