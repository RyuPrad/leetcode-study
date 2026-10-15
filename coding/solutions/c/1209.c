char* removeDuplicates(char* s, int k) {
    int n = strlen(s);
    char* chars = malloc(n + 1);
    int* counts = malloc(n * sizeof(int));
    int top = 0;
    for (int i = 0; i < n; i++) {
        char c = s[i];
        if (top > 0 && chars[top - 1] == c) {
            counts[top - 1]++;
        } else {
            chars[top] = c;
            counts[top] = 1;
            top++;
        }
        if (counts[top - 1] == k) {
            top--;
        }
    }
    char* res = malloc(n + 1);
    int length = 0;
    for (int i = 0; i < top; i++) {
        for (int j = 0; j < counts[i]; j++) res[length++] = chars[i];
    }
    res[length] = '\0';
    free(chars);
    free(counts);
    return res;
}
