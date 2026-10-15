int minimizeArrayValue(int* nums, int numsSize) {
    long long prefix = 0, res = 0;
    for (int i = 0; i < numsSize; i++) {
        prefix += nums[i];
        long long average = (prefix + i) / (i + 1);
        if (average > res) res = average;
    }
    return (int) res;
}
