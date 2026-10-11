struct TreeNode* deleteNode(struct TreeNode* root, int key) {
    if (!root) return NULL;
    if (key < root->val) {
        root->left = deleteNode(root->left, key);
    } else if (key > root->val) {
        root->right = deleteNode(root->right, key);
    } else {
        if (!root->left) return root->right;
        if (!root->right) return root->left;
        struct TreeNode* min = root->right;
        while (min->left) min = min->left;
        root->val = min->val;
        root->right = deleteNode(root->right, min->val);
    }
    return root;
}
