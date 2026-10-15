static int compare(const void* a, const void* b) {
    return *(const int*)a - *(const int*)b;
}

int numSubseq(int* nums, int numsSize, int target) {
    const int MOD = 1000000007;
    qsort(nums, numsSize, sizeof(int), compare);
    int* pow = malloc(numsSize * sizeof(int));
    pow[0] = 1;
    for (int i = 1; i < numsSize; i++) {
        pow[i] = (pow[i - 1] * 2) % MOD;
    }
    int left = 0, right = numsSize - 1, res = 0;
    while (left <= right) {
        if (nums[left] + nums[right] > target) {
            right--;
        } else {
            res = (res + pow[right - left]) % MOD;
            left++;
        }
    }
    free(pow);
    return res;
}
