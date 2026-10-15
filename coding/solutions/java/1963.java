class Solution {
    public int minSwaps(String s) {
        int extraClose = 0, maxClose = 0;
        for (char c : s.toCharArray()) {
            if (c == ']') {
                extraClose++;
            } else {
                extraClose--;
            }
            maxClose = Math.max(maxClose, extraClose);
        }
        return (maxClose + 1) / 2;
    }
}
