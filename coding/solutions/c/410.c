int splitArray(int* nums, int numsSize, int k) {
    int left = 0, right = 0;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] > left) left = nums[i];
        right += nums[i];
    }
    int ans = right;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        int pieces = 1;
        int cur = 0;
        for (int i = 0; i < numsSize; i++) {
            if (cur + nums[i] > mid) {
                pieces++;
                cur = 0;
            }
            cur += nums[i];
        }
        if (pieces <= k) {
            ans = mid;
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    return ans;
}
