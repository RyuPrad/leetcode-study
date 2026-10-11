static int robLine(int* nums, int from, int to) {
    int prev = 0, curr = 0;
    for (int i = from; i <= to; i++) {
        int next = curr > prev + nums[i] ? curr : prev + nums[i];
        prev = curr;
        curr = next;
    }
    return curr;
}

int rob(int* nums, int numsSize) {
    int n = numsSize;
    if (n == 1) return nums[0];
    int a = robLine(nums, 0, n - 2), b = robLine(nums, 1, n - 1);
    return a > b ? a : b;
}
