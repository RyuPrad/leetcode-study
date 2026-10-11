static int ascending(const void* a, const void* b) {
    int x = *(const int*)a, y = *(const int*)b;
    return (x > y) - (x < y);
}

int minMeetingRooms(int** intervals, int intervalsSize, int* intervalsColSize) {
    int n = intervalsSize;
    int* starts = malloc(n * sizeof(int));
    int* ends = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        starts[i] = intervals[i][0];
        ends[i] = intervals[i][1];
    }
    qsort(starts, n, sizeof(int), ascending);
    qsort(ends, n, sizeof(int), ascending);
    int rooms = 0, maxRooms = 0;
    int s = 0, e = 0;
    while (s < n) {
        if (starts[s] < ends[e]) {
            rooms++;
            s++;
        } else {
            rooms--;
            e++;
        }
        if (rooms > maxRooms) maxRooms = rooms;
    }
    free(starts);
    free(ends);
    return maxRooms;
}
