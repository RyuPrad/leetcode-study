typedef struct {
    const char* word;
    UT_hash_handle hh;
} Entry;

char** findAllConcatenatedWordsInADict(char** words, int wordsSize, int* returnSize) {
    Entry* dict = NULL;
    for (int i = 0; i < wordsSize; i++) {
        Entry* entry = malloc(sizeof(Entry));
        entry->word = words[i];
        HASH_ADD_KEYPTR(hh, dict, entry->word, strlen(entry->word), entry);
    }
    char** res = malloc((wordsSize + 1) * sizeof(char*));
    *returnSize = 0;
    for (int w = 0; w < wordsSize; w++) {
        char* word = words[w];
        int n = strlen(word);
        bool* dp = calloc(n + 1, sizeof(bool));
        dp[0] = true;
        for (int end = 1; end <= n; end++) {
            for (int start = 0; start < end; start++) {
                if (start == 0 && end == n) {
                    continue;
                }
                Entry* found = NULL;
                if (dp[start]) {
                    HASH_FIND(hh, dict, word + start, end - start, found);
                }
                if (found) {
                    dp[end] = true;
                    break;
                }
            }
        }
        if (dp[n]) {
            res[(*returnSize)++] = word;
        }
        free(dp);
    }
    Entry *entry, *tmp;
    HASH_ITER(hh, dict, entry, tmp) {
        HASH_DEL(dict, entry);
        free(entry);
    }
    return res;
}
