char* removeKdigits(char* num, int k) {
    int n = strlen(num);
    char* stack = malloc(n + 2);
    int top = 0;
    for (int i = 0; i < n; i++) {
        char digit = num[i];
        while (k > 0 && top > 0 && stack[top - 1] > digit) {
            top--;
            k--;
        }
        stack[top++] = digit;
    }
    while (k > 0) {
        top--;
        k--;
    }
    stack[top] = '\0';
    char* res = stack;
    while (*res == '0') res++;
    if (*res == '\0') {
        stack[0] = '0';
        stack[1] = '\0';
        return stack;
    }
    memmove(stack, res, strlen(res) + 1);
    return stack;
}
