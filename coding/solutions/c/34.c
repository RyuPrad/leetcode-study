int* searchRange(long long* nums, int numsSize, long long target, int* returnSize) {
    int left = 0;
    int right = numsSize;
    // Lower bound: first index whose value is at least target.
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    int first = left;
    left = 0;
    right = numsSize;
    // Upper bound: first index whose value is greater than target.
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] <= target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    int afterLast = left;
    int* res = malloc(2 * sizeof(int));
    *returnSize = 2;
    if (first == numsSize || nums[first] != target) {
        res[0] = -1;
        res[1] = -1;
        return res;
    }
    res[0] = first;
    res[1] = afterLast - 1;
    return res;
}
