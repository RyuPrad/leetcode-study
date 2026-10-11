int evalRPN(char** tokens, int tokensSize) {
    long long* stack = malloc(tokensSize * sizeof(long long));
    int top = 0;
    for (int i = 0; i < tokensSize; i++) {
        char* token = tokens[i];
        if (token[1] == '\0' && strchr("+-*/", token[0])) {
            long long b = stack[--top];
            long long a = stack[--top];
            if (token[0] == '+') stack[top++] = a + b;
            else if (token[0] == '-') stack[top++] = a - b;
            else if (token[0] == '*') stack[top++] = a * b;
            else stack[top++] = a / b;
        } else {
            stack[top++] = atoll(token);
        }
    }
    int result = (int)stack[0];
    free(stack);
    return result;
}
