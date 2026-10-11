int reverse(int x) {
    long long value = llabs((long long)x);
    long long res = 0;
    while (value > 0) {
        res = res * 10 + value % 10;
        value /= 10;
    }
    res = x < 0 ? -res : res;
    if (res < INT_MIN || res > INT_MAX) return 0;
    return (int)res;
}
