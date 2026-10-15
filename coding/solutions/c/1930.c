int countPalindromicSubsequence(char* s) {
    int n = strlen(s);
    int res = 0;
    for (char letter = 'a'; letter <= 'z'; letter++) {
        int first = -1, last = -1;
        for (int i = 0; i < n; i++) {
            if (s[i] == letter) {
                if (first == -1) first = i;
                last = i;
            }
        }
        if (first != -1 && last - first > 1) {
            bool seen[26] = {false};
            for (int i = first + 1; i < last; i++) {
                if (!seen[s[i] - 'a']) {
                    seen[s[i] - 'a'] = true;
                    res++;
                }
            }
        }
    }
    return res;
}
