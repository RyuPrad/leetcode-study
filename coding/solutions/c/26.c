int removeDuplicates(int* nums, int numsSize) {
    if (numsSize == 0) return 0;
    int left = 0;
    for (int right = 1; right < numsSize; right++) {
        if (nums[right] != nums[left]) {
            left++;
            nums[left] = nums[right];
        }
    }
    return left + 1;
}
