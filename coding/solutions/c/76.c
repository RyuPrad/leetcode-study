char* minWindow(char* s, char* t) {
    int need[128] = { 0 }, window[128] = { 0 };
    int needCount = 0;
    for (char* c = t; *c; c++) if (need[(int)*c]++ == 0) needCount++;
    int have = 0, left = 0;
    int resLen = INT_MAX, resStart = 0;
    for (int right = 0; s[right]; right++) {
        int c = s[right];
        window[c]++;
        if (need[c] > 0 && window[c] == need[c]) have++;
        while (have == needCount) {
            if (right - left + 1 < resLen) {
                resLen = right - left + 1; resStart = left;
            }
            int d = s[left];
            window[d]--;
            if (need[d] > 0 && window[d] < need[d]) have--;
            left++;
        }
    }
    if (resLen == INT_MAX) resLen = 0;
    char* res = malloc(resLen + 1);
    memcpy(res, s + resStart, resLen);
    res[resLen] = '\0';
    return res;
}
