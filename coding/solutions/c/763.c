int* partitionLabels(char* s, int* returnSize) {
    int n = strlen(s), last[26] = { 0 };
    for (int i = 0; i < n; i++) last[s[i] - 'a'] = i;
    int* res = malloc(n * sizeof(int));
    int count = 0, start = 0, end = 0;
    for (int i = 0; i < n; i++) {
        if (last[s[i] - 'a'] > end) end = last[s[i] - 'a'];
        if (i == end) { res[count++] = end - start + 1; start = i + 1; }
    }
    *returnSize = count;
    return res;
}
