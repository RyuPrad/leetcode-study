// The chain reaches at most a few hundred distinct numbers, so a small array serves as the seen set.
static bool has(const int* seen, int count, int n) {
    for (int i = 0; i < count; i++) if (seen[i] == n) return true;
    return false;
}

bool isHappy(int n) {
    int seen[1024], count = 0;
    while (n != 1 && !has(seen, count, n)) {
        seen[count++] = n;
        int sum = 0;
        while (n > 0) {
            int digit = n % 10;
            sum += digit * digit;
            n /= 10;
        }
        n = sum;
    }
    return n == 1;
}
