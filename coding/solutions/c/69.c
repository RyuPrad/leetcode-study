int mySqrt(int x) {
    long long left = 0;
    long long right = x;
    long long ans = 0;
    while (left <= right) {
        long long mid = (left + right) / 2;
        if (mid * mid <= x) {
            ans = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return (int)ans;
}
