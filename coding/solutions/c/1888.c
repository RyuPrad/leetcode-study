int minFlips(char* s) {
    int n = strlen(s);
    char* t = malloc(2 * n + 1);
    strcpy(t, s);
    strcat(t, s);
    int diff1 = 0, diff2 = 0, res = INT_MAX;
    for (int right = 0; right < 2 * n; right++) {
        if (t[right] != (right % 2 == 0 ? '0' : '1')) diff1++;
        if (t[right] != (right % 2 == 0 ? '1' : '0')) diff2++;
        if (right >= n) {
            int left = right - n;
            if (t[left] != (left % 2 == 0 ? '0' : '1')) diff1--;
            if (t[left] != (left % 2 == 0 ? '1' : '0')) diff2--;
        }
        if (right >= n - 1) {
            int best = diff1 < diff2 ? diff1 : diff2;
            if (best < res) res = best;
        }
    }
    free(t);
    return res;
}
