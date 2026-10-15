int* missingRolls(int* rolls, int rollsSize, int mean, int n, int* returnSize) {
    int m = rollsSize;
    int missing = mean * (n + m);
    for (int i = 0; i < m; i++) {
        missing -= rolls[i];
    }
    if (missing < n || missing > 6 * n) {
        *returnSize = 0;
        return malloc(sizeof(int));
    }
    int* res = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        res[i] = missing / n;
    }
    for (int i = 0; i < missing % n; i++) {
        res[i]++;
    }
    *returnSize = n;
    return res;
}
