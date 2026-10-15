int* addToArrayForm(int* num, int numSize, int k, int* returnSize) {
    int* res = malloc((numSize + 6) * sizeof(int));
    int size = 0;
    int i = numSize - 1;
    while (i >= 0 || k > 0) {
        if (i >= 0) {
            k += num[i];
        }
        res[size++] = k % 10;
        k = k / 10;
        i--;
    }
    for (int a = 0, b = size - 1; a < b; a++, b--) {
        int temp = res[a];
        res[a] = res[b];
        res[b] = temp;
    }
    *returnSize = size;
    return res;
}
