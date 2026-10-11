int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    int* nothing = NULL;
    printf("before crash %d\n", numsSize);
    *returnSize = nothing[12345];
    return nothing;
}
