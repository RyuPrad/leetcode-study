struct TreeNode* searchBST(struct TreeNode* root, int val) {
    struct TreeNode* curr = root;
    while (curr != NULL) {
        if (curr->val == val) {
            return curr;
        }
        if (val < curr->val) {
            curr = curr->left;
        } else {
            curr = curr->right;
        }
    }
    return NULL;
}
