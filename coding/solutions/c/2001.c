typedef struct {
    long long key;
    int count;
    UT_hash_handle hh;
} Ratio;

static int gcd(int a, int b) {
    return b == 0 ? a : gcd(b, a % b);
}

long long interchangeableRectangles(int** rectangles, int rectanglesSize, int* rectanglesColSize) {
    Ratio* count = NULL;
    long long res = 0;
    for (int i = 0; i < rectanglesSize; i++) {
        int w = rectangles[i][0], h = rectangles[i][1];
        int g = gcd(w, h);
        long long key = (long long) (w / g) * 200001 + h / g;
        Ratio* entry;
        HASH_FIND(hh, count, &key, sizeof(long long), entry);
        res += entry ? entry->count : 0;
        if (!entry) {
            entry = calloc(1, sizeof(Ratio));
            entry->key = key;
            HASH_ADD(hh, count, key, sizeof(long long), entry);
        }
        entry->count++;
    }
    Ratio *entry, *tmp;
    HASH_ITER(hh, count, entry, tmp) {
        HASH_DEL(count, entry);
        free(entry);
    }
    return res;
}
