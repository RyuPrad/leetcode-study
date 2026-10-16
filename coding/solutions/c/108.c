static struct TreeNode* build(int* nums, int lo, int hi) {
    if (lo > hi) {
        return NULL;
    }
    int mid = (lo + hi) / 2;
    struct TreeNode* node = malloc(sizeof(struct TreeNode));
    node->val = nums[mid];
    node->left = build(nums, lo, mid - 1);
    node->right = build(nums, mid + 1, hi);
    return node;
}

struct TreeNode* sortedArrayToBST(int* nums, int numsSize) {
    return build(nums, 0, numsSize - 1);
}
