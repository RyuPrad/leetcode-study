long long minEnd(int n, int x) {
    long long result = x;
    long long remaining = n - 1;
    long long bit = 1;
    while (remaining > 0) {
        if ((result & bit) == 0) {
            if (remaining & 1) {
                result |= bit;
            }
            remaining >>= 1;
        }
        bit <<= 1;
    }
    return result;
}
