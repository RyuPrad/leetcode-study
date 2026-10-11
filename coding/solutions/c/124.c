static int ans;

static int gain(struct TreeNode* node) {
    if (!node) return 0;
    int left = gain(node->left);
    int right = gain(node->right);
    if (left < 0) left = 0;
    if (right < 0) right = 0;
    if (node->val + left + right > ans) ans = node->val + left + right;
    return node->val + (left > right ? left : right);
}

int maxPathSum(struct TreeNode* root) {
    ans = INT_MIN;
    gain(root);
    return ans;
}
