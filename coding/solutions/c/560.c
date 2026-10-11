struct Prefix { int sum; int count; UT_hash_handle hh; };

static void add(struct Prefix** freq, int sum) {
    struct Prefix* entry;
    HASH_FIND_INT(*freq, &sum, entry);
    if (!entry) {
        entry = malloc(sizeof *entry);
        entry->sum = sum;
        entry->count = 0;
        HASH_ADD_INT(*freq, sum, entry);
    }
    entry->count++;
}

int subarraySum(int* nums, int numsSize, int k) {
    struct Prefix *freq = NULL, *entry, *tmp;
    add(&freq, 0);
    int sum = 0;
    int count = 0;
    for (int i = 0; i < numsSize; i++) {
        sum += nums[i];
        int need = sum - k;
        HASH_FIND_INT(freq, &need, entry);
        if (entry) count += entry->count;
        add(&freq, sum);
    }
    HASH_ITER(hh, freq, entry, tmp) { HASH_DEL(freq, entry); free(entry); }
    return count;
}
