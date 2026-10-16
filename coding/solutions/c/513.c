static int countNodes(struct TreeNode* node) {
    return node ? 1 + countNodes(node->left) + countNodes(node->right) : 0;
}

int findBottomLeftValue(struct TreeNode* root) {
    struct TreeNode** queue = malloc(countNodes(root) * sizeof(struct TreeNode*));
    int size = 0;
    queue[size++] = root;
    struct TreeNode* node = NULL;
    for (int head = 0; head < size; head++) {
        node = queue[head];
        if (node->right) {
            queue[size++] = node->right;
        }
        if (node->left) {
            queue[size++] = node->left;
        }
    }
    free(queue);
    return node->val;
}
