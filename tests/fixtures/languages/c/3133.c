long long minEnd(int n, int x) {
    long long result = x, remaining = n - 1;
    for (long long bit = 1; remaining; bit <<= 1)
        if (!(result & bit)) { if (remaining & 1) result |= bit; remaining >>= 1; }
    return result;
}
