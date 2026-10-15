int pivotIndex(int* nums, int numsSize) {
    int total = 0;
    for (int k = 0; k < numsSize; k++) total += nums[k];
    int leftSum = 0;
    for (int i = 0; i < numsSize; i++) {
        if (leftSum == total - leftSum - nums[i]) {
            return i;
        }
        leftSum += nums[i];
    }
    return -1;
}
