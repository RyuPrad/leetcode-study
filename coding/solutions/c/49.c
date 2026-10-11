struct Group { int count[26]; int index; UT_hash_handle hh; };

char*** groupAnagrams(char** strs, int strsSize, int* returnSize, int** returnColumnSizes) {
    struct Group *groups = NULL, *group, *tmp;
    char*** res = malloc((strsSize ? strsSize : 1) * sizeof(char**));
    int* sizes = calloc(strsSize ? strsSize : 1, sizeof(int));
    int total = 0;

    for (int i = 0; i < strsSize; i++) {
        int count[26] = { 0 };

        for (char* c = strs[i]; *c; c++) {
            count[*c - 'a']++;
        }

        HASH_FIND(hh, groups, count, sizeof count, group);
        if (!group) {
            group = malloc(sizeof *group);
            memcpy(group->count, count, sizeof count);
            group->index = total;
            res[total++] = malloc(strsSize * sizeof(char*));
            HASH_ADD(hh, groups, count, sizeof count, group);
        }
        res[group->index][sizes[group->index]++] = strs[i];
    }

    HASH_ITER(hh, groups, group, tmp) { HASH_DEL(groups, group); free(group); }
    *returnSize = total;
    *returnColumnSizes = sizes;
    return res;
}
