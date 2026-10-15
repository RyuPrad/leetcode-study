int arraySign(int* nums, int numsSize) {
    int sign = 1;
    for (int i = 0; i < numsSize; i++) {
        int num = nums[i];
        if (num == 0) {
            return 0;
        }
        if (num < 0) {
            sign = -sign;
        }
    }
    return sign;
}
