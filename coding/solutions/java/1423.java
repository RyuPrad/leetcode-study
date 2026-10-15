class Solution {
    public int maxScore(int[] cardPoints, int k) {
        int n = cardPoints.length;
        int total = 0;
        for (int i = 0; i < k; i++) {
            total += cardPoints[i];
        }
        int res = total;
        for (int i = 0; i < k; i++) {
            total += cardPoints[n - 1 - i] - cardPoints[k - 1 - i];
            res = Math.max(res, total);
        }
        return res;
    }
}
