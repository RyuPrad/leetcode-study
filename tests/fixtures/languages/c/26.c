int removeDuplicates(int* nums, int numsSize) {
    if (numsSize == 0) return 0;
    int left = 1;
    for (int right = 1; right < numsSize; right++)
        if (nums[right] != nums[left - 1]) nums[left++] = nums[right];
    return left;
}
