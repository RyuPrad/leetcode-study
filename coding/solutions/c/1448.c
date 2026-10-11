static int dfs(struct TreeNode* node, int maxSoFar) {
    if (!node) return 0;
    int good = node->val >= maxSoFar ? 1 : 0;
    int newMax = node->val > maxSoFar ? node->val : maxSoFar;
    return good + dfs(node->left, newMax) + dfs(node->right, newMax);
}

int goodNodes(struct TreeNode* root) {
    return dfs(root, INT_MIN);
}
