int* findDisappearedNumbers(int* nums, int numsSize, int* returnSize) {
    for (int k = 0; k < numsSize; k++) {
        int num = nums[k];
        int index = abs(num) - 1;
        nums[index] = -abs(nums[index]);
    }
    int* res = malloc(numsSize * sizeof(int));
    int count = 0;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] > 0) {
            res[count++] = i + 1;
        }
    }
    *returnSize = count;
    return res;
}
