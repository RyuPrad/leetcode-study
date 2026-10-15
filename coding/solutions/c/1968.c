static int compare(const void* a, const void* b) {
    return *(const int*)a - *(const int*)b;
}

int* rearrangeArray(int* nums, int numsSize, int* returnSize) {
    qsort(nums, numsSize, sizeof(int), compare);
    int* res = malloc(numsSize * sizeof(int));
    int size = 0;
    int left = 0, right = numsSize - 1;
    while (size < numsSize) {
        res[size++] = nums[left];
        left++;
        if (left <= right) {
            res[size++] = nums[right];
            right--;
        }
    }
    *returnSize = numsSize;
    return res;
}
