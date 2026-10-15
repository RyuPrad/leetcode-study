int partitionString(char* s) {
    bool seen[26] = {false};
    int res = 1;
    for (char* p = s; *p; p++) {
        char c = *p;
        if (seen[c - 'a']) {
            res++;
            memset(seen, 0, sizeof(seen));
        }
        seen[c - 'a'] = true;
    }
    return res;
}
