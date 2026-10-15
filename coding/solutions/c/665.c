bool checkPossibility(int* nums, int numsSize) {
    bool changed = false;
    for (int i = 1; i < numsSize; i++) {
        if (nums[i] >= nums[i - 1]) {
            continue;
        }
        if (changed) {
            return false;
        }
        changed = true;
        if (i < 2 || nums[i - 2] <= nums[i]) {
            nums[i - 1] = nums[i];
        } else {
            nums[i] = nums[i - 1];
        }
    }
    return true;
}
