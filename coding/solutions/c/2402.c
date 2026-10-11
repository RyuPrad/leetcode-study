static int byStart(const void* a, const void* b) {
    int x = (*(int* const*)a)[0], y = (*(int* const*)b)[0];
    return (x > y) - (x < y);
}

// With few rooms, each room's free time is scanned directly instead of keeping heaps.
int mostBooked(int n, int** meetings, int meetingsSize, int* meetingsColSize) {
    qsort(meetings, meetingsSize, sizeof(int*), byStart);
    int* count = calloc(n, sizeof(int));
    long long* freeAt = calloc(n, sizeof(long long));
    for (int m = 0; m < meetingsSize; m++) {
        long long start = meetings[m][0], end = meetings[m][1];
        int room = -1;
        for (int r = 0; r < n; r++) if (freeAt[r] <= start) { room = r; break; }
        if (room >= 0) {
            freeAt[room] = end;
        } else {
            room = 0;
            for (int r = 1; r < n; r++) if (freeAt[r] < freeAt[room]) room = r;
            freeAt[room] += end - start;
        }
        count[room]++;
    }
    int best = 0;
    for (int r = 1; r < n; r++) {
        if (count[r] > count[best]) best = r;
    }
    free(count);
    free(freeAt);
    return best;
}
