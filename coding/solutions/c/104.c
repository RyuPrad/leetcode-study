int maxDepth(struct TreeNode* root) {
    if (!root) return 0;
    int left = maxDepth(root->left), right = maxDepth(root->right);
    return 1 + (left > right ? left : right);
}
