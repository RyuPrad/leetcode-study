static int compare(const void* a, const void* b) {
    int x = *(const int*)a, y = *(const int*)b;
    return (x > y) - (x < y);
}

int minimizeMax(int* nums, int numsSize, int p) {
    qsort(nums, numsSize, sizeof(int), compare);
    int left = 0, right = nums[numsSize - 1] - nums[0];
    while (left < right) {
        int mid = left + (right - left) / 2;
        int pairs = 0;
        for (int i = 0; i + 1 < numsSize; i++) {
            if (nums[i + 1] - nums[i] <= mid) {
                pairs++;
                i++;
            }
        }
        if (pairs >= p) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    return left;
}
