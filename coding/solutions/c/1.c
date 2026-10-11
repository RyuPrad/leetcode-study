struct Seen { int num; int index; UT_hash_handle hh; };

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    struct Seen *seen = NULL, *entry;
    int* answer = malloc(2 * sizeof(int));
    *returnSize = 0;

    for (int i = 0; i < numsSize; i++) {
        int num = nums[i];
        int need = target - num;

        HASH_FIND_INT(seen, &need, entry);
        if (entry) {
            answer[0] = entry->index;
            answer[1] = i;
            *returnSize = 2;
            break;
        }

        HASH_FIND_INT(seen, &num, entry);
        if (!entry) {
            entry = malloc(sizeof *entry);
            entry->num = num;
            HASH_ADD_INT(seen, num, entry);
        }
        entry->index = i;
    }

    struct Seen *tmp;
    HASH_ITER(hh, seen, entry, tmp) { HASH_DEL(seen, entry); free(entry); }
    return answer;
}
