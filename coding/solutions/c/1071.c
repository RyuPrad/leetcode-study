static int gcd(int a, int b) {
    return b == 0 ? a : gcd(b, a % b);
}

char* gcdOfStrings(char* str1, char* str2) {
    int n1 = strlen(str1), n2 = strlen(str2);
    char* ab = malloc(n1 + n2 + 1);
    char* ba = malloc(n1 + n2 + 1);
    strcpy(ab, str1); strcat(ab, str2);
    strcpy(ba, str2); strcat(ba, str1);
    int len = strcmp(ab, ba) == 0 ? gcd(n1, n2) : 0;
    free(ab);
    free(ba);
    char* res = malloc(len + 1);
    memcpy(res, str1, len);
    res[len] = '\0';
    return res;
}
