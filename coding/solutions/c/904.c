int totalFruit(int* fruits, int fruitsSize) {
    int* count = calloc(fruitsSize, sizeof(int));
    int kinds = 0;
    int left = 0, res = 0;
    for (int right = 0; right < fruitsSize; right++) {
        if (count[fruits[right]]++ == 0) kinds++;
        while (kinds > 2) {
            int fruit = fruits[left];
            count[fruit]--;
            if (count[fruit] == 0) {
                kinds--;
            }
            left++;
        }
        res = res > right - left + 1 ? res : right - left + 1;
    }
    free(count);
    return res;
}
