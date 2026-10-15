bool wordPattern(char* pattern, char* s) {
    char* words[300];
    int count = 0;
    char* copy = strdup(s);
    for (char* word = strtok(copy, " "); word; word = strtok(NULL, " ")) words[count++] = word;
    int n = strlen(pattern);
    if (count != n) {
        free(copy);
        return false;
    }
    char* charToWord[26] = {0};
    for (int i = 0; i < n; i++) {
        int c = pattern[i] - 'a';
        char* word = words[i];
        bool taken = false;
        for (int k = 0; k < 26; k++) {
            if (k != c && charToWord[k] && strcmp(charToWord[k], word) == 0) taken = true;
        }
        if ((charToWord[c] && strcmp(charToWord[c], word) != 0) || taken) {
            free(copy);
            return false;
        }
        charToWord[c] = word;
    }
    free(copy);
    return true;
}
