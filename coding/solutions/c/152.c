static int max3(int a, int b, int c) { int m = a > b ? a : b; return m > c ? m : c; }
static int min3(int a, int b, int c) { int m = a < b ? a : b; return m < c ? m : c; }

int maxProduct(int* nums, int numsSize) {
    int res = nums[0];
    int curMax = nums[0];
    int curMin = nums[0];
    for (int i = 1; i < numsSize; i++) {
        int n = nums[i];
        int tmpMax = max3(n, curMax * n, curMin * n);
        curMin = min3(n, curMax * n, curMin * n);
        curMax = tmpMax;
        if (curMax > res) res = curMax;
    }
    return res;
}
