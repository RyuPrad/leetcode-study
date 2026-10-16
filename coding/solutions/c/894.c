static struct TreeNode** memo[21];
static int memoSize[21];

static struct TreeNode* newNode(struct TreeNode* left, struct TreeNode* right) {
    struct TreeNode* node = malloc(sizeof(struct TreeNode));
    node->val = 0;
    node->left = left;
    node->right = right;
    return node;
}

static struct TreeNode** build(int k) {
    if (memo[k]) {
        return memo[k];
    }
    int cap = 16, size = 0;
    struct TreeNode** res = malloc(cap * sizeof(struct TreeNode*));
    for (int left = 1; left < k; left += 2) {
        struct TreeNode** lefts = build(left);
        struct TreeNode** rights = build(k - 1 - left);
        for (int a = 0; a < memoSize[left]; a++) {
            for (int b = 0; b < memoSize[k - 1 - left]; b++) {
                if (size == cap) {
                    cap *= 2;
                    res = realloc(res, cap * sizeof(struct TreeNode*));
                }
                res[size++] = newNode(lefts[a], rights[b]);
            }
        }
    }
    memo[k] = res;
    memoSize[k] = size;
    return res;
}

struct TreeNode** allPossibleFBT(int n, int* returnSize) {
    for (int k = 0; k <= 20; k++) {
        memo[k] = NULL;
        memoSize[k] = 0;
    }
    memo[1] = malloc(sizeof(struct TreeNode*));
    memo[1][0] = newNode(NULL, NULL);
    memoSize[1] = 1;
    if (n % 2 == 0) {
        *returnSize = 0;
        return malloc(sizeof(struct TreeNode*));
    }
    struct TreeNode** trees = build(n);
    *returnSize = memoSize[n];
    struct TreeNode** res = malloc(memoSize[n] * sizeof(struct TreeNode*));
    memcpy(res, trees, memoSize[n] * sizeof(struct TreeNode*));
    return res;
}
