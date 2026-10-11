int kthSmallest(struct TreeNode* root, int k) {
    struct TreeNode* stack[10001];
    int top = 0;
    struct TreeNode* node = root;
    while (node || top) {
        while (node) {
            stack[top++] = node;
            node = node->left;
        }
        node = stack[--top];
        k--;
        if (k == 0) return node->val;
        node = node->right;
    }
    return -1;
}
