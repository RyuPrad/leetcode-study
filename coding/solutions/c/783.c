static int countNodes(struct TreeNode* node) {
    return node ? 1 + countNodes(node->left) + countNodes(node->right) : 0;
}

int minDiffInBST(struct TreeNode* root) {
    struct TreeNode** stack = malloc(countNodes(root) * sizeof(struct TreeNode*));
    int top = 0;
    struct TreeNode* node = root;
    int prev = -1, res = INT_MAX;
    while (node || top > 0) {
        while (node) {
            stack[top++] = node;
            node = node->left;
        }
        node = stack[--top];
        if (prev != -1) {
            if (node->val - prev < res) res = node->val - prev;
        }
        prev = node->val;
        node = node->right;
    }
    free(stack);
    return res;
}
