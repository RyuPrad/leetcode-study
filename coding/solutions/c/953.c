bool isAlienSorted(char** words, int wordsSize, char* order) {
    int rank[26];
    for (int i = 0; order[i]; i++) rank[order[i] - 'a'] = i;
    for (int i = 0; i < wordsSize - 1; i++) {
        char* w1 = words[i];
        char* w2 = words[i + 1];
        for (int j = 0; ; j++) {
            if (!w1[j]) break;
            if (!w2[j]) return false;
            if (w1[j] != w2[j]) {
                if (rank[w1[j] - 'a'] > rank[w2[j] - 'a']) return false;
                break;
            }
        }
    }
    return true;
}
