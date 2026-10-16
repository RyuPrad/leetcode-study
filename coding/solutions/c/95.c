static struct TreeNode** build(int lo, int hi, int* size) {
    if (lo > hi) {
        struct TreeNode** none = malloc(sizeof(struct TreeNode*));
        none[0] = NULL;
        *size = 1;
        return none;
    }
    int cap = 16;
    struct TreeNode** res = malloc(cap * sizeof(struct TreeNode*));
    *size = 0;
    for (int root = lo; root <= hi; root++) {
        int leftSize, rightSize;
        struct TreeNode** lefts = build(lo, root - 1, &leftSize);
        struct TreeNode** rights = build(root + 1, hi, &rightSize);
        for (int a = 0; a < leftSize; a++) {
            for (int b = 0; b < rightSize; b++) {
                if (*size == cap) {
                    cap *= 2;
                    res = realloc(res, cap * sizeof(struct TreeNode*));
                }
                struct TreeNode* node = malloc(sizeof(struct TreeNode));
                node->val = root;
                node->left = lefts[a];
                node->right = rights[b];
                res[(*size)++] = node;
            }
        }
        free(lefts);
        free(rights);
    }
    return res;
}

struct TreeNode** generateTrees(int n, int* returnSize) {
    return build(1, n, returnSize);
}
