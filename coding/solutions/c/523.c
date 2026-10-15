typedef struct {
    int remainder;
    int index;
    UT_hash_handle hh;
} First;

static First* entry(int remainder, int index) {
    First* item = malloc(sizeof(First));
    item->remainder = remainder;
    item->index = index;
    return item;
}

bool checkSubarraySum(int* nums, int numsSize, int k) {
    First* firstIndex = NULL;
    First* start = entry(0, -1);
    HASH_ADD_INT(firstIndex, remainder, start);
    int sum = 0;
    bool found = false;
    for (int i = 0; i < numsSize && !found; i++) {
        sum = (int) (((long long) sum + nums[i]) % k);
        First* item;
        HASH_FIND_INT(firstIndex, &sum, item);
        if (item) {
            if (i - item->index >= 2) {
                found = true;
            }
        } else {
            item = entry(sum, i);
            HASH_ADD_INT(firstIndex, remainder, item);
        }
    }
    First *item, *tmp;
    HASH_ITER(hh, firstIndex, item, tmp) {
        HASH_DEL(firstIndex, item);
        free(item);
    }
    return found;
}
