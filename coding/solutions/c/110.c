static bool balanced;

static int height(struct TreeNode* node) {
    if (!node) return 0;
    int left = height(node->left);
    int right = height(node->right);
    if (abs(left - right) > 1) balanced = false;
    return 1 + (left > right ? left : right);
}

bool isBalanced(struct TreeNode* root) {
    balanced = true;
    height(root);
    return balanced;
}
