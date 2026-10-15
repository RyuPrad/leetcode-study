static int compare(const void* a, const void* b) {
    return *(const int*)a - *(const int*)b;
}

int maxFrequency(int* nums, int numsSize, int k) {
    qsort(nums, numsSize, sizeof(int), compare);
    int left = 0, res = 0;
    long long total = 0;
    for (int right = 0; right < numsSize; right++) {
        total += nums[right];
        while ((long long) nums[right] * (right - left + 1) > total + k) {
            total -= nums[left];
            left++;
        }
        res = res > right - left + 1 ? res : right - left + 1;
    }
    return res;
}
