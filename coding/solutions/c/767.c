// At most 26 letters, so the heap is a count array searched for the best entry:
// the larger count first, and among equal counts the larger letter.
char* reorganizeString(char* s) {
    int n = strlen(s), freq[26] = { 0 };
    bool inHeap[26] = { false };
    for (int i = 0; i < n; i++) freq[s[i] - 'a']++;
    for (int c = 0; c < 26; c++) inHeap[c] = freq[c] > 0;
    char* res = malloc(n + 1);
    int length = 0, prev = -1;
    while (true) {
        int best = -1;
        for (int c = 25; c >= 0; c--) if (inHeap[c] && (best < 0 || freq[c] > freq[best])) best = c;
        if (best < 0) break;
        inHeap[best] = false;
        res[length++] = (char)('a' + best);
        if (prev >= 0 && freq[prev] > 0) inHeap[prev] = true;
        freq[best]--;
        prev = best;
    }
    if (length != n) length = 0;
    res[length] = '\0';
    return res;
}
