class Solution {
    public long zeroFilledSubarray(int[] nums) {
        long res = 0, run = 0;
        for (int num : nums) {
            if (num == 0) {
                run++;
                res += run;
            } else {
                run = 0;
            }
        }
        return res;
    }
}
