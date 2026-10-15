static int ascending(const void* a, const void* b) {
    return *(const int*) a - *(const int*) b;
}

int eliminateMaximum(int* dist, int distSize, int* speed, int speedSize) {
    int* arrival = malloc(distSize * sizeof(int));
    for (int i = 0; i < distSize; i++) {
        arrival[i] = (dist[i] + speed[i] - 1) / speed[i];
    }
    qsort(arrival, distSize, sizeof(int), ascending);
    for (int minute = 0; minute < distSize; minute++) {
        if (arrival[minute] <= minute) {
            free(arrival);
            return minute;
        }
    }
    free(arrival);
    return distSize;
}
