static int countNodes(struct TreeNode* node) {
    return node ? 1 + countNodes(node->left) + countNodes(node->right) : 0;
}

int widthOfBinaryTree(struct TreeNode* root) {
    int total = countNodes(root);
    struct TreeNode** nodes = malloc(total * sizeof(struct TreeNode*));
    struct TreeNode** nextNodes = malloc(total * sizeof(struct TreeNode*));
    long long* index = malloc(total * sizeof(long long));
    long long* nextIndex = malloc(total * sizeof(long long));
    long long res = 0;
    int size = 1;
    nodes[0] = root;
    index[0] = 0;
    while (size > 0) {
        long long first = index[0];
        if (index[size - 1] - first + 1 > res) res = index[size - 1] - first + 1;
        int nextSize = 0;
        for (int k = 0; k < size; k++) {
            long long i = index[k] - first;
            if (nodes[k]->left) {
                nextNodes[nextSize] = nodes[k]->left;
                nextIndex[nextSize++] = 2 * i;
            }
            if (nodes[k]->right) {
                nextNodes[nextSize] = nodes[k]->right;
                nextIndex[nextSize++] = 2 * i + 1;
            }
        }
        struct TreeNode** swapNodes = nodes;
        nodes = nextNodes;
        nextNodes = swapNodes;
        long long* swapIndex = index;
        index = nextIndex;
        nextIndex = swapIndex;
        size = nextSize;
    }
    free(nodes);
    free(nextNodes);
    free(index);
    free(nextIndex);
    return (int) res;
}
