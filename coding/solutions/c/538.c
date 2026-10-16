static int countNodes(struct TreeNode* node) {
    return node ? 1 + countNodes(node->left) + countNodes(node->right) : 0;
}

struct TreeNode* convertBST(struct TreeNode* root) {
    struct TreeNode** stack = malloc((countNodes(root) + 1) * sizeof(struct TreeNode*));
    int top = 0;
    struct TreeNode* node = root;
    int sum = 0;
    while (node || top > 0) {
        while (node) {
            stack[top++] = node;
            node = node->right;
        }
        node = stack[--top];
        sum += node->val;
        node->val = sum;
        node = node->left;
    }
    free(stack);
    return root;
}
