struct Word { char* text; bool visited; UT_hash_handle hh; };

int ladderLength(char* beginWord, char* endWord, char** wordList, int wordListSize) {
    struct Word *words = NULL, *found, *tmp;
    for (int i = 0; i < wordListSize; i++) {
        HASH_FIND_STR(words, wordList[i], found);
        if (found) continue;
        found = malloc(sizeof *found);
        found->text = wordList[i];
        found->visited = false;
        HASH_ADD_KEYPTR(hh, words, found->text, strlen(found->text), found);
    }
    HASH_FIND_STR(words, endWord, found);
    int result = 0;
    if (found) {
        int length = strlen(beginWord);
        char** queue = malloc((wordListSize + 1) * sizeof(char*));
        char** next = malloc((wordListSize + 1) * sizeof(char*));
        int size = 0, level = 1;
        queue[size++] = beginWord;
        HASH_FIND_STR(words, beginWord, found);
        if (found) found->visited = true;
        char* cand = malloc(length + 1);
        while (size > 0 && !result) {
            int nextSize = 0;
            for (int q = 0; q < size && !result; q++) {
                if (strcmp(queue[q], endWord) == 0) { result = level; break; }
                strcpy(cand, queue[q]);
                for (int i = 0; i < length; i++) {
                    char original = cand[i];
                    for (char ch = 'a'; ch <= 'z'; ch++) {
                        cand[i] = ch;
                        HASH_FIND_STR(words, cand, found);
                        if (found && !found->visited) {
                            found->visited = true;
                            next[nextSize++] = found->text;
                        }
                    }
                    cand[i] = original;
                }
            }
            char** swap = queue; queue = next; next = swap;
            size = nextSize;
            level++;
        }
        free(cand); free(queue); free(next);
    }
    HASH_ITER(hh, words, found, tmp) { HASH_DEL(words, found); free(found); }
    return result;
}
