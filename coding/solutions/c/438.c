int* findAnagrams(char* s, char* p, int* returnSize) {
    int n = strlen(s), m = strlen(p);
    int* res = malloc((n + 1) * sizeof(int));
    *returnSize = 0;
    if (m > n) {
        return res;
    }
    int need[26] = {0}, have[26] = {0};
    for (int i = 0; i < m; i++) {
        need[p[i] - 'a']++;
        have[s[i] - 'a']++;
    }
    if (memcmp(need, have, sizeof(need)) == 0) {
        res[(*returnSize)++] = 0;
    }
    for (int right = m; right < n; right++) {
        have[s[right] - 'a']++;
        have[s[right - m] - 'a']--;
        if (memcmp(need, have, sizeof(need)) == 0) {
            res[(*returnSize)++] = right - m + 1;
        }
    }
    return res;
}
