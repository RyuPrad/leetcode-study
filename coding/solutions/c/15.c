static int ascending(const void* a, const void* b) {
    int x = *(const int*)a, y = *(const int*)b;
    return (x > y) - (x < y);
}

int** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {
    qsort(nums, numsSize, sizeof(int), ascending);
    int capacity = 16, count = 0;
    int** res = malloc(capacity * sizeof(int*));

    for (int i = 0; i < numsSize; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;

        int left = i + 1;
        int right = numsSize - 1;

        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];

            if (sum == 0) {
                if (count == capacity) { capacity *= 2; res = realloc(res, capacity * sizeof(int*)); }
                res[count] = malloc(3 * sizeof(int));
                res[count][0] = nums[i]; res[count][1] = nums[left]; res[count][2] = nums[right];
                count++;
                left++;
                right--;

                while (left < right && nums[left] == nums[left - 1]) left++;
                while (left < right && nums[right] == nums[right + 1]) right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }

    *returnSize = count;
    *returnColumnSizes = malloc((count ? count : 1) * sizeof(int));
    for (int k = 0; k < count; k++) (*returnColumnSizes)[k] = 3;
    return res;
}
