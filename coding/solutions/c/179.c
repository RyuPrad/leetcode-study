static int compare(const void* x, const void* y) {
    const char* a = *(const char* const*)x;
    const char* b = *(const char* const*)y;
    char ab[24], ba[24];
    sprintf(ab, "%s%s", a, b);
    sprintf(ba, "%s%s", b, a);
    return strcmp(ba, ab);
}

char* largestNumber(int* nums, int numsSize) {
    char** strs = malloc(numsSize * sizeof(char*));
    for (int i = 0; i < numsSize; i++) {
        strs[i] = malloc(12);
        sprintf(strs[i], "%d", nums[i]);
    }
    qsort(strs, numsSize, sizeof(char*), compare);
    char* res = calloc(numsSize * 11 + 1, 1);
    for (int i = 0; i < numsSize; i++) strcat(res, strs[i]);
    for (int i = 0; i < numsSize; i++) free(strs[i]);
    free(strs);
    if (res[0] == '0') {
        res[1] = '\0';
    }
    return res;
}
