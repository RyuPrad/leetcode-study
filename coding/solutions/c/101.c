bool isSymmetric(struct TreeNode* root) {
    int cap = 64, size = 0;
    struct TreeNode** queue = malloc(cap * sizeof(struct TreeNode*));
    queue[size++] = root->left;
    queue[size++] = root->right;
    for (int head = 0; head < size; head += 2) {
        struct TreeNode *a = queue[head], *b = queue[head + 1];
        if (!a && !b) {
            continue;
        }
        if (!a || !b || a->val != b->val) {
            free(queue);
            return false;
        }
        if (size + 4 > cap) {
            cap *= 2;
            queue = realloc(queue, cap * sizeof(struct TreeNode*));
        }
        queue[size++] = a->left;
        queue[size++] = b->right;
        queue[size++] = a->right;
        queue[size++] = b->left;
    }
    free(queue);
    return true;
}
