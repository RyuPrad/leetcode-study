/** Encodes a list of strings to a single string. */
char* encode(char** strs, int strsSize) {
    size_t total = 1;
    for (int i = 0; i < strsSize; i++) total += strlen(strs[i]) + 12;
    char* encoded = malloc(total);
    char* end = encoded;
    *end = '\0';
    for (int i = 0; i < strsSize; i++) {
        end += sprintf(end, "%d#%s", (int)strlen(strs[i]), strs[i]);
    }
    return encoded;
}

/** Decodes a single string to a list of strings. */
char** decode(char* s, int* returnSize) {
    char** decoded = malloc((strlen(s) / 2 + 1) * sizeof(char*));
    int count = 0;
    int i = 0;
    while (s[i]) {
        int j = i;
        while (s[j] != '#') j++;
        int len = atoi(s + i);
        int start = j + 1;
        decoded[count] = malloc(len + 1);
        memcpy(decoded[count], s + start, len);
        decoded[count++][len] = '\0';
        i = start + len;
    }
    *returnSize = count;
    return decoded;
}
