int** levelOrder(struct TreeNode* root, int* returnSize, int** returnColumnSizes) {
    struct TreeNode** queue = malloc(10001 * sizeof(struct TreeNode*));
    int** res = malloc(10001 * sizeof(int*));
    int* sizes = malloc(10001 * sizeof(int));
    int head = 0, tail = 0, levels = 0;
    if (root) queue[tail++] = root;
    while (head < tail) {
        int size = tail - head;
        int* level = malloc(size * sizeof(int));
        for (int i = 0; i < size; i++) {
            struct TreeNode* node = queue[head++];
            level[i] = node->val;
            if (node->left) queue[tail++] = node->left;
            if (node->right) queue[tail++] = node->right;
        }
        res[levels] = level;
        sizes[levels++] = size;
    }
    free(queue);
    *returnSize = levels;
    *returnColumnSizes = sizes;
    return res;
}
