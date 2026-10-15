static int compare(const void* a, const void* b) {
    return strcmp(*(char* const*)a, *(char* const*)b);
}

char*** suggestedProducts(char** products, int productsSize, char* searchWord, int* returnSize, int** returnColumnSizes) {
    qsort(products, productsSize, sizeof(char*), compare);
    int n = strlen(searchWord);
    char*** res = malloc(n * sizeof(char**));
    *returnColumnSizes = malloc(n * sizeof(int));
    char* prefix = calloc(n + 1, 1);
    for (int t = 0; t < n; t++) {
        prefix[t] = searchWord[t];
        int left = 0, right = productsSize;
        while (left < right) {
            int mid = (left + right) / 2;
            if (strcmp(products[mid], prefix) < 0) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        char** matches = malloc(3 * sizeof(char*));
        int count = 0;
        for (int i = left; i < left + 3 && i < productsSize; i++) {
            if (strncmp(products[i], prefix, t + 1) == 0) {
                matches[count++] = products[i];
            }
        }
        res[t] = matches;
        (*returnColumnSizes)[t] = count;
    }
    free(prefix);
    *returnSize = n;
    return res;
}
