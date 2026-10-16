typedef struct {
    struct TreeNode** stack;
    int top;
} BSTIterator;

static int countNodes(struct TreeNode* node) {
    return node ? 1 + countNodes(node->left) + countNodes(node->right) : 0;
}

static void pushLeft(BSTIterator* obj, struct TreeNode* node) {
    while (node) {
        obj->stack[obj->top++] = node;
        node = node->left;
    }
}

BSTIterator* bSTIteratorCreate(struct TreeNode* root) {
    BSTIterator* obj = malloc(sizeof(BSTIterator));
    obj->stack = malloc((countNodes(root) + 1) * sizeof(struct TreeNode*));
    obj->top = 0;
    pushLeft(obj, root);
    return obj;
}

int bSTIteratorNext(BSTIterator* obj) {
    struct TreeNode* node = obj->stack[--obj->top];
    pushLeft(obj, node->right);
    return node->val;
}

bool bSTIteratorHasNext(BSTIterator* obj) {
    return obj->top > 0;
}

void bSTIteratorFree(BSTIterator* obj) {
    free(obj->stack);
    free(obj);
}
