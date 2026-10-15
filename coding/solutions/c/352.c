typedef struct {
    bool seen[10001];
} SummaryRanges;

SummaryRanges* summaryRangesCreate() {
    SummaryRanges* obj = calloc(1, sizeof(SummaryRanges));
    return obj;
}

void summaryRangesAddNum(SummaryRanges* obj, int value) {
    obj->seen[value] = true;
}

int** summaryRangesGetIntervals(SummaryRanges* obj, int* retSize, int** retColSize) {
    int** res = malloc(5001 * sizeof(int*));
    *retColSize = malloc(5001 * sizeof(int));
    *retSize = 0;
    for (int value = 0; value <= 10000; value++) {
        if (!obj->seen[value]) {
            continue;
        }
        if (*retSize > 0 && res[*retSize - 1][1] + 1 == value) {
            res[*retSize - 1][1] = value;
        } else {
            res[*retSize] = malloc(2 * sizeof(int));
            res[*retSize][0] = value;
            res[*retSize][1] = value;
            (*retColSize)[*retSize] = 2;
            (*retSize)++;
        }
    }
    return res;
}

void summaryRangesFree(SummaryRanges* obj) {
    free(obj);
}
