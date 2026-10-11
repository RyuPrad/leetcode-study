static char** res;
static int count, capacity;
static char sentence[64];

static bool hasWord(char** words, int total, const char* start, int length) {
    for (int k = 0; k < total; k++) {
        if ((int)strlen(words[k]) == length && strncmp(words[k], start, length) == 0) return true;
    }
    return false;
}

static void dfs(char* s, int n, char** words, int total, int start, int length) {
    if (start == n) {
        if (count == capacity) { capacity *= 2; res = realloc(res, capacity * sizeof(char*)); }
        res[count] = malloc(length);
        memcpy(res[count], sentence, length - 1);
        res[count++][length - 1] = '\0';
        return;
    }
    for (int end = start + 1; end <= n; end++) {
        if (hasWord(words, total, s + start, end - start)) {
            memcpy(sentence + length, s + start, end - start);
            sentence[length + end - start] = ' ';
            dfs(s, n, words, total, end, length + end - start + 1);
        }
    }
}

char** wordBreak(char* s, char** wordDict, int wordDictSize, int* returnSize) {
    count = 0;
    capacity = 16;
    res = malloc(capacity * sizeof(char*));
    dfs(s, strlen(s), wordDict, wordDictSize, 0, 0);
    *returnSize = count;
    return res;
}
