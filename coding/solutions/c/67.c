char* addBinary(char* a, char* b) {
    int i = strlen(a) - 1, j = strlen(b) - 1;
    int length = (i > j ? i : j) + 2;
    char* res = malloc(length + 1);
    int k = length;
    res[k] = '\0';
    int carry = 0;
    while (i >= 0 || j >= 0 || carry > 0) {
        int sum = carry;
        if (i >= 0) sum += a[i] - '0';
        if (j >= 0) sum += b[j] - '0';
        res[--k] = (char)('0' + sum % 2);
        carry = sum / 2;
        i--;
        j--;
    }
    memmove(res, res + k, length - k + 1);
    return res;
}
