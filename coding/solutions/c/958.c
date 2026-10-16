static int countNodes(struct TreeNode* node) {
    return node ? 1 + countNodes(node->left) + countNodes(node->right) : 0;
}

bool isCompleteTree(struct TreeNode* root) {
    struct TreeNode** queue = malloc((2 * countNodes(root) + 2) * sizeof(struct TreeNode*));
    int size = 0;
    queue[size++] = root;
    bool seenNull = false;
    for (int head = 0; head < size; head++) {
        struct TreeNode* node = queue[head];
        if (!node) {
            seenNull = true;
        } else {
            if (seenNull) {
                free(queue);
                return false;
            }
            queue[size++] = node->left;
            queue[size++] = node->right;
        }
    }
    free(queue);
    return true;
}
