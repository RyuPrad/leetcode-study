int maxSubarraySumCircular(int* nums, int numsSize) {
    int total = 0;
    int curMax = 0, maxSum = nums[0];
    int curMin = 0, minSum = nums[0];
    for (int i = 0; i < numsSize; i++) {
        int num = nums[i];
        curMax = curMax + num > num ? curMax + num : num;
        if (curMax > maxSum) maxSum = curMax;
        curMin = curMin + num < num ? curMin + num : num;
        if (curMin < minSum) minSum = curMin;
        total += num;
    }
    if (maxSum <= 0) return maxSum;
    return maxSum > total - minSum ? maxSum : total - minSum;
}
