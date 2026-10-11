static int ascending(const void* a, const void* b) {
    int x = *(const int*)a, y = *(const int*)b;
    return (x > y) - (x < y);
}

int** fourSum(int* nums, int numsSize, int target, int* returnSize, int** returnColumnSizes) {
    qsort(nums, numsSize, sizeof(int), ascending);
    int capacity = 16, count = 0;
    int** res = malloc(capacity * sizeof(int*));
    int n = numsSize;
    for (int i = 0; i < n - 3; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        for (int j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && nums[j] == nums[j - 1]) continue;
            int left = j + 1;
            int right = n - 1;
            while (left < right) {
                long long sum = (long long)nums[i] + nums[j] + nums[left] + nums[right];
                if (sum == target) {
                    if (count == capacity) { capacity *= 2; res = realloc(res, capacity * sizeof(int*)); }
                    res[count] = malloc(4 * sizeof(int));
                    res[count][0] = nums[i]; res[count][1] = nums[j]; res[count][2] = nums[left]; res[count][3] = nums[right];
                    count++;
                    left++;
                    right--;
                    while (left < right && nums[left] == nums[left - 1]) left++;
                    while (left < right && nums[right] == nums[right + 1]) right--;
                } else if (sum < target) {
                    left++;
                } else {
                    right--;
                }
            }
        }
    }
    *returnSize = count;
    *returnColumnSizes = malloc((count ? count : 1) * sizeof(int));
    for (int k = 0; k < count; k++) (*returnColumnSizes)[k] = 4;
    return res;
}
