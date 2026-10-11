static int ascending(const void* a, const void* b) {
    int x = *(const int*)a, y = *(const int*)b;
    return (x > y) - (x < y);
}

// Sorted cards make the counts contiguous: distinct values with their counts, in order.
bool isNStraightHand(int* hand, int handSize, int groupSize) {
    if (handSize % groupSize != 0) return false;
    qsort(hand, handSize, sizeof(int), ascending);
    int* keys = malloc(handSize * sizeof(int));
    int* count = malloc(handSize * sizeof(int));
    int distinct = 0;
    for (int i = 0; i < handSize; i++) {
        if (distinct && keys[distinct - 1] == hand[i]) count[distinct - 1]++;
        else { keys[distinct] = hand[i]; count[distinct++] = 1; }
    }
    bool ok = true;
    for (int s = 0; s < distinct && ok; s++) {
        int need = count[s];
        if (need > 0) {
            for (int g = 0; g < groupSize; g++) {
                int at = s + g;
                if (at >= distinct || keys[at] != keys[s] + g || count[at] < need) { ok = false; break; }
                count[at] -= need;
            }
        }
    }
    free(keys);
    free(count);
    return ok;
}
