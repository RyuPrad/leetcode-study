static int byRight(const void* a, const void* b) {
    return (*(const int**) a)[1] - (*(const int**) b)[1];
}

int findLongestChain(int** pairs, int pairsSize, int* pairsColSize) {
    qsort(pairs, pairsSize, sizeof(int*), byRight);
    int res = 0, end = INT_MIN;
    for (int i = 0; i < pairsSize; i++) {
        if (pairs[i][0] > end) {
            res++;
            end = pairs[i][1];
        }
    }
    return res;
}
