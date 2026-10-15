int minOperations(int* nums, int numsSize, int x) {
    int target = -x;
    for (int i = 0; i < numsSize; i++) target += nums[i];
    int left = 0, sum = 0, best = -1;
    for (int right = 0; right < numsSize; right++) {
        sum += nums[right];
        while (left <= right && sum > target) {
            sum -= nums[left];
            left++;
        }
        if (sum == target) {
            best = best > right - left + 1 ? best : right - left + 1;
        }
    }
    return best == -1 ? -1 : numsSize - best;
}
