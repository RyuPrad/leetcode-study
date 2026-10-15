long long maxAlternatingSum(int* nums, int numsSize) {
    long long plus = 0, minus = 0;
    for (int i = 0; i < numsSize; i++) {
        long long nextPlus = minus + nums[i] > plus ? minus + nums[i] : plus;
        long long nextMinus = plus - nums[i] > minus ? plus - nums[i] : minus;
        plus = nextPlus;
        minus = nextMinus;
    }
    return plus;
}
