static bool hasWord(char** words, int count, const char* start, int length) {
    for (int k = 0; k < count; k++) {
        if ((int)strlen(words[k]) == length && strncmp(words[k], start, length) == 0) return true;
    }
    return false;
}

bool wordBreak(char* s, char** wordDict, int wordDictSize) {
    int n = strlen(s);
    bool* dp = calloc(n + 1, sizeof(bool));
    dp[0] = true;
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j < i; j++) {
            if (dp[j] && hasWord(wordDict, wordDictSize, s + j, i - j)) {
                dp[i] = true;
                break;
            }
        }
    }
    bool result = dp[n];
    free(dp);
    return result;
}
