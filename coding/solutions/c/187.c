typedef struct {
    char key[11];
    int count;
    UT_hash_handle hh;
} Sequence;

char** findRepeatedDnaSequences(char* s, int* returnSize) {
    Sequence* seen = NULL;
    int n = strlen(s);
    char** res = malloc((n + 1) * sizeof(char*));
    *returnSize = 0;
    for (int i = 0; i + 10 <= n; i++) {
        char sequence[11];
        memcpy(sequence, s + i, 10);
        sequence[10] = '\0';
        Sequence* item;
        HASH_FIND_STR(seen, sequence, item);
        if (item) {
            if (++item->count == 2) res[(*returnSize)++] = strdup(sequence);
        } else {
            item = calloc(1, sizeof(Sequence));
            strcpy(item->key, sequence);
            item->count = 1;
            HASH_ADD_STR(seen, key, item);
        }
    }
    Sequence *item, *tmp;
    HASH_ITER(hh, seen, item, tmp) {
        HASH_DEL(seen, item);
        free(item);
    }
    return res;
}
