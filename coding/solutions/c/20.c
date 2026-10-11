bool isValid(char* s) {
    int n = strlen(s), top = 0;
    char* stack = malloc(n + 1);
    for (int i = 0; i < n; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') {
            stack[top++] = c;
        } else {
            char open = c == ')' ? '(' : c == ']' ? '[' : '{';
            if (top == 0 || stack[--top] != open) {
                free(stack);
                return false;
            }
        }
    }
    free(stack);
    return top == 0;
}
