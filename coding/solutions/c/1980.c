static char** list;
static int count;

static bool build(char* current, int length) {
    if (length == count) {
        current[length] = '\0';
        for (int i = 0; i < count; i++) {
            if (strcmp(list[i], current) == 0) return false;
        }
        return true;
    }
    current[length] = '0';
    if (build(current, length + 1)) {
        return true;
    }
    current[length] = '1';
    return build(current, length + 1);
}

char* findDifferentBinaryString(char** nums, int numsSize) {
    list = nums;
    count = numsSize;
    char* current = malloc(numsSize + 1);
    build(current, 0);
    return current;
}
