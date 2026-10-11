char* multiply(char* num1, char* num2) {
    if (strcmp(num1, "0") == 0 || strcmp(num2, "0") == 0) {
        char* zero = malloc(2);
        strcpy(zero, "0");
        return zero;
    }
    int m = strlen(num1), n = strlen(num2);
    int* pos = calloc(m + n, sizeof(int));
    for (int i = m - 1; i >= 0; i--) {
        for (int j = n - 1; j >= 0; j--) {
            int mul = (num1[i] - '0') * (num2[j] - '0');
            int p1 = i + j, p2 = i + j + 1;
            int sum = mul + pos[p2];
            pos[p2] = sum % 10;
            pos[p1] += sum / 10;
        }
    }
    char* res = malloc(m + n + 1);
    int length = 0;
    for (int k = 0; k < m + n; k++) {
        if (length == 0 && pos[k] == 0) continue;
        res[length++] = (char)('0' + pos[k]);
    }
    res[length] = '\0';
    free(pos);
    return res;
}
