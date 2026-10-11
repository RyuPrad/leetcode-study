char* longestCommonPrefix(char** strs, int strsSize) {
    int length = strsSize ? strlen(strs[0]) : 0;

    for (int i = 0; i < length; i++) {
        char c = strs[0][i];

        for (int j = 1; j < strsSize; j++) {
            if (strs[j][i] != c) {
                length = i;
                break;
            }
        }
    }

    char* prefix = malloc(length + 1);
    memcpy(prefix, strsSize ? strs[0] : "", length);
    prefix[length] = '\0';
    return prefix;
}
