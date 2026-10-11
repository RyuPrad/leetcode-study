struct TreeNode* buildTree(int* preorder, int preorderSize, int* inorder, int inorderSize) {
    if (preorderSize == 0) return NULL;
    int rootVal = preorder[0];
    struct TreeNode* root = malloc(sizeof(struct TreeNode));
    root->val = rootVal;
    int mid = 0;
    while (inorder[mid] != rootVal) mid++;
    root->left = buildTree(preorder + 1, mid, inorder, mid);
    root->right = buildTree(preorder + mid + 1, preorderSize - mid - 1, inorder + mid + 1, inorderSize - mid - 1);
    return root;
}
