long long zeroFilledSubarray(int* nums, int numsSize) {
    long long res = 0, run = 0;
    for (int i = 0; i < numsSize; i++) {
        int num = nums[i];
        if (num == 0) {
            run++;
            res += run;
        } else {
            run = 0;
        }
    }
    return res;
}
