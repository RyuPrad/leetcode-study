static int expand(char* s, int n, int l, int r) {
    int count = 0;
    while (l >= 0 && r < n && s[l] == s[r]) {
        count++;
        l--;
        r++;
    }
    return count;
}

int countSubstrings(char* s) {
    int n = strlen(s), count = 0;
    for (int i = 0; i < n; i++) {
        count += expand(s, n, i, i);
        count += expand(s, n, i, i + 1);
    }
    return count;
}
