static struct TreeNode* build(int* pre, int* preIndex, int* in, int lo, int hi) {
    if (lo > hi) return NULL;
    struct TreeNode* node = malloc(sizeof *node);
    node->val = pre[(*preIndex)++]; node->left = node->right = NULL;
    int mid = lo; while (in[mid] != node->val) mid++;
    node->left = build(pre, preIndex, in, lo, mid - 1);
    node->right = build(pre, preIndex, in, mid + 1, hi);
    return node;
}
struct TreeNode* buildTree(int* preorder, int preorderSize, int* inorder, int inorderSize) {
    int index = 0;
    return build(preorder, &index, inorder, 0, inorderSize - 1);
}
