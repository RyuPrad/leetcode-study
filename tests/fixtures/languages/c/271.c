/** Encodes a list of strings to a single string. */
char* encode(char** strs, int strsSize) {
    size_t total = 1;
    for (int i = 0; i < strsSize; i++) total += strlen(strs[i]) + 12;
    char* out = malloc(total); out[0] = 0; char* p = out;
    for (int i = 0; i < strsSize; i++) p += sprintf(p, "%d#%s", (int)strlen(strs[i]), strs[i]);
    return out;
}
/** Decodes a single string to a list of strings. */
char** decode(char* s, int* returnSize) {
    char** out = malloc(sizeof(char*) * (strlen(s) + 1)); int count = 0;
    while (*s) {
        int length = atoi(s); s = strchr(s, '#') + 1;
        out[count] = malloc(length + 1); memcpy(out[count], s, length); out[count][length] = 0; count++;
        s += length;
    }
    *returnSize = count;
    return out;
}
