int* shuffle(int* nums, int numsSize, int n, int* returnSize) {
    for (int i = 0; i < n; i++) {
        nums[i] = (nums[i] << 10) | nums[n + i];
    }
    int j = 2 * n - 1;
    for (int i = n - 1; i >= 0; i--) {
        int y = nums[i] & 1023;
        int x = nums[i] >> 10;
        nums[j] = y;
        nums[j - 1] = x;
        j -= 2;
    }
    *returnSize = numsSize;
    return nums;
}
