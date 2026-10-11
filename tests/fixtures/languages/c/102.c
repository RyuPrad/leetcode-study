int** levelOrder(struct TreeNode* root, int* returnSize, int** returnColumnSizes) {
    struct TreeNode* queue[4096]; int head = 0, tail = 0, levels = 0;
    int** out = malloc(2048 * sizeof(int*)); int* sizes = malloc(2048 * sizeof(int));
    if (root) queue[tail++] = root;
    while (head < tail) {
        int width = tail - head;
        out[levels] = malloc(width * sizeof(int)); sizes[levels] = width;
        for (int i = 0; i < width; i++) {
            struct TreeNode* node = queue[head++];
            out[levels][i] = node->val;
            if (node->left) queue[tail++] = node->left;
            if (node->right) queue[tail++] = node->right;
        }
        levels++;
    }
    *returnSize = levels; *returnColumnSizes = sizes;
    return out;
}
