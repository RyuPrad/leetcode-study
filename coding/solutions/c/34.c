static int bound(int* nums, int numsSize, int target, bool leftBias) {
    int left = 0, right = numsSize - 1, res = -1;
    while (left <= right) {
        int mid = (left + right) / 2;
        if (nums[mid] < target) {
            left = mid + 1;
        } else if (nums[mid] > target) {
            right = mid - 1;
        } else {
            res = mid;
            if (leftBias) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
    }
    return res;
}

int* searchRange(int* nums, int numsSize, int target, int* returnSize) {
    int first = bound(nums, numsSize, target, true);
    int last = bound(nums, numsSize, target, false);
    int* res = malloc(2 * sizeof(int));
    res[0] = first;
    res[1] = last;
    *returnSize = 2;
    return res;
}
