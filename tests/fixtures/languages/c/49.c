struct Group { char key[128]; int index; UT_hash_handle hh; };
static int byChar(const void* a, const void* b) { return *(const char*)a - *(const char*)b; }
char*** groupAnagrams(char** strs, int strsSize, int* returnSize, int** returnColumnSizes) {
    struct Group *groups = NULL, *g;
    char*** out = malloc((strsSize ? strsSize : 1) * sizeof(char**));
    int* sizes = calloc(strsSize ? strsSize : 1, sizeof(int));
    int count = 0;
    for (int i = 0; i < strsSize; i++) {
        char key[128]; strcpy(key, strs[i]); qsort(key, strlen(key), 1, byChar);
        HASH_FIND_STR(groups, key, g);
        if (!g) { g = malloc(sizeof *g); strcpy(g->key, key); g->index = count; out[count++] = malloc(strsSize * sizeof(char*)); HASH_ADD_STR(groups, key, g); }
        out[g->index][sizes[g->index]++] = strs[i];
    }
    *returnSize = count; *returnColumnSizes = sizes;
    return out;
}
