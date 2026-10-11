// Each key keeps its (timestamp, value) pairs in insertion order, which is increasing time.
struct Entry {
    char* key;
    int* times;
    char** values;
    int size;
    int capacity;
    UT_hash_handle hh;
};

typedef struct {
    struct Entry* store;
} TimeMap;

static char* copy(const char* text) {
    char* out = malloc(strlen(text) + 1);
    strcpy(out, text);
    return out;
}

TimeMap* timeMapCreate() {
    TimeMap* obj = malloc(sizeof(TimeMap));
    obj->store = NULL;
    return obj;
}

void timeMapSet(TimeMap* obj, char* key, char* value, int timestamp) {
    struct Entry* entry;
    HASH_FIND_STR(obj->store, key, entry);
    if (!entry) {
        entry = calloc(1, sizeof *entry);
        entry->key = copy(key);
        HASH_ADD_KEYPTR(hh, obj->store, entry->key, strlen(entry->key), entry);
    }
    if (entry->size == entry->capacity) {
        entry->capacity = entry->capacity ? entry->capacity * 2 : 4;
        entry->times = realloc(entry->times, entry->capacity * sizeof(int));
        entry->values = realloc(entry->values, entry->capacity * sizeof(char*));
    }
    entry->times[entry->size] = timestamp;
    entry->values[entry->size++] = copy(value);
}

char* timeMapGet(TimeMap* obj, char* key, int timestamp) {
    struct Entry* entry;
    HASH_FIND_STR(obj->store, key, entry);
    char* res = "";
    if (entry) {
        int left = 0;
        int right = entry->size - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (entry->times[mid] <= timestamp) {
                res = entry->values[mid];
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    return res;
}

void timeMapFree(TimeMap* obj) {
    struct Entry *entry, *tmp;
    HASH_ITER(hh, obj->store, entry, tmp) {
        HASH_DEL(obj->store, entry);
        for (int i = 0; i < entry->size; i++) free(entry->values[i]);
        free(entry->times); free(entry->values); free(entry->key); free(entry);
    }
    free(obj);
}
