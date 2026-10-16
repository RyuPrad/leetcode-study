int sumNumbers(struct TreeNode* root) {
    int res = 0, cap = 64, top = 0;
    struct TreeNode** nodes = malloc(cap * sizeof(struct TreeNode*));
    int* prefixes = malloc(cap * sizeof(int));
    nodes[top] = root;
    prefixes[top++] = 0;
    while (top > 0) {
        struct TreeNode* node = nodes[--top];
        int number = prefixes[top] * 10 + node->val;
        if (!node->left && !node->right) {
            res += number;
        }
        if (top + 2 > cap) {
            cap *= 2;
            nodes = realloc(nodes, cap * sizeof(struct TreeNode*));
            prefixes = realloc(prefixes, cap * sizeof(int));
        }
        if (node->right) {
            nodes[top] = node->right;
            prefixes[top++] = number;
        }
        if (node->left) {
            nodes[top] = node->left;
            prefixes[top++] = number;
        }
    }
    free(nodes);
    free(prefixes);
    return res;
}
