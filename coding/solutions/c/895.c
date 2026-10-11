// group[f] is a stack of the values pushed when their frequency became f.
struct Freq { int val; int count; UT_hash_handle hh; };

typedef struct {
    struct Freq* freq;
    int** group;
    int* groupSize;
    int* groupCapacity;
    int groups;
    int maxFreq;
} FreqStack;

FreqStack* freqStackCreate() {
    FreqStack* obj = calloc(1, sizeof(FreqStack));
    obj->groups = 16;
    obj->group = calloc(obj->groups, sizeof(int*));
    obj->groupSize = calloc(obj->groups, sizeof(int));
    obj->groupCapacity = calloc(obj->groups, sizeof(int));
    return obj;
}

void freqStackPush(FreqStack* obj, int val) {
    struct Freq* entry;
    HASH_FIND_INT(obj->freq, &val, entry);
    if (!entry) {
        entry = malloc(sizeof *entry);
        entry->val = val;
        entry->count = 0;
        HASH_ADD_INT(obj->freq, val, entry);
    }
    int f = ++entry->count;
    if (f > obj->maxFreq) {
        obj->maxFreq = f;
    }
    if (f >= obj->groups) {
        int more = obj->groups * 2;
        obj->group = realloc(obj->group, more * sizeof(int*));
        obj->groupSize = realloc(obj->groupSize, more * sizeof(int));
        obj->groupCapacity = realloc(obj->groupCapacity, more * sizeof(int));
        for (int i = obj->groups; i < more; i++) { obj->group[i] = NULL; obj->groupSize[i] = 0; obj->groupCapacity[i] = 0; }
        obj->groups = more;
    }
    if (obj->groupSize[f] == obj->groupCapacity[f]) {
        obj->groupCapacity[f] = obj->groupCapacity[f] ? obj->groupCapacity[f] * 2 : 8;
        obj->group[f] = realloc(obj->group[f], obj->groupCapacity[f] * sizeof(int));
    }
    obj->group[f][obj->groupSize[f]++] = val;
}

int freqStackPop(FreqStack* obj) {
    int f = obj->maxFreq;
    int val = obj->group[f][--obj->groupSize[f]];
    struct Freq* entry;
    HASH_FIND_INT(obj->freq, &val, entry);
    entry->count = f - 1;
    if (obj->groupSize[f] == 0) {
        obj->maxFreq--;
    }
    return val;
}

void freqStackFree(FreqStack* obj) {
    struct Freq *entry, *tmp;
    HASH_ITER(hh, obj->freq, entry, tmp) { HASH_DEL(obj->freq, entry); free(entry); }
    for (int i = 0; i < obj->groups; i++) free(obj->group[i]);
    free(obj->group); free(obj->groupSize); free(obj->groupCapacity);
    free(obj);
}
