typedef struct {
    char key[16];
    int value;
    UT_hash_handle hh;
} Memo;

static Memo* memo;
static char** stickerList;
static int stickerCount;

static int solve(const char* rest) {
    Memo* found;
    HASH_FIND_STR(memo, rest, found);
    if (found) {
        return found->value;
    }
    int best = INT_MAX;
    for (int s = 0; s < stickerCount; s++) {
        if (!strchr(stickerList[s], rest[0])) {
            continue;
        }
        char next[16];
        strcpy(next, rest);
        for (const char* ch = stickerList[s]; *ch; ch++) {
            char* at = strchr(next, *ch);
            if (at) memmove(at, at + 1, strlen(at));
        }
        int sub = solve(next);
        if (sub != INT_MAX && 1 + sub < best) {
            best = 1 + sub;
        }
    }
    Memo* entry = malloc(sizeof(Memo));
    strcpy(entry->key, rest);
    entry->value = best;
    HASH_ADD_STR(memo, key, entry);
    return best;
}

static int byLetter(const void* a, const void* b) {
    return *(const char*) a - *(const char*) b;
}

int minStickers(char** stickers, int stickersSize, char* target) {
    memo = NULL;
    stickerList = stickers;
    stickerCount = stickersSize;
    Memo* empty = malloc(sizeof(Memo));
    empty->key[0] = '\0';
    empty->value = 0;
    HASH_ADD_STR(memo, key, empty);
    char sorted[16];
    strcpy(sorted, target);
    qsort(sorted, strlen(sorted), 1, byLetter);
    int res = solve(sorted);
    Memo *entry, *tmp;
    HASH_ITER(hh, memo, entry, tmp) {
        HASH_DEL(memo, entry);
        free(entry);
    }
    return res == INT_MAX ? -1 : res;
}
