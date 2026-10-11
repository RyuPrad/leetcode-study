char* alienOrder(char** words, int wordsSize) {
    // Letters are kept in first-seen order, and edges in insertion order, as in the reference.
    char letters[26];
    int letterCount = 0, indegree[26] = { 0 };
    bool present[26] = { false }, edge[26][26] = { { false } };
    char adj[26][26];
    int adjSize[26] = { 0 };
    for (int i = 0; i < wordsSize; i++) {
        for (char* ch = words[i]; *ch; ch++) {
            int c = *ch - 'a';
            if (!present[c]) { present[c] = true; letters[letterCount++] = *ch; }
        }
    }
    char* res = malloc(27);
    for (int i = 0; i < wordsSize - 1; i++) {
        char *w1 = words[i], *w2 = words[i + 1];
        int len1 = strlen(w1), len2 = strlen(w2), minLen = len1 < len2 ? len1 : len2;
        if (len1 > len2 && strncmp(w1, w2, minLen) == 0) { res[0] = '\0'; return res; }
        for (int j = 0; j < minLen; j++) {
            if (w1[j] != w2[j]) {
                int a = w1[j] - 'a', b = w2[j] - 'a';
                if (!edge[a][b]) { edge[a][b] = true; adj[a][adjSize[a]++] = (char)b; indegree[b]++; }
                break;
            }
        }
    }
    int queue[26], head = 0, tail = 0, length = 0;
    for (int i = 0; i < letterCount; i++) if (indegree[letters[i] - 'a'] == 0) queue[tail++] = letters[i] - 'a';
    while (head < tail) {
        int c = queue[head++];
        res[length++] = (char)('a' + c);
        for (int k = 0; k < adjSize[c]; k++) {
            int nei = adj[c][k];
            if (--indegree[nei] == 0) queue[tail++] = nei;
        }
    }
    if (length != letterCount) length = 0;
    res[length] = '\0';
    return res;
}
