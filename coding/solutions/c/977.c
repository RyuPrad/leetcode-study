int* sortedSquares(int* nums, int numsSize, int* returnSize) {
    int* res = calloc(numsSize, sizeof(int));
    int left = 0, right = numsSize - 1;
    for (int i = numsSize - 1; i >= 0; i--) {
        if (abs(nums[left]) > abs(nums[right])) {
            res[i] = nums[left] * nums[left];
            left++;
        } else {
            res[i] = nums[right] * nums[right];
            right--;
        }
    }
    *returnSize = numsSize;
    return res;
}
