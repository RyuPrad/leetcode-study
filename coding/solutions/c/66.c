int* plusOne(int* digits, int digitsSize, int* returnSize) {
    int* res = malloc((digitsSize + 1) * sizeof(int));
    memcpy(res, digits, digitsSize * sizeof(int));
    for (int i = digitsSize - 1; i >= 0; i--) {
        if (res[i] < 9) {
            res[i]++;
            *returnSize = digitsSize;
            return res;
        }
        res[i] = 0;
    }
    res[0] = 1;
    for (int i = 1; i <= digitsSize; i++) res[i] = 0;
    *returnSize = digitsSize + 1;
    return res;
}
