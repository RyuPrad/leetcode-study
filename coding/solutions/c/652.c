struct Entry {
    int key[3];
    int id;
    int count;
    UT_hash_handle hh;
};

static int visit(struct TreeNode* node, struct Entry** ids, struct TreeNode** res, int* size) {
    if (!node) {
        return 0;
    }
    int left = visit(node->left, ids, res, size);
    int right = visit(node->right, ids, res, size);
    int key[3] = {node->val, left, right};
    struct Entry* entry;
    HASH_FIND(hh, *ids, key, sizeof(key), entry);
    if (!entry) {
        entry = calloc(1, sizeof(struct Entry));
        memcpy(entry->key, key, sizeof(key));
        entry->id = HASH_COUNT(*ids) + 1;
        HASH_ADD(hh, *ids, key, sizeof(entry->key), entry);
    }
    entry->count++;
    if (entry->count == 2) {
        res[(*size)++] = node;
    }
    return entry->id;
}

static int countNodes(struct TreeNode* node) {
    return node ? 1 + countNodes(node->left) + countNodes(node->right) : 0;
}

struct TreeNode** findDuplicateSubtrees(struct TreeNode* root, int* returnSize) {
    struct Entry *ids = NULL, *entry, *tmp;
    struct TreeNode** res = malloc((countNodes(root) + 1) * sizeof(struct TreeNode*));
    *returnSize = 0;
    visit(root, &ids, res, returnSize);
    HASH_ITER(hh, ids, entry, tmp) {
        HASH_DEL(ids, entry);
        free(entry);
    }
    return res;
}
