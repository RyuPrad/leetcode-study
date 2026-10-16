struct Entry {
    int value;
    int index;
    UT_hash_handle hh;
};

static struct TreeNode* build(int lo, int hi, int* postorder, int* post, struct Entry* at) {
    if (lo > hi) {
        return NULL;
    }
    struct TreeNode* node = malloc(sizeof(struct TreeNode));
    node->val = postorder[(*post)--];
    struct Entry* entry;
    HASH_FIND_INT(at, &node->val, entry);
    int mid = entry->index;
    node->right = build(mid + 1, hi, postorder, post, at);
    node->left = build(lo, mid - 1, postorder, post, at);
    return node;
}

struct TreeNode* buildTree(int* inorder, int inorderSize, int* postorder, int postorderSize) {
    struct Entry *at = NULL, *entries = malloc(inorderSize * sizeof(struct Entry));
    for (int i = 0; i < inorderSize; i++) {
        entries[i].value = inorder[i];
        entries[i].index = i;
        HASH_ADD_INT(at, value, &entries[i]);
    }
    int post = postorderSize - 1;
    struct TreeNode* root = build(0, inorderSize - 1, postorder, &post, at);
    HASH_CLEAR(hh, at);
    free(entries);
    return root;
}
