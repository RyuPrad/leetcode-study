struct Count { int num; int count; int order; UT_hash_handle hh; };

int* topKFrequent(int* nums, int numsSize, int k, int* returnSize) {
    struct Count *freq = NULL, *entry, *tmp;
    // Distinct values in first-seen order, like iterating a JavaScript Map.
    int* order = malloc(numsSize * sizeof(int));
    int distinct = 0;

    for (int i = 0; i < numsSize; i++) {
        HASH_FIND_INT(freq, &nums[i], entry);
        if (!entry) {
            entry = malloc(sizeof *entry);
            entry->num = nums[i];
            entry->count = 0;
            order[distinct++] = nums[i];
            HASH_ADD_INT(freq, num, entry);
        }
        entry->count++;
    }

    int* res = malloc(k * sizeof(int));
    int size = 0;

    for (int count = numsSize; count >= 0 && size < k; count--) {
        for (int i = 0; i < distinct && size < k; i++) {
            HASH_FIND_INT(freq, &order[i], entry);
            if (entry->count == count) res[size++] = order[i];
        }
    }

    HASH_ITER(hh, freq, entry, tmp) { HASH_DEL(freq, entry); free(entry); }
    free(order);
    *returnSize = size;
    return res;
}
