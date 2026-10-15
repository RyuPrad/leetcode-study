static bool contains(int* nums, int size, int value) {
    for (int i = 0; i < size; i++) if (nums[i] == value) return true;
    return false;
}

static int* only(int* a, int aSize, int* b, int bSize, int* size) {
    int* res = malloc((aSize + 1) * sizeof(int));
    *size = 0;
    for (int i = 0; i < aSize; i++) {
        if (!contains(b, bSize, a[i]) && !contains(res, *size, a[i])) res[(*size)++] = a[i];
    }
    return res;
}

int** findDifference(int* nums1, int nums1Size, int* nums2, int nums2Size, int* returnSize, int** returnColumnSizes) {
    int** res = malloc(2 * sizeof(int*));
    *returnColumnSizes = malloc(2 * sizeof(int));
    res[0] = only(nums1, nums1Size, nums2, nums2Size, &(*returnColumnSizes)[0]);
    res[1] = only(nums2, nums2Size, nums1, nums1Size, &(*returnColumnSizes)[1]);
    *returnSize = 2;
    return res;
}
