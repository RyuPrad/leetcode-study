static char** words;
static int wordCount;
static int best;

static bool unique(const char* text) {
    bool seen[26] = {false};
    for (int i = 0; text[i]; i++) {
        if (seen[text[i] - 'a']) return false;
        seen[text[i] - 'a'] = true;
    }
    return true;
}

static void backtrack(int index, const char* used) {
    int length = strlen(used);
    if (length > best) best = length;
    for (int i = index; i < wordCount; i++) {
        char candidate[64];
        strcpy(candidate, used);
        strcat(candidate, words[i]);
        if (unique(candidate)) {
            backtrack(i + 1, candidate);
        }
    }
}

int maxLength(char** arr, int arrSize) {
    words = arr;
    wordCount = arrSize;
    best = 0;
    backtrack(0, "");
    return best;
}
