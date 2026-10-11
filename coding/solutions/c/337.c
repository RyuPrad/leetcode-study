static int max(int a, int b) { return a > b ? a : b; }

// Writes {withRoot, withoutRoot} for this subtree.
static void dfs(struct TreeNode* node, int out[2]) {
    if (!node) { out[0] = out[1] = 0; return; }
    int left[2], right[2];
    dfs(node->left, left);
    dfs(node->right, right);
    out[0] = node->val + left[1] + right[1];
    out[1] = max(left[0], left[1]) + max(right[0], right[1]);
}

int rob(struct TreeNode* root) {
    int res[2];
    dfs(root, res);
    return max(res[0], res[1]);
}
