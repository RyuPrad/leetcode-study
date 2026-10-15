char* removeStars(char* s) {
    char* stack = malloc(strlen(s) + 1);
    int top = 0;
    for (char* p = s; *p; p++) {
        char c = *p;
        if (c == '*') {
            top--;
        } else {
            stack[top++] = c;
        }
    }
    stack[top] = '\0';
    return stack;
}
