static void dfs(struct TreeNode* node, int* res, int* count) {
    if (!node) return;
    res[(*count)++] = node->val;
    dfs(node->left, res, count);
    dfs(node->right, res, count);
}

int* preorderTraversal(struct TreeNode* root, int* returnSize) {
    int* res = malloc(10001 * sizeof(int));
    *returnSize = 0;
    dfs(root, res, returnSize);
    return res;
}
