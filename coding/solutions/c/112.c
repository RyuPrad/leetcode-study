bool hasPathSum(struct TreeNode* root, int targetSum) {
    if (!root) {
        return false;
    }
    int cap = 64, top = 0;
    struct TreeNode** nodes = malloc(cap * sizeof(struct TreeNode*));
    int* sums = malloc(cap * sizeof(int));
    nodes[top] = root;
    sums[top++] = root->val;
    while (top > 0) {
        struct TreeNode* node = nodes[--top];
        int sum = sums[top];
        if (!node->left && !node->right && sum == targetSum) {
            free(nodes);
            free(sums);
            return true;
        }
        if (top + 2 > cap) {
            cap *= 2;
            nodes = realloc(nodes, cap * sizeof(struct TreeNode*));
            sums = realloc(sums, cap * sizeof(int));
        }
        if (node->right) {
            nodes[top] = node->right;
            sums[top++] = sum + node->right->val;
        }
        if (node->left) {
            nodes[top] = node->left;
            sums[top++] = sum + node->left->val;
        }
    }
    free(nodes);
    free(sums);
    return false;
}
