class Solution {
    public int minFlipsMonoIncr(String s) {
        int ones = 0, res = 0;
        for (char ch : s.toCharArray()) {
            if (ch == '1') {
                ones++;
            } else {
                res = Math.min(res + 1, ones);
            }
        }
        return res;
    }
}
