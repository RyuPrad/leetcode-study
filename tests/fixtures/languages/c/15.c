static int compare(const void* a, const void* b) { return *(const int*)a - *(const int*)b; }
int** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {
    qsort(nums, numsSize, sizeof(int), compare);
    int capacity = 16, count = 0;
    int** out = malloc(capacity * sizeof(int*));
    for (int i = 0; i < numsSize - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int lo = i + 1, hi = numsSize - 1;
        while (lo < hi) {
            int sum = nums[i] + nums[lo] + nums[hi];
            if (sum < 0) lo++;
            else if (sum > 0) hi--;
            else {
                if (count == capacity) { capacity *= 2; out = realloc(out, capacity * sizeof(int*)); }
                out[count] = malloc(3 * sizeof(int));
                out[count][0] = nums[i]; out[count][1] = nums[lo]; out[count][2] = nums[hi]; count++;
                while (lo < hi && nums[lo] == nums[lo + 1]) lo++;
                while (lo < hi && nums[hi] == nums[hi - 1]) hi--;
                lo++; hi--;
            }
        }
    }
    *returnSize = count;
    *returnColumnSizes = malloc((count ? count : 1) * sizeof(int));
    for (int k = 0; k < count; k++) (*returnColumnSizes)[k] = 3;
    return out;
}
