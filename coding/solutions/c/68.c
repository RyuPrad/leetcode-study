char** fullJustify(char** words, int wordsSize, int maxWidth, int* returnSize) {
    char** res = malloc(wordsSize * sizeof(char*));
    *returnSize = 0;
    int i = 0;
    while (i < wordsSize) {
        int j = i, length = 0;
        while (j < wordsSize && length + (int) strlen(words[j]) + (j - i) <= maxWidth) {
            length += strlen(words[j]);
            j++;
        }
        int gaps = j - i - 1;
        char* line = calloc(maxWidth + 1, 1);
        if (j == wordsSize || gaps == 0) {
            for (int k = i; k < j; k++) {
                if (k > i) strcat(line, " ");
                strcat(line, words[k]);
            }
            memset(line + strlen(line), ' ', maxWidth - strlen(line));
        } else {
            int spaces = (maxWidth - length) / gaps, extra = (maxWidth - length) % gaps;
            for (int k = i; k < j - 1; k++) {
                strcat(line, words[k]);
                memset(line + strlen(line), ' ', spaces + (k - i < extra ? 1 : 0));
            }
            strcat(line, words[j - 1]);
        }
        res[(*returnSize)++] = line;
        i = j;
    }
    return res;
}
