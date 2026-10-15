int arrangeCoins(int n) {
    long long left = 1, right = n, res = 0;
    while (left <= right) {
        long long mid = (left + right) / 2;
        long long coins = mid * (mid + 1) / 2;
        if (coins > n) {
            right = mid - 1;
        } else {
            res = mid;
            left = mid + 1;
        }
    }
    return (int) res;
}
