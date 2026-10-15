int findNumberOfLIS(int* nums, int numsSize) {
    int n = numsSize;
    int* length = malloc(n * sizeof(int));
    int* count = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        length[i] = 1;
        count[i] = 1;
    }
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] >= nums[i]) {
                continue;
            }
            if (length[j] + 1 > length[i]) {
                length[i] = length[j] + 1;
                count[i] = count[j];
            } else if (length[j] + 1 == length[i]) {
                count[i] += count[j];
            }
        }
    }
    int longest = 0;
    for (int i = 0; i < n; i++) {
        if (length[i] > longest) longest = length[i];
    }
    int res = 0;
    for (int i = 0; i < n; i++) {
        if (length[i] == longest) {
            res += count[i];
        }
    }
    free(length);
    free(count);
    return res;
}
