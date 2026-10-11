int* productExceptSelf(int* nums, int numsSize, int* returnSize) {
    int n = numsSize;
    int* res = malloc(n * sizeof(int));

    int prefix = 1;

    for (int i = 0; i < n; i++) {
        res[i] = prefix;
        prefix *= nums[i];
    }

    int suffix = 1;

    for (int i = n - 1; i >= 0; i--) {
        res[i] *= suffix;
        suffix *= nums[i];
    }

    *returnSize = n;
    return res;
}
