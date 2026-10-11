int majorityElement(int* nums, int numsSize) {
    int count = 0;
    int ans = 0;
    for (int i = 0; i < numsSize; i++) {
        if (count == 0) {
            ans = nums[i];
        }
        count += (nums[i] == ans) ? 1 : -1;
    }
    return ans;
}
