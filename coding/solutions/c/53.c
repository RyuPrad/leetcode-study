int maxSubArray(int* nums, int numsSize) {
    int curSum = nums[0];
    int maxSum = nums[0];
    for (int i = 1; i < numsSize; i++) {
        curSum = nums[i] > curSum + nums[i] ? nums[i] : curSum + nums[i];
        if (curSum > maxSum) maxSum = curSum;
    }
    return maxSum;
}
