int maxProduct(char* s) {
    int n = strlen(s), total = 1 << n;
    int* lengths = calloc(total, sizeof(int));
    for (int mask = 1; mask < total; mask++) {
        char picked[13];
        int length = 0;
        for (int i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                picked[length++] = s[i];
            }
        }
        bool palindrome = true;
        for (int k = 0; k < length / 2; k++) if (picked[k] != picked[length - 1 - k]) palindrome = false;
        if (palindrome) {
            lengths[mask] = length;
        }
    }
    int res = 0;
    for (int a = 1; a < total; a++) {
        if (!lengths[a]) continue;
        for (int b = 1; b < total; b++) {
            if (lengths[b] && (a & b) == 0) {
                if (lengths[a] * lengths[b] > res) res = lengths[a] * lengths[b];
            }
        }
    }
    free(lengths);
    return res;
}
