typedef struct {
    char suffix[16];
    UT_hash_handle hh;
} Suffix;

long long distinctNames(char** ideas, int ideasSize) {
    Suffix* groups[26] = {NULL};
    int sizes[26] = {0};
    for (int i = 0; i < ideasSize; i++) {
        int first = ideas[i][0] - 'a';
        Suffix* item = calloc(1, sizeof(Suffix));
        strcpy(item->suffix, ideas[i] + 1);
        HASH_ADD_STR(groups[first], suffix, item);
        sizes[first]++;
    }
    long long res = 0;
    for (int a = 0; a < 26; a++) {
        if (!sizes[a]) continue;
        for (int b = a + 1; b < 26; b++) {
            if (!sizes[b]) continue;
            long long shared = 0;
            for (Suffix* item = groups[a]; item; item = item->hh.next) {
                Suffix* match;
                HASH_FIND_STR(groups[b], item->suffix, match);
                if (match) {
                    shared++;
                }
            }
            res += 2 * (sizes[a] - shared) * (sizes[b] - shared);
        }
    }
    for (int a = 0; a < 26; a++) {
        Suffix *item, *tmp;
        HASH_ITER(hh, groups[a], item, tmp) {
            HASH_DEL(groups[a], item);
            free(item);
        }
    }
    return res;
}
