int* getConcatenation(int* nums, int numsSize, int* returnSize) {
    int* res = malloc(numsSize * 2 * sizeof(int));

    for (int i = 0; i < numsSize; i++) {
        res[i] = nums[i];
        res[i + numsSize] = nums[i];
    }

    *returnSize = numsSize * 2;
    return res;
}
