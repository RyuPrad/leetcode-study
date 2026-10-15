class Solution {
    public int[] missingRolls(int[] rolls, int mean, int n) {
        int m = rolls.length;
        int missing = mean * (n + m);
        for (int roll : rolls) {
            missing -= roll;
        }
        if (missing < n || missing > 6 * n) {
            return new int[0];
        }
        int[] res = new int[n];
        Arrays.fill(res, missing / n);
        for (int i = 0; i < missing % n; i++) {
            res[i]++;
        }
        return res;
    }
}
