int** zigzagLevelOrder(struct TreeNode* root, int* returnSize, int** returnColumnSizes) {
    int cap = 64, levels = 0;
    int** res = malloc(cap * sizeof(int*));
    *returnColumnSizes = malloc(cap * sizeof(int));
    int width = 1, nextWidth = 0, queueCap = 64;
    struct TreeNode** level = malloc(queueCap * sizeof(struct TreeNode*));
    struct TreeNode** next = malloc(queueCap * sizeof(struct TreeNode*));
    if (root) level[0] = root; else width = 0;
    while (width > 0) {
        int* values = malloc(width * sizeof(int));
        for (int k = 0; k < width; k++) values[k] = level[k]->val;
        if (levels % 2 == 1) {
            for (int a = 0, b = width - 1; a < b; a++, b--) { int t = values[a]; values[a] = values[b]; values[b] = t; }
        }
        if (levels == cap) {
            cap *= 2;
            res = realloc(res, cap * sizeof(int*));
            *returnColumnSizes = realloc(*returnColumnSizes, cap * sizeof(int));
        }
        res[levels] = values;
        (*returnColumnSizes)[levels++] = width;
        nextWidth = 0;
        if (2 * width > queueCap) {
            queueCap = 2 * width;
            next = realloc(next, queueCap * sizeof(struct TreeNode*));
            level = realloc(level, queueCap * sizeof(struct TreeNode*));
        }
        for (int k = 0; k < width; k++) {
            struct TreeNode* node = level[k];
            if (node->left) {
                next[nextWidth++] = node->left;
            }
            if (node->right) {
                next[nextWidth++] = node->right;
            }
        }
        struct TreeNode** swap = level;
        level = next;
        next = swap;
        width = nextWidth;
    }
    free(level);
    free(next);
    *returnSize = levels;
    return res;
}
