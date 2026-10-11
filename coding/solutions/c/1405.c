// Three letters, so the heap is a count array: pick the larger count, then the larger letter.
static int pick(int* count, int skip) {
    int best = -1;
    for (int i = 2; i >= 0; i--) {
        if (i == skip || count[i] <= 0) continue;
        if (best < 0 || count[i] > count[best]) best = i;
    }
    return best;
}

char* longestDiverseString(int a, int b, int c) {
    int count[3] = { a, b, c };
    char* res = malloc(a + b + c + 1);
    int length = 0;
    while (true) {
        int first = pick(count, -1);
        if (first < 0) break;
        char ch = (char)('a' + first);
        if (length >= 2 && res[length - 1] == ch && res[length - 2] == ch) {
            int second = pick(count, first);
            if (second < 0) break;
            res[length++] = (char)('a' + second);
            count[second]--;
        } else {
            res[length++] = ch;
            count[first]--;
        }
    }
    res[length] = '\0';
    return res;
}
