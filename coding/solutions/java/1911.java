class Solution {
    public long maxAlternatingSum(int[] nums) {
        long plus = 0, minus = 0;
        for (int num : nums) {
            long nextPlus = Math.max(plus, minus + num);
            long nextMinus = Math.max(minus, plus - num);
            plus = nextPlus;
            minus = nextMinus;
        }
        return plus;
    }
}
