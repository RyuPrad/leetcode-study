static int start, maxLen;

static void expand(char* s, int n, int l, int r) {
    while (l >= 0 && r < n && s[l] == s[r]) {
        if (r - l + 1 > maxLen) { start = l; maxLen = r - l + 1; }
        l--;
        r++;
    }
}

char* longestPalindrome(char* s) {
    int n = strlen(s);
    start = 0;
    maxLen = n < 2 ? n : 1;
    for (int i = 0; i < n; i++) {
        expand(s, n, i, i);
        expand(s, n, i, i + 1);
    }
    char* result = malloc(maxLen + 1);
    memcpy(result, s + start, maxLen);
    result[maxLen] = '\0';
    return result;
}
