static int compare(const void* a, const void* b) {
    return *(const int*)a - *(const int*)b;
}

int* successfulPairs(int* spells, int spellsSize, int* potions, int potionsSize, long long success, int* returnSize) {
    qsort(potions, potionsSize, sizeof(int), compare);
    int* res = malloc(spellsSize * sizeof(int));
    for (int i = 0; i < spellsSize; i++) {
        int spell = spells[i];
        int left = 0, right = potionsSize;
        while (left < right) {
            int mid = (left + right) / 2;
            if ((long long) spell * potions[mid] >= success) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        res[i] = potionsSize - left;
    }
    *returnSize = spellsSize;
    return res;
}
