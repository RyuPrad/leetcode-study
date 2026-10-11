struct Seen { int num; UT_hash_handle hh; };

static bool has(struct Seen* seen, int num) {
    struct Seen* found;
    HASH_FIND_INT(seen, &num, found);
    return found != NULL;
}

int longestConsecutive(int* nums, int numsSize) {
    struct Seen *seen = NULL, *entry, *tmp;
    for (int i = 0; i < numsSize; i++) {
        if (has(seen, nums[i])) continue;
        entry = malloc(sizeof *entry);
        entry->num = nums[i];
        HASH_ADD_INT(seen, num, entry);
    }
    int ans = 0;
    HASH_ITER(hh, seen, entry, tmp) {
        int num = entry->num;
        if (num == INT_MIN || !has(seen, num - 1)) {
            int curr = num;
            int length = 1;
            while (curr < INT_MAX && has(seen, curr + 1)) {
                curr++;
                length++;
            }
            if (length > ans) ans = length;
        }
    }
    HASH_ITER(hh, seen, entry, tmp) { HASH_DEL(seen, entry); free(entry); }
    return ans;
}
