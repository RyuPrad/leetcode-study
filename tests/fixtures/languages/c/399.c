static int ids(char*** names, int* count, const char* name) {
    for (int i = 0; i < *count; i++) if (!strcmp((*names)[i], name)) return i;
    return -1;
}
static int indexOf(char*** names, int* count, char* name) {
    int i = ids(names, count, name);
    if (i >= 0) return i;
    (*names)[*count] = name; return (*count)++;
}
double* calcEquation(char*** equations, int equationsSize, int* equationsColSize, double* values, int valuesSize, char*** queries, int queriesSize, int* queriesColSize, int* returnSize) {
    char** names = malloc(sizeof(char*) * (2 * equationsSize + 1)); int count = 0;
    static double ratio[64][64];
    for (int i = 0; i < 64; i++) for (int j = 0; j < 64; j++) ratio[i][j] = i == j ? 1.0 : 0.0;
    for (int e = 0; e < equationsSize; e++) {
        int a = indexOf(&names, &count, equations[e][0]), b = indexOf(&names, &count, equations[e][1]);
        ratio[a][b] = values[e]; ratio[b][a] = 1.0 / values[e];
    }
    for (int k = 0; k < count; k++) for (int i = 0; i < count; i++) for (int j = 0; j < count; j++)
        if (ratio[i][j] == 0.0 && ratio[i][k] != 0.0 && ratio[k][j] != 0.0) ratio[i][j] = ratio[i][k] * ratio[k][j];
    double* out = malloc(sizeof(double) * (queriesSize ? queriesSize : 1));
    for (int q = 0; q < queriesSize; q++) {
        int a = ids(&names, &count, queries[q][0]), b = ids(&names, &count, queries[q][1]);
        out[q] = a < 0 || b < 0 || ratio[a][b] == 0.0 ? -1.0 : ratio[a][b];
    }
    *returnSize = queriesSize;
    return out;
}
