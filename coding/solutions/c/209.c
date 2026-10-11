int minSubArrayLen(int target, int* nums, int numsSize) {
    int left = 0;
    int sum = 0;
    int ans = INT_MAX;
    for (int right = 0; right < numsSize; right++) {
        sum += nums[right];
        while (sum >= target) {
            if (right - left + 1 < ans) ans = right - left + 1;
            sum -= nums[left];
            left++;
        }
    }
    return ans == INT_MAX ? 0 : ans;
}
