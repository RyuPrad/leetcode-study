typedef struct {
    double slope;
    int count;
    UT_hash_handle hh;
} SlopeCount;

int maxPoints(int** points, int pointsSize, int* pointsColSize) {
    int res = 1;
    for (int i = 0; i < pointsSize; i++) {
        SlopeCount* count = NULL;
        for (int j = i + 1; j < pointsSize; j++) {
            int dx = points[j][0] - points[i][0], dy = points[j][1] - points[i][1];
            double slope = dx == 0 ? INFINITY : dy == 0 ? 0.0 : (double) dy / dx;
            SlopeCount* entry;
            HASH_FIND(hh, count, &slope, sizeof(double), entry);
            if (!entry) {
                entry = calloc(1, sizeof(SlopeCount));
                entry->slope = slope;
                entry->count = 1;
                HASH_ADD(hh, count, slope, sizeof(double), entry);
            }
            entry->count++;
            if (entry->count > res) res = entry->count;
        }
        SlopeCount *entry, *tmp;
        HASH_ITER(hh, count, entry, tmp) {
            HASH_DEL(count, entry);
            free(entry);
        }
    }
    return res;
}
