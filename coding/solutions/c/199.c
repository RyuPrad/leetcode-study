int* rightSideView(struct TreeNode* root, int* returnSize) {
    int* res = malloc(101 * sizeof(int));
    struct TreeNode* queue[101];
    int head = 0, tail = 0, count = 0;
    if (root) queue[tail++] = root;
    while (head < tail) {
        int size = tail - head;
        for (int i = 0; i < size; i++) {
            struct TreeNode* node = queue[head++];
            if (i == size - 1) res[count++] = node->val;
            if (node->left) queue[tail++] = node->left;
            if (node->right) queue[tail++] = node->right;
        }
    }
    *returnSize = count;
    return res;
}
