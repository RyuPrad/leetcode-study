struct Seen { int num; UT_hash_handle hh; };

bool containsDuplicate(int* nums, int numsSize) {
    struct Seen *seen = NULL, *entry, *tmp;
    bool found = false;

    for (int i = 0; i < numsSize && !found; i++) {
        HASH_FIND_INT(seen, &nums[i], entry);
        if (entry) {
            found = true;
        } else {
            entry = malloc(sizeof *entry);
            entry->num = nums[i];
            HASH_ADD_INT(seen, num, entry);
        }
    }

    HASH_ITER(hh, seen, entry, tmp) { HASH_DEL(seen, entry); free(entry); }
    return found;
}
