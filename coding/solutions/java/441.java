class Solution {
    public int arrangeCoins(int n) {
        long left = 1, right = n, res = 0;
        while (left <= right) {
            long mid = (left + right) / 2;
            long coins = mid * (mid + 1) / 2;
            if (coins > n) {
                right = mid - 1;
            } else {
                res = mid;
                left = mid + 1;
            }
        }
        return (int) res;
    }
}
