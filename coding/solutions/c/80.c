int removeDuplicates(int* nums, int numsSize) {
    int left = 0;
    for (int right = 0; right < numsSize; right++) {
        if (left < 2 || nums[right] != nums[left - 2]) {
            nums[left] = nums[right];
            left++;
        }
    }
    return left;
}
