bool hasAllCodes(char* s, int k) {
    int n = strlen(s), total = 1 << k, count = 0;
    bool* codes = calloc(total, sizeof(bool));
    for (int i = 0; i + k <= n; i++) {
        int code = 0;
        for (int j = i; j < i + k; j++) code = code * 2 + (s[j] - '0');
        if (!codes[code]) {
            codes[code] = true;
            count++;
        }
    }
    free(codes);
    return count == total;
}
