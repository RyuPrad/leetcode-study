static int compare(const void* a, const void* b) {
    return *(const int*)a - *(const int*)b;
}

int minimumDifference(int* nums, int numsSize, int k) {
    qsort(nums, numsSize, sizeof(int), compare);
    int res = INT_MAX;
    for (int left = 0; left + k - 1 < numsSize; left++) {
        int right = left + k - 1;
        res = nums[right] - nums[left] < res ? nums[right] - nums[left] : res;
    }
    return res;
}
